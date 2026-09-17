import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/is-admin";

/** Authz first: JWT via getUser() + app_metadata.role === admin. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return { supabase, user };
}
