import { InvoicesPage } from "@/components/seller/invoices-page"

export default function SellerInvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">Manage and pay your outstanding invoices.</p>
      </div>

      <InvoicesPage />
    </div>
  )
}

