import { SalesInterface } from "@/components/sales-interface"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Receipt, History, FileText } from "lucide-react"
import { MiniOrdersTable } from "@/components/mini-orders-table"

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Point of Sale" className="w-fit" description="Process sales, manage orders, and generate receipts.">
        {/* <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            Order History
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </Button>
        </div> */}
      </PageHeader>

      <Tabs defaultValue="pos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pos">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Point of Sale
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Receipt className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pos" className="space-y-4">
          <SalesInterface />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <MiniOrdersTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

