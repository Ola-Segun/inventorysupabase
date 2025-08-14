import { MenuManagement } from "@/components/menu-management"

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-muted-foreground">
          Create and manage menu items, recipes, and ingredients for your restaurant.
        </p>
      </div>

      <MenuManagement />
    </div>
  )
}

