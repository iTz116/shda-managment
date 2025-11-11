import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // 1️⃣ Fetch invoice + customer info
    const invoiceResult = await db.query(
      `
      SELECT invoices.*, orders.customer_name, orders.customer_phone, orders.customer_location
      FROM invoices
      JOIN orders ON invoices.order_id = orders.id
      WHERE invoices.id = $1
      `,
      [id]
    )

    if (invoiceResult.rows.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = invoiceResult.rows[0]

    // 2️⃣ Fetch products/items of this order
    const itemsResult = await db.query(
      `
      SELECT product_name, quantity, price
      FROM order_items
      WHERE order_id = $1
      `,
      [invoice.order_id]
    )

    const items = itemsResult.rows.map((item) => ({
      name: item.product_name,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.quantity) * Number(item.price),
    }))

    // 3️⃣ Add items and total to invoice
    invoice.items = items
    invoice.total = items.reduce((sum: number, item: any) => sum + item.total, 0)

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
