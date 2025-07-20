"use client"

import type React from "react"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeProviderProps {
  children: React.ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return <Elements stripe={stripePromise}>{children}</Elements>
}
