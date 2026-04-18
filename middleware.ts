import { NextResponse, type NextRequest } from "next/server";

// Inject current pathname into request headers so server layouts can read it
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = { matcher: "/(.*)" };
