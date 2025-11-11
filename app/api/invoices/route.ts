// app/api/invoices/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// ✅ GET all invoices
export async function GET() {
  try {
    const result = await db.query(
      `SELECT id, order_id, invoice_number, total, notes, created_at
       FROM invoices
       ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error("Error fetching invoices:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ POST new invoice
export async function POST(req: Request) {
  const { order_id, total, notes } = await req.json()
  if (!order_id) return NextResponse.json({ error: "Missing order_id" }, { status: 400 })

  try {
    const result = await db.query("SELECT COUNT(*) FROM invoices")
    const count = parseInt(result.rows[0].count) + 1
    const invoiceNumber = `INV-${count.toString().padStart(4, "0")}`

    const insert = await db.query(
      `INSERT INTO invoices (order_id, invoice_number, total, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, invoiceNumber, total || 0, notes || null]
    )

    return NextResponse.json(insert.rows[0])
  } catch (err) {
    console.error("Error creating invoice:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
