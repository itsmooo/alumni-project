"use client"

import { useState } from "react"
import { StripePaymentForm } from "@/components/payments/stripe-payment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function TestPaymentPage() {
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    message: string
    paymentIntent?: any
  } | null>(null)

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentResult({
      success: true,
      message: "Payment completed successfully!",
      paymentIntent,
    })
  }

  const handlePaymentError = (error: string) => {
    setPaymentResult({
      success: false,
      message: error,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Payment Test</h1>
          <p className="text-gray-600">
            Test the Stripe payment integration with test card numbers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Test Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <StripePaymentForm
                  amount={50.00}
                  currency="USD"
                  type="test"
                  purpose="Test Payment - Alumni Network"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </CardContent>
            </Card>
          </div>

          {/* Test Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Card Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Success Test</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Card:</strong> 4242 4242 4242 4242<br />
                    <strong>Expiry:</strong> Any future date<br />
                    <strong>CVC:</strong> Any 3 digits
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">❌ Decline Test</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Card:</strong> 4000 0000 0000 0002<br />
                    <strong>Expiry:</strong> Any future date<br />
                    <strong>CVC:</strong> Any 3 digits
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">🔒 3D Secure Test</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Card:</strong> 4000 0025 0000 3155<br />
                    <strong>Expiry:</strong> Any future date<br />
                    <strong>CVC:</strong> Any 3 digits
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Environment Check */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Stripe Key:</strong>{" "}
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <span className="text-green-600">✅ Set</span>
                    ) : (
                      <span className="text-red-600">❌ Missing</span>
                    )}
                  </div>
                  <div>
                    <strong>API URL:</strong>{" "}
                    {process.env.NEXT_PUBLIC_API_URL ? (
                      <span className="text-green-600">✅ Set</span>
                    ) : (
                      <span className="text-red-600">❌ Missing</span>
                    )}
                  </div>
                  <div>
                    <strong>Backend Running:</strong>{" "}
                    <span className="text-yellow-600">⚠️ Check manually</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <div className="mt-6">
            <Alert variant={paymentResult.success ? "default" : "destructive"}>
              <div className="flex items-center space-x-2">
                {paymentResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>{paymentResult.success ? "Success!" : "Error:"}</strong>{" "}
                  {paymentResult.message}
                </AlertDescription>
              </div>
            </Alert>
            {paymentResult.paymentIntent && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(paymentResult.paymentIntent, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 