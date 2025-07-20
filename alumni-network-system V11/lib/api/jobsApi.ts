import { api } from '../api'

// Job Types - Updated to match API documentation
export interface JobSummary {
  totalJobs: {
    value: number
    change?: number
    changeType?: 'increase' | 'decrease' | 'stable'
  }
  activeJobs: {
    value: number
    percentage?: number
  }
  jobsThisMonth: {
    value: number
    change?: number
    changeType?: 'increase' | 'decrease' | 'stable'
  }
  totalApplications: {
    value: number
  }
  featuredJobs: {
    value: number
  }
}

export interface Job {
  _id: string
  title: string
  company: {
    name: string
    website?: string
    logo?: string
    description?: string
    location: {
      city: string
      state?: string
      country: string
      isRemote: boolean
    }
  }
  description: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer'
  category: 'technology' | 'healthcare' | 'finance' | 'education' | 'marketing' | 'sales' | 'operations' | 'other'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  skills: string[]
  tags?: string[]
  salary?: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
    isNegotiable?: boolean
  }
  applicationMethod: 'email' | 'website' | 'phone' | 'in_person'
  applicationEmail?: string
  applicationUrl?: string
  applicationPhone?: string
  applicationDeadline?: string
  contactInfo?: {
    email?: string
    phone?: string
    contactPerson?: string
  }
  status: 'active' | 'expired' | 'filled' | 'paused'
  featured: boolean
  postedBy: {
    _id: string
    name?: string
    firstName?: string
    lastName?: string
    email: string
  }
  views: number
  applicationCount: number
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export interface JobsResponse {
  jobs: Job[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CreateJobRequest {
  title: string
  company: {
    name: string
    website?: string
    logo?: string
    description?: string
    location: {
      city: string
      state?: string
      country: string
      isRemote: boolean
    }
  }
  description: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer'
  category: 'technology' | 'healthcare' | 'finance' | 'education' | 'marketing' | 'sales' | 'operations' | 'other'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  skills: string[]
  tags?: string[]
  salary?: {
    min?: number
    max?: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
    isNegotiable?: boolean
  }
  applicationMethod: 'email' | 'website' | 'phone' | 'in_person'
  applicationEmail?: string
  applicationUrl?: string
  applicationPhone?: string
  applicationDeadline?: string
  contactInfo?: {
    email?: string
    phone?: string
    contactPerson?: string
  }
  postedBy: string
  status?: 'active' | 'expired' | 'filled' | 'paused'
  featured?: boolean
  expiresAt?: string
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: 'active' | 'expired' | 'filled' | 'paused'
}

export interface JobFilters {
  page?: number
  limit?: number
  search?: string
  type?: string
  category?: string
  experienceLevel?: string
  status?: string
  featured?: boolean
  sortBy?: 'createdAt' | 'title' | 'company' | 'views' | 'applicationCount' | 'expiresAt'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface BulkJobAction {
  action: 'delete' | 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'expire'
  jobIds: string[]
}

export interface DetailedJobStatistics {
  mainKPIs: {
    totalJobs: { value: number; change: number; changeType: string }
    activeJobs: { value: number; percentage: number }
    totalApplications: { value: number; change: number; changeType: string }
    avgApplicationsPerJob: { value: number; change: number; changeType: string }
    featuredJobs: { value: number }
  }
  breakdown: {
    byStatus: Array<{ status: string; count: number; percentage: number }>
    byType: Array<{ type: string; count: number; percentage: number }>
    byCategory: Array<{ category: string; count: number; percentage: number }>
  }
  trends: {
    monthlyJobs: Array<{ month: string; jobs: number; applications: number }>
    topPerformingJobs: Array<{
      _id: string
      title: string
      company: string
      applications: number
      views: number
    }>
  }
  alerts: {
    expiredJobs: number
    expiringJobs: number
    lowPerformingJobs: number
  }
}

export const jobsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Statistics
    getJobSummary: builder.query<JobSummary, void>({
      query: () => '/jobs/summary',
      providesTags: ['Job'],
    }),

    getDetailedJobStatistics: builder.query<DetailedJobStatistics, void>({
      query: () => '/jobs/admin/statistics',
      providesTags: ['Job'],
    }),

    // CRUD Operations
    getJobs: builder.query<JobsResponse, JobFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `/jobs/admin?${params.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map(({ _id }) => ({ type: 'Job' as const, id: _id })),
              { type: 'Job', id: 'LIST' },
            ]
          : [{ type: 'Job', id: 'LIST' }],
    }),

    getJob: builder.query<Job, string>({
      query: (id) => `/jobs/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),

    createJob: builder.mutation<Job, CreateJobRequest>({
      query: (jobData) => ({
        url: '/jobs/admin',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: [
        { type: 'Job', id: 'LIST' },
        'Job',
      ],
    }),

    updateJob: builder.mutation<Job, { id: string; data: UpdateJobRequest }>({
      query: ({ id, data }) => ({
        url: `/jobs/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
        'Job',
      ],
    }),

    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `/jobs/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Job', id },
        { type: 'Job', id: 'LIST' },
        'Job',
      ],
    }),

    // Bulk Operations
    bulkJobAction: builder.mutation<{ success: boolean; message: string }, BulkJobAction>({
      query: (actionData) => ({
        url: '/jobs/admin/bulk',
        method: 'POST',
        body: actionData,
      }),
      invalidatesTags: [
        { type: 'Job', id: 'LIST' },
        'Job',
      ],
    }),

    // Export
    exportJobs: builder.query<Blob, { format: 'csv' | 'json'; filters?: JobFilters }>({
      query: ({ format, filters = {} }) => {
        const params = new URLSearchParams({ format })
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return {
          url: `/jobs/admin/export?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        }
      },
    }),
  }),
})

export const {
  useGetJobSummaryQuery,
  useGetDetailedJobStatisticsQuery,
  useGetJobsQuery,
  useGetJobQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useBulkJobActionMutation,
  useLazyExportJobsQuery,
} = jobsApi 