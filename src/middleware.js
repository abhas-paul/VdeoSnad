import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const secret = process.env.NEXT_PUBLIC_MEETING_CODE_SECRET;

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/auth";
  const isMeetingPath = pathname.startsWith("/meeting/");

  // ✅ 1. Unauthenticated users blocked except /auth
  if (!token && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // ✅ 2. Authenticated users blocked from /auth
  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ 3. Validate meeting code
  if (isMeetingPath) {
    const meetingCode = pathname.split("/meeting/")[1];
    const isValidCode = meetingCode?.includes(secret);

    if (!isValidCode) {
      const url = request.nextUrl.clone();
      url.pathname = "/not-found"; // This should trigger your not-found page
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api).*)"],
};
