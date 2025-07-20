import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { PaymentsState, Payment } from "@/types"

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  paymentIntent: null,
  isLoading: false,
  error: null,
}

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload
    },
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload
    },
    setPaymentIntent: (state, action: PayloadAction<any>) => {
      state.paymentIntent = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setPayments, setSelectedPayment, setPaymentIntent, setLoading, setError } = paymentsSlice.actions
export default paymentsSlice.reducer
