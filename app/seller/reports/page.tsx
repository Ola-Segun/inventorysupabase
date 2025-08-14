import { SellerReports } from "@/components/seller/seller-reports"

export default function SellerReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Seller Reports</h1>
        <p className="text-muted-foreground">Analyze your spending patterns and purchase history.</p>
      </div>

      <SellerReports />
    </div>
  )
}

