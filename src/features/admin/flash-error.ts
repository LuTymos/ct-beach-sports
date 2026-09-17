import { cookies } from "next/headers";

const COOKIE = "admin_flash_error";

export async function peekAdminFlashError(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function setAdminFlashError(message: string) {
  const jar = await cookies();
  jar.set(COOKIE, message.slice(0, 800), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 120,
  });
}
