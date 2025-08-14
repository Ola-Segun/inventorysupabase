"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Printer, Settings, Layers, Tag, RefreshCw, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BarcodeGeneratorProps {
  product?: {
    id: string
    name: string
    sku: string
    price: number
  }
  products?: Array<{
    id: string
    name: string
    sku: string
    price: number
  }>
  open: boolean
  onClose: () => void
}

type BarcodeFormat = "CODE128" | "EAN13" | "UPC" | "CODE39" | "ITF" | "MSI" | "QR"
type BarcodeSize = "small" | "medium" | "large"

interface BarcodeSettings {
  format: BarcodeFormat
  width: number
  height: number
  fontSize: number
  displayValue: boolean
  includePrice: boolean
  includeProductName: boolean
  background: string
  lineColor: string
  margin: number
  quantity: number
}

export function BarcodeGenerator({ product, products = [], open, onClose }: BarcodeGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"single" | "batch">(product ? "single" : "batch")
  const [selectedProducts, setSelectedProducts] = useState<string[]>(product ? [product.id] : [])
  const [customText, setCustomText] = useState<string>(product?.sku || "")
  const [barcodeSettings, setBarcodeSettings] = useState<BarcodeSettings>({
    format: "CODE128",
    width: 2,
    height: 100,
    fontSize: 14,
    displayValue: true,
    includePrice: true,
    includeProductName: true,
    background: "#FFFFFF",
    lineColor: "#000000",
    margin: 10,
    quantity: 1,
  })
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedBarcodes, setGeneratedBarcodes] = useState<Array<{ id: string; dataUrl: string }>>([])
  const [showSettings, setShowSettings] = useState<boolean>(false)

  const barcodeContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize with the product if provided
  useEffect(() => {
    if (product) {
      setCustomText(product.sku)
      generateBarcode()
    }
  }, [product])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedProducts(product ? [product.id] : [])
      setCustomText(product?.sku || "")
      setGeneratedBarcodes([])
      setShowSettings(false)
    }
  }, [open, product])

  // Mock function to generate barcode - in a real app, you'd use a library like JsBarcode
  const generateBarcode = () => {
    setIsGenerating(true)

    // Clear previous barcodes
    setGeneratedBarcodes([])

    setTimeout(() => {
      const productsToGenerate =
        activeTab === "single"
          ? [{ id: "custom", sku: customText, name: product?.name || "Custom Barcode", price: product?.price || 0 }]
          : products.filter((p) => selectedProducts.includes(p.id))

      const newBarcodes = productsToGenerate.map((p) => {
        // Create a canvas for the barcode
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) return { id: p.id, dataUrl: "" }

        // Set canvas size based on settings
        const width = barcodeSettings.width * 50 + barcodeSettings.margin * 2
        const height =
          barcodeSettings.height +
          (barcodeSettings.displayValue ? 30 : 0) +
          (barcodeSettings.includeProductName ? 20 : 0) +
          (barcodeSettings.includePrice ? 20 : 0) +
          barcodeSettings.margin * 2

        canvas.width = width
        canvas.height = height

        // Fill background
        ctx.fillStyle = barcodeSettings.background
        ctx.fillRect(0, 0, width, height)

        // In a real app, we'd generate the actual barcode here
        // For this example, we'll draw a mock barcode
        ctx.fillStyle = barcodeSettings.lineColor

        // Draw mock barcode lines
        const startX = barcodeSettings.margin
        const startY = barcodeSettings.margin
        const barcodeWidth = width - barcodeSettings.margin * 2
        const barcodeHeight = barcodeSettings.height

        if (barcodeSettings.format === "QR") {
          // Draw a mock QR code
          ctx.fillRect(startX, startY, barcodeWidth, barcodeHeight)

          // Add some white squares to make it look like a QR code
          ctx.fillStyle = barcodeSettings.background
          const cellSize = barcodeWidth / 10

          // Pattern of white squares to simulate QR code
          const qrPattern = [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [2, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [7, 0],
            [8, 0],
            [9, 0],
            [7, 1],
            [9, 1],
            [7, 2],
            [8, 2],
            [9, 2],
            [0, 7],
            [1, 7],
            [2, 7],
            [0, 8],
            [2, 8],
            [0, 9],
            [1, 9],
            [2, 9],
            [4, 4],
            [5, 4],
            [6, 4],
            [4, 5],
            [5, 5],
            [6, 5],
            [4, 6],
            [5, 6],
            [6, 6],
          ]

          qrPattern.forEach(([x, y]) => {
            ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize)
          })
        } else {
          // Generate a deterministic but unique barcode pattern based on the product SKU or custom text
          const seed = p.sku || customText || p.id
          const hash = generateSimpleHash(seed)

          // Draw mock barcode lines with a pattern based on the hash
          const lineCount = 40
          const lineWidth = barcodeWidth / lineCount

          // Create start and end patterns (consistent for all barcodes)
          const startPattern = [1, 0, 1] // Start pattern (black, white, black)
          const endPattern = [1, 0, 1] // End pattern (black, white, black)

          // Draw start pattern
          for (let i = 0; i < startPattern.length; i++) {
            if (startPattern[i] === 1) {
              ctx.fillRect(startX + i * lineWidth, startY, lineWidth, barcodeHeight)
            }
          }

          // Draw middle pattern (unique to each product)
          const middleStart = startPattern.length
          const middleEnd = lineCount - endPattern.length

          for (let i = middleStart; i < middleEnd; i++) {
            // Use the hash to determine if this position should have a line
            // This creates a unique but consistent pattern for each product
            const position = i - middleStart
            const shouldDraw = ((hash >> (position % 30)) & 1) === 1

            if (shouldDraw) {
              ctx.fillRect(startX + i * lineWidth, startY, lineWidth, barcodeHeight)
            }
          }

          // Draw end pattern
          for (let i = 0; i < endPattern.length; i++) {
            if (endPattern[i] === 1) {
              ctx.fillRect(startX + (middleEnd + i) * lineWidth, startY, lineWidth, barcodeHeight)
            }
          }
        }

        // Add text if needed
        let textY = startY + barcodeHeight + 15

        if (barcodeSettings.displayValue) {
          ctx.fillStyle = barcodeSettings.lineColor
          ctx.font = `${barcodeSettings.fontSize}px Arial`
          ctx.textAlign = "center"
          ctx.fillText(p.sku, width / 2, textY)
          textY += 20
        }

        if (barcodeSettings.includeProductName) {
          ctx.fillStyle = barcodeSettings.lineColor
          ctx.font = `${barcodeSettings.fontSize - 2}px Arial`
          ctx.textAlign = "center"
          ctx.fillText(p.name, width / 2, textY)
          textY += 20
        }

        if (barcodeSettings.includePrice) {
          ctx.fillStyle = barcodeSettings.lineColor
          ctx.font = `${barcodeSettings.fontSize}px Arial`
          ctx.textAlign = "center"
          ctx.fillText(`${p.price.toFixed(2)}`, width / 2, textY)
        }

        return { id: p.id, dataUrl: canvas.toDataURL("image/png") }
      })

      setGeneratedBarcodes(newBarcodes)
      setIsGenerating(false)
    }, 1000) // Simulate processing time
  }

  const handlePrint = () => {
    if (generatedBarcodes.length === 0) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Create content for the print window
    let printContent = `
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .barcode-container { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 10px; 
              justify-content: flex-start;
            }
            .barcode-item {
              border: 1px dashed #ccc;
              padding: 5px;
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <div class="barcode-container">
    `

    // Add each barcode multiple times based on quantity
    generatedBarcodes.forEach((barcode) => {
      for (let i = 0; i < barcodeSettings.quantity; i++) {
        printContent += `
          <div class="barcode-item">
            <img src="${barcode.dataUrl}" alt="Barcode" />
          </div>
        `
      }
    })

    printContent += `
          </div>
        </body>
      </html>
    `

    // Write to the new window and prepare for printing
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  const handleDownload = () => {
    if (generatedBarcodes.length === 0) return

    // For a single barcode, download directly
    if (generatedBarcodes.length === 1) {
      const link = document.createElement("a")
      link.href = generatedBarcodes[0].dataUrl
      link.download = `barcode-${customText || "custom"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    // For multiple barcodes, create a zip file
    // In a real app, you'd use a library like JSZip
    // For this example, we'll just download the first one
    alert(
      "In a real implementation, this would download a ZIP file with all barcodes. For this demo, downloading the first barcode.",
    )
    const link = document.createElement("a")
    link.href = generatedBarcodes[0].dataUrl
    link.download = `barcode-batch.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopy = () => {
    if (generatedBarcodes.length === 0) return

    // In a real app, you'd use the Clipboard API
    // For this example, we'll show an alert
    alert("In a real implementation, this would copy the barcode to your clipboard.")
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const getSizePreset = (size: BarcodeSize) => {
    switch (size) {
      case "small":
        return { width: 1.5, height: 60 }
      case "medium":
        return { width: 2, height: 100 }
      case "large":
        return { width: 3, height: 150 }
    }
  }

  const handleSizePreset = (size: BarcodeSize) => {
    const preset = getSizePreset(size)
    setBarcodeSettings({
      ...barcodeSettings,
      ...preset,
    })
  }

  // Helper function to generate a simple hash from a string
  const generateSimpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Barcode Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "single" | "batch")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Barcode</TabsTrigger>
              <TabsTrigger value="batch">Batch Generation</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="barcode-text">Barcode Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter SKU or custom value"
                      className="flex-1"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Barcode Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {showSettings && (
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Barcode Settings</h3>

                    <div className="grid gap-2">
                      <Label htmlFor="barcode-format">Format</Label>
                      <Select
                        value={barcodeSettings.format}
                        onValueChange={(value) =>
                          setBarcodeSettings({ ...barcodeSettings, format: value as BarcodeFormat })
                        }
                      >
                        <SelectTrigger id="barcode-format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">CODE 128</SelectItem>
                          <SelectItem value="EAN13">EAN-13</SelectItem>
                          <SelectItem value="UPC">UPC-A</SelectItem>
                          <SelectItem value="CODE39">CODE 39</SelectItem>
                          <SelectItem value="ITF">ITF</SelectItem>
                          <SelectItem value="MSI">MSI</SelectItem>
                          <SelectItem value="QR">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Button variant="outline" size="sm" onClick={() => handleSizePreset("small")} className="text-xs">
                        Small
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSizePreset("medium")}
                        className="text-xs"
                      >
                        Medium
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleSizePreset("large")} className="text-xs">
                        Large
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="barcode-width">Width</Label>
                        <span className="text-xs text-muted-foreground">{barcodeSettings.width}</span>
                      </div>
                      <Slider
                        id="barcode-width"
                        min={1}
                        max={5}
                        step={0.5}
                        value={[barcodeSettings.width]}
                        onValueChange={(value) => setBarcodeSettings({ ...barcodeSettings, width: value[0] })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="barcode-height">Height</Label>
                        <span className="text-xs text-muted-foreground">{barcodeSettings.height}px</span>
                      </div>
                      <Slider
                        id="barcode-height"
                        min={30}
                        max={200}
                        step={10}
                        value={[barcodeSettings.height]}
                        onValueChange={(value) => setBarcodeSettings({ ...barcodeSettings, height: value[0] })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="barcode-font-size">Font Size</Label>
                        <span className="text-xs text-muted-foreground">{barcodeSettings.fontSize}px</span>
                      </div>
                      <Slider
                        id="barcode-font-size"
                        min={8}
                        max={24}
                        step={1}
                        value={[barcodeSettings.fontSize]}
                        onValueChange={(value) => setBarcodeSettings({ ...barcodeSettings, fontSize: value[0] })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="barcode-quantity">Quantity</Label>
                        <span className="text-xs text-muted-foreground">{barcodeSettings.quantity}</span>
                      </div>
                      <Slider
                        id="barcode-quantity"
                        min={1}
                        max={50}
                        step={1}
                        value={[barcodeSettings.quantity]}
                        onValueChange={(value) => setBarcodeSettings({ ...barcodeSettings, quantity: value[0] })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="display-value"
                          checked={barcodeSettings.displayValue}
                          onCheckedChange={(checked) =>
                            setBarcodeSettings({ ...barcodeSettings, displayValue: checked })
                          }
                        />
                        <Label htmlFor="display-value">Show Value</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="include-price"
                          checked={barcodeSettings.includePrice}
                          onCheckedChange={(checked) =>
                            setBarcodeSettings({ ...barcodeSettings, includePrice: checked })
                          }
                        />
                        <Label htmlFor="include-price">Show Price</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="include-name"
                          checked={barcodeSettings.includeProductName}
                          onCheckedChange={(checked) =>
                            setBarcodeSettings({ ...barcodeSettings, includeProductName: checked })
                          }
                        />
                        <Label htmlFor="include-name">Show Name</Label>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={generateBarcode} disabled={!customText || isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Tag className="mr-2 h-4 w-4" />
                      Generate Barcode
                    </>
                  )}
                </Button>
              </div>

              {generatedBarcodes.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="border rounded-md p-4 flex justify-center" ref={barcodeContainerRef}>
                    <div className="flex flex-col items-center">
                      <img
                        src={generatedBarcodes[0].dataUrl || "/placeholder.svg"}
                        alt="Generated Barcode"
                        className="max-w-full"
                      />
                      <div className="mt-2 text-sm text-muted-foreground">
                        {barcodeSettings.format === "QR" ? "QR Code" : "Barcode"} for {customText}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="batch" className="space-y-4 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">Select All</Label>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Barcode Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {showSettings && (
                <div className="border rounded-md p-4 space-y-4 mb-4">
                  <h3 className="font-medium">Batch Settings</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="batch-format">Format</Label>
                    <Select
                      value={barcodeSettings.format}
                      onValueChange={(value) =>
                        setBarcodeSettings({ ...barcodeSettings, format: value as BarcodeFormat })
                      }
                    >
                      <SelectTrigger id="batch-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE 128</SelectItem>
                        <SelectItem value="EAN13">EAN-13</SelectItem>
                        <SelectItem value="UPC">UPC-A</SelectItem>
                        <SelectItem value="CODE39">CODE 39</SelectItem>
                        <SelectItem value="ITF">ITF</SelectItem>
                        <SelectItem value="MSI">MSI</SelectItem>
                        <SelectItem value="QR">QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" size="sm" onClick={() => handleSizePreset("small")} className="text-xs">
                      Small
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSizePreset("medium")} className="text-xs">
                      Medium
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSizePreset("large")} className="text-xs">
                      Large
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="batch-quantity">Quantity Per Product</Label>
                      <span className="text-xs text-muted-foreground">{barcodeSettings.quantity}</span>
                    </div>
                    <Slider
                      id="batch-quantity"
                      min={1}
                      max={20}
                      step={1}
                      value={[barcodeSettings.quantity]}
                      onValueChange={(value) => setBarcodeSettings({ ...barcodeSettings, quantity: value[0] })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-display-value"
                        checked={barcodeSettings.displayValue}
                        onCheckedChange={(checked) => setBarcodeSettings({ ...barcodeSettings, displayValue: checked })}
                      />
                      <Label htmlFor="batch-display-value">Show Value</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-include-price"
                        checked={barcodeSettings.includePrice}
                        onCheckedChange={(checked) => setBarcodeSettings({ ...barcodeSettings, includePrice: checked })}
                      />
                      <Label htmlFor="batch-include-price">Show Price</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-include-name"
                        checked={barcodeSettings.includeProductName}
                        onCheckedChange={(checked) =>
                          setBarcodeSettings({ ...barcodeSettings, includeProductName: checked })
                        }
                      />
                      <Label htmlFor="batch-include-name">Show Name</Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="border rounded-md">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="w-[40px] p-2 text-left"></th>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">SKU</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No products available
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.id} className="border-t">
                            <td className="p-2">
                              <Checkbox
                                checked={selectedProducts.includes(p.id)}
                                onCheckedChange={(checked) => handleSelectProduct(p.id, !!checked)}
                              />
                            </td>
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">{p.sku}</td>
                            <td className="p-2 text-right">${p.price.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                </div>
                <Button onClick={generateBarcode} disabled={selectedProducts.length === 0 || isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Layers className="mr-2 h-4 w-4" />
                      Generate {selectedProducts.length} Barcode{selectedProducts.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>

              {generatedBarcodes.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Generated Barcodes</h3>
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4" ref={barcodeContainerRef}>
                      {generatedBarcodes.map((barcode, index) => (
                        <div key={index} className="border rounded-md p-2 flex flex-col items-center">
                          <img
                            src={barcode.dataUrl || "/placeholder.svg"}
                            alt={`Barcode ${index + 1}`}
                            className="max-w-full"
                          />
                          <div className="mt-2 text-xs text-center text-muted-foreground">
                            {products.find((p) => p.id === barcode.id)?.sku || customText}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {generatedBarcodes.length > 0 && (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print barcodes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
