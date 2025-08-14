import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { StockTransferForm } from "@/components/stock-transfer-form"
import { Plus, FileText } from "lucide-react"

export default function StockTransferPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Transfer" description="Transfer inventory between locations and manage stock movements.">
        <Button variant="outline" size="sm" className="mr-2">
          <FileText className="mr-2 h-4 w-4" />
          Transfer History
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </PageHeader>

      <StockTransferForm />
    </div>
  )
}

