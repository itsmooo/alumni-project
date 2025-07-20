"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard } from "lucide-react"
import { useCreatePaymentIntentMutation } from "@/lib/api/paymentsApi"

interface StripePaymentFormProps {
  amount: number
  currency: string
  type: string
  purpose: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
}

export function StripePaymentForm({ amount, currency, type, purpose, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [createPaymentIntent] = useCreatePaymentIntentMutation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const { paymentIntent, clientSecret } = await createPaymentIntent({
        amount,
        currency,
        type,
        purpose,
        paymentMethod: "card",
      }).unwrap()

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Confirm payment
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        },
      )

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
        onError?.(stripeError.message || "Payment failed")
      } else if (confirmedPaymentIntent?.status === "succeeded") {
        onSuccess?.(confirmedPaymentIntent)
      }
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Payment failed"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
    },
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          {purpose} - {currency.toUpperCase()} {amount.toFixed(2)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 border rounded-md">
            <CardElement options={cardElementOptions} />
          </div>

          <Button type="submit" className="w-full" disabled={!stripe || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ${currency.toUpperCase()} ${amount.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your payment is secured by Stripe. We do not store your card details.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
