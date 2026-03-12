import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth checks are handled in page components (server-side)
// Middleware is minimal to avoid Edge runtime crypto issues
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
