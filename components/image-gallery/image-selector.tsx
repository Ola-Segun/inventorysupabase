"use client"

import { useState } from "react"
import { useImageGallery, type GalleryImage } from "@/contexts/image-gallery-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageFilters } from "@/components/image-gallery/image-filters"
import { FolderList } from "@/components/image-gallery/folder-list"
import { ImageUploader } from "@/components/image-gallery/image-uploader"
import { Plus, ImageIcon, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageSelect: (image: GalleryImage) => void
  currentImageId?: string
}

export function ImageSelector({ open, onOpenChange, onImageSelect, currentImageId }: ImageSelectorProps) {
  const { images, folders, recordImageUsage } = useImageGallery()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Filter images based on current folder and search query
  const filteredImages = images
    .filter((img) => !currentFolder || img.folder === currentFolder)
    .filter(
      (img) =>
        !searchQuery ||
        img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())

  const handleImageSelect = (image: GalleryImage) => {
    recordImageUsage(image.id)
    onImageSelect(image)
    onOpenChange(false)

    toast({
      title: "Image selected",
      description: "The selected image will be used.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "gallery" | "upload")}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">
              <ImageIcon className="mr-2 h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="gallery" className="p-0 mt-0 h-full flex flex-col">
              <div className="p-4 border-b">
                <ImageFilters onSearch={setSearchQuery} searchQuery={searchQuery} />
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Folders sidebar */}
                <div className="hidden md:block w-64 border-r">
                  <FolderList folders={folders} currentFolder={currentFolder} onFolderSelect={setCurrentFolder} />
                </div>

                {/* Images grid */}
                <ScrollArea className="flex-1">
                  {filteredImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No images found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery
                          ? "Try adjusting your search or filters"
                          : currentFolder
                            ? "This folder is empty"
                            : "Upload some images to get started"}
                      </p>
                      <Button onClick={() => setActiveTab("upload")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload New Image
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          className={`border rounded-md overflow-hidden cursor-pointer transition-all hover:border-primary ${
                            currentImageId === image.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => handleImageSelect(image)}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            {currentImageId === image.id && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="truncate text-sm font-medium">{image.name}</div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-xs text-muted-foreground">
                                {folders.find((f) => f.id === image.folder)?.name}
                              </div>
                              {image.usageCount > 0 && (
                                <div className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                                  Used: {image.usageCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="p-0 mt-0 h-full">
              <div className="p-6">
                <ImageUploader
                  open={true}
                  onOpenChange={(open) => {
                    if (!open) setActiveTab("gallery")
                  }}
                  currentFolder={currentFolder}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
