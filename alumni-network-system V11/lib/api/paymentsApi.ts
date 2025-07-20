import { api } from "../api"
import type { Payment, PaginatedResponse, PaginationParams } from "@/types"

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<
      { paymentIntent: any; clientSecret: string },
      {
        amount: number
        currency: string
        type: string
        purpose: string
        paymentMethod: string
      }
    >({
      query: (data) => ({
        url: "/payments/create-intent",
        method: "POST",
        body: data,
      }),
    }),
    getMyPayments: builder.query<PaginatedResponse<Payment>, PaginationParams>({
      query: (params) => ({
        url: "/payments/my-payments",
        params,
      }),
      providesTags: ["Payment"],
    }),
    getPayment: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: "Payment", id }],
    }),
    downloadReceipt: builder.query<Blob, string>({
      query: (id) => ({
        url: `/payments/${id}/receipt`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useCreatePaymentIntentMutation,
  useGetMyPaymentsQuery,
  useGetPaymentQuery,
  useLazyDownloadReceiptQuery,
} = paymentsApi
