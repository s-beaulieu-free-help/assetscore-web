import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GUEST_STOCK_COOKIE, guestStockGate, isPrefetchRequest } from "@/lib/guest-stock";
import { supabaseEnv } from "@/lib/supabase/env";
import { wantsStaySignedIn, withSessionLifetime } from "@/lib/supabase/stay-signed-in";

export async function middleware(request: NextRequest) {
  const env = supabaseEnv();
  if (!env) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        const nextCookies = withSessionLifetime(cookiesToSet, wantsStaySignedIn(request.cookies.getAll()));
        for (const { name, value } of nextCookies) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of nextCookies) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const gate = guestStockGate(request.nextUrl.pathname, request.cookies.get(GUEST_STOCK_COOKIE)?.value, Boolean(data.user));
  if (gate.action === "register") {
    const register = request.nextUrl.clone();
    register.pathname = "/register";
    register.search = `?next=${encodeURIComponent(`/stocks/${gate.ticker}`)}`;
    return NextResponse.redirect(register);
  }
  if (isPrefetchRequest((name) => request.headers.get(name))) return response;
  if (gate.action === "remember") {
    response.cookies.set(GUEST_STOCK_COOKIE, gate.ticker, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|logo.png|sitemap.xml|robots.txt).*)"],
};
