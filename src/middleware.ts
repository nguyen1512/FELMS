import { NextRequest, NextResponse } from "next/server";

type RoleCode = "SUPER_ADMIN" | "LMS_ADMIN" | "EMPLOYEE";

function getRoleCode(request: NextRequest): string | null {
  const userCookie = request.cookies.get("user")?.value;

  if (!userCookie) return null;

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    return user?.roles?.[0]?.code || null;
  } catch {
    try {
      const user = JSON.parse(userCookie);
      return user?.roles?.[0]?.code || null;
    } catch {
      return null;
    }
  }
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.delete("token");
  response.cookies.delete("user");

  return response;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;
  const roleCode = getRoleCode(request) as RoleCode | null;

  if (!token || !roleCode) {
    return redirectToLogin(request);
  }

  if (roleCode === "SUPER_ADMIN") {
    return NextResponse.next();
  }

  if (roleCode === "LMS_ADMIN") {
    if (path.startsWith("/lms-admin") || path.startsWith("/employee")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/lms-admin", request.url));
  }

  if (roleCode === "EMPLOYEE") {
    if (path.startsWith("/employee")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/employee", request.url));
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/admin/:path*", "/lms-admin/:path*", "/employee/:path*"],
};