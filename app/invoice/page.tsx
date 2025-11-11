"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { jsPDF } from "jspdf"

interface Invoice {
  id: number
  order_id: number
  invoice_number: string
  total: number
  notes?: string
  created_at: string
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const orderIdRef = useRef<HTMLInputElement>(null)
  const totalRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/invoices", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch invoices")
      const data = await res.json()
      setInvoices(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  // Create new invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderIdRef.current || !totalRef.current) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: parseInt(orderIdRef.current.value),
          total: parseFloat(totalRef.current.value),
          notes: notesRef.current?.value || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to create invoice")

      orderIdRef.current.value = ""
      totalRef.current.value = ""
      if (notesRef.current) notesRef.current.value = ""
      setShowForm(false)
      fetchInvoices()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Download PDF
  const downloadPDF = (invoice: Invoice) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Invoice: ${invoice.invoice_number}`, 20, 20)
    doc.setFontSize(12)
    doc.text(`Order ID: ${invoice.order_id}`, 20, 40)
    doc.text(`Total: $${Number(invoice.total).toFixed(2)}`, 20, 50)
    doc.text(`Notes: ${invoice.notes || "-"}`, 20, 60)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleString()}`, 20, 70)
    doc.save(`${invoice.invoice_number}.pdf`)
  }

  // Show loading while session is pending
  if (isPending) return <div className="p-6">Loading session...</div>

  // Admin-only protection
  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="p-6 text-red-600 font-bold">
        Access Denied. Admins only.
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header + Toggle Form */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Invoice"}
        </button>
      </div>

      {/* Invoice Creation Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 border rounded shadow space-y-4"
        >
          <div>
            <label className="block font-medium">Order ID</label>
            <input
              type="number"
              ref={orderIdRef}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Total</label>
            <input
              type="number"
              step="0.01"
              ref={totalRef}
              required
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Notes</label>
            <input
              type="text"
              ref={notesRef}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {submitting ? "Creating..." : "Create Invoice"}
          </button>
        </form>
      )}

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>ID</th>
              <th>Invoice #</th>
              <th>Order ID</th>
              <th>Total</th>
              <th>Notes</th>
              <th>Created At</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-6 animate-pulse bg-gray-100"
                      >
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))
              : invoices.length === 0
              ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              )
              : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.id}</td>
                    <td className="px-4 py-2">{inv.invoice_number}</td>
                    <td className="px-4 py-2">{inv.order_id}</td>
                    <td className="px-4 py-2">${Number(inv.total).toFixed(2)}</td>
                    <td className="px-4 py-2">{inv.notes || "-"}</td>
                    <td className="px-4 py-2">
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => downloadPDF(inv)}
                        className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
