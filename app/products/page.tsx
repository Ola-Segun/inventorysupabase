import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { ProductsTable } from "@/components/products-table"
import { Plus, Upload, Download } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalog, categories, and pricing.">
        <Button variant="outline" size="sm" className="mr-2">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      <ProductsTable />
    </div>
  )
}

