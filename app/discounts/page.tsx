import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { DiscountsTable } from "@/components/discounts-table"
import { Plus, Calendar } from "lucide-react"

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts & Promotions"
        description="Create and manage discounts, coupons, and promotional offers."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="mr-2">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Discount
          </Button>
        </div>
      </PageHeader>

      <DiscountsTable />
    </div>
  )
}

