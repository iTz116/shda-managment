"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"

export default function CheckoutPage() {
  const { id } = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [alert, setAlert] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlert("")

    const res = await fetch(`/api/checkout/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, location }),
    })

    const data = await res.json()

    if (res.ok && data.invoice) {
      // ✅ بعد إنشاء الفاتورة، نحول العميل على صفحة الفاتورة
      router.push(`/invoice/${data.invoice.id}`)
    } else {
      setAlert(data.error || "Something went wrong.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>

      {alert && <Alert className="mb-4">{alert}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Location / Address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Confirm & Create Invoice
        </Button>
      </form>
    </div>
  )
}
