"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  isLoading?: boolean
  showItemsPerPage?: boolean
  showPageInput?: boolean
  showInfo?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  showItemsPerPage = true,
  showPageInput = true,
  showInfo = true,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage <= 4) {
        // Show first few pages
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show last few pages
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show pages around current page
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const handlePageInputChange = (value: string) => {
    const page = parseInt(value)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      {/* Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <Label htmlFor="itemsPerPage" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger id="itemsPerPage" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
      )}

      {/* Page info */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{" "}
          {totalItems.toLocaleString()} results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>

        {/* Page input */}
        {showPageInput && totalPages > 1 && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Go to</span>
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => handlePageInputChange(e.target.value)}
              disabled={isLoading}
              className="w-16 h-8 text-center"
            />
            <span className="text-sm text-muted-foreground">
              of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact pagination for mobile/small spaces
export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className,
}: Pick<PaginationProps, "currentPage" | "totalPages" | "onPageChange" | "isLoading" | "className">) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium">{currentPage}</span>
        <span className="text-sm text-muted-foreground">of</span>
        <span className="text-sm font-medium">{totalPages}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}

// Simple pagination with just numbers
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  maxVisible = 5,
  className,
}: Pick<PaginationProps, "currentPage" | "totalPages" | "onPageChange" | "isLoading" | "className"> & {
  maxVisible?: number
}) {
  const getVisiblePages = () => {
    const pages: number[] = []
    const half = Math.floor(maxVisible / 2)
    
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          {page}
        </Button>
      ))}
    </div>
  )
} 