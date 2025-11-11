"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Invoice {
  id: number
  customer_name?: string
  customer_phone?: string
  customer_location?: string
  invoice_number: string
  total: number
  created_at: string
}

export default function InvoicePage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`)
        if (!res.ok) throw new Error("Invoice not found")
        const data = await res.json()
        // ensure total is number
        data.total = Number(data.total) || 0
        setInvoice(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchInvoice()
  }, [id])

  const handleDownloadPDF = () => {
    if (!invoice) return

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

    // Company Info
    doc.setTextColor(textGray)
    doc.setFontSize(11)
    doc.text("SHDA Store", 20, 55)
    doc.text("Amman, Jordan", 20, 62)
    doc.text("support@shda.com", 20, 69)

    // Customer Info
    doc.setFontSize(13)
    doc.setTextColor("#000")
    doc.text("Bill To:", 140, 55)
    doc.setFontSize(11)
    doc.setTextColor(textGray)
    doc.text(invoice.customer_name || "N/A", 140, 62)
    doc.text(invoice.customer_phone || "N/A", 140, 69)
    doc.text(invoice.customer_location || "N/A", 140, 76)

    // Example Table (replace with real order items if you have)
    const items = [
      ["Product A", "2", "$25.00", "$50.00"],
      ["Product B", "1", "$35.00", "$35.00"],
    ]

    autoTable(doc, {
      head: [["Item", "Qty", "Price", "Total"]],
      body: items,
      startY: 95,
      theme: "striped",
      headStyles: { fillColor: accentColor, textColor: "#fff", halign: "center" },
      styles: { textColor: "#000", halign: "center" },
    })

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text("Total:", 150, finalY)
    doc.text(`$${invoice.total.toFixed(2)}`, 180, finalY)

    // Footer
    doc.setDrawColor(accentColor)
    doc.line(20, 280, 190, 280)
    doc.setFontSize(10)
    doc.setTextColor(textGray)
    doc.text("Thank you for your business!", 20, 288)
    doc.text("www.shda.com", 160, 288)

    doc.save(`Invoice-${invoice.invoice_number}.pdf`)
  }

  if (!invoice) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Invoice #{invoice.invoice_number}
      </h1>

      <div className="space-y-2">
        <p><strong>Customer:</strong> {invoice.customer_name || "-"}</p>
        <p><strong>Phone:</strong> {invoice.customer_phone || "-"}</p>
        <p><strong>Location:</strong> {invoice.customer_location || "-"}</p>
        <p><strong>Total:</strong> ${invoice.total.toFixed(2)}</p>
        <p><strong>Date:</strong> {new Date(invoice.created_at).toLocaleString()}</p>
      </div>

      <Button className="mt-6 w-full" onClick={handleDownloadPDF}>
        Download Modern Invoice (PDF)
      </Button>
    </div>
  )
}
