"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ImageIcon, Trash2, Edit, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CategoryImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

interface CategoryImageGalleryProps {
  categoryId: string
  categoryName: string
  images: CategoryImage[]
  onImagesChange: (images: CategoryImage[]) => void
}

export function CategoryImageGallery({ categoryId, categoryName, images, onImagesChange }: CategoryImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("gallery")
  const [selectedImage, setSelectedImage] = useState<CategoryImage | null>(null)
  const [newImageData, setNewImageData] = useState<string | null>(null)
  const [newImageAlt, setNewImageAlt] = useState("")
  const [editImageAlt, setEditImageAlt] = useState("")
  const { toast } = useToast()

  const handleAddImage = () => {
    if (!newImageData) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      })
      return
    }

    const newImage: CategoryImage = {
      id: `img-${Date.now()}`,
      url: newImageData,
      alt: newImageAlt || categoryName,
      isPrimary: images.length === 0, // First image is primary by default
    }

    onImagesChange([...images, newImage])
    setNewImageData(null)
    setNewImageAlt("")
    setActiveTab("gallery")

    toast({
      title: "Image added",
      description: "The image has been added to the category gallery.",
    })
  }

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter((img) => img.id !== imageId)

    // If we deleted the primary image, make the first remaining image primary
    if (images.find((img) => img.id === imageId)?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }

    onImagesChange(updatedImages)

    toast({
      title: "Image deleted",
      description: "The image has been removed from the category gallery.",
    })
  }

  const handleSetPrimary = (imageId: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }))

    onImagesChange(updatedImages)

    toast({
      title: "Primary image updated",
      description: "The selected image is now the primary image for this category.",
    })
  }

  const handleEditImage = () => {
    if (!selectedImage) return

    const updatedImages = images.map((img) => (img.id === selectedImage.id ? { ...img, alt: editImageAlt } : img))

    onImagesChange(updatedImages)
    setSelectedImage(null)

    toast({
      title: "Image updated",
      description: "The image details have been updated successfully.",
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <ImageIcon className="mr-2 h-4 w-4" />
        Manage Images
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Category Images</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Gallery ({images.length})</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="space-y-4 pt-4">
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No images yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.id} className={`overflow-hidden ${image.isPrimary ? "ring-2 ring-primary" : ""}`}>
                      <div className="relative aspect-square">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                            Primary
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs truncate mb-2">{image.alt}</p>
                        <div className="flex justify-between">
                          {!image.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleSetPrimary(image.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Set Primary
                            </Button>
                          )}
                          <div className="flex ml-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedImage(image)
                                setEditImageAlt(image.alt)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <Label>Upload Image</Label>
                <ImageUpload
                  initialImage={newImageData}
                  onImageChange={setNewImageData}
                  aspectRatio={1}
                  entityName="category"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Input
                  id="alt-text"
                  placeholder="Describe the image"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a description of the image for accessibility purposes.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab("gallery")}>
                  Cancel
                </Button>
                <Button onClick={handleAddImage} disabled={!newImageData}>
                  Add Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {selectedImage && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Edit Image Details</h3>
                <div className="mb-4">
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.alt}
                    className="w-full h-40 object-contain mb-4"
                  />
                  <Label htmlFor="edit-alt-text" className="mb-2 block">
                    Alt Text
                  </Label>
                  <Input
                    id="edit-alt-text"
                    value={editImageAlt}
                    onChange={(e) => setEditImageAlt(e.target.value)}
                    className="mb-4"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedImage(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleEditImage}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
