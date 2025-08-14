import { InventoryTable } from "@/components/inventory-table"
import { CategoriesTable } from "@/components/categories-table"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Download, BarChart2, Package, Truck, ArrowLeftRight, Boxes } from "lucide-react"
import Link from "next/link"
import { StockLevelManagement } from "@/components/stock-level-management"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory Management"
        description="Track stock levels, manage products, and monitor inventory movements."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="mr-2">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="mr-2">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Boxes className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="stock">
            <BarChart2 className="mr-2 h-4 w-4" />
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="mr-2 h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-4">
          <InventoryTable />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <CategoriesTable />
        </TabsContent>
        <TabsContent value="stock" className="space-y-4">
          <StockLevelManagement />
        </TabsContent>
        <TabsContent value="transfers" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm flex flex-col items-center justify-center">
            <ArrowLeftRight className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">Stock Transfers</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
              Transfer inventory between locations and manage stock movements.
            </p>
            <Button asChild>
              <Link href="/stock-transfer">Create Transfer</Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="suppliers" className="space-y-4">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm flex flex-col items-center justify-center">
            <Truck className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">Supplier Management</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
              Manage supplier information, purchase orders, and supplier relationships.
            </p>
            <Button asChild>
              <Link href="/suppliers">View Suppliers</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


