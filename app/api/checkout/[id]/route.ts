import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, phone, location } = await req.json()

  if (!name || !phone || !location) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  try {
    // 1️⃣ تحديث الطلب
    await db.query(
      `
      UPDATE orders
      SET customer_name = $1,
          customer_phone = $2,
          customer_location = $3,
          check_out = TRUE
      WHERE id = $4
      `,
      [name, phone, location, id]
    )

    // 2️⃣ إنشاء رقم فاتورة فريد
    const countResult = await db.query("SELECT COUNT(*) FROM invoices")
    const count = parseInt(countResult.rows[0].count) + 1
    const invoiceNumber = `INV-${count.toString().padStart(4, "0")}`

    // 3️⃣ إنشاء الفاتورة في قاعدة البيانات
    const invoiceResult = await db.query(
      `
      INSERT INTO invoices (order_id, invoice_number, total)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id, invoiceNumber, 0] // حالياً total = 0، نقدر نحسبها لاحقاً من المنتجات
    )

    const invoice = invoiceResult.rows[0]

    return NextResponse.json({
      success: true,
      message: "Checkout completed and invoice created",
      invoice,
    })
  } catch (error) {
    console.error("❌ Error processing checkout:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
