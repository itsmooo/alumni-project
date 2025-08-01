import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "@/lib/store"

export interface SendEmailRequest {
  subject: string
  message: string
  recipientType: "all" | "students" | "specific" | "multiple"
  specificUser?: string
  selectedUsers?: string[]
  sendEmail?: boolean
  sendNotification?: boolean
}

export interface SendEmailResponse {
  success: boolean
  message: string
  emailResults: {
    sent: number
    failed: number
  }
  notificationResults: {
    sent: number
    failed: number
  }
  totalRecipients: number
}

export const emailsApi = createApi({
  reducerPath: "emailsApi",
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
  tagTypes: ["Emails"],
  endpoints: (builder) => ({
    sendEmail: builder.mutation<SendEmailResponse, SendEmailRequest>({
      query: (data) => ({
        url: "/emails/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Emails"],
    }),
  }),
})

export const {
  useSendEmailMutation,
} = emailsApi 