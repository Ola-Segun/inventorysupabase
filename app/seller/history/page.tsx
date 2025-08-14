import { PurchaseHistory } from "@/components/seller/purchase-history"

export default function PurchaseHistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
        <p className="text-muted-foreground">View and track all your past purchases.</p>
      </div>

      <PurchaseHistory />
    </div>
  )
}

