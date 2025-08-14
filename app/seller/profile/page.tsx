import { SellerProfile } from "@/components/seller/seller-profile"

export default function SellerProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage your personal information, payment methods, and notification preferences.
        </p>
      </div>

      <SellerProfile />
    </div>
  )
}

