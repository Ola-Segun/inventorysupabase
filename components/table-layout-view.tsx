"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

interface Table {
  id: string
  name: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  section: "main" | "outdoor" | "private" | "bar"
}

interface TableLayoutViewProps {
  tables: Table[]
  onSelectTable: (table: Table) => void
  selectedTableId?: string
}

export function TableLayoutView({ tables, onSelectTable, selectedTableId }: TableLayoutViewProps) {
  // Group tables by section
  const tablesBySection = tables.reduce(
    (acc, table) => {
      if (!acc[table.section]) {
        acc[table.section] = []
      }
      acc[table.section].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-blue-500"
      case "cleaning":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Table["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-8">
      {Object.entries(tablesBySection).map(([section, sectionTables]) => (
        <div key={section} className="space-y-4">
          <h3 className="text-lg font-medium capitalize">{section} Section</h3>
          <div className="relative border rounded-lg p-6 bg-muted/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sectionTables.map((table) => (
                <div
                  key={table.id}
                  className={cn(
                    "relative cursor-pointer transition-all",
                    selectedTableId === table.id ? "scale-105" : "",
                  )}
                  onClick={() => onSelectTable(table)}
                >
                  <div className={cn("absolute inset-0 rounded-lg opacity-20", getStatusColor(table.status))}></div>
                  <Card
                    className={cn("border-2", selectedTableId === table.id ? "border-primary" : "border-transparent")}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="font-medium">{table.name}</div>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{table.capacity}</span>
                      </div>
                      <Badge className={cn("mt-2", getStatusColor(table.status))}>{getStatusText(table.status)}</Badge>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Section labels */}
            {section === "main" && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-lg font-light border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
                Main Dining Area
              </div>
            )}
            {section === "outdoor" && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-lg font-light border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
                Outdoor Patio
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

