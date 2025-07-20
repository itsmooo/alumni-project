"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Edit, Trash2, Download } from "lucide-react"
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useExportDataMutation,
} from "@/lib/api/adminApi"
import { format } from "date-fns"
import type { UserManagement } from "@/lib/api/adminApi"

export function UserManagementTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null)

  const {
    data: usersData,
    isLoading,
    error,
  } = useGetAllUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  })

  const [updateUserRole] = useUpdateUserRoleMutation()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [exportData] = useExportDataMutation()

  const users = usersData?.data || []
  const pagination = usersData?.pagination

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap()
    } catch (error) {
      console.error("Failed to update user role:", error)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus({ userId, status: newStatus }).unwrap()
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    try {
      const result = await exportData({
        type: "users",
        format,
        filters: {
          search: search || undefined,
          role: roleFilter === "all" ? undefined : roleFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      }).unwrap()

      // Open download URL
      window.open(result.downloadUrl, "_blank")
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage alumni accounts, roles, and permissions</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value) => handleExport(value as any)}>
              <SelectTrigger className="w-32">
                <Download className="h-4 w-4 mr-2" />
                Export
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load users. Please try again.</p>
          </div>
        ) : users.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userMgmt) => (
                  <TableRow key={userMgmt.user._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userMgmt.user.profile?.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback>
                            {userMgmt.user.firstName[0]}
                            {userMgmt.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {userMgmt.user.firstName} {userMgmt.user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{userMgmt.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(userMgmt.user.role)}>{userMgmt.user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(userMgmt.status)}>{userMgmt.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(userMgmt.lastActivity), "MMM dd, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{userMgmt.loginCount} logins</div>
                    </TableCell>
                    <TableCell>{userMgmt.eventsAttended}</TableCell>
                    <TableCell>${userMgmt.paymentsTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(userMgmt)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>Update user role and status</DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Role</label>
                                  <Select
                                    value={selectedUser.user.role}
                                    onValueChange={(value) => handleRoleChange(selectedUser.user._id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="alumni">Alumni</SelectItem>
                                      <SelectItem value="moderator">Moderator</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Select
                                    value={selectedUser.status}
                                    onValueChange={(value) => handleStatusChange(selectedUser.user._id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(userMgmt.user._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pagination.pages}
                </span>
                <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}>
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
