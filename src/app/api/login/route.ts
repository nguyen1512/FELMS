import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirect = String(formData.get("redirect") || "");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=Vui lòng nhập email và mật khẩu", req.url)
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            data.message || "Email hoặc mật khẩu không đúng"
          )}`,
          req.url
        )
      );
    }

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user || data.data;

    const roles: string[] = Array.isArray(user?.roles)
      ? user.roles.map((role: any) => role.code).filter(Boolean)
      : [];

    let targetUrl = "/";

    const isEntranceTestAccount =
      email === "entrance01@anu.edu.vn" ||
      email === "entrance02@anu.edu.vn" ||
      email === "entrance03@anu.edu.vn";

    if (isEntranceTestAccount) {
      targetUrl = "/lms-student/entrance-test";
    } else if (redirect) {
      targetUrl = redirect;
    } else if (roles.includes("SUPER_ADMIN")) {
      targetUrl = "/";
    } else if (roles.includes("LMS_ADMIN")) {
      targetUrl = "/lms-admin";
    } else if (roles.includes("HR_MANAGER")) {
      targetUrl = "/admin";
    } else if (roles.includes("MANAGER")) {
      targetUrl = "/lms-admin";
    } else if (roles.includes("INSTRUCTOR")) {
      targetUrl = "/lms-admin";
    } else if (roles.includes("EMPLOYEE")) {
      targetUrl = "/employee";
    } else {
      targetUrl = "/employee";
    }

    const res = NextResponse.redirect(new URL(targetUrl, req.url));

    if (token) {
      res.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      res.cookies.set("accessToken", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (user?.id) {
      res.cookies.set("userId", user.id, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    res.cookies.set("user", JSON.stringify(user || {}), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("roles", JSON.stringify(roles), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Login route error:", error);

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Lỗi kết nối server đăng nhập")}`,
        req.url
      )
    );
  }
}