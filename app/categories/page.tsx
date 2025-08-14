import { PageHeader } from "@/components/page-header"
import { CategoriesManagement } from "@/components/categories-management"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CategoriesPage() {
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Categories Management" description="Create, organize, and manage product categories">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      <CategoriesManagement />
    </div>
  )
}
