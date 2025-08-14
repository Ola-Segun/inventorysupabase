import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { OrdersTable } from "@/components/orders-table"
import { Plus, Download, Filter } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View, manage, and process customer orders.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="mr-2">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="mr-2">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </PageHeader>

      <OrdersTable />
    </div>
  )
}

