import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./store"
import { logout } from "./slices/authSlice"

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Handle 401 errors by logging out the user (disabled for development)
  if (result.error && result.error.status === 401) {
    console.warn('401 Unauthorized - Token may be expired or invalid')
    
    // Temporarily disable auto-logout for development
    // Uncomment below for production:
    /*
    api.dispatch(logout())
    
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login'
    }
    */
  }
  
  return result
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Event", "Announcement", "Job", "Payment", "Dashboard", "Admin"],
  endpoints: () => ({}),
})
