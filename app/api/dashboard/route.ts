import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 👇 اجلب الإحصائيات من قاعدة البيانات
    const orders = await db.query("SELECT COUNT(*) FROM orders");
    const customers = await db.query("SELECT COUNT(DISTINCT customer) FROM orders");
    const inventory = await db.query("SELECT COUNT(*) FROM inventory"); // لو عندك جدول inventory
    const revenue = await db.query("SELECT COALESCE(SUM(total), 0) FROM orders"); // لو عندك عمود total

    return NextResponse.json({
      orders: Number(orders.rows[0].count),
      customers: Number(customers.rows[0].count),
      inventory: inventory.rows.length ? Number(inventory.rows[0].count) : 0,
      revenue: Number(revenue.rows[0].coalesce || 0),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
