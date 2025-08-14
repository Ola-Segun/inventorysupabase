"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Package, ShoppingCart, AlertCircle, Check, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define notification types
interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "system" | "inventory" | "order" | "alert"
  read: boolean
  icon: React.ReactNode
  link?: string
}

// Sample notifications data
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "System Update",
    description:
      "The system will undergo maintenance tonight from 2 AM to 4 AM. Please save your work before this time.",
    time: "2 hours ago",
    type: "system",
    read: false,
    icon: <Bell className="h-5 w-5 text-primary" />,
  },
  {
    id: "2",
    title: "Low Stock Alert",
    description: "7 items are running low on stock and need to be replenished.",
    time: "5 hours ago",
    type: "inventory",
    read: false,
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    link: "/inventory",
  },
  {
    id: "3",
    title: "New Order",
    description: "Order #1234 has been placed for $156.99.",
    time: "Yesterday",
    type: "order",
    read: true,
    icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
    link: "/sales",
  },
  {
    id: "4",
    title: "Inventory Update",
    description: "24 new items have been added to the inventory.",
    time: "2 days ago",
    type: "inventory",
    read: true,
    icon: <Package className="h-5 w-5 text-blue-500" />,
    link: "/inventory",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">View and manage your notifications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>All Notifications</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("unread")}>Unread Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("system")}>System Updates</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("inventory")}>Inventory Alerts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("order")}>Order Updates</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>Your latest alerts and updates</CardDescription>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    {notification.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      {notification.link && (
                        <Button
                          variant="link"
                          className="px-0 text-sm"
                          onClick={() => {
                            window.location.href = notification.link!
                          }}
                        >
                          View Details
                        </Button>
                      )}
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No notifications found</p>
                <p className="text-xs text-muted-foreground">
                  {activeTab !== "all" ? "Try changing your filter settings" : "You're all caught up!"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure your notification preferences in the Settings page.</p>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.href = "/settings"
            }}
          >
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

