import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";

/** Server-only admin client (invite/link users). Never expose to the browser. */
export function createServiceClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada (necessária para convidar atletas)"
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function hasServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
