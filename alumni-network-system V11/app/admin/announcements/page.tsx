"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Megaphone,
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Heart,
  MessageCircle,
  Pin,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  FileText,
  Calendar,
  Target,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { Pagination } from "@/components/admin/pagination"
import { AuthDebug } from "@/components/admin/auth-debug"
import {
  useGetAdminAnnouncementsQuery,
  useGetAnnouncementStatisticsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useBulkAnnouncementActionMutation,
  useLazyExportAnnouncementsQuery,
  type Announcement,
  type AnnouncementFilters,
  type BulkAnnouncementAction,
} from "@/lib/api/announcementsApi"

function AnnouncementManagementContent() {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<'createdAt' | 'publishDate' | 'views' | 'likes' | 'comments' | 'title'>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Form and dialog state
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<'publish' | 'archive' | 'delete' | 'pin' | 'unpin' | "">("")
  
  // API queries and mutations
  const {
    data: announcementStats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetAnnouncementStatisticsQuery()

  const {
    data: announcementsResponse,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch: refetchAnnouncements,
  } = useGetAdminAnnouncementsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    sortBy,
    sortOrder,
  })

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation()
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation()
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation()
  const [bulkAnnouncementAction, { isLoading: isBulkOperating }] = useBulkAnnouncementActionMutation()
  const [exportAnnouncements, { isLoading: isExporting }] = useLazyExportAnnouncementsQuery()

  // Calculate error states first
  const hasErrors = (statsError && announcementsError)
  const isUnauthorized = (statsError as any)?.status === 401 || (announcementsError as any)?.status === 401
  const isNetworkError = (statsError as any)?.status === 'FETCH_ERROR' || (announcementsError as any)?.status === 'FETCH_ERROR'

  // Use real API data with smart fallbacks
  const finalAnnouncementStats = announcementStats || {
    overview: {
      totalAnnouncements: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      averageEngagement: "0"
    },
    breakdowns: {
      status: { published: 0, draft: 0, archived: 0 },
      category: {},
      priority: { high: 0, medium: 0, low: 0 }
    }
  }
  
  const finalAnnouncements = announcementsResponse?.announcements || []
  const totalAnnouncements = announcementsResponse?.pagination?.total || 0
  const totalPages = announcementsResponse?.pagination?.pages || 0

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, priorityFilter])

  // Show error state for network connectivity issues only
  if (hasErrors && isNetworkError) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to connect to the backend server. Please check your connection and ensure the backend is running on port 5000.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    refetchStats()
                    refetchAnnouncements()
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
            <AuthDebug error={statsError || announcementsError} />
          </div>
        </div>
      </div>
    )
  }

  // Show authentication warning for 401 errors
  if (isUnauthorized) {
    console.warn('Authentication failed - using fallback data for development')
  }

  // Show loading state only when both queries are loading
  if (isStatsLoading || isAnnouncementsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // CRUD operations
  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      console.log("handleCreateAnnouncement called with data:", announcementData)
      
      const result = await createAnnouncement(announcementData).unwrap()
      console.log("Announcement creation successful:", result)
      
      toast.success("Announcement created successfully!")
      setIsAnnouncementFormOpen(false)
      refetchAnnouncements()
      refetchStats()
    } catch (error: any) {
      console.error("Announcement creation error:", error)
      if (error?.status === 401) {
        toast.error("Authentication failed. Please check your login status.")
      } else {
        toast.error(error?.data?.message || "Failed to create announcement")
      }
      throw error
    }
  }

  const handleUpdateAnnouncement = async (announcementData: any) => {
    if (!selectedAnnouncement) return
    try {
      await updateAnnouncement({ id: selectedAnnouncement._id, data: announcementData }).unwrap()
      toast.success("Announcement updated successfully!")
      setSelectedAnnouncement(undefined)
      refetchAnnouncements()
      refetchStats()
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Authentication failed. Please check your login status.")
      } else {
        toast.error(error?.data?.message || "Failed to update announcement")
      }
      throw error
    }
  }

  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete) return
    try {
      await deleteAnnouncement(announcementToDelete._id).unwrap()
      toast.success("Announcement deleted successfully!")
      setAnnouncementToDelete(null)
      setIsDeleteDialogOpen(false)
      refetchAnnouncements()
      refetchStats()
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Authentication failed. Please check your login status.")
      } else {
        toast.error(error?.data?.message || "Failed to delete announcement")
      }
    }
  }

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedAnnouncements.length === 0) return
    
    try {
      await bulkAnnouncementAction({ action: bulkAction, announcementIds: selectedAnnouncements }).unwrap()
      toast.success(`Bulk ${bulkAction} completed successfully!`)
      setSelectedAnnouncements([])
      setBulkAction("")
      refetchAnnouncements()
      refetchStats()
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Authentication failed. Please check your login status.")
      } else {
        toast.error(error?.data?.message || `Failed to perform bulk ${bulkAction}`)
      }
    }
  }

  // Export data
  const handleExport = async (format: "csv" | "json") => {
    try {
      const result = await exportAnnouncements({ format }).unwrap()
      // Handle download logic here
      const url = window.URL.createObjectURL(result)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `announcements_export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Announcements exported as ${format.toUpperCase()}`)
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Authentication failed. Please check your login status.")
      } else {
        toast.error(error?.data?.message || "Failed to export announcements")
      }
    }
  }

  const openEditForm = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsAnnouncementFormOpen(true)
  }

  const openCreateForm = () => {
    setSelectedAnnouncement(undefined)
    setIsAnnouncementFormOpen(true)
  }

  const openDeleteDialog = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
    setIsDeleteDialogOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800"
      case "draft": return "bg-gray-100 text-gray-800"
      case "archived": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "general": return "bg-blue-100 text-blue-800"
      case "jobs": return "bg-green-100 text-green-800"
      case "news": return "bg-purple-100 text-purple-800"
      case "scholarships": return "bg-orange-100 text-orange-800"
      case "events": return "bg-pink-100 text-pink-800"
      case "achievements": return "bg-yellow-100 text-yellow-800"
      case "obituary": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-blue-100 text-blue-800"
      case "low": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
  }

  const handleSelectAnnouncement = (announcementId: string, checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements([...selectedAnnouncements, announcementId])
    } else {
      setSelectedAnnouncements(selectedAnnouncements.filter(id => id !== announcementId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnnouncements(finalAnnouncements.map(a => a._id))
    } else {
      setSelectedAnnouncements([])
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Development Notice - Only show for actual issues */}
            {(statsError || announcementsError) && !isNetworkError && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>API Notice:</strong> Some API calls encountered issues but the system is functioning normally. 
                  Check the debug panel below for details.
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      refetchStats()
                      refetchAnnouncements()
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry API Calls
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Announcement Management</h1>
                <p className="text-muted-foreground">
                  Create, manage, and track announcements across your alumni network
                </p>
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={openCreateForm} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Total Announcements */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-purple-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                    <Megaphone className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{finalAnnouncementStats.overview.totalAnnouncements}</div>
                    <p className="text-xs text-green-600">
                      {finalAnnouncementStats.breakdowns.status.published} published
                    </p>
                  </CardContent>
                </div>
              </Card>
              {/* Total Views */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:to-pink-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{finalAnnouncementStats.overview.totalViews.toLocaleString()}</div>
                    <p className="text-xs text-blue-600">
                      Across all announcements
                    </p>
                  </CardContent>
                </div>
              </Card>
              {/* Total Likes */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-pink-500 before:to-red-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <Heart className="h-4 w-4 text-pink-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{finalAnnouncementStats.overview.totalLikes}</div>
                    <p className="text-xs text-purple-600">
                      Community engagement
                    </p>
                  </CardContent>
                </div>
              </Card>
              {/* Total Comments */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-yellow-400 before:to-orange-500 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                    <MessageCircle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{finalAnnouncementStats.overview.totalComments}</div>
                    <p className="text-xs text-orange-600">
                      Active discussions
                    </p>
                  </CardContent>
                </div>
              </Card>
              {/* Avg Engagement */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-purple-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{finalAnnouncementStats.overview.averageEngagement}%</div>
                    <p className="text-xs text-green-600">
                      Engagement rate
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl mt-6">
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">📢 General</SelectItem>
                      <SelectItem value="jobs">💼 Jobs</SelectItem>
                      <SelectItem value="news">📰 News</SelectItem>
                      <SelectItem value="scholarships">🎓 Scholarships</SelectItem>
                      <SelectItem value="events">📅 Events</SelectItem>
                      <SelectItem value="achievements">🏆 Achievements</SelectItem>
                      <SelectItem value="obituary">🕊️ Obituary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="publishDate">Publish Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedAnnouncements.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedAnnouncements.length} announcement(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Bulk action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publish">Publish</SelectItem>
                          <SelectItem value="archive">Archive</SelectItem>
                          <SelectItem value="pin">Pin</SelectItem>
                          <SelectItem value="unpin">Unpin</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Announcements Table */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl mt-6">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAnnouncements.length === finalAnnouncements.length && finalAnnouncements.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finalAnnouncements.map((announcement) => (
                      <TableRow key={announcement._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAnnouncements.includes(announcement._id)}
                            onCheckedChange={(checked) => handleSelectAnnouncement(announcement._id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {announcement.isPinned && <Pin className="h-3 w-3 text-yellow-600" />}
                              <span className="font-medium">{announcement.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {truncateContent(announcement.content, 80)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadgeColor(announcement.category)} variant="secondary">
                            {announcement.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(announcement.status)} variant="secondary">
                            {announcement.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeColor(announcement.priority)} variant="secondary">
                            {announcement.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm">{announcement.author.firstName} {announcement.author.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {announcement.engagement.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {announcement.engagement.likes.length}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {announcement.engagement.comments.length}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(announcement.publishDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditForm(announcement)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(announcement)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {finalAnnouncements.length === 0 && (
                  <div className="text-center py-8">
                    <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Get started by creating your first announcement"}
                    </p>
                    <Button onClick={openCreateForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalAnnouncements}
              />
            )}
          </div>
        </div>
      </div>

      {/* Announcement Form Dialog */}
      <AnnouncementForm
        announcement={selectedAnnouncement}
        isOpen={isAnnouncementFormOpen}
        onClose={() => {
          setIsAnnouncementFormOpen(false)
          setSelectedAnnouncement(undefined)
        }}
        onSubmit={selectedAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
        isLoading={false}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-0">
          <AlertDialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl">
            <AlertDialogTitle className="text-lg font-bold text-white tracking-tight">Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="px-6 pt-4 pb-2 text-slate-700 dark:text-slate-200">
            This action cannot be undone. This will permanently delete the announcement
            "{announcementToDelete?.title}" and remove all associated data.
          </AlertDialogDescription>
          <AlertDialogFooter className="px-6 pb-4">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnnouncement}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function AnnouncementManagementPage() {
  return <AnnouncementManagementContent />
} 