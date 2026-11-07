import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import {
  isPublicPath,
  PRIVATE_CACHE_CONTROL,
  safeReturnPath,
} from "./lib/access";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response: NextResponse;
  if (isPublicPath(path)) {
    response = NextResponse.next();
  } else {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
        query: { disableCookieCache: true },
      });
      if (session) {
        response = NextResponse.next();
      } else if (path.startsWith("/api/")) {
        response = NextResponse.json(
          { error: "Sign in to continue." },
          { status: 401 },
        );
      } else {
        const signIn = new URL("/auth/signin", request.url);
        signIn.searchParams.set(
          "callbackUrl",
          safeReturnPath(path + request.nextUrl.search),
        );
        response = NextResponse.redirect(signIn);
      }
    } catch {
      response = NextResponse.json(
        { error: "Access could not be checked. Try again." },
        { status: 503 },
      );
    }
  }
  response.headers.set("Cache-Control", PRIVATE_CACHE_CONTROL);
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  runtime: "nodejs",
  // Do not exclude _next/data: it can return private server-rendered page data.
  matcher: ["/((?!_next/static/|_next/image$|favicon.ico$|images/).*)"],
};
