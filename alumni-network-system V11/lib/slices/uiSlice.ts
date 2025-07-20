import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UIState } from "@/types"

const initialState: UIState = {
  theme: "light",
  sidebarOpen: false,
  modals: {},
  loading: {},
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading
    },
  },
})

export const { setTheme, toggleSidebar, setSidebarOpen, openModal, closeModal, setLoading } = uiSlice.actions

export default uiSlice.reducer
