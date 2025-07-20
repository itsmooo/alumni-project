import { api } from '../api'

// Announcement Types - Based on API documentation
export interface AnnouncementSummary {
  totalAnnouncements: number
  likedAnnouncements: number
  commentedAnnouncements: number
  recentActivity: number
  categoryBreakdown: {
    general: number
    jobs: number
    news: number
    scholarships: number
    events: number
    achievements: number
    obituary: number
  }
}

export interface AnnouncementAuthor {
  _id: string
  firstName: string
  lastName: string
  role?: string
  email?: string
}

export interface AnnouncementEngagement {
  views: number
  likes: any[]
  comments: any[]
}

export interface AnnouncementStats {
  likes: number
  comments: number
  replies?: number
  views: number
  totalEngagement: number
  engagementRate?: string
}

export interface Announcement {
  _id: string
  title: string
  content: string
  category: 'general' | 'jobs' | 'news' | 'scholarships' | 'events' | 'achievements' | 'obituary'
  author: AnnouncementAuthor
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'archived'
  publishDate: string
  expiryDate?: string
  isPinned: boolean
  targetAudience?: {
    graduationYears?: number[]
    locations?: string[]
    roles?: string[]
    isPublic: boolean
  }
  engagement: AnnouncementEngagement
  stats?: AnnouncementStats
  createdAt: string
  updatedAt: string
}

export interface AnnouncementsResponse {
  announcements: Announcement[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  category: 'general' | 'jobs' | 'news' | 'scholarships' | 'events' | 'achievements' | 'obituary'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'draft' | 'published' | 'archived'
  publishDate?: string
  expiryDate?: string
  isPinned?: boolean
  targetAudience?: {
    graduationYears?: number[]
    locations?: string[]
    roles?: string[]
    isPublic: boolean
  }
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  status?: 'draft' | 'published' | 'archived'
}

export interface AnnouncementFilters {
  page?: number
  limit?: number
  category?: string
  status?: string
  priority?: string
  author?: string
  search?: string
  sortBy?: 'createdAt' | 'publishDate' | 'views' | 'likes' | 'comments' | 'title'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface BulkAnnouncementAction {
  action: 'publish' | 'archive' | 'delete' | 'pin' | 'unpin'
  announcementIds: string[]
}

export interface AnnouncementStatistics {
  overview: {
    totalAnnouncements: number
    totalViews: number
    totalLikes: number
    totalComments: number
    averageEngagement: string
  }
  breakdowns: {
    status: {
      published: number
      draft: number
      archived: number
    }
    category: {
      [key: string]: {
        count: number
        averageViews: number
        totalEngagement: number
      }
    }
    priority: {
      high: number
      medium: number
      low: number
    }
  }
  recentActivity: Array<{
    _id: string
    count: number
  }>
  topAnnouncements: Array<{
    _id: string
    title: string
    category: string
    author: {
      firstName: string
      lastName: string
    }
    views: number
    likes: number
    comments: number
    engagementScore: number
  }>
}

export interface Comment {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
  }
  content: string
  createdAt: string
  replies: Reply[]
}

export interface Reply {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
  }
  content: string
  createdAt: string
}

export const announcementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Alumni Routes
    getAnnouncementSummary: builder.query<AnnouncementSummary, void>({
      query: () => '/announcements/summary',
      providesTags: ['Announcement'],
    }),

    // Public Routes
    getPublicAnnouncements: builder.query<AnnouncementsResponse, AnnouncementFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `/announcements?${params.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.announcements.map(({ _id }) => ({ type: 'Announcement' as const, id: _id })),
              { type: 'Announcement', id: 'PUBLIC_LIST' },
            ]
          : [{ type: 'Announcement', id: 'PUBLIC_LIST' }],
    }),

    getPublicAnnouncement: builder.query<Announcement, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcement', id }],
    }),

    likeAnnouncement: builder.mutation<{ message: string; likeCount: number }, string>({
      query: (id) => ({
        url: `/announcements/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        { type: 'Announcement', id: 'ADMIN_LIST' },
      ],
    }),

    addComment: builder.mutation<{ message: string; comment: Comment }, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/announcements/${id}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        { type: 'Announcement', id: 'ADMIN_LIST' },
      ],
    }),

    addReply: builder.mutation<{ message: string; reply: Reply }, { id: string; commentId: string; content: string }>({
      query: ({ id, commentId, content }) => ({
        url: `/announcements/${id}/comments/${commentId}/replies`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        { type: 'Announcement', id: 'ADMIN_LIST' },
      ],
    }),

    // Admin Routes
    getAdminAnnouncements: builder.query<AnnouncementsResponse, AnnouncementFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `/announcements/admin?${params.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.announcements.map(({ _id }) => ({ type: 'Announcement' as const, id: _id })),
              { type: 'Announcement', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Announcement', id: 'ADMIN_LIST' }],
    }),

    createAnnouncement: builder.mutation<{ message: string; announcement: Announcement }, CreateAnnouncementRequest>({
      query: (announcementData) => ({
        url: '/announcements/admin',
        method: 'POST',
        body: announcementData,
      }),
      invalidatesTags: [
        { type: 'Announcement', id: 'ADMIN_LIST' },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        'Announcement',
      ],
    }),

    getAdminAnnouncement: builder.query<Announcement, string>({
      query: (id) => `/announcements/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcement', id }],
    }),

    updateAnnouncement: builder.mutation<{ message: string; announcement: Announcement }, { id: string; data: UpdateAnnouncementRequest }>({
      query: ({ id, data }) => ({
        url: `/announcements/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'ADMIN_LIST' },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        'Announcement',
      ],
    }),

    deleteAnnouncement: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/announcements/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'ADMIN_LIST' },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        'Announcement',
      ],
    }),

    bulkAnnouncementAction: builder.mutation<{ message: string; modifiedCount: number; matchedCount: number }, BulkAnnouncementAction>({
      query: (actionData) => ({
        url: '/announcements/admin/bulk',
        method: 'POST',
        body: actionData,
      }),
      invalidatesTags: [
        { type: 'Announcement', id: 'ADMIN_LIST' },
        { type: 'Announcement', id: 'PUBLIC_LIST' },
        'Announcement',
      ],
    }),

    exportAnnouncements: builder.query<Blob, { format?: 'csv' | 'json'; filters?: AnnouncementFilters }>({
      query: ({ format = 'json', filters = {} }) => {
        const params = new URLSearchParams({ format })
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return {
          url: `/announcements/admin/export?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        }
      },
    }),

    getAnnouncementStatistics: builder.query<AnnouncementStatistics, void>({
      query: () => '/announcements/admin/statistics',
      providesTags: ['Announcement'],
    }),
  }),
})

export const {
  // Alumni hooks
  useGetAnnouncementSummaryQuery,
  
  // Public hooks
  useGetPublicAnnouncementsQuery,
  useGetPublicAnnouncementQuery,
  useLikeAnnouncementMutation,
  useAddCommentMutation,
  useAddReplyMutation,
  
  // Admin hooks
  useGetAdminAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useGetAdminAnnouncementQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useBulkAnnouncementActionMutation,
  useLazyExportAnnouncementsQuery,
  useGetAnnouncementStatisticsQuery,
} = announcementsApi 