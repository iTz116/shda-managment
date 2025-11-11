import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  // ✅ unwrap params promise
  const { id } = await params

  // ✅ fetch the order from the database
  const res = await db.query("SELECT * FROM orders WHERE id = $1", [id])
  const order = res.rows[0]

  // ✅ if order not found, show 404
  if (!order) return notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Order #{order.id}</h1>

      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow-sm">
        <div>
          <p className="text-gray-500 font-medium">Customer Name</p>
          <p className="text-gray-900">{order.customer_name}</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium">Product ID</p>
          <p className="text-gray-900">{order.product_id}</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium">Total</p>
          <p className="text-gray-900">${order.total}</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium">Status</p>
          <p className="text-gray-900 capitalize">{order.status}</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium">Created At</p>
          <p className="text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">Checked Out</p>
          <p className="text-gray-900"><Link href={`/checkout/${order.id}`}>View</Link></p>
        </div>
        
      </div>
      
      

    </div>
  )
}
