"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

import {
  ShoppingCart,
  Package,
  Users,
  Settings,
  LayoutDashboard,
  ReceiptText,
  ChevronUp,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ✅ العناصر
const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: "Application" },
  { title: "Orders", url: "/dashboard/orders", icon: Package, group: "Application" },
  { title: "Employees", url: "/dashboard/employees", icon: Users, group: "Application" },
  { title: "Products", url: "/dashboard/inventory", icon: ShoppingCart, group: "Application" },
  { title: "Settings", url: "/settings", icon: Settings, group: "Application" },
  { title: "Invoices", url: "/invoices", icon: ReceiptText, group: "Finance" },
]

const groupedItems = {
  Application: items.filter((item) => item.group === "Application"),
  Finance: items.filter((item) => item.group === "Finance"),
}

export function AppSidebar() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return null // prevent hydration mismatch
  if (!session?.user) return null

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  return (
    <Sidebar side="left">
      <SidebarContent>
        {/* Application Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.Application.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Finance Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.Finance.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {session.user.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <a href="/dashboard/profile">Profile</a>
                </DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button onClick={handleSignOut}>Sign Out</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
