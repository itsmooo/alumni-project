"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider } from "react-redux"
import { store, type AppDispatch } from "@/lib/store" // Import AppDispatch
import { setAuthFromStorage } from "@/lib/slices/authSlice"
import type { User } from "@/types"

interface ReduxProviderProps {
  children: React.ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userString = localStorage.getItem("user")

    let user: User | null = null

    if (token && userString) {
      try {
        user = JSON.parse(userString)
          // Dispatch action to rehydrate auth state
        ;(store.dispatch as AppDispatch)(setAuthFromStorage({ user, token }))
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e)
        // Clear invalid data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
