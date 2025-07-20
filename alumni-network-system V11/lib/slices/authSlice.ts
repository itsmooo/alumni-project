import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, User } from "@/types"

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { identifier: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      return rejectWithValue(error.message || "Login failed")
    }

    const data = await response.json()
    // Save token and user to localStorage on successful login
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return { user: data.user, token: data.token }
  } catch (error) {
    return rejectWithValue("Network error occurred")
  }
})

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  {
    firstName: string
    lastName: string
    email: string
    phone?: string
    password: string
    graduationYear: number
    degree: string
    major: string
  },
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      return rejectWithValue(error.message || "Registration failed")
    }

    const data = await response.json()
    // Save token and user to localStorage on successful registration
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    return { user: data.user, token: data.token }
  } catch (error) {
    return rejectWithValue("Network error occurred")
  }
})

export const updateProfile = createAsyncThunk<User, Partial<User>, { rejectValue: string; state: { auth: AuthState } }>(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || "Profile update failed")
      }

      const data = await response.json()
      // Update user in localStorage if profile is updated
      localStorage.setItem("user", JSON.stringify(data.user))
      return data.user
    } catch (error) {
      return rejectWithValue("Network error occurred")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      // Remove token and user from localStorage on logout
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    // New action to set auth state from localStorage
    setAuthFromStorage: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Login failed"
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Registration failed"
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Profile update failed"
      })
  },
})

export const { logout, clearError, setUser, setAuthFromStorage } = authSlice.actions
export default authSlice.reducer
