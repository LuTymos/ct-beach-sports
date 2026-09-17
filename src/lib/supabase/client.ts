import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/config";
import { supabaseCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublicKey(), {
    cookieOptions: supabaseCookieOptions(),
  });
}
