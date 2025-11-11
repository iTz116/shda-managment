"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Product {
  id: number
  name: string
  sku: string
  category: string
  price: number
  cost_price: number
  quantity: number
  min_quantity: number
  description: string
  status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [form, setForm] = useState<any>({
    id: null,
    name: "",
    category: "",
    price: "",
    cost_price: "",
    quantity: "",
    min_quantity: "",
    description: "",
  })

  // Fetch products
  const fetchProducts = async () => {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Create or update product
  const handleSave = async () => {
    const method = isEditing ? "PUT" : "POST"
    await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setOpen(false)
    setIsEditing(false)
    fetchProducts()
  }

  // Delete product
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchProducts()
  }

  // Edit product
  const handleEdit = (product: Product) => {
    setForm(product)
    setIsEditing(true)
    setOpen(true)
  }

  // Close dialog
  const handleDialogClose = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setIsEditing(false)
      setForm({
        id: null,
        name: "",
        category: "",
        price: "",
        cost_price: "",
        quantity: "",
        min_quantity: "",
        description: "",
      })
    }
  }

  // Extract all unique categories
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean))
    return ["all", ...Array.from(unique)]
  }, [products])

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Button onClick={() => setOpen(true)}>Add Product</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2"
        />

        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-1/4">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Status</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.sku}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">${p.price}</td>
              <td className="border p-2">{p.quantity}</td>
              <td
                className={`border p-2 ${
                  p.status === "out_of_stock"
                    ? "text-red-500"
                    : p.status === "low_stock"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                {p.status}
              </td>
              <td className="border p-2 text-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}

          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {["name", "category", "price", "cost_price", "quantity", "min_quantity", "description"].map(
              (key) => (
                <div key={key}>
                  <Label>{key.replace("_", " ")}</Label>
                  <Input
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </div>
              )
            )}
            <Button className="w-full mt-3" onClick={handleSave}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
