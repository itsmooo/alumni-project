import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { EventsState, Event } from "@/types"

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  myEvents: [],
  isLoading: false,
  error: null,
}

// Async thunks with optimistic updates
export const registerForEvent = createAsyncThunk<
  { eventId: string; userId: string },
  string,
  { rejectValue: string; state: { auth: { token: string; user: { _id: string } } } }
>("events/register", async (eventId, { rejectWithValue, getState }) => {
  try {
    const { token, user } = getState().auth
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return rejectWithValue(error.message || "Registration failed")
    }

    return { eventId, userId: user._id }
  } catch (error) {
    return rejectWithValue("Network error occurred")
  }
})

export const cancelEventRegistration = createAsyncThunk<
  { eventId: string; userId: string },
  string,
  { rejectValue: string; state: { auth: { token: string; user: { _id: string } } } }
>("events/cancelRegistration", async (eventId, { rejectWithValue, getState }) => {
  try {
    const { token, user } = getState().auth
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/register`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return rejectWithValue(error.message || "Cancellation failed")
    }

    return { eventId, userId: user._id }
  } catch (error) {
    return rejectWithValue("Network error occurred")
  }
})

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload)
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex((event) => event._id === action.payload._id)
      if (index !== -1) {
        state.events[index] = action.payload
      }
      if (state.selectedEvent?._id === action.payload._id) {
        state.selectedEvent = action.payload
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((event) => event._id !== action.payload)
      if (state.selectedEvent?._id === action.payload) {
        state.selectedEvent = null
      }
    },
    // Optimistic update for registration
    optimisticRegister: (state, action: PayloadAction<{ eventId: string; userId: string }>) => {
      const { eventId, userId } = action.payload
      const event = state.events.find((e) => e._id === eventId)
      if (event) {
        event.attendeeCount += 1
        event.attendees.push({
          user: userId,
          status: "registered",
          registeredAt: new Date().toISOString(),
        })
      }
      if (state.selectedEvent?._id === eventId) {
        state.selectedEvent.attendeeCount += 1
        state.selectedEvent.attendees.push({
          user: userId,
          status: "registered",
          registeredAt: new Date().toISOString(),
        })
      }
    },
    // Rollback optimistic update
    rollbackRegister: (state, action: PayloadAction<{ eventId: string; userId: string }>) => {
      const { eventId, userId } = action.payload
      const event = state.events.find((e) => e._id === eventId)
      if (event) {
        event.attendeeCount -= 1
        event.attendees = event.attendees.filter((a) => a.user !== userId)
      }
      if (state.selectedEvent?._id === eventId) {
        state.selectedEvent.attendeeCount -= 1
        state.selectedEvent.attendees = state.selectedEvent.attendees.filter((a) => a.user !== userId)
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register for event
      .addCase(registerForEvent.pending, (state, action) => {
        // Optimistic update already applied in component
        state.isLoading = true
      })
      .addCase(registerForEvent.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Registration failed"
        // Rollback will be handled in component
      })
      // Cancel registration
      .addCase(cancelEventRegistration.pending, (state) => {
        state.isLoading = true
      })
      .addCase(cancelEventRegistration.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(cancelEventRegistration.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || "Cancellation failed"
      })
  },
})

export const {
  setEvents,
  setSelectedEvent,
  addEvent,
  updateEvent,
  removeEvent,
  optimisticRegister,
  rollbackRegister,
  clearError,
} = eventsSlice.actions

export default eventsSlice.reducer
