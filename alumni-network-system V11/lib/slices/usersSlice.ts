import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UsersState, User } from "@/types"

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  searchResults: [],
  isLoading: false,
  error: null,
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    setSearchResults: (state, action: PayloadAction<User[]>) => {
      state.searchResults = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setUsers, setSelectedUser, setSearchResults, setLoading, setError } = usersSlice.actions
export default usersSlice.reducer
