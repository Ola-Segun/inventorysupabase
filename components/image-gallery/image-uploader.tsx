"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { useImageGallery } from "@/contexts/image-gallery-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Plus, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolder?: string | null
}

export function ImageUploader({ open, onOpenChange, currentFolder }: ImageUploaderProps) {
  const { folders, addImage, images } = useImageGallery()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState("")
  const [imageDescription, setImageDescription] = useState("")
  const [selectedFolder, setSelectedFolder] = useState(currentFolder || folders[0]?.id || "")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  // Get all unique tags from all images for suggestions
  const allTags = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.tags))).sort(),
    [images]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // For demo purposes, we're just using FileReader to get a data URL
    // In a real app, you'd upload to a server or cloud storage
    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result as string)
      // Set default name from filename
      setImageName(file.name.split(".")[0])
      setIsUploading(false)
    }
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // Enhanced tag input: split by comma, add all new tags
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(",")) {
      const parts = value.split(",").map((t) => t.trim()).filter(Boolean)
      const newTags = parts.filter((t) => t && !tags.includes(t))
      if (newTags.length > 0) {
        setTags([...tags, ...newTags])
      }
      setTagInput("")
    } else {
      setTagInput(value)
    }
  }

  // Add tag from suggestion
  const handleAddSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleSubmit = async () => {
    if (!uploadedImage) return

    try {
      await addImage({
        url: uploadedImage,
        name: imageName || "Untitled Image",
        description: imageDescription || "",
        tags,
        folder: selectedFolder,
      })

      toast({
        title: "Image uploaded",
        description: "Your image has been added to the gallery.",
      })

      // Reset form
      setUploadedImage(null)
      setImageName("")
      setImageDescription("")
      setTags([])
      setTagInput("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was a problem saving your image.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadedImage ? (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Upload an image</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
              <Button variant="secondary" disabled={isUploading}>
                <Plus className="mr-2 h-4 w-4" />
                Select Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-md overflow-hidden border">
                <img src={uploadedImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Image Name</Label>
                  <Input
                    id="name"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    placeholder="Enter image name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    placeholder="Enter image description"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="folder">Folder</Label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger id="folder">
                      <SelectValue placeholder="Select a folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  {/* Selected tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <div key={tag} className="bg-muted px-2 py-1 rounded-md text-sm flex items-center">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                          tabIndex={-1}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Tag input */}
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      placeholder="Add tags (comma separated)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          if (tagInput.trim()) handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {/* Suggested tags */}
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allTags
                        .filter((tag) => !tags.includes(tag))
                        .map((tag) => (
                          <div key={tag} className="flex items-center">
                            <span className="bg-muted px-2 py-1 rounded-md text-sm">{tag}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-1"
                              onClick={() => handleAddSuggestedTag(tag)}
                              tabIndex={-1}
                              type="button"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleSubmit} className="mt-4">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Save to Gallery
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
