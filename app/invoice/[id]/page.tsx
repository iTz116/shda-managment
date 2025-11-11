"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceItem {
  name: string
  quantity: number
  price: number
  total: number
}

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
  items: InvoiceItem[]
}

export default function PublicInvoicePage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(`/api/invoices/${id}`)
      const data: Invoice = await res.json()
      setInvoice(data)
    }
    fetchInvoice()
  }, [id])

  const downloadPDF = () => {
    if (!invoice || !invoice.items) return
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
    const itemsTable = invoice.items.map((item: InvoiceItem) => [
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

    doc.save(`Invoice-${invoice.invoice_number}.pdf`)
  }

  if (!invoice) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Invoice #{invoice.invoice_number}
      </h1>

      <div className="space-y-2">
        <p><strong>Customer:</strong> {invoice.customer_name}</p>
        <p><strong>Phone:</strong> {invoice.customer_phone}</p>
        <p><strong>Location:</strong> {invoice.customer_location}</p>
        <p><strong>Subtotal:</strong> ${invoice.items.reduce((sum, i) => sum + i.total, 0).toFixed(2)}</p>
        <p><strong>Tax (10%):</strong> ${(invoice.items.reduce((sum, i) => sum + i.total, 0) * 0.1).toFixed(2)}</p>
        <p><strong>Total:</strong> ${(invoice.items.reduce((sum, i) => sum + i.total, 0) * 1.1).toFixed(2)}</p>
      </div>

      <table className="w-full mt-4 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 border">Item</th>
            <th className="px-2 py-1 border">Qty</th>
            <th className="px-2 py-1 border">Price</th>
            <th className="px-2 py-1 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: InvoiceItem, idx: number) => (
            <tr key={idx}>
              <td className="px-2 py-1 border">{item.name}</td>
              <td className="px-2 py-1 border">{item.quantity}</td>
              <td className="px-2 py-1 border">${item.price.toFixed(2)}</td>
              <td className="px-2 py-1 border">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button className="mt-6 w-full" onClick={downloadPDF}>
        Download Invoice (PDF)
      </Button>
    </div>
  )
}
