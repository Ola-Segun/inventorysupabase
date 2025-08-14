import { AdminUserManagement } from "@/components/admin/admin-user-management"

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, monitor activities, and control permissions.</p>
      </div>

      <AdminUserManagement />
    </div>
  )
}

