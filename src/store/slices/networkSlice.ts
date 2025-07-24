import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NetworkDevice {
  id: string
  hostname: string
  label: string
  ipAddresses: string[] // Support for both IPv4 and IPv6
  macAddresses: string[]
  type: 'router' | 'switch' | 'firewall' | 'server' | 'workstation' | 'access-point' | 'load-balancer' | 'ids-ips' | 'hypervisor' | 'container-host'
  status: 'online' | 'warning' | 'offline' | 'unknown'
  vendor: string
  model: string
  osVersion: string
  firmwareVersion: string
  location: string
  dataCenter: string
  uptime: number
  cpu: number
  memory: number
  temperature: number
  interfaces: NetworkInterface[]
  vlans: VlanInfo[]
  routingTable: RouteEntry[]
  openPorts: number[]
  services: ServiceInfo[]
  snmpInfo: SnmpInfo | null
  credentials: DeviceCredentials | null
  lastDiscovered: string
  discoveryMethods: string[] // ['ping', 'snmp', 'cdp', 'lldp', 'ssh', 'api']
  position?: { x: number; y: number } // For manual layout positioning
}

export interface NetworkInterface {
  id: string
  name: string
  type: string
  status: 'up' | 'down' | 'admin-down'
  speed: string
  duplex: 'full' | 'half' | 'auto'
  utilization: number
  errors: number
  packets: number
  bytes: number
  connectedDevice?: string
  connectedPort?: string
  vlanId?: number
  ipAddress?: string
  macAddress?: string
}

export interface VlanInfo {
  id: number
  name: string
  description: string
  interfaces: string[]
}

export interface RouteEntry {
  destination: string
  nextHop: string
  interface: string
  metric: number
  protocol: string
}

export interface ServiceInfo {
  port: number
  protocol: 'tcp' | 'udp'
  service: string
  version?: string
  status: 'open' | 'closed' | 'filtered'
}

export interface SnmpInfo {
  version: '1' | '2c' | '3'
  community?: string
  username?: string
  authProtocol?: string
  privProtocol?: string
  sysDescr?: string
  sysObjectId?: string
  sysUpTime?: number
  sysContact?: string
  sysName?: string
  sysLocation?: string
}

export interface DeviceCredentials {
  snmp?: {
    version: '1' | '2c' | '3'
    community?: string
    username?: string
    authPassword?: string
    privPassword?: string
  }
  ssh?: {
    username: string
    password?: string
    privateKey?: string
  }
  api?: {
    endpoint: string
    apiKey?: string
    username?: string
    password?: string
  }
}

export interface NetworkConnection {
  id: string
  source: string
  target: string
  sourceInterface: string
  targetInterface: string
  type: 'ethernet' | 'fiber' | 'wireless' | 'vpn' | 'trunk' | 'access'
  bandwidth: string
  utilization: number
  latency: number
  packetLoss: number
  status: 'active' | 'inactive' | 'error' | 'degraded'
  vlanId?: number
  protocol?: string
  discoveryMethod: 'cdp' | 'lldp' | 'arp' | 'routing' | 'manual'
  lastSeen: string
}

export interface NetworkTopology {
  devices: NetworkDevice[]
  connections: NetworkConnection[]
  subnets: SubnetInfo[]
  lastUpdated: string
  discoveryStats: DiscoveryStats
}

export interface SubnetInfo {
  id: string
  network: string
  mask: string
  gateway: string
  vlanId?: number
  description: string
  deviceCount: number
  utilization: number
}

export interface DiscoveryStats {
  totalDevices: number
  devicesByType: Record<string, number>
  devicesByStatus: Record<string, number>
  devicesByLocation: Record<string, number>
  totalConnections: number
  discoveryMethods: Record<string, number>
  lastScanDuration: number
  coverage: number // Percentage of network discovered
}

export interface DiscoveryConfig {
  ipRanges: string[]
  excludeRanges: string[]
  snmpCommunities: string[]
  snmpCredentials: SnmpInfo[]
  sshCredentials: DeviceCredentials['ssh'][]
  apiEndpoints: DeviceCredentials['api'][]
  scanPorts: number[]
  enabledProtocols: {
    ping: boolean
    snmp: boolean
    cdp: boolean
    lldp: boolean
    ssh: boolean
    api: boolean
  }
  scanInterval: number // minutes
  maxConcurrentScans: number
  timeout: number // seconds
}

export interface PathTrace {
  id: string
  source: string
  target: string
  hops: PathHop[]
  totalLatency: number
  status: 'complete' | 'partial' | 'failed'
  timestamp: string
}

export interface PathHop {
  deviceId: string
  interface: string
  latency: number
  packetLoss: number
}

export interface TopologyFilter {
  deviceTypes: string[]
  statuses: string[]
  locations: string[]
  dataCenters: string[]
  vlans: number[]
  searchTerm: string
  showOfflineDevices: boolean
  showConnections: boolean
}

interface NetworkState {
  topology: NetworkTopology
  selectedDevice: NetworkDevice | null
  selectedConnection: NetworkConnection | null
  isLoading: boolean
  error: string | null
  discoveryStatus: 'idle' | 'scanning' | 'complete' | 'error'
  scanProgress: number
  discoveryConfig: DiscoveryConfig
  filters: TopologyFilter
  layoutType: 'hierarchical' | 'force' | 'circular' | 'grid' | 'custom'
  pathTrace: PathTrace | null
  realTimeUpdates: boolean
}

