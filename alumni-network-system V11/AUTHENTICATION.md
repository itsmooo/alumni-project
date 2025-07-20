# Authentication System Documentation

## Overview

The Alumni Network System implements a comprehensive authentication system with JWT token validation, role-based access control, and automatic redirection based on user authentication status.

## Key Components

### 1. Token Validation Utilities (`lib/utils/tokenUtils.ts`)

Provides utility functions for token management:

- `isTokenValid(token)`: Checks if a JWT token exists and is not expired (full validation)
- `isTokenQuickValid(token)`: Quick validation without JWT decoding (for performance)
- `getTokenFromStorage()`: Retrieves token from localStorage
- `getUserFromStorage()`: Retrieves user data from localStorage
- `clearAuthStorage()`: Clears all authentication data from localStorage

### 2. Background Token Validation (`hooks/useTokenValidation.ts`)

- Runs token validation in the background every 5 minutes
- Automatically clears expired tokens
- Doesn't block the UI or slow down navigation

### 3. Main Entry Point (`app/page.tsx`)

The first page users encounter that:

1. **Quick token check** in localStorage (no JWT decoding for speed)
2. **Immediate redirection** based on authentication status:
   - If token exists → Redirects to appropriate dashboard based on user role
   - If no token → Redirects to login page
3. **Sets Redux state** from localStorage if token exists
4. **Background validation** handles token expiration separately

### 4. Route Guards

#### RouteGuard (`components/auth/route-guard.tsx`)
Protects individual pages by:
- Quick authentication check (no JWT decoding)
- Validating user roles
- Redirecting unauthorized users
- Supporting role hierarchy (admin > moderator > alumni)

#### AuthGuard (`components/auth/auth-guard.tsx`)
Alternative route guard with similar functionality but different implementation approach.

### 5. Authentication Flow

```
User visits app → 
Quick localStorage check (no JWT decode) → 
Token exists? → 
  Yes: Set Redux state & redirect to dashboard immediately
  No: Redirect to login immediately

Background: Periodic token validation every 5 minutes
```

## Usage Examples

### Protecting a Page

```tsx
import { RouteGuard } from "@/components/auth/route-guard"

export default function ProtectedPage() {
  return (
    <RouteGuard requiredRole="admin">
      <YourPageContent />
    </RouteGuard>
  )
}
```

### Role-Based Access

```tsx
// Admin only
<RouteGuard requiredRole="admin">

// Admin or moderator
<RouteGuard requiredRole="moderator">

// Any authenticated user (admin, moderator, or alumni)
<RouteGuard>
```

### Dashboard Redirection

The system automatically redirects users to appropriate dashboards:

- **Admin users** → `/admin/dashboard`
- **Moderator users** → `/moderator/dashboard`
- **Alumni users** → `/dashboard`

## Token Management

### Storage
- Tokens are stored in `localStorage` as "token"
- User data is stored in `localStorage` as "user"
- Both are automatically managed by the auth slice

### Validation
- Tokens are validated using JWT decode
- Expiration is checked against current timestamp
- Invalid tokens are automatically cleared

### Security
- Tokens are cleared on logout
- Expired tokens are automatically removed
- Failed validation redirects to login

## Redux Integration

The authentication state is managed in Redux (`lib/slices/authSlice.ts`):

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

### Key Actions
- `setAuthFromStorage`: Restores auth state from localStorage
- `logout`: Clears all auth data
- `loginUser`: Handles login process
- `registerUser`: Handles registration process

## Error Handling

- Network errors redirect to login
- Invalid tokens are automatically cleared
- Role mismatches redirect to appropriate dashboard
- All errors are logged to console for debugging

## Best Practices

1. **Always use RouteGuard** for protected pages
2. **Check user roles** before rendering sensitive content
3. **Handle loading states** during authentication checks
4. **Clear storage** on logout or token expiration
5. **Use role hierarchy** for access control (admin > moderator > alumni)

## Environment Variables

Make sure to set:
```
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Dependencies

- `jwt-decode`: For token validation
- `@reduxjs/toolkit`: For state management
- `next/navigation`: For routing
- `lucide-react`: For loading icons