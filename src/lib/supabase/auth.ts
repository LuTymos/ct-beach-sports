import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/is-admin";
import type { Athlete } from "@/types";

export { isAdminUser };

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getLinkedAthlete(): Promise<Athlete | null> {
  const user = await getSessionUser();
  if (!user || isAdminUser(user)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("id, name, team, active, created_at, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as Omit<Athlete, "email">),
    email: user.email ?? null,
  };
}

export async function isOwnAthleteProfile(athleteId: string): Promise<boolean> {
  const linked = await getLinkedAthlete();
  return linked?.id === athleteId;
}

export function isAthleteUser(user: User | null | undefined): boolean {
  return Boolean(user) && !isAdminUser(user);
}