const initialState: NetworkState = {
  topology: {
    devices: [],
    connections: [],
    subnets: [],
    lastUpdated: new Date().toISOString(),
    discoveryStats: {
      totalDevices: 0,
      devicesByType: {},
      devicesByStatus: {},
      devicesByLocation: {},
      totalConnections: 0,
      discoveryMethods: {},
      lastScanDuration: 0,
      coverage: 0
    }
  },
  selectedDevice: null,
  selectedConnection: null,
  isLoading: false,
  error: null,
  discoveryStatus: 'idle',
  scanProgress: 0,
  discoveryConfig: {
    ipRanges: ['192.168.1.0/24', '10.0.0.0/8'],
    excludeRanges: [],
    snmpCommunities: ['public', 'private'],
    snmpCredentials: [],
    sshCredentials: [],
    apiEndpoints: [],
    scanPorts: [22, 23, 80, 443, 161, 162],
    enabledProtocols: {
      ping: true,
      snmp: true,
      cdp: true,
      lldp: true,
      ssh: false,
      api: false
    },
    scanInterval: 60,
    maxConcurrentScans: 50,
    timeout: 30
  },
  filters: {
    deviceTypes: [],
    statuses: [],
    locations: [],
    dataCenters: [],
    vlans: [],
    searchTerm: '',
    showOfflineDevices: true,
    showConnections: true
  },
  layoutType: 'hierarchical',
  pathTrace: null,
  realTimeUpdates: true
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setTopology: (state, action: PayloadAction<NetworkTopology>) => {
      state.topology = action.payload
      state.isLoading = false
      state.error = null
    },
    addDevice: (state, action: PayloadAction<NetworkDevice>) => {
      const existingIndex = state.topology.devices.findIndex(d => d.id === action.payload.id)
      if (existingIndex !== -1) {
        state.topology.devices[existingIndex] = action.payload
      } else {
        state.topology.devices.push(action.payload)
      }
      state.topology.lastUpdated = new Date().toISOString()
    },
    updateDevice: (state, action: PayloadAction<NetworkDevice>) => {
      const index = state.topology.devices.findIndex(device => device.id === action.payload.id)
      if (index !== -1) {
        state.topology.devices[index] = action.payload
        state.topology.lastUpdated = new Date().toISOString()
      }
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.topology.devices = state.topology.devices.filter(device => device.id !== action.payload)
      state.topology.connections = state.topology.connections.filter(
        conn => conn.source !== action.payload && conn.target !== action.payload
      )
      state.topology.lastUpdated = new Date().toISOString()
    },
    addConnection: (state, action: PayloadAction<NetworkConnection>) => {
      const existingIndex = state.topology.connections.findIndex(c => c.id === action.payload.id)
      if (existingIndex !== -1) {
        state.topology.connections[existingIndex] = action.payload
      } else {
        state.topology.connections.push(action.payload)
      }
      state.topology.lastUpdated = new Date().toISOString()
    },
    updateConnection: (state, action: PayloadAction<NetworkConnection>) => {
      const index = state.topology.connections.findIndex(conn => conn.id === action.payload.id)
      if (index !== -1) {
        state.topology.connections[index] = action.payload
        state.topology.lastUpdated = new Date().toISOString()
      }
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      state.topology.connections = state.topology.connections.filter(conn => conn.id !== action.payload)
      state.topology.lastUpdated = new Date().toISOString()
    },
    setSelectedDevice: (state, action: PayloadAction<NetworkDevice | null>) => {
      state.selectedDevice = action.payload
    },
    setSelectedConnection: (state, action: PayloadAction<NetworkConnection | null>) => {
      state.selectedConnection = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setDiscoveryStatus: (state, action: PayloadAction<'idle' | 'scanning' | 'complete' | 'error'>) => {
      state.discoveryStatus = action.payload
    },
    setScanProgress: (state, action: PayloadAction<number>) => {
      state.scanProgress = action.payload
    },
    updateDiscoveryConfig: (state, action: PayloadAction<Partial<DiscoveryConfig>>) => {
      state.discoveryConfig = { ...state.discoveryConfig, ...action.payload }
    },
    setFilters: (state, action: PayloadAction<Partial<TopologyFilter>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLayoutType: (state, action: PayloadAction<typeof initialState.layoutType>) => {
      state.layoutType = action.payload
    },
    setPathTrace: (state, action: PayloadAction<PathTrace | null>) => {
      state.pathTrace = action.payload
    },
    updateDiscoveryStats: (state, action: PayloadAction<DiscoveryStats>) => {
      state.topology.discoveryStats = action.payload
    },
    setRealTimeUpdates: (state, action: PayloadAction<boolean>) => {
      state.realTimeUpdates = action.payload
    },
    updateDevicePosition: (state, action: PayloadAction<{ deviceId: string; position: { x: number; y: number } }>) => {
      const device = state.topology.devices.find(d => d.id === action.payload.deviceId)
      if (device) {
        device.position = action.payload.position
      }
    }
  },
})

export const {
  setTopology,
  addDevice,
  updateDevice,
  removeDevice,
  addConnection,
  updateConnection,
  removeConnection,
  setSelectedDevice,
  setSelectedConnection,
  setLoading,
  setError,
  setDiscoveryStatus,
  setScanProgress,
  updateDiscoveryConfig,
  setFilters,
  setLayoutType,
  setPathTrace,
  updateDiscoveryStats,
  setRealTimeUpdates,
  updateDevicePosition,
} = networkSlice.actions

export default networkSlice.reducer