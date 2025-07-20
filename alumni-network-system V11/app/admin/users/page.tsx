"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { toast } from "sonner"
import {
  Users,
  UserCheck,
  Shield,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UserForm } from "@/components/admin/user-form"
import { RouteGuard } from "@/components/auth/route-guard"
import {
  useGetUserSummaryQuery,
  useGetAdminUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useExportUsersMutation,
} from "@/lib/api/adminApi"
import type { User } from "@/types"
import type { CreateUserRequest, UpdateUserRequest } from "@/lib/api/adminApi"
import { useSearchParams } from "next/navigation"

function UserManagementContent() {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [graduationYearFilter, setGraduationYearFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Form and dialog state
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // API queries and mutations
  const {
    data: userSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetUserSummaryQuery()

  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    graduationYear: graduationYearFilter !== "all" ? parseInt(graduationYearFilter) : undefined,
    sortBy,
    sortOrder,
  })

  const [createUser, { isLoading: isCreating, error: createError }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating, error: updateError }] = useUpdateUserMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation()
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation()
  const [exportUsers, { isLoading: isExporting }] = useExportUsersMutation()

  // Use API data with fallbacks (now properly transformed)
  const finalUserSummary = userSummary || {
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    adminCount: 0,
    moderatorCount: 0,
    alumniCount: 0,
    byGraduationYear: [],
    byLocation: [],
    recentUsers: [],
  }
  const finalUsers = usersResponse?.data || []
  const totalUsers = usersResponse?.total || 0
  const totalPages = usersResponse?.totalPages || 0

  // Use API data
  const paginatedUsers = finalUsers

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter, graduationYearFilter])

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("addUser") === "1") {
      setIsUserFormOpen(true);
      setSelectedUser(undefined);
    }
  }, [searchParams]);

  // Show error state if both API calls fail
  if (summaryError && usersError) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load user data. Please check your connection and try again.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    refetchSummary()
                    refetchUsers()
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
  if (isSummaryLoading && isUsersLoading) {
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
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

  // Handlers
  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUser(userData).unwrap()
      toast.success("User created successfully!")
      setIsUserFormOpen(false)
      setSelectedUser(undefined)
      refetchUsers()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user")
      throw error
    }
  }

  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    if (!selectedUser) return
    try {
      await updateUser({ id: selectedUser._id, data: userData }).unwrap()
      toast.success("User updated successfully!")
      setIsUserFormOpen(false)
      setSelectedUser(undefined)
      refetchUsers()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user")
      throw error
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await deleteUser(userToDelete._id).unwrap()
      toast.success("User deleted successfully!")
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      refetchUsers()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user")
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap()
      toast.success("User role updated successfully!")
      refetchUsers()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user role")
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string, isActive: boolean) => {
    try {
      await updateUserStatus({ userId, status: newStatus, isActive }).unwrap()
      toast.success("User status updated successfully!")
      refetchUsers()
      refetchSummary()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user status")
    }
  }

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    try {
      const result = await exportUsers({
        format,
        filters: {
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          graduationYear: graduationYearFilter !== "all" ? parseInt(graduationYearFilter) : undefined,
        },
      }).unwrap()
      
      // Create download link
      const link = document.createElement("a")
      link.href = result.downloadUrl
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Export completed successfully!")
    } catch (error: any) {
      // Fallback to client-side export if API fails
      const dataToExport = finalUsers.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Phone: user.phone || "",
        Role: user.role,
        Status: user.isActive ? user.membershipStatus : "inactive",
        "Graduation Year": user.profile?.graduationYear || "",
        Degree: user.profile?.degree || "",
        Major: user.profile?.major || "",
        Profession: user.profile?.profession || "",
        Company: user.profile?.company || "",
        Location: user.profile?.location ? `${user.profile.location.city}, ${user.profile.location.country}` : "",
        "Last Login": user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
        "Created At": new Date(user.createdAt).toLocaleDateString(),
      }))
      
      const dataStr = JSON.stringify(dataToExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Export completed successfully! Downloaded ${dataToExport.length} users.`)
    }
  }

  const openEditForm = (user: User) => {
    setSelectedUser(user)
    setIsUserFormOpen(true)
  }

  const openCreateForm = () => {
    setSelectedUser(undefined)
    setIsUserFormOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // Utility functions
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "moderator": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "alumni": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusBadgeColor = (status: string, isActive: boolean) => {
    if (!isActive) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "inactive": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">
                  Manage alumni profiles, roles, and permissions
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
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  size="sm" 
                  onClick={openCreateForm}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Users */}
              <Card
                className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10
                  before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-purple-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
              >
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(finalUserSummary?.totalUsers || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      +{finalUserSummary?.newThisMonth || 0} from last month
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Active Users */}
              <Card
                className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10
                  before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-green-500 before:to-emerald-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
              >
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(finalUserSummary?.activeUsers || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-600">
                      {Math.round(((finalUserSummary?.activeUsers || 0) / (finalUserSummary?.totalUsers || 1)) * 100)}% of total users
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* Admins */}
              <Card
                className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10
                  before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:to-pink-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
              >
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admins</CardTitle>
                    <Shield className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalUserSummary?.adminCount || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      {finalUserSummary?.moderatorCount || 0} moderators
                    </p>
                  </CardContent>
                </div>
              </Card>

              {/* New This Month */}
              <Card
                className={`group relative overflow-hidden border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm
                  transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-10
                  before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-gradient-to-b before:from-orange-500 before:to-red-600 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
              >
                <div className="relative z-10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                    <UserPlus className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {finalUserSummary?.newThisMonth || 0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Alumni: {finalUserSummary?.alumniCount || 0}
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between rounded-t-2xl px-6 py-4 bg-gradient-to-r from-indigo-500/80 to-cyan-600/80">
                <CardTitle className="text-lg font-bold text-white tracking-tight">
                  <span className="inline-block border-l-4 border-indigo-300 pl-3">Filters & Search</span>
                </CardTitle>
                <Filter className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Graduation Year</label>
                    <Select value={graduationYearFilter} onValueChange={setGraduationYearFilter}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {finalUserSummary?.byGraduationYear?.map((yearData) => (
                          <SelectItem key={yearData.year} value={yearData.year.toString()}>
                            {yearData.year} ({yearData.count})
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Date Created</SelectItem>
                          <SelectItem value="lastLogin">Last Login</SelectItem>
                          <SelectItem value="firstName">First Name</SelectItem>
                          <SelectItem value="lastName">Last Name</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Order</label>
                      <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                        <SelectTrigger className="w-32 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descending</SelectItem>
                          <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setRoleFilter("all")
                      setStatusFilter("all")
                      setGraduationYearFilter("all")
                      setSortBy("createdAt")
                      setSortOrder("desc")
                      setCurrentPage(1)
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-cyan-600 text-white border-0 hover:from-indigo-600 hover:to-cyan-700 shadow-lg"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Directory */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between rounded-t-2xl px-6 py-4 bg-gradient-to-r from-blue-500/80 to-purple-600/80">
                <CardTitle className="text-lg font-bold text-white tracking-tight">
                  <span className="inline-block border-l-4 border-blue-300 pl-3">User Directory</span> ({totalUsers} users)
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      refetchUsers()
                      refetchSummary()
                    }}
                    disabled={isUsersLoading || isSummaryLoading}
                    className="bg-white/80 dark:bg-slate-900/60 border-0 shadow hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    {isUsersLoading || isSummaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isUsersLoading ? (
                  <div className="space-y-4 px-6 py-8">
                    {[...Array(itemsPerPage)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paginatedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your filters or search terms."
                        : "Get started by adding your first user."}
                    </p>
                    <Button onClick={openCreateForm} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100 dark:bg-slate-800">
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Graduation</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedUsers.map((user) => (
                            <TableRow key={user._id} className="transition-all duration-200 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 hover:shadow-md">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                                    <AvatarFallback>
                                      {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                      </span>
                                      {user.phone && (
                                        <span className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {user.phone}
                                        </span>
                                      )}
                                    </div>
                                    {(user.profile?.profession || user.profile?.company) && (
                                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <Briefcase className="h-3 w-3" />
                                        {user.profile.profession}
                                        {user.profile.profession && user.profile.company && " at "}
                                        {user.profile.company}
                                      </div>
                                    )}
                                    {user.profile?.location && (
                                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {user.profile.location.city}
                                        {user.profile.location.city && user.profile.location.country && ", "}
                                        {user.profile.location.country}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusBadgeColor(user.membershipStatus, user.isActive)}>
                                    {user.isActive ? user.membershipStatus : "inactive"}
                                  </Badge>
                                  {!user.isActive && (
                                    <Badge variant="secondary" className="text-xs">
                                      Disabled
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span>{user.profile?.graduationYear || "N/A"}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.profile?.degree}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.profile?.major}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {formatLastLogin(user.lastLogin)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Joined {formatDate(user.createdAt)}
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
                                    <DropdownMenuItem onClick={() => openEditForm(user)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Send Message
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRoleChange(user._id, user.role === "admin" ? "alumni" : "admin")}
                                      disabled={isUpdatingRole}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(user._id, user.isActive ? "inactive" : "active", !user.isActive)}
                                      disabled={isUpdatingStatus}
                                    >
                                      {user.isActive ? (
                                        <>
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openDeleteDialog(user)}
                                      className="text-destructive"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6 px-6 pb-6">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Show</label>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(parseInt(value))
                          setCurrentPage(1)
                        }}>
                          <SelectTrigger className="w-20">
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

                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} results
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* User Form Dialog */}
      <UserForm
        user={selectedUser}
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false)
          setSelectedUser(undefined)
        }}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        isLoading={selectedUser ? isUpdating : isCreating}
        error={selectedUser ? (updateError as any)?.data?.message : (createError as any)?.data?.message}
        dialogClassName="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-0"
        headerClassName="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl"
        titleClassName="text-lg font-bold text-white tracking-tight"
        buttonClassName="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-0">
          <AlertDialogHeader className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-2xl">
            <AlertCircle className="h-6 w-6 text-white" />
            <AlertDialogTitle className="text-lg font-bold text-white tracking-tight">Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="px-6 pt-4 pb-2 text-slate-700 dark:text-slate-200">
            This action cannot be undone. This will permanently delete the user account for{" "}
            <strong>
              {userToDelete?.firstName} {userToDelete?.lastName}
            </strong>{" "}
            and remove all associated data.
          </AlertDialogDescription>
          <AlertDialogFooter className="px-6 pb-4">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function UserManagementPage() {
  return (
    <RouteGuard requiredRole="admin">
      <UserManagementContent />
    </RouteGuard>
  )
} 