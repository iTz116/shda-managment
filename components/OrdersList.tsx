"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Order {
  id: number
  customer_name: string
  product_id: number
  total: number
  status: string
  created_at: string
}

const STATUS_OPTIONS = ["Pending", "Processing", "Completed", "Cancelled"]

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)

  // 🌐 Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "order_status_updated") {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        )
      }

      if (data.type === "new_order") {
        setOrders((prev) => [data.order, ...prev])
      }
    }

    ws.onopen = () => console.log("🟢 Connected to WS server")
    ws.onclose = () => console.log("🔴 WS connection closed")
    ws.onerror = (err) => console.error("❌ WS error:", err)

    return () => ws.close()
  }, [])

  // Update status via API
  async function handleStatusChange(orderId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      // state will update automatically via WebSocket
    } catch (err) {
      console.error("❌ Error updating status:", err)
      alert("Failed to update status")
    }
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Product</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.customer_name}</td>
                <td className="p-2">{order.product_id}</td>
                <td className="p-2">${order.total}</td>
                <td className="p-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
