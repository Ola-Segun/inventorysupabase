import { SellerMessaging } from "@/components/seller/seller-messaging"

export default function SellerMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">View and respond to messages from administrators.</p>
      </div>

      <SellerMessaging />
    </div>
  )
}

