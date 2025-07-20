"use client"

import { useTokenValidation } from "@/hooks/useTokenValidation"
import { type ReactNode } from "react"

interface TokenValidationProviderProps {
  children: ReactNode
}

export function TokenValidationProvider({ children }: TokenValidationProviderProps) {
  // This hook runs background token validation
  useTokenValidation()
  
  return <>{children}</>
} 