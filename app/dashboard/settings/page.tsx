"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    currency: "JOD",
    language: "en",
    darkMode: false,
    whatsappApiKey: "",
    smtpEmail: "",
    smtpPassword: "",
  })

  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load existing settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error("Failed to fetch settings")
        const data = await res.json()
        if (data) {
          setSettings({
            companyName: data.company_name || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            currency: data.currency || "JOD",
            language: data.language || "en",
            darkMode: data.dark_mode || false,
            whatsappApiKey: data.whatsapp_api_key || "",
            smtpEmail: data.smtp_email || "",
            smtpPassword: data.smtp_password || "",
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchSettings()
  }, [])

  // Save settings to API
  const handleSave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setMessage("✅ Settings saved successfully!")
      } else {
        setMessage("❌ Failed to save settings.")
      }
    } catch (error) {
      console.error(error)
      setMessage("❌ Something went wrong.")
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Success or Error Message */}
      {message && (
        <div
          className={`p-3 rounded-md border ${
            message.includes("✅")
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Company Info */}
      <section className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-lg font-medium">Company Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Company Name</Label>
            <Input
              value={settings.companyName}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* System Preferences */}
      <section className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-lg font-medium">System Preferences</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(v) =>
                setSettings({ ...settings, currency: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JOD">JOD</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language</Label>
            <Select
              value={settings.language}
              onValueChange={(v) =>
                setSettings({ ...settings, language: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) =>
                setSettings({ ...settings, darkMode: v })
              }
            />
            <Label>Enable Dark Mode</Label>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-lg font-medium">Integrations</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>WhatsApp API Key</Label>
            <Input
              type="password"
              value={settings.whatsappApiKey}
              onChange={(e) =>
                setSettings({ ...settings, whatsappApiKey: e.target.value })
              }
            />
          </div>
          <div>
            <Label>SMTP Email</Label>
            <Input
              value={settings.smtpEmail}
              onChange={(e) =>
                setSettings({ ...settings, smtpEmail: e.target.value })
              }
            />
          </div>
          <div>
            <Label>SMTP Password</Label>
            <Input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) =>
                setSettings({ ...settings, smtpPassword: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
