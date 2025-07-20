import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AnnouncementsState, Announcement } from "@/types"

const initialState: AnnouncementsState = {
  announcements: [],
  selectedAnnouncement: null,
  isLoading: false,
  error: null,
}

const announcementsSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload
    },
    setSelectedAnnouncement: (state, action: PayloadAction<Announcement | null>) => {
      state.selectedAnnouncement = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setAnnouncements, setSelectedAnnouncement, setLoading, setError } = announcementsSlice.actions
export default announcementsSlice.reducer
