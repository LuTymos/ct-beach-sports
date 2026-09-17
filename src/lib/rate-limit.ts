import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

type MemoryBucket = { times: number[] };

const memory = new Map<string, MemoryBucket>();

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || h.get("cf-connecting-ip")?.trim() || "unknown";
}

export async function rateLimitKey(parts: string[]): Promise<string> {
  const ip = await clientIp();
  return hashKey([ip, ...parts].join("|"));
}

async function hitMemory(bucket: string, keyHash: string, limit: number, windowMs: number) {
  const id = `${bucket}:${keyHash}`;
  const now = Date.now();
  const current = memory.get(id) ?? { times: [] };
  current.times = current.times.filter((t) => now - t < windowMs);
  if (current.times.length >= limit) {
    memory.set(id, current);
    return false;
  }
  current.times.push(now);
  memory.set(id, current);
  return true;
}

/**
 * Count-then-insert limiter. Returns false when the caller should be blocked.
 * Uses Postgres when service_role exists (serverless-safe); otherwise process memory.
 */
export async function consumeRateLimit(opts: {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<boolean> {
  const keyHash = opts.key.includes("|") ? hashKey(opts.key) : opts.key;
  const windowSec = Math.ceil(opts.windowMs / 1000);

  if (!hasServiceRoleKey()) {
    return hitMemory(opts.bucket, keyHash, opts.limit, opts.windowMs);
  }

  const service = createServiceClient();
  const since = new Date(Date.now() - opts.windowMs).toISOString();

  const { count, error: countError } = await service
    .from("security_rate_hits")
    .select("*", { count: "exact", head: true })
    .eq("bucket", opts.bucket)
    .eq("key_hash", keyHash)
    .gte("created_at", since);

  if (countError) {
    return hitMemory(opts.bucket, keyHash, opts.limit, opts.windowMs);
  }

  if ((count ?? 0) >= opts.limit) {
    return false;
  }

  const { error: insertError } = await service.from("security_rate_hits").insert({
    bucket: opts.bucket,
    key_hash: keyHash,
  });

  if (insertError) {
    return hitMemory(opts.bucket, keyHash, opts.limit, opts.windowMs);
  }

  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - Math.max(opts.windowMs, 60 * 60 * 1000)).toISOString();
    await service.from("security_rate_hits").delete().lt("created_at", cutoff);
  }

  void windowSec;
  return true;
}

export const CONTACT_RATE = { limit: 3, windowMs: 15 * 60 * 1000 } as const;
export const LOGIN_RATE = { limit: 5, windowMs: 15 * 60 * 1000 } as const;
