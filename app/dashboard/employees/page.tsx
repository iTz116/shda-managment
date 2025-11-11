"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { NewUserDialog } from "@/components/NewUserDialog"

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (!isPending && session?.user?.role !== "admin") {
      router.push("/") // or /dashboard
    }
  }, [isPending, session, router])

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === "admin") fetchUsers()
  }, [session])

  // Wait for session to load or redirect
  if (isPending || session?.user?.role !== "admin") return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <NewUserDialog onCreated={fetchUsers} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 4 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-6 animate-pulse bg-gray-100">&nbsp;</td>
                    ))}
                  </tr>
                ))
              : users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-2">{user.id}</td>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
