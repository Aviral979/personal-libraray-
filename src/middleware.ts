import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that checks for admin routes
// Auth validation happens in server components/actions, not in edge middleware
// This avoids Prisma client issues with Edge Runtime
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // For admin routes, check if there's a session token
  if (pathname.startsWith("/admin")) {
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
