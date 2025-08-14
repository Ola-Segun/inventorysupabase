"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { FileUp, AlertTriangle, FileQuestion, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function CategoryImport() {
  const { toast } = useToast()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFormat, setImportFormat] = useState("csv")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importOptions, setImportOptions] = useState({
    updateExisting: true,
    skipErrors: false,
    importProducts: false,
  })
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    // Simulate import process with progress updates
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        const newProgress = prev + Math.floor(Math.random() * 15) + 5
        if (newProgress >= 100) {
          clearInterval(interval)

          // Simulate completion after reaching 100%
          setTimeout(() => {
            setIsImporting(false)
            setIsImportDialogOpen(false)
            setSelectedFile(null)

            toast({
              title: "Import Complete",
              description: "Categories have been imported successfully.",
            })
          }, 500)

          return 100
        }
        return newProgress
      })
    }, 500)
  }

  const handleDownloadTemplate = () => {
    toast({
      title: "Template Downloaded",
      description: `${importFormat.toUpperCase()} template has been downloaded.`,
    })
  }

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Import Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Categories</DialogTitle>
          <DialogDescription>
            Import categories from a file. Make sure your file follows the required format.
          </DialogDescription>
        </DialogHeader>

        {isImporting ? (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">Importing Categories</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we process your file...</p>
            </div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-sm text-center">{importProgress}% complete</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="import-format">File Format</Label>
                <Select value={importFormat} onValueChange={setImportFormat}>
                  <SelectTrigger id="import-format">
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Button variant="ghost" size="sm" onClick={handleDownloadTemplate} className="h-8">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Template
                  </Button>
                </div>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {selectedFile ? (
                        <>
                          <FileQuestion className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">{importFormat.toUpperCase()} (max. 10MB)</p>
                        </>
                      )}
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept={importFormat === "csv" ? ".csv" : importFormat === "json" ? ".json" : ".xlsx,.xls"}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Import Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="update-existing"
                      checked={importOptions.updateExisting}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, updateExisting: checked as boolean })
                      }
                    />
                    <Label htmlFor="update-existing" className="text-sm font-normal">
                      Update existing categories if IDs match
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skip-errors"
                      checked={importOptions.skipErrors}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, skipErrors: checked as boolean })
                      }
                    />
                    <Label htmlFor="skip-errors" className="text-sm font-normal">
                      Skip rows with errors and continue import
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="import-products"
                      checked={importOptions.importProducts}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, importProducts: checked as boolean })
                      }
                    />
                    <Label htmlFor="import-products" className="text-sm font-normal">
                      Import product assignments if included in file
                    </Label>
                  </div>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    This will import categories from the selected file. Existing categories may be affected based on
                    your import options.
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!selectedFile}>
                Import Categories
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
