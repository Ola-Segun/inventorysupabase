import type React from "react"
import { Package, ShoppingCart, DollarSign, AlertCircle } from "lucide-react"

interface ActivityItem {
  id: number
  icon: React.ReactNode
  title: string
  description: string
  timestamp: string
}

const activityData: ActivityItem[] = [
  {
    id: 1,
    icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    title: "New Sale",
    description: "Order #1234 - $156.99",
    timestamp: "Just now",
  },
  {
    id: 2,
    icon: <Package className="h-5 w-5 text-green-500" />,
    title: "Inventory Update",
    description: "Added 24 units of Organic Apples",
    timestamp: "2 hours ago",
  },
  {
    id: 3,
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    title: "Low Stock Alert",
    description: "Whole Wheat Bread is running low",
    timestamp: "3 hours ago",
  },
  {
    id: 4,
    icon: <DollarSign className="h-5 w-5 text-purple-500" />,
    title: "Daily Summary",
    description: "Total sales: $1,245.89",
    timestamp: "5 hours ago",
  },
  {
    id: 5,
    icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
    title: "New Sale",
    description: "Order #1233 - $89.50",
    timestamp: "6 hours ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activityData.map((item) => (
        <div key={item.id} className="flex items-start gap-4 rounded-lg border p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">{item.icon}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.timestamp}</p>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

