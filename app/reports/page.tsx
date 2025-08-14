import { ReportsInterface } from "@/components/reports-interface"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">View sales data, analyze trends, and export reports.</p>
      </div>

      <ReportsInterface />
    </div>
  )
}

