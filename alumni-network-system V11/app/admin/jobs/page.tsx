"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Users,
  Star,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  StarOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { JobForm } from "@/components/admin/job-form"
import { RouteGuard } from "@/components/auth/route-guard"
import {
  useGetJobSummaryQuery,
  useGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useBulkJobActionMutation,
  useLazyExportJobsQuery,
  type Job,
  type JobFilters,
  type BulkJobAction,
} from "@/lib/api/jobsApi"
import { useSearchParams, useRouter } from "next/navigation"

function JobManagementContent() {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [experienceFilter, setExperienceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "company" | "views" | "applicationCount" | "expiresAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Form and dialog state
  const [isJobFormOpen, setIsJobFormOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<BulkJobAction["action"] | "">("")
  
  // API queries and mutations
  const {
    data: jobSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetJobSummaryQuery()

  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useGetJobsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    experienceLevel: experienceFilter !== "all" ? experienceFilter : undefined,
    sortBy,
    sortOrder,
  })

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation()
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation()
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation()
  const [bulkJobAction, { isLoading: isBulkOperating }] = useBulkJobActionMutation()
  const [exportJobs, { isLoading: isExporting }] = useLazyExportJobsQuery()

  // Use API data with fallbacks
  const finalJobSummary = jobSummary || {
    totalJobs: { value: 0 },
    activeJobs: { value: 0 },
    jobsThisMonth: { value: 0 },
    totalApplications: { value: 0 },
    featuredJobs: { value: 0 },
  }
  const finalJobs = jobsResponse?.jobs || []
  const totalJobs = jobsResponse?.pagination?.totalItems || 0
  const totalPages = jobsResponse?.pagination?.totalPages || 0

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, categoryFilter, statusFilter, experienceFilter])

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("addJob") === "1") {
      setIsJobFormOpen(true);
      setSelectedJob(undefined);
    }
  }, [searchParams]);

  const handleCloseJobForm = () => {
    setIsJobFormOpen(false);
    setSelectedJob(undefined);
    const params = new URLSearchParams(window.location.search);
    if (params.has("addJob")) {
      params.delete("addJob");
      router.replace(window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
    }
  };

  // Show error state if both API calls fail
  if (summaryError && jobsError) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load job data. Please check your connection and try again.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    refetchSummary()
                    refetchJobs()
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isSummaryLoading && isJobsLoading) {
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
  const handleCreateJob = async (jobData: any) => {
    try {
      console.log("handleCreateJob called with data:", jobData)
      console.log("createJob mutation:", createJob)
      
      const result = await createJob(jobData).unwrap()
      console.log("Job creation successful:", result)
      
      toast.success("Job created successfully!")
      setIsJobFormOpen(false)
      refetchJobs()
      refetchSummary()
    } catch (error: any) {
      console.error("Job creation error:", error)
      toast.error(error?.data?.message || "Failed to create job")
      throw error
    }
  }

  const handleUpdateJob = async (jobData: any) => {
    if (!selectedJob) return
    try {
      await updateJob({ id: selectedJob._id, data: jobData }).unwrap()
      toast.success("Job updated successfully!")
      setSelectedJob(undefined)
      refetchJobs()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update job")
      throw error
    }
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    try {
      await deleteJob(jobToDelete._id).unwrap()
      toast.success("Job deleted successfully!")
      setJobToDelete(null)
      setIsDeleteDialogOpen(false)
      refetchJobs()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete job")
    }
  }

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedJobs.length === 0) return
    
    try {
      await bulkJobAction({ action: bulkAction, jobIds: selectedJobs }).unwrap()
      toast.success(`Bulk ${bulkAction} completed successfully!`)
      setSelectedJobs([])
      setBulkAction("")
      refetchJobs()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to perform bulk ${bulkAction}`)
    }
  }

  // Export data
  const handleExport = async (format: "csv" | "json") => {
    try {
      const result = await exportJobs({ format }).unwrap()
      // Handle download logic here
      const url = window.URL.createObjectURL(result)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `jobs_export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Jobs exported as ${format.toUpperCase()}`)
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to export jobs")
    }
  }

  // Dialog handlers
  const openEditForm = (job: Job) => {
    setSelectedJob(job)
    setIsJobFormOpen(true)
  }

  const openCreateForm = () => {
    setSelectedJob(undefined)
    setIsJobFormOpen(true)
  }

  const openDeleteDialog = (job: Job) => {
    setJobToDelete(job)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleFeature = async (job: Job) => {
    try {
      await updateJob({ 
        id: job._id, 
        data: { featured: !job.featured } 
      }).unwrap()
      toast.success(`Job ${job.featured ? 'unfeatured' : 'featured'} successfully!`)
      refetchJobs()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update job")
    }
  }

  // Status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800 border-green-200"
      case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "filled": return "bg-blue-100 text-blue-800 border-blue-200"
      case "expired": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time": return "bg-blue-100 text-blue-800 border-blue-200"
      case "part-time": return "bg-green-100 text-green-800 border-green-200"
      case "contract": return "bg-purple-100 text-purple-800 border-purple-200"
      case "internship": return "bg-orange-100 text-orange-800 border-orange-200"
      case "volunteer": return "bg-pink-100 text-pink-800 border-pink-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatSalary = (job: Job) => {
    if (!job.salary) return "Not specified"
    const { min, max, currency, period } = job.salary
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }
    
    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)} ${period}`
    } else if (min) {
      return `${formatAmount(min)}+ ${period}`
    } else if (max) {
      return `Up to ${formatAmount(max)} ${period}`
    }
    return "Not specified"
  }

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId])
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && finalJobs.length > 0) {
      setSelectedJobs(finalJobs.map(job => job._id))
    } else {
      setSelectedJobs([])
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
                <p className="text-muted-foreground">
                  Manage job postings, applications, and recruitment analytics
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isExporting}>
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={openCreateForm} disabled={isCreating} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg">
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Job
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Total Jobs */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-purple-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalJobSummary.totalJobs.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      All time jobs
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Active Jobs */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-green-500 before:to-emerald-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalJobSummary.activeJobs.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-600">
                      Currently open
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Total Applications */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:to-pink-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalJobSummary.totalApplications.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-600">
                      Across all jobs
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* This Month */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-orange-500 before:to-red-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalJobSummary.jobsThisMonth.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-purple-600">
                      New jobs this month
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Featured Jobs */}
              <Card className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10 before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-yellow-400 before:to-orange-500 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`} style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}>
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Featured Jobs</CardTitle>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalJobSummary.featuredJobs.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-orange-600">
                      Premium listings
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between rounded-t-2xl px-6 py-4 bg-gradient-to-r from-blue-500/80 to-purple-600/80">
                <CardTitle className="text-lg font-bold text-white tracking-tight">
                  <span className="inline-block border-l-4 border-blue-300 pl-3">Filters & Search</span>
                </CardTitle>
                <Filter className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: "createdAt" | "title" | "company" | "views" | "applicationCount" | "expiresAt") => setSortBy(value)}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-blue-400/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="title">Job Title</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="applicationCount">Applications</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="expiresAt">Expires At</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl mt-6">
              <CardHeader>
                <CardTitle>Jobs ({totalJobs})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedJobs.length === finalJobs.length && finalJobs.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finalJobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedJobs.includes(job._id)}
                              onCheckedChange={(checked) => 
                                handleSelectJob(job._id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {job.title}
                                {job.featured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {job.experienceLevel} level
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{job.company.name}</span>
                              </div>
                              {job.company.website && (
                                <div className="text-sm text-blue-600 hover:underline">
                                  <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                                    {new URL(job.company.website).hostname}
                                  </a>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {job.company.location.city}, {job.company.location.country}
                                </span>
                              </div>
                              {job.company.location.isRemote && (
                                <Badge variant="secondary" className="text-xs">Remote</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatSalary(job)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{job.applicationCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(job.createdAt)}</span>
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
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Job
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditForm(job)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Job
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleFeature(job)}>
                                  {job.featured ? (
                                    <StarOff className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Star className="mr-2 h-4 w-4" />
                                  )}
                                  {job.featured ? "Unfeature Job" : "Feature Job"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(job)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-0">
          <AlertDialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl">
            <AlertDialogTitle className="text-lg font-bold text-white tracking-tight">Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="px-6 pt-4 pb-2 text-slate-700 dark:text-slate-200">
            This action cannot be undone. This will permanently delete the job posting
            "{jobToDelete?.title}" and remove all associated data.
          </AlertDialogDescription>
          <AlertDialogFooter className="px-6 pb-4">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Form Dialog */}
      <JobForm
        job={selectedJob}
        isOpen={isJobFormOpen}
        onClose={handleCloseJobForm}
        onSubmit={selectedJob ? handleUpdateJob : handleCreateJob}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default function JobManagementPage() {
  return (
    <RouteGuard requiredRole="admin">
      <JobManagementContent />
    </RouteGuard>
  )
} 