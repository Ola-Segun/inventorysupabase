"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ImageFiltersProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function ImageFilters({ searchQuery, onSearch }: ImageFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search images by name, description, or tags..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  )
}
