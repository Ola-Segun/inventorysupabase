import { CustomerManagement } from "@/components/customer-management"

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">
          Manage customer information, view purchase history, and track loyalty points.
        </p>
      </div>

      <CustomerManagement />
    </div>
  )
}

