import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { JobsState, Job, JobApplication } from "@/types"

const initialState: JobsState = {
  jobs: [],
  selectedJob: null,
  myJobs: [],
  applications: [],
  isLoading: false,
  error: null,
}

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload
    },
    setSelectedJob: (state, action: PayloadAction<Job | null>) => {
      state.selectedJob = action.payload
    },
    setApplications: (state, action: PayloadAction<JobApplication[]>) => {
      state.applications = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setJobs, setSelectedJob, setApplications, setLoading, setError } = jobsSlice.actions
export default jobsSlice.reducer
