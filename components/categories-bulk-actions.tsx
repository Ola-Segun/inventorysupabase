"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpDown, FileDown, Trash2, AlertTriangle } from "lucide-react"

interface CategoryBulkActionsProps {
  selectedCategories: string[]
  onClearSelection: () => void
  onBulkStatusChange: (status: "active" | "inactive") => void
  onBulkDelete: () => void
}

export function CategoryBulkActions({
  selectedCategories,
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete,
}: CategoryBulkActionsProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportOptions, setExportOptions] = useState({
    includeProducts: true,
    includeMetadata: false,
    includeStats: false,
  })

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${selectedCategories.length} categories as ${exportFormat.toUpperCase()}...`,
    })

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${selectedCategories.length} categories have been exported successfully.`,
      })
      setIsExportDialogOpen(false)
    }, 1500)
  }

  const handleBulkDelete = () => {
    if (!confirmDelete) return

    onBulkDelete()
    setIsDeleteDialogOpen(false)
    setConfirmDelete(false)
  }

  if (selectedCategories.length === 0) {
    return null
  }

  return (
    <div className="bg-muted/50 border rounded-md p-3 mb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-medium">{selectedCategories.length}</span> categories selected
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(value) => onBulkStatusChange(value as "active" | "inactive")}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Set Active</SelectItem>
              <SelectItem value="inactive">Set Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FileDown className="mr-2 h-3.5 w-3.5" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Categories</DialogTitle>
                <DialogDescription>
                  Export {selectedCategories.length} selected categories in your preferred format.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Export Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-products"
                        checked={exportOptions.includeProducts}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeProducts: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-products" className="text-sm font-normal">
                        Include product counts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-metadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeMetadata: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-metadata" className="text-sm font-normal">
                        Include metadata (created/updated dates)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-stats"
                        checked={exportOptions.includeStats}
                        onCheckedChange={(checked) =>
                          setExportOptions({ ...exportOptions, includeStats: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-stats" className="text-sm font-normal">
                        Include usage statistics
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport}>Export Categories</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="h-8">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
            Reorder
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Categories</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedCategories.length} categories? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="font-medium">Warning</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Deleting categories may impact products assigned to these categories and could affect your store's
                  navigation.
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="confirm-delete"
                    checked={confirmDelete}
                    onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
                  />
                  <Label htmlFor="confirm-delete" className="text-sm font-medium">
                    I understand that this action cannot be undone
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete} disabled={!confirmDelete}>
                  Delete Categories
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" className="h-8" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  )
}
