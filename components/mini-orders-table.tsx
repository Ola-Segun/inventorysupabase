"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

interface Order {
  id: string
  customer: string
  total: number
  status: "pending" | "completed" | "cancelled"
  date: string
}

// Sample data - replace with real data source
const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "John Doe",
    total: 45.99,
    status: "completed",
    date: "2024-01-20",
  },
  // Add more sample orders...
]

export function MiniOrdersTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm">
          View all <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 p-4 pt-0">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between space-x-4 rounded-md p-2 hover:bg-accent"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <Badge 
                    variant={
                      order.status === "completed" 
                        ? "success" 
                        : order.status === "cancelled" 
                        ? "destructive" 
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
