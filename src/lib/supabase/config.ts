/**
 * Public Supabase key for browser/server clients.
 * New dashboard: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…)
 * Legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT anon)
 */
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey());
}
