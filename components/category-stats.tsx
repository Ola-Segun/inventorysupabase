"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderTree, ShoppingBag, Tag, AlertTriangle } from "lucide-react"

interface CategoryStatsProps {
  isLoading?: boolean
}

export function CategoryStats({ isLoading = false }: CategoryStatsProps) {
  // Sample data - in a real app, this would come from an API
  const stats = {
    totalCategories: 12,
    activeCategories: 11,
    totalProducts: 326,
    uncategorizedProducts: 8,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          <FolderTree className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-32" /> : `${stats.activeCategories} active categories`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products in Categories</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-32" /> : `Across all categories`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Category Depth</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">3 levels</div>}
          <div className="text-xs text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-32" /> : `Max hierarchy depth`}
          </div>
        </CardContent>
      </Card>

      <Card
        className={
          stats.uncategorizedProducts > 0
            ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
            : ""
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uncategorized Products</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${stats.uncategorizedProducts > 0 ? "text-amber-500" : "text-muted-foreground"}`}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.uncategorizedProducts}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : stats.uncategorizedProducts > 0 ? (
              "Products need categorization"
            ) : (
              "All products categorized"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
