import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("anu_lms_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const userResult = await query(
      `
      SELECT id, full_name, email, phone, avatar_url, position, status
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const rolesResult = await query(`SELECT * FROM get_user_roles($1)`, [
      user.id,
    ]);

    const permissionsResult = await query(
      `SELECT * FROM get_user_permissions($1)`,
      [user.id]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        position: user.position,
        status: user.status,
        roles: rolesResult.rows,
        permissions: permissionsResult.rows,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}