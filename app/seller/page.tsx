import { SellerDashboard } from "@/components/seller/seller-dashboard"

export default function SellerDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your purchases and account status.</p>
      </div>

      <SellerDashboard />
    </div>
  )
}

