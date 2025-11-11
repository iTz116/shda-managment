"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface Invoice {
  id: number
  order_id: number
  invoice_number: string
  total: number
  notes?: string
  created_at: string
  customer_name: string
  customer_phone: string
  customer_location: string
  items?: { name: string; quantity: number; price: number; total: number }[]
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

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

  useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== "admin")) {
      router.push("/login")
    }
    fetchInvoices()
  }, [isPending, session, router])

  const downloadPDF = (invoice: Invoice) => {
    if (!invoice.items) return
    const doc = new jsPDF()
    const accentColor = "#6C63FF"
    const textGray = "#555"

    // Header
    doc.setFillColor(accentColor)
    doc.rect(0, 0, 210, 40, "F")
    doc.setFontSize(22)
    doc.setTextColor("#fff")
    doc.text("INVOICE", 20, 25)
    doc.setFontSize(12)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 20)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 150, 30)

    // Customer Info
    doc.setTextColor(textGray)
    doc.setFontSize(11)
    doc.text("Bill To:", 20, 55)
    doc.setTextColor("#000")
    doc.text(invoice.customer_name, 20, 62)
    doc.text(invoice.customer_phone, 20, 69)
    doc.text(invoice.customer_location, 20, 76)

    // Table
    const itemsTable = invoice.items.map((item) => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${item.total.toFixed(2)}`,
    ])

    autoTable(doc, {
      head: [["Item", "Qty", "Price", "Total"]],
      body: itemsTable,
      startY: 95,
      theme: "striped",
      headStyles: { fillColor: accentColor, textColor: "#fff", halign: "center" },
      styles: { textColor: "#000", halign: "center" },
    })

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10
    const subtotal = invoice.items.reduce((sum, i) => sum + i.total, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    doc.setFontSize(12)
    doc.setTextColor("#000")
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 150, finalY)
    doc.text(`Tax (10%): $${tax.toFixed(2)}`, 150, finalY + 8)
    doc.setFontSize(14)
    doc.setTextColor(accentColor)
    doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 18)

    // Footer
    doc.setDrawColor(accentColor)
    doc.line(20, 280, 190, 280)
    doc.setFontSize(10)
    doc.setTextColor(textGray)
    doc.text("Thank you for your business!", 20, 288)
    doc.text("www.shda.com", 160, 288)

    doc.save(`Invoice-${invoice.invoice_number}.pdf`)
  }

  if (!session?.user || session.user.role !== "admin") return null

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>ID</th>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 6 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-6 animate-pulse bg-gray-100">&nbsp;</td>
                    ))}
                  </tr>
                ))
              : invoices.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )
              : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{inv.id}</td>
                    <td className="px-4 py-2">{inv.invoice_number}</td>
                    <td className="px-4 py-2">{inv.customer_name}</td>
                    <td className="px-4 py-2">${Number(inv.total).toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(inv.created_at).toLocaleString()}</td>
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
