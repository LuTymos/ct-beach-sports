import { cookies } from "next/headers";

const INVITE_LINK_COOKIE = "admin_athlete_invite_link";

/** Read invite magic link from httpOnly flash cookie (not in the URL). */
export async function peekInviteLinkFlash(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(INVITE_LINK_COOKIE)?.value ?? null;
}

/** Store invite magic link for ~5 minutes after generate-link action. */
export async function setInviteLinkFlash(link: string) {
  const jar = await cookies();
  jar.set(INVITE_LINK_COOKIE, link, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 5,
  });
}
