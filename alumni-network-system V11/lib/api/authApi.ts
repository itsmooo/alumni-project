import { api } from "../api"
import type { User, ApiResponse } from "@/types"

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; token: string }, { identifier: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: User; token: string },
      {
        firstName: string
        lastName: string
        email: string
        phone?: string
        password: string
        graduationYear: number
        degree: string
        major: string
      }
    >({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    verifyEmail: builder.mutation<ApiResponse, { token: string }>({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse, { token: string; password: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
