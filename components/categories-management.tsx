"use client"

import { useState, useEffect } from "react"
import { CategoriesTable } from "@/components/categories-table"
import { CategoryHierarchyView } from "@/components/category-hierarchy-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CategoryStats } from "@/components/category-stats"

export function CategoriesManagement() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <CategoryStats isLoading={isLoading} />

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card className="p-6">
            <CategoriesTable />
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <Card className="p-6">
            <CategoryHierarchyView />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
