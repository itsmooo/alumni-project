import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { isTokenValid, getTokenFromStorage, clearAuthStorage } from '@/lib/utils/tokenUtils'

export const useTokenValidation = () => {
  const dispatch = useDispatch()
  const validationTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const validateTokenInBackground = () => {
      const token = getTokenFromStorage()
      
      if (token) {
        // Validate token in background
        if (!isTokenValid(token)) {
          // Token is expired, clear storage
          clearAuthStorage()
          console.log('Token expired, cleared authentication')
        }
      }
    }

    // Validate immediately
    validateTokenInBackground()

    // Set up periodic validation every 5 minutes
    validationTimeoutRef.current = setInterval(validateTokenInBackground, 5 * 60 * 1000)

    return () => {
      if (validationTimeoutRef.current) {
        clearInterval(validationTimeoutRef.current)
      }
    }
  }, [dispatch])

  return null
} 