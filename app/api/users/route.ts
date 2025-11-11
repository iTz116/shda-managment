// app/api/users/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { admin } from "better-auth/plugins"

export async function GET(req: Request) {

  try {
    const result = await db.query('SELECT id, name, email, role FROM "user" ORDER BY id ASC')
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error("Error fetching users:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
