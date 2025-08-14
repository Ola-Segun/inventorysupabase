"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Printer, Share2, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QRCodeGeneratorProps {
  data: string
  title?: string
  description?: string
  open: boolean
  onClose: () => void
}

export function QRCodeGenerator({ data, title, description, open, onClose }: QRCodeGeneratorProps) {
  const [qrData, setQrData] = useState(data)
  const [qrSize, setQrSize] = useState(200)
  const [qrColor, setQrColor] = useState("#000000")
  const [qrBackground, setQrBackground] = useState("#FFFFFF")
  const [qrFormat, setQrFormat] = useState<"png" | "svg">("png")
  const [qrErrorCorrection, setQrErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M")
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)

  const qrContainerRef = useRef<HTMLDivElement>(null)

  // Reset state when dialog opens
  useState(() => {
    if (open) {
      setQrData(data)
      setGeneratedQR(null)
    }
  })

  const generateQRCode = () => {
    setIsGenerating(true)

    // Simulate QR code generation
    setTimeout(() => {
      // Create a canvas for the QR code
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        setIsGenerating(false)
        return
      }

      // Set canvas size
      canvas.width = qrSize
      canvas.height = qrSize

      // Fill background
      ctx.fillStyle = qrBackground
      ctx.fillRect(0, 0, qrSize, qrSize)

      // Draw a mock QR code
      ctx.fillStyle = qrColor

      // Draw the QR code pattern
      const cellSize = qrSize / 25
      const margin = cellSize * 2

      // Draw the three position detection patterns
      // Top-left
      ctx.fillRect(margin, margin, cellSize * 7, cellSize * 7)
      ctx.fillStyle = qrBackground
      ctx.fillRect(margin + cellSize, margin + cellSize, cellSize * 5, cellSize * 5)
      ctx.fillStyle = qrColor
      ctx.fillRect(margin + cellSize * 2, margin + cellSize * 2, cellSize * 3, cellSize * 3)

      // Top-right
      ctx.fillStyle = qrColor
      ctx.fillRect(qrSize - margin - cellSize * 7, margin, cellSize * 7, cellSize * 7)
      ctx.fillStyle = qrBackground
      ctx.fillRect(qrSize - margin - cellSize * 6, margin + cellSize, cellSize * 5, cellSize * 5)
      ctx.fillStyle = qrColor
      ctx.fillRect(qrSize - margin - cellSize * 5, margin + cellSize * 2, cellSize * 3, cellSize * 3)

      // Bottom-left
      ctx.fillStyle = qrColor
      ctx.fillRect(margin, qrSize - margin - cellSize * 7, cellSize * 7, cellSize * 7)
      ctx.fillStyle = qrBackground
      ctx.fillRect(margin + cellSize, qrSize - margin - cellSize * 6, cellSize * 5, cellSize * 5)
      ctx.fillStyle = qrColor
      ctx.fillRect(margin + cellSize * 2, qrSize - margin - cellSize * 5, cellSize * 3, cellSize * 3)

      // Draw some random cells to make it look like a QR code
      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * 25)
        const y = Math.floor(Math.random() * 25)

        // Skip the position detection patterns
        if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) {
          continue
        }

        ctx.fillRect(margin + x * cellSize, margin + y * cellSize, cellSize, cellSize)
      }

      // Get the data URL
      const dataUrl = canvas.toDataURL(qrFormat === "png" ? "image/png" : "image/svg+xml")
      setGeneratedQR(dataUrl)
      setIsGenerating(false)
    }, 1000)
  }

  const handlePrint = () => {
    if (!generatedQR) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Create content for the print window
    const printContent = `
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
            .qr-container { margin: 20px auto; }
            .qr-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .qr-description { font-size: 14px; color: #666; margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <div class="qr-container">
            ${title ? `<div class="qr-title">${title}</div>` : ""}
            ${description ? `<div class="qr-description">${description}</div>` : ""}
            <img src="${generatedQR}" alt="QR Code" style="max-width: 100%;" />
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
    if (!generatedQR) return

    const link = document.createElement("a")
    link.href = generatedQR
    link.download = `qrcode-${title || "custom"}.${qrFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!generatedQR || !navigator.share) return

    try {
      // Convert data URL to blob
      const response = await fetch(generatedQR)
      const blob = await response.blob()

      // Create a File from the blob
      const file = new File([blob], `qrcode-${title || "custom"}.${qrFormat}`, {
        type: qrFormat === "png" ? "image/png" : "image/svg+xml",
      })

      // Share the file
      await navigator.share({
        title: title || "QR Code",
        text: description || "Scan this QR code",
        files: [file],
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      alert("Unable to share QR code. Your browser may not support this feature.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>QR Code Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qr-data">QR Code Content</Label>
                  <Input
                    id="qr-data"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    placeholder="Enter text or URL"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="qr-size">Size</Label>
                    <span className="text-xs text-muted-foreground">{qrSize}px</span>
                  </div>
                  <Slider
                    id="qr-size"
                    min={100}
                    max={500}
                    step={10}
                    value={[qrSize]}
                    onValueChange={(value) => setQrSize(value[0])}
                  />
                </div>

                <Button onClick={generateQRCode} disabled={!qrData || isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate QR Code"
                  )}
                </Button>
              </div>

              {generatedQR && (
                <div className="mt-6 flex justify-center">
                  <div className="border rounded-md p-4 flex flex-col items-center" ref={qrContainerRef}>
                    <img src={generatedQR || "/placeholder.svg"} alt="Generated QR Code" className="max-w-full" />
                    {title && <div className="mt-2 text-sm font-medium">{title}</div>}
                    {description && <div className="text-xs text-muted-foreground">{description}</div>}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qr-format">Format</Label>
                  <Select value={qrFormat} onValueChange={(value) => setQrFormat(value as "png" | "svg")}>
                    <SelectTrigger id="qr-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="qr-error-correction">Error Correction</Label>
                  <Select
                    value={qrErrorCorrection}
                    onValueChange={(value) => setQrErrorCorrection(value as "L" | "M" | "Q" | "H")}
                  >
                    <SelectTrigger id="qr-error-correction">
                      <SelectValue placeholder="Select error correction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="qr-color">Foreground Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: qrColor }} />
                      <Input
                        id="qr-color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="qr-background">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: qrBackground }} />
                      <Input
                        id="qr-background"
                        value={qrBackground}
                        onChange={(e) => setQrBackground(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {generatedQR && (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Print QR code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {navigator.share && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share QR code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

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
