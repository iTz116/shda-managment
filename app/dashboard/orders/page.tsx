import { NewOrderDialog } from "@/components/NewOrderDialog";
import { OrdersList } from "@/components/OrdersList";

export default async function OrdersPage() {
  let orders: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`, {
      cache: "no-store",
    });

    if (res.ok) {
      // ✅ Try parse JSON safely
      orders = await res.json();
    } else {
      console.error("❌ Failed to fetch orders:", res.status, res.statusText);
    }
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <NewOrderDialog />
      </div>

      <OrdersList initialOrders={orders || []} />
    </div>
  );
}
