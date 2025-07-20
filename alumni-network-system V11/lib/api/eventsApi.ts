import { api } from "../api"
import type { Event, PaginatedResponse, PaginationParams } from "@/types"

// Event Summary Statistics Interface
export interface EventSummary {
  totalEvents: number
  publishedEvents: number
  upcomingEvents: number
  eventsThisMonth: number
  totalAttendees: number
}

// Create Event Request Interface
export interface CreateEventRequest {
  title: string
  description: string
  type: "reunion" | "webinar" | "fundraiser" | "networking" | "workshop" | "social" | "other"
  date: {
    start: string // ISO date
    end: string // ISO date
  }
  location: {
    type: "physical" | "virtual" | "hybrid"
    address?: string
    city?: string
    country?: string
    virtualLink?: string
  }
  capacity?: number
  registration?: {
    required: boolean
    deadline?: string
    fee?: {
      amount: number
      currency: string
    }
  }
  status?: "draft" | "published" | "cancelled" | "completed"
  isPublic?: boolean
  tags?: string[]
}

// Update Event Request Interface
export interface UpdateEventRequest {
  title?: string
  description?: string
  type?: "reunion" | "webinar" | "fundraiser" | "networking" | "workshop" | "social" | "other"
  date?: {
    start?: string
    end?: string
  }
  location?: {
    type?: "physical" | "virtual" | "hybrid"
    address?: string
    city?: string
    country?: string
    virtualLink?: string
  }
  capacity?: number
  registration?: {
    required?: boolean
    deadline?: string
    fee?: {
      amount?: number
      currency?: string
    }
  }
  status?: "draft" | "published" | "cancelled" | "completed"
  isPublic?: boolean
  tags?: string[]
}

// Backend API Response Types
interface BackendEventPaginatedResponse<T> {
  events?: T[]
  data?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const eventsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public Events (Alumni can view)
    getEvents: builder.query<
      PaginatedResponse<Event>,
      PaginationParams & {
        type?: string
        status?: string
        upcoming?: boolean
        search?: string
      }
    >({
      query: (params) => ({
        url: "/events",
        params,
      }),
      transformResponse: (response: BackendEventPaginatedResponse<Event>) => ({
        data: response.events || response.data || [],
        total: response.pagination.total,
        currentPage: response.pagination.page,
        totalPages: response.pagination.pages,
        limit: response.pagination.limit,
        hasNextPage: response.pagination.page < response.pagination.pages,
        hasPrevPage: response.pagination.page > 1,
      }),
      providesTags: ["Event"],
    }),

    getEvent: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Event Summary Statistics
    getEventSummary: builder.query<EventSummary, void>({
      query: () => "/events/summary",
      transformResponse: (response: any) => {
        // Transform backend response format to match frontend expectations
        return {
          totalEvents: response.totalEvents?.count || 0,
          publishedEvents: response.publishedEvents?.count || 0,
          upcomingEvents: response.upcomingEvents?.count || 0,
          eventsThisMonth: response.eventsThisMonth?.count || 0,
          totalAttendees: response.totalAttendees?.count || 0,
        }
      },
      providesTags: ["Event"],
    }),

    // Admin Event Management
    getAdminEvents: builder.query<
      PaginatedResponse<Event>,
      {
        page?: number
        limit?: number
        sortBy?: string
        sortOrder?: "asc" | "desc"
        status?: string
        type?: string
        search?: string
      }
    >({
      query: (params) => ({
        url: "/events/admin",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      transformResponse: (response: BackendEventPaginatedResponse<Event>) => ({
        data: response.events || response.data || [],
        total: response.pagination.total,
        currentPage: response.pagination.page,
        totalPages: response.pagination.pages,
        limit: response.pagination.limit,
        hasNextPage: response.pagination.page < response.pagination.pages,
        hasPrevPage: response.pagination.page > 1,
      }),
      providesTags: ["Event"],
    }),

    getAdminEvent: builder.query<{ event: Event; adminStats: any }, string>({
      query: (id) => `/events/admin/${id}`,
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    createEvent: builder.mutation<Event, CreateEventRequest>({
      query: (eventData) => ({
        url: "/events/admin",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),

    updateEvent: builder.mutation<Event, { id: string; data: UpdateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/events/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Event", id },
        { type: "Event", id: "LIST" },
      ],
    }),

    // Bulk Operations
    bulkEventOperation: builder.mutation<
      { message: string; results: { total: number; successful: number; failed: number } },
      { action: "publish" | "draft" | "cancel" | "complete" | "delete"; eventIds: string[] }
    >({
      query: ({ action, eventIds }) => ({
        url: "/events/admin/bulk",
        method: "POST",
        body: { action, eventIds },
      }),
      invalidatesTags: ["Event"],
    }),

    // Event Registration (for alumni)
    registerForEvent: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/register`,
        method: "POST",
      }),
      invalidatesTags: (result, error, eventId) => [{ type: "Event", id: eventId }],
    }),

    cancelEventRegistration: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/events/${eventId}/register`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, eventId) => [{ type: "Event", id: eventId }],
    }),
  }),
})

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useGetEventSummaryQuery,
  useGetAdminEventsQuery,
  useGetAdminEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useBulkEventOperationMutation,
  useRegisterForEventMutation,
  useCancelEventRegistrationMutation,
} = eventsApi
