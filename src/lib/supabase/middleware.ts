import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicKey, getSupabaseUrl } from "@/lib/supabase/config";
import { isAdminUser } from "@/lib/supabase/is-admin";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!user || !isAdminUser(user)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (path === "/admin/login" && isAdminUser(user)) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/admin";
    return NextResponse.redirect(dashboard);
  }

  // Logged-in athlete on login page → own profile (or /conta)
  // Allow /conta/definir-senha and /conta/ativar for invite flow.
  if (path === "/conta/login" && user && !isAdminUser(user)) {
    const conta = request.nextUrl.clone();
    conta.pathname = "/conta";
    return NextResponse.redirect(conta);
  }

  if (
    (path === "/conta/login" || path === "/conta/definir-senha" || path === "/conta/ativar") &&
    isAdminUser(user)
  ) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/admin";
    return NextResponse.redirect(dashboard);
  }

  return supabaseResponse;
}
