import { TableManagement } from "@/components/table-management"

export default function TablesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
        <p className="text-muted-foreground">Manage restaurant tables, track reservations, and monitor table status.</p>
      </div>

      <TableManagement />
    </div>
  )
}

