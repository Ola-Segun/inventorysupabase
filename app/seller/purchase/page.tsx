import { NewPurchase } from "@/components/seller/new-purchase"

export default function NewPurchasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">New Purchase</h1>
        <p className="text-muted-foreground">Browse products and add them to your cart to make a new purchase.</p>
      </div>

      <NewPurchase />
    </div>
  )
}

