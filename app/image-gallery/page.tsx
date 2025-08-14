import { PageHeader } from "@/components/page-header"
import { GalleryView } from "@/components/image-gallery/gallery-view"
import { ImageGalleryProvider } from "@/contexts/image-gallery-context";


export default function ImageGalleryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Image Gallery" description="Manage and organize all your images in one central location" />
      <ImageGalleryProvider>
      <GalleryView />
    </ImageGalleryProvider>
    </div>
  )
}
