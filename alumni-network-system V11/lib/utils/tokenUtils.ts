import { jwtDecode } from "jwt-decode"

interface TokenPayload {
  exp: number
  iat: number
  [key: string]: any
}

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false
  
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    const currentTime = Date.now() / 1000
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < currentTime) {
      return false
    }
    
    return true
  } catch (error) {
    // If token can't be decoded, it's invalid
    return false
  }
}

// Quick validation for performance - doesn't decode JWT
export const isTokenQuickValid = (token: string | null): boolean => {
  if (!token) return false
  return token.length > 10 && token.includes('.')
}

export const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const getUserFromStorage = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
} 