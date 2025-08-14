"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

interface TopProduct {
  id: string
  name: string
  category: string
  quantity: number
  totalSpent: number
  lastPurchased: string
}

const topProducts: TopProduct[] = [
  {
    id: "1",
    name: "Organic Apples (Case)",
    category: "Grocery",
    quantity: 24,
    totalSpent: 1103.76,
    lastPurchased: "Mar 25, 2025",
  },
  {
    id: "2",
    name: "Whole Wheat Bread (24 Pack)",
    category: "Bakery",
    quantity: 18,
    totalSpent: 656.82,
    lastPurchased: "Mar 22, 2025",
  },
  {
    id: "3",
    name: "Organic Milk (12 Gallons)",
    category: "Dairy",
    quantity: 15,
    totalSpent: 824.85,
    lastPurchased: "Mar 25, 2025",
  },
  {
    id: "4",
    name: "Chicken Breast (40 lbs)",
    category: "Meat",
    quantity: 12,
    totalSpent: 1079.88,
    lastPurchased: "Mar 22, 2025",
  },
  {
    id: "5",
    name: "Sparkling Water (24 Case)",
    category: "Beverages",
    quantity: 20,
    totalSpent: 429.8,
    lastPurchased: "Mar 18, 2025",
  },
  {
    id: "6",
    name: "Paper Towels (Industrial)",
    category: "Household",
    quantity: 15,
    totalSpent: 494.85,
    lastPurchased: "Mar 18, 2025",
  },
  {
    id: "7",
    name: "Ground Beef (40 lbs)",
    category: "Meat",
    quantity: 8,
    totalSpent: 1023.92,
    lastPurchased: "Mar 22, 2025",
  },
  {
    id: "8",
    name: "Cheddar Cheese (20 lbs)",
    category: "Dairy",
    quantity: 10,
    totalSpent: 754.9,
    lastPurchased: "Mar 22, 2025",
  },
]

export function SellerTopProducts() {
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Grocery: "bg-green-500 hover:bg-green-600",
      Bakery: "bg-orange-500 hover:bg-orange-600",
      Dairy: "bg-blue-500 hover:bg-blue-600",
      Meat: "bg-red-500 hover:bg-red-600",
      Beverages: "bg-purple-500 hover:bg-purple-600",
      Household: "bg-gray-500 hover:bg-gray-600",
    }

    return <Badge className={colors[category] || "bg-primary"}>{category}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead>Last Purchased</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{getCategoryBadge(product.category)}</TableCell>
              <TableCell className="text-right">{product.quantity}</TableCell>
              <TableCell className="text-right">${product.totalSpent.toFixed(2)}</TableCell>
              <TableCell>{product.lastPurchased}</TableCell>
              <TableCell className="text-right">
                <Button size="sm">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Purchase
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

