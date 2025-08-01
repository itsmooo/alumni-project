import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "@/lib/store"

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  graduationYear?: number
  department?: string
  profile?: {
    graduationYear?: number
    location?: {
      city?: string
    }
  }
}

export interface UsersResponse {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

export const usersApi = createApi({
  reducerPath: "usersApi",
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
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UsersQueryParams>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["Users"],
    }),
    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: "/users",
        params: { limit: 1000 },
      }),
      transformResponse: (response: UsersResponse) => response.users,
      providesTags: ["Users"],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetAllUsersQuery,
} = usersApi 