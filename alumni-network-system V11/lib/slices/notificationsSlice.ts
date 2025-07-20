import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { NotificationsState, Notification } from "@/types"

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter((n) => !n.isRead).length
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n._id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount -= 1
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setNotifications, addNotification, markAsRead, setLoading, setError } = notificationsSlice.actions
export default notificationsSlice.reducer
