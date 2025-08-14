import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { SuppliersTable } from "@/components/suppliers-table"
import { Plus, Upload, Download } from "lucide-react"

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="Manage your suppliers, contacts, and purchase orders.">
        <Button variant="outline" size="sm" className="mr-2">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </PageHeader>

      <SuppliersTable />
    </div>
  )
}

