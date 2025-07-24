import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Alert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  category: 'network' | 'security' | 'performance' | 'system'
  source: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  assignee?: string
  tags: string[]
  metadata: Record<string, any>
}

interface AlertsState {
  alerts: Alert[]
  filteredAlerts: Alert[]
  filters: {
    severity: string[]
    category: string[]
    acknowledged: boolean | null
    resolved: boolean | null
  }
  isLoading: boolean
  error: string | null
}

const initialState: AlertsState = {
  alerts: [],
  filteredAlerts: [],
  filters: {
    severity: [],
    category: [],
    acknowledged: null,
    resolved: null,
  },
  isLoading: false,
  error: null,
}

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload
      state.filteredAlerts = action.payload
      state.isLoading = false
      state.error = null
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload)
      state.filteredAlerts = applyFilters(state.alerts, state.filters)
    },
    updateAlert: (state, action: PayloadAction<Alert>) => {
      const index = state.alerts.findIndex(alert => alert.id === action.payload.id)
      if (index !== -1) {
        state.alerts[index] = action.payload
        state.filteredAlerts = applyFilters(state.alerts, state.filters)
      }
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(alert => alert.id === action.payload)
      if (alert) {
        alert.acknowledged = true
        state.filteredAlerts = applyFilters(state.alerts, state.filters)
      }
    },
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(alert => alert.id === action.payload)
      if (alert) {
        alert.resolved = true
        state.filteredAlerts = applyFilters(state.alerts, state.filters)
      }
    },
    setFilters: (state, action: PayloadAction<Partial<AlertsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredAlerts = applyFilters(state.alerts, state.filters)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

function applyFilters(alerts: Alert[], filters: AlertsState['filters']): Alert[] {
  return alerts.filter(alert => {
    if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
      return false
    }
    if (filters.category.length > 0 && !filters.category.includes(alert.category)) {
      return false
    }
    if (filters.acknowledged !== null && alert.acknowledged !== filters.acknowledged) {
      return false
    }
    if (filters.resolved !== null && alert.resolved !== filters.resolved) {
      return false
    }
    return true
  })
}

export const {
  setAlerts,
  addAlert,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  setFilters,
  setLoading,
  setError,
} = alertsSlice.actions

export default alertsSlice.reducer