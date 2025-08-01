import { api } from "../api"
import type { User, Event, Announcement, PaginatedResponse, PaginationParams } from "@/types"

export interface AdminStats {
  users: {
    total: number
    new: number
    active: number
    inactive: number
    byRole: {
      alumni: number
      moderator: number
      admin: number
    }
    byGraduationYear: Array<{
      year: number
      count: number
    }>
    recent: User[]
    growthData: Array<{
      date: string
      count: number
    }>
  }
  events: {
    total: number
    upcoming: number
    completed: number
    cancelled: number
    byType: Record<string, number>
    attendanceRate: number
    revenueFromEvents: number
    popularEvents: Array<{
      event: Event
      attendeeCount: number
      revenue: number
    }>
  }
  payments: {
    totalRevenue: number
    recentRevenue: number
    monthlyRevenue: Array<{
      month: string
      revenue: number
      transactions: number
    }>
    byType: Record<string, number>
    averageTransaction: number
    refundRate: number
  }
  announcements: {
    total: number
    byCategory: Record<string, number>
    engagementRate: number
    mostEngaged: Announcement[]
  }
  jobs: {
    total: number
    active: number
    byCategory: Record<string, number>
    applicationRate: number
    topCompanies: Array<{
      company: string
      jobCount: number
      applicationCount: number
    }>
  }
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    activeConnections: number
  }
}

export interface UserManagement {
  user: User
  lastActivity: string
  loginCount: number
  eventsAttended: number
  paymentsTotal: number
  status: "active" | "inactive" | "suspended"
}

// User Management Types
export interface UserSummary {
  totalUsers: number
  activeUsers: number
  newThisMonth: number
  adminCount: number
  moderatorCount: number
  alumniCount: number
  byGraduationYear: Array<{ year: number; count: number }>
  byLocation: Array<{ location: string; count: number }>
  recentUsers: User[]
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role: "alumni" | "moderator" | "admin"
  profile: {
    graduationYear: number
    degree: string
    major: string
    profession?: string
    company?: string
    bio?: string
    location?: {
      city: string
      country: string
    }
    skills?: string[]
    socialLinks?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      website?: string
    }
  }
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: "alumni" | "moderator" | "admin"
  isActive?: boolean
  membershipStatus?: "active" | "inactive" | "suspended"
  profile?: {
    graduationYear?: number
    degree?: string
    major?: string
    profession?: string
    company?: string
    bio?: string
    location?: {
      city?: string
      country?: string
    }
    skills?: string[]
    socialLinks?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      website?: string
    }
  }
  preferences?: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    privacy?: {
      showEmail?: boolean
      showPhone?: boolean
      showLocation?: boolean
    }
  }
}

