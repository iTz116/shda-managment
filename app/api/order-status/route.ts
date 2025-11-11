import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET all statuses
export async function GET() {
  const { rows } = await pool.query("SELECT * FROM order_statuses ORDER BY id ASC")
  return NextResponse.json(rows)
}

// POST new status
export async function POST(req: Request) {
  const { name, color } = await req.json()
  const result = await pool.query(
    "INSERT INTO order_statuses (name, color) VALUES ($1, $2) RETURNING *",
    [name, color]
  )
  return NextResponse.json(result.rows[0])
}
