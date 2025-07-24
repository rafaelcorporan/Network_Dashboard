import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NetworkDevice, DeviceCredentials } from './networkSlice'

export interface Device extends NetworkDevice {
  serialNumber: string
  firmwareVersion: string
  lastSeen: string
  configBackup?: string
  snmpCommunity?: string
  credentials: DeviceCredentials | null
  monitoring: {
    enabled: boolean
    interval: number
    metrics: string[]
  }
}

interface DevicesState {
  devices: Device[]
  filteredDevices: Device[]
  selectedDevice: Device | null
  filters: {
    type: string[]
    status: string[]
    vendor: string[]
    location: string[]
  }
  isLoading: boolean
  error: string | null
}

const initialState: DevicesState = {
  devices: [],
  filteredDevices: [],
  selectedDevice: null,
  filters: {
    type: [],
    status: [],
    vendor: [],
    location: [],
  },
  isLoading: false,
  error: null,
}

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload
      state.filteredDevices = action.payload
      state.isLoading = false
      state.error = null
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      state.devices.push(action.payload)
      state.filteredDevices = applyFilters(state.devices, state.filters)
    },
    updateDevice: (state, action: PayloadAction<Device>) => {
      const index = state.devices.findIndex(device => device.id === action.payload.id)
      if (index !== -1) {
        state.devices[index] = action.payload
        state.filteredDevices = applyFilters(state.devices, state.filters)
      }
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(device => device.id !== action.payload)
      state.filteredDevices = applyFilters(state.devices, state.filters)
    },
    setSelectedDevice: (state, action: PayloadAction<Device | null>) => {
      state.selectedDevice = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<DevicesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredDevices = applyFilters(state.devices, state.filters)
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

function applyFilters(devices: Device[], filters: DevicesState['filters']): Device[] {
  return devices.filter(device => {
    if (filters.type.length > 0 && !filters.type.includes(device.type)) {
      return false
    }
    if (filters.status.length > 0 && !filters.status.includes(device.status)) {
      return false
    }
    if (filters.vendor.length > 0 && !filters.vendor.includes(device.vendor)) {
      return false
    }
    if (filters.location.length > 0 && !filters.location.includes(device.location)) {
      return false
    }
    return true
  })
}

export const {
  setDevices,
  addDevice,
  updateDevice,
  removeDevice,
  setSelectedDevice,
  setFilters,
  setLoading,
  setError,
} = devicesSlice.actions

export default devicesSlice.reducer