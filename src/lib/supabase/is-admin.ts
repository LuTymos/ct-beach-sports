import type { User } from "@supabase/supabase-js";

/** Admin claim lives in app_metadata (server-set). Never trust user_metadata. */
export function isAdminUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}
