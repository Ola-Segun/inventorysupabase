import { AdminMessaging } from "@/components/admin/admin-messaging"

export default function AdminMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">Send messages to sellers and manage conversations.</p>
      </div>

      <AdminMessaging />
    </div>
  )
}

