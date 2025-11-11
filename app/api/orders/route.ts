// app/api/orders/route.ts
import { NextResponse } from "next/server";
import {db} from "@/lib/db";
import { broadcast } from "@/lib/ws-server";

// ✅ GET all orders
export async function GET() {
  try {
    const result = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// ✅ POST new order
export async function POST(request: Request) {
  try {
    const { customer_name, product_id, total, status } =
      await request.json();

    const result = await db.query(
      `INSERT INTO orders (customer_name, product_id, total, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_name, product_id, total, status]
    );

    const newOrder = result.rows[0];

    // 🔥 Notify all connected WS clients
    broadcast({ type: "new_order", order: newOrder });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
