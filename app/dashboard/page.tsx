"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface Order {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Fetch recent orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.slice(0, 5)); // show last 5 orders
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchOrders();
  }, []);

  if (!session?.user) return null;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome back, {session.user.name}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Completed Orders</p>
          <p className="text-2xl font-bold">{completedOrders}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-bold mb-4">Recent Orders</h2>
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
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
                <td className="p-2">${order.total}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-2 text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
