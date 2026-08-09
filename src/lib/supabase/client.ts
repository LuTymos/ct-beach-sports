import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/config";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublicKey());
}
