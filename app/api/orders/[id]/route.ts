import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
