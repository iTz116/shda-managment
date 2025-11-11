"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewOrderDialog() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customer_name = formData.get("customer_name") as string;
    const product_id = formData.get("product_id") as string;
    const total = parseFloat(formData.get("total") as string);
    const status = formData.get("status") as string;

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_name, product_id, total, status }),
    });

    setLoading(false);
    setOpen(false);
    window.location.reload(); // Refresh page to show new order
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">+ New Order</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
          <DialogDescription>Add a new order with customer and product details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input id="customer_name" name="customer_name" required />
          </div>

          <div>
            <Label htmlFor="product_id">Product ID</Label>
            <Input id="product_id" name="product_id" required />
          </div>

          <div>
            <Label htmlFor="total">Total</Label>
            <Input id="total" name="total" type="number" step="0.01" required />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" name="status" placeholder="Pending / Completed / Shipped" required />
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Order"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
