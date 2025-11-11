import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { broadcast } from "@/lib/ws-server"

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params // 👈 unwrap the Promise
    const { status } = await req.json()

    const result = await db.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, params.id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updatedOrder = result.rows[0]
    broadcast({ type: "order_status_updated", order: updatedOrder })
    return NextResponse.json(updatedOrder, { status: 200 })
  } catch (err) {
    console.error("❌ Error updating order status:", err)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
