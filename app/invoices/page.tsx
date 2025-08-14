import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InvoicesTable } from "@/components/invoices-table"
import { Plus, Download, Upload, Filter } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Manage invoices, track payments, and generate statements.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="mr-2">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="mr-2">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="mr-2">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {/* <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button> */}
        </div>
      </PageHeader>

      <InvoicesTable />
    </div>
  )
}

