"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, ImageIcon, Edit, Trash, Camera, RotateCw, Crop, Undo, Redo, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { ImageSelectorButton } from "@/components/image-selector-button"
import type { GalleryImage } from "@/contexts/image-gallery-context"

interface ImageUploadProps {
  initialImage?: string
  onImageChange: (imageData: string | null) => void
  aspectRatio?: number
  maxSizeInMB?: number
  allowedTypes?: string[]
  entityName?: string
  enableGallerySelection?: boolean
}

export function ImageUpload({
  initialImage,
  onImageChange,
  aspectRatio,
  maxSizeInMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  entityName = "item",
  enableGallerySelection = true,
}: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [editHistory, setEditHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a valid image file (${allowedTypes.join(", ")})`,
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Image must be smaller than ${maxSizeInMB}MB`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setImage(imageData)
      onImageChange(imageData)
      setIsUploading(false)
    }
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was an error reading the uploaded file",
        variant: "destructive",
      })
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openEditor = () => {
    if (!image) return
    setEditingImage(image)
    setRotation(0)
    setZoom(1)
    setBrightness(100)
    setContrast(100)
    setEditHistory([image])
    setHistoryIndex(0)
    setIsEditorOpen(true)
  }

  const applyEdit = (newImage: string) => {
    setEditingImage(newImage)

    // Add to history, removing any "future" if we're not at the end
    const newHistory = [...editHistory.slice(0, historyIndex + 1), newImage]
    setEditHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleRotate = () => {
    if (!editingImage) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      const newRotation = (rotation + 90) % 360
      setRotation(newRotation)

      // Swap width and height if rotating by 90 or 270 degrees
      if (newRotation === 90 || newRotation === 270) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      // Translate and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((newRotation * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      const rotatedImage = canvas.toDataURL("image/png")
      applyEdit(rotatedImage)
    }
    img.src = editingImage
  }

  const handleZoom = (value: number[]) => {
    if (!editingImage) return
    setZoom(value[0])

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate zoom
      const zoomFactor = value[0]
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw zoomed image
      ctx.translate(centerX, centerY)
      ctx.scale(zoomFactor, zoomFactor)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      const zoomedImage = canvas.toDataURL("image/png")
      applyEdit(zoomedImage)
    }
    img.src = editingImage
  }

  const handleAdjustment = (type: "brightness" | "contrast", value: number[]) => {
    if (!editingImage) return

    if (type === "brightness") {
      setBrightness(value[0])
    } else {
      setContrast(value[0])
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
      ctx.drawImage(img, 0, 0)

      const adjustedImage = canvas.toDataURL("image/png")
      applyEdit(adjustedImage)
    }
    img.src = editHistory[0] // Always apply filters to the original image
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setEditingImage(editHistory[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setEditingImage(editHistory[historyIndex + 1])
    }
  }

  const handleSaveEdit = () => {
    if (!editingImage) return
    setImage(editingImage)
    onImageChange(editingImage)
    setIsEditorOpen(false)
  }

  const handleCaptureFromCamera = () => {
    // This would typically open a camera interface
    // For this demo, we'll simulate it with a file upload
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {image ? (
          <div className="relative rounded-md overflow-hidden border border-border">
            <img
              src={image || "/placeholder.svg"}
              alt={`${entityName} image`}
              className="object-cover w-full h-full max-h-[200px]"
              style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : "auto" }}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={openEditor}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={handleRemoveImage}>
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : "16/9", width: "100%", maxHeight: "200px" }}
          >
            {isUploading ? (
              <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">
                  {allowedTypes.map((type) => type.replace("image/", ".")).join(", ")} up to {maxSizeInMB}MB
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={(e) => {
            e.preventDefault()
            fileInputRef.current?.click()}}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>

          <Button variant="outline" className="flex-1" onClick={(e) => {
            e.preventDefault()
            handleCaptureFromCamera}}>
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>
        {enableGallerySelection && (
          <ImageSelectorButton
            onImageSelect={(galleryImage: GalleryImage) => {
              setImage(galleryImage.url)
              onImageChange(galleryImage.url)
            }}
            currentImageId={undefined}
            className="flex-1"
          />
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Image Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Make adjustments to your image before saving.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border rounded-md overflow-hidden bg-muted/50 flex items-center justify-center p-2">
              {editingImage && (
                <img
                  src={editingImage || "/placeholder.svg"}
                  alt="Editing preview"
                  className="max-h-[300px] max-w-full object-contain"
                />
              )}
            </div>

            <Tabs defaultValue="transform">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="transform">Transform</TabsTrigger>
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="transform" className="space-y-4 pt-4">
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate 90°
                  </Button>
                  <Button variant="outline" disabled>
                    <Crop className="h-4 w-4 mr-2" />
                    Crop
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="zoom">Zoom</Label>
                    <span className="text-xs text-muted-foreground">{zoom.toFixed(1)}x</span>
                  </div>
                  <Slider id="zoom" min={0.5} max={2} step={0.1} value={[zoom]} onValueChange={handleZoom} />
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brightness">Brightness</Label>
                    <span className="text-xs text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider
                    id="brightness"
                    min={50}
                    max={150}
                    step={5}
                    value={[brightness]}
                    onValueChange={(value) => handleAdjustment("brightness", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contrast">Contrast</Label>
                    <span className="text-xs text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider
                    id="contrast"
                    min={50}
                    max={150}
                    step={5}
                    value={[contrast]}
                    onValueChange={(value) => handleAdjustment("contrast", value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="filters" className="pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1"></div>
                    <span className="text-xs">Normal</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1 brightness-125"></div>
                    <span className="text-xs">Bright</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1 contrast-125"></div>
                    <span className="text-xs">Vivid</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1 grayscale"></div>
                    <span className="text-xs">B&W</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1 sepia"></div>
                    <span className="text-xs">Sepia</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-2 flex flex-col">
                    <div className="w-full h-12 bg-muted rounded-sm mb-1 hue-rotate-90"></div>
                    <span className="text-xs">Cool</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex >= editHistory.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
