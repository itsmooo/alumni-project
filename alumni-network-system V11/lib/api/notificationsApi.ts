import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "@/lib/store"

export interface Notification {
  _id: string
  type: string
  subject: string
  content: string
  status: string
  readAt?: string
  createdAt: string
  sender?: {
    _id: string
    firstName: string
    lastName: string
  }
}

export interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  unreadCount: number
}

export interface NotificationsQueryParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, NotificationsQueryParams>({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      providesTags: ["Notifications"],
    }),
    markNotificationAsRead: builder.mutation<
      { message: string; notification: { _id: string; status: string; readAt: string } },
      string
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsAsRead: builder.mutation<
      { message: string; updatedCount: number },
      void
    >({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi 