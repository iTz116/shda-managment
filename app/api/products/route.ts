import {db as pool}  from "@/lib/db"

function getStatus(quantity: number, min_quantity: number) {
  if (quantity === 0) return "out_of_stock"
  if (quantity < min_quantity) return "low_stock"
  return "available"
}

// 🟢 GET all products
export async function GET() {
  const client = await pool.connect()
  try {
    const res = await client.query("SELECT * FROM products ORDER BY id DESC")
    return Response.json(res.rows)
  } finally {
    client.release()
  }
}

// 🟡 POST create product
export async function POST(req: Request) {
  const data = await req.json()
  const { name, category, description, price, cost_price, quantity, min_quantity } = data

  const sku = `PRD-${Math.floor(10000 + Math.random() * 90000)}`
  const status = getStatus(quantity, min_quantity)

  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO products 
        (name, sku, category, description, price, cost_price, quantity, min_quantity, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [name, sku, category, description, price, cost_price, quantity, min_quantity, status]
    )
    return Response.json(result.rows[0])
  } finally {
    client.release()
  }
}

// 🟣 PUT update product
export async function PUT(req: Request) {
  const data = await req.json()
  const { id, name, category, description, price, cost_price, quantity, min_quantity } = data
  const status = getStatus(quantity, min_quantity)

  const client = await pool.connect()
  try {
    const result = await client.query(
      `UPDATE products 
       SET name=$1, category=$2, description=$3, price=$4, cost_price=$5,
           quantity=$6, min_quantity=$7, status=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING *`,
      [name, category, description, price, cost_price, quantity, min_quantity, status, id]
    )
    return Response.json(result.rows[0])
  } finally {
    client.release()
  }
}

// 🔴 DELETE product
export async function DELETE(req: Request) {
  const { id } = await req.json()
  const client = await pool.connect()
  try {
    await client.query("DELETE FROM products WHERE id=$1", [id])
    return Response.json({ success: true })
  } finally {
    client.release()
  }
}
