import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip Supabase entirely if env vars are not configured (e.g. during build).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session without blocking
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect vendor dashboard routes
  const vendorProtected = [
    "/vendor/dashboard",
    "/vendor/leads",
    "/vendor/profile",
    "/vendor/reviews",
    "/vendor/analytics",
    "/vendor/calendar",
    "/vendor/clients",
    "/vendor/invoices",
  ];

  if (vendorProtected.some(p => pathname.startsWith(p)) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/vendor/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin
  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/vendor/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-logged-in users away from login/signup
  if ((pathname === "/vendor/login" || pathname === "/vendor/signup") && user) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/vendor/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
