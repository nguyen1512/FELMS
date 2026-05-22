import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        NOW() AS server_time,
        COUNT(*) AS total_users
      FROM users
    `);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("TEST_DB_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không kết nối được database",
      },
      { status: 500 }
    );
  }
}