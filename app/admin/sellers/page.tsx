import { AdminSellerManagement } from "@/components/admin/admin-seller-management"


export default function AdminSellersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Seller Management</h1>
        <p className="text-muted-foreground">Manage seller accounts, monitor activities, and control permissions.</p>
      </div>

      <AdminSellerManagement />
    </div>
  )
}

