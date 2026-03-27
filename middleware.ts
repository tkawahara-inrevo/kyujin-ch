import { NextRequest, NextResponse } from "next/server";

// Auth checks are handled in page components (server-side)
// Middleware is minimal to avoid Edge runtime crypto issues
export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();

  if (hostname === "kyujin-ch.com" || hostname === "www.kyujin-ch.com") {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.protocol = "https:";
    redirectUrl.hostname = "kyujin-ch.jp";
    redirectUrl.port = "";

    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
