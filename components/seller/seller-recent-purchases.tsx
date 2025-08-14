"use client"

import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Purchase {
  id: string
  date: Date
  items: number
  total: number
  status: "completed" | "processing" | "shipped"
}

const recentPurchases: Purchase[] = [
  {
    id: "PO-2023-001",
    date: new Date(2025, 2, 25),
    items: 12,
    total: 450.75,
    status: "completed",
  },
  {
    id: "PO-2023-002",
    date: new Date(2025, 2, 22),
    items: 8,
    total: 325.5,
    status: "shipped",
  },
  {
    id: "PO-2023-003",
    date: new Date(2025, 2, 18),
    items: 15,
    total: 780.25,
    status: "completed",
  },
  {
    id: "PO-2023-004",
    date: new Date(2025, 2, 15),
    items: 5,
    total: 150.0,
    status: "processing",
  },
]

export function SellerRecentPurchases() {
  const getStatusColor = (status: Purchase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "processing":
        return "bg-amber-500 hover:bg-amber-600"
      case "shipped":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      {recentPurchases.map((purchase) => (
        <div key={purchase.id} className="flex items-start gap-4 rounded-lg border p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-medium">{purchase.id}</div>
              <Badge className={getStatusColor(purchase.status)}>
                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(purchase.date, { addSuffix: true })}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-sm">{purchase.items} items</div>
              <div className="font-medium">${purchase.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

