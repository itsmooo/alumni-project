import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { StripeProvider } from "@/components/providers/stripe-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TokenValidationProvider } from "@/components/providers/token-validation-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Alumni Network Management System",
  description:
    "A comprehensive platform for managing alumni networks with events, payments, and communication features.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <StripeProvider>
              <TokenValidationProvider>
                {children}
                <Toaster />
              </TokenValidationProvider>
            </StripeProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
