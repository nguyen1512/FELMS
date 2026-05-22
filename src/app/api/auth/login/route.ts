import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

const JWT_SECRET =
  process.env.JWT_SECRET || "anu_lms_secret_key_change_later";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu email hoặc mật khẩu",
        },
        { status: 400 }
      );
    }

    // Lấy user
    const userResult = await query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản không tồn tại",
        },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Kiểm tra trạng thái
    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản đã bị khóa",
        },
        { status: 403 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Sai mật khẩu",
        },
        { status: 401 }
      );
    }

    // Lấy roles
    const rolesResult = await query(
      `
      SELECT *
      FROM get_user_roles($1)
      `,
      [user.id]
    );

    // Lấy permissions
    const permissionsResult = await query(
      `
      SELECT *
      FROM get_user_permissions($1)
      `,
      [user.id]
    );

    // JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Trả về
    return NextResponse.json({
      success: true,

      token,

      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        position: user.position,
        status: user.status,

        roles: rolesResult.rows,

        permissions: permissionsResult.rows,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 }
    );
  }
}