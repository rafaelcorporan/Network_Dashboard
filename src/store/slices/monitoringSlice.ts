import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MetricData {
  timestamp: string
  value: number
  unit: string
}

export interface NetworkMetrics {
  bandwidth: {
    inbound: MetricData[]
    outbound: MetricData[]
  }
  latency: MetricData[]
  packetLoss: MetricData[]
  availability: MetricData[]
}

export interface DeviceMetrics {
  cpu: MetricData[]
  memory: MetricData[]
  temperature: MetricData[]
  diskUsage: MetricData[]
  interfaceUtilization: Record<string, MetricData[]>
}

export interface MonitoringData {
  network: NetworkMetrics
  devices: Record<string, DeviceMetrics>
  summary: {
    totalDevices: number
    onlineDevices: number
    criticalAlerts: number
    averageLatency: number
    networkUptime: number
  }
}

interface MonitoringState {
  data: MonitoringData
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  refreshInterval: number
  isRealTime: boolean
  isLoading: boolean
  error: string | null
  lastUpdated: string
}

const initialState: MonitoringState = {
  data: {
    network: {
      bandwidth: { inbound: [], outbound: [] },
      latency: [],
      packetLoss: [],
      availability: [],
    },
    devices: {},
    summary: {
      totalDevices: 0,
      onlineDevices: 0,
      criticalAlerts: 0,
      averageLatency: 0,
      networkUptime: 0,
    },
  },
  timeRange: '24h',
  refreshInterval: 30000, // 30 seconds
  isRealTime: true,
  isLoading: false,
  error: null,
  lastUpdated: new Date().toISOString(),
}

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    setMonitoringData: (state, action: PayloadAction<MonitoringData>) => {
      state.data = action.payload
      state.lastUpdated = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },
    updateNetworkMetrics: (state, action: PayloadAction<Partial<NetworkMetrics>>) => {
      state.data.network = { ...state.data.network, ...action.payload }
      state.lastUpdated = new Date().toISOString()
    },
    updateDeviceMetrics: (state, action: PayloadAction<{ deviceId: string; metrics: DeviceMetrics }>) => {
      state.data.devices[action.payload.deviceId] = action.payload.metrics
      state.lastUpdated = new Date().toISOString()
    },
    updateSummary: (state, action: PayloadAction<Partial<MonitoringData['summary']>>) => {
      state.data.summary = { ...state.data.summary, ...action.payload }
      state.lastUpdated = new Date().toISOString()
    },
    setTimeRange: (state, action: PayloadAction<MonitoringState['timeRange']>) => {
      state.timeRange = action.payload
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload
    },
    setRealTime: (state, action: PayloadAction<boolean>) => {
      state.isRealTime = action.payload
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

export const {
  setMonitoringData,
  updateNetworkMetrics,
  updateDeviceMetrics,
  updateSummary,
  setTimeRange,
  setRefreshInterval,
  setRealTime,
  setLoading,
  setError,
} = monitoringSlice.actions

export default monitoringSlice.reducer