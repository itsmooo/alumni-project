import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { api } from "./api"
import { notificationsApi } from "./api/notificationsApi"
import { emailsApi } from "./api/emailsApi"
import { usersApi } from "./api/usersApi"

import authSlice from "./slices/authSlice"
import usersSlice from "./slices/usersSlice"
import eventsSlice from "./slices/eventsSlice"
import announcementsSlice from "./slices/announcementsSlice"
import jobsSlice from "./slices/jobsSlice"
import paymentsSlice from "./slices/paymentsSlice"
import notificationsSlice from "./slices/notificationsSlice"
import uiSlice from "./slices/uiSlice"

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [emailsApi.reducerPath]: emailsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  auth: authSlice,
  users: usersSlice,
  events: eventsSlice,
  announcements: announcementsSlice,
  jobs: jobsSlice,
  payments: paymentsSlice,
  notifications: notificationsSlice,
  ui: uiSlice,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(api.middleware, notificationsApi.middleware, emailsApi.middleware, usersApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