// Backend API Response Types (matching your API documentation)
interface BackendPaginatedResponse<T> {
  users?: T[]
  events?: T[]
  announcements?: T[]
  jobs?: T[]
  data?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Stats - using your external server endpoint
    getDashboardStats: builder.query<AdminStats, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: "/dashboard",
        params,
      }),
      providesTags: ["Admin"],
    }),

    // User Management APIs - Alumni Directory (public)
    getUserSummary: builder.query<UserSummary, void>({
      query: () => "/users/summary",
      transformResponse: (response: any) => {
        // Transform backend response format to match frontend expectations
        return {
          totalUsers: response.totalUsers?.count || 0,
          activeUsers: response.activeUsers?.count || 0,
          newThisMonth: response.newThisMonth?.count || 0,
          adminCount: response.admins?.count || 0,
          moderatorCount: response.moderators?.count || 0,
          alumniCount: response.alumni?.count || 0,
          byGraduationYear: response.byGraduationYear || [],
          byLocation: response.byLocation || [],
          recentUsers: response.recentUsers || [],
        }
      },
      providesTags: ["User", "Admin"],
    }),

    getAllUsers: builder.query<
      PaginatedResponse<User>,
      {
        page?: number
        limit?: number
        search?: string
        role?: string
        status?: string
        graduationYear?: number
        location?: string
        profession?: string
        sortBy?: string
        sortOrder?: "asc" | "desc"
      }
    >({
      query: (params) => ({
        url: "/users",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      transformResponse: (response: BackendPaginatedResponse<User>) => ({
        data: response.users || response.data || [],
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.pages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "User" as const, id: _id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Admin User Management (admin only) - using your server's admin endpoints
    getAdminUsers: builder.query<
      PaginatedResponse<User>,
      {
        page?: number
        limit?: number
        search?: string
        role?: string
        status?: string
        graduationYear?: number
        location?: string
        profession?: string
        sortBy?: string
        sortOrder?: "asc" | "desc"
      }
    >({
      query: (params) => ({
        url: "/users/admin",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      transformResponse: (response: BackendPaginatedResponse<User>) => ({
        data: response.users || response.data || [],
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.pages,
      }),
      providesTags: ["User", "Admin"],
    }),

    getAdminUserById: builder.query<User, string>({
      query: (id) => `/users/admin/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: "/users/admin",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }, "Admin"],
    }),

    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        "Admin",
      ],
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        "Admin",
      ],
    }),

    updateUserRole: builder.mutation<User, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/admin/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "Admin",
      ],
    }),

    updateUserStatus: builder.mutation<User, { userId: string; status: string; isActive?: boolean }>({
      query: ({ userId, status, isActive }) => ({
        url: `/users/admin/${userId}/status`,
        method: "PUT",
        body: { status, isActive },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        "Admin",
      ],
    }),

    bulkUpdateUsers: builder.mutation<
      { success: number; failed: number },
      { userIds: string[]; updates: Partial<UpdateUserRequest> }
    >({
      query: ({ userIds, updates }) => ({
        url: "/users/admin/bulk",
        method: "POST",
        body: { userIds, updates },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }, "Admin"],
    }),

    exportUsers: builder.mutation<
      { downloadUrl: string; filename: string },
      {
        format: "csv" | "xlsx" | "json"
        filters?: {
          role?: string
          status?: string
          graduationYear?: number
          location?: string
        }
      }
    >({
      query: (params) => ({
        url: "/users/admin/export",
        method: "GET",
        params,
      }),
    }),

    getAdminStatistics: builder.query<
      {
        totalUsers: number
        activeUsers: number
        newThisMonth: number
        usersByRole: Record<string, number>
        usersByStatus: Record<string, number>
        usersByGraduationYear: Array<{ year: number; count: number }>
        usersByLocation: Array<{ location: string; count: number }>
        recentActivity: Array<{
          userId: string
          action: string
          timestamp: string
        }>
      },
      void
    >({
      query: () => "/users/admin/statistics",
      providesTags: ["Admin"],
    }),

    // Events Management
    getEvents: builder.query<PaginatedResponse<Event>, PaginationParams>({
      query: (params) => ({
        url: "/events",
        params,
      }),
      transformResponse: (response: BackendPaginatedResponse<Event>) => ({
        data: response.events || response.data || [],
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.pages,
      }),
      providesTags: ["Event"],
    }),

    getAdminEvents: builder.query<PaginatedResponse<Event>, PaginationParams>({
      query: (params) => ({
        url: "/events/admin",
        params,
      }),
      transformResponse: (response: BackendPaginatedResponse<Event>) => ({
        data: response.events || response.data || [],
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.pages,
      }),
      providesTags: ["Event", "Admin"],
    }),

    getEventStatistics: builder.query<
      {
        totalEvents: number
        upcomingEvents: number
        completedEvents: number
        cancelledEvents: number
        eventsByType: Record<string, number>
        attendanceRate: number
        revenueFromEvents: number
      },
      void
    >({
      query: () => "/events/admin/statistics",
      providesTags: ["Event", "Admin"],
    }),

    // System Management
    getSystemSettings: builder.query<
      {
        siteName: string
        siteDescription: string
        contactEmail: string
        maintenanceMode: boolean
        registrationEnabled: boolean
        emailNotificationsEnabled: boolean
        smsNotificationsEnabled: boolean
      },
      void
    >({
      query: () => "/system/settings",
      providesTags: ["Admin"],
    }),

    exportSystemData: builder.mutation<
      { downloadUrl: string },
      {
        type: "users" | "events" | "payments" | "announcements" | "jobs"
        format: "csv" | "xlsx" | "json"
        filters?: any
      }
    >({
      query: (data) => ({
        url: `/system/export/${data.type}`,
        method: "GET",
        params: { format: data.format, ...data.filters },
      }),
    }),

    // Filter endpoints
    getGraduationYears: builder.query<number[], void>({
      query: () => "/users/filters/graduation-years",
      providesTags: ["User"],
    }),

    getLocations: builder.query<string[], void>({
      query: () => "/users/filters/locations",
      providesTags: ["User"],
    }),

    // System Monitoring - placeholder for future implementation
    getSystemLogs: builder.query<
      PaginatedResponse<{ level: string; message: string; timestamp: string }>,
      { page?: number; limit?: number; level?: string }
    >({
      query: (params) => ({
        url: "/system/logs",
        params,
      }),
      providesTags: ["Admin"],
    }),

    // Bulk Communication - placeholder for future implementation
    sendBulkNotification: builder.mutation<
      { success: boolean; sent: number },
      { 
        recipients: string[];
        type: "email" | "push";
        subject?: string;
        message: string;
      }
    >({
      query: (data) => ({
        url: "/communications/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetUserSummaryQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useBulkUpdateUsersMutation,
  useExportUsersMutation,
  useGetAdminStatisticsQuery,
  useGetEventsQuery,
  useGetAdminEventsQuery,
  useGetEventStatisticsQuery,
  useGetSystemSettingsQuery,
  useExportSystemDataMutation,
  useGetGraduationYearsQuery,
  useGetLocationsQuery,
  useGetSystemLogsQuery,
  useSendBulkNotificationMutation,
} = adminApi
