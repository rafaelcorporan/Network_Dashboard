import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  setDevices, 
  setSelectedDevice, 
  addDevice, 
  updateDevice, 
  removeDevice,
  Device 
} from '@/store/slices/devicesSlice'
import { generateMockDeviceInventory } from '@/utils/mockDeviceData'
import DeviceTable from '@/components/DeviceInventory/DeviceTable'
import DeviceDetails from '@/components/DeviceInventory/DeviceDetails'
import SimpleDeviceDetails from '@/components/DeviceInventory/SimpleDeviceDetails'
import DeviceFilters from '@/components/DeviceInventory/DeviceFilters'
import DeviceForm from '@/components/DeviceInventory/DeviceForm'
import EnhancedLoadingSpinner from '@/components/Layout/EnhancedLoadingSpinner'
import {
  Plus,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  HardDrive,
  Wifi,
  Activity,
  Shield,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Power,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const DeviceInventory: React.FC = () => {
  const dispatch = useDispatch()
  const { devices, isLoading } = useSelector((state: RootState) => state.devices)
  const { topology } = useSelector((state: RootState) => state.network)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: [] as string[],
    status: [] as string[],
    vendor: [] as string[],
    location: [] as string[]
  })
  const [showDeviceForm, setShowDeviceForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize devices with mock data immediately
  useEffect(() => {
    const initializeDevices = async () => {
      setIsInitializing(true)
      
      // Simulate some processing time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (devices.length === 0) {
        // Generate comprehensive mock device data
        const mockDevices = generateMockDeviceInventory()
        const deviceList: Device[] = mockDevices.map(device => ({
          ...device,
          serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          snmpCommunity: Math.random() > 0.5 ? 'public' : undefined,
          credentials: Math.random() > 0.3 ? {
            ssh: {
              username: 'admin'
            }
          } : null,
          monitoring: {
            enabled: Math.random() > 0.2,
            interval: [60, 300, 600][Math.floor(Math.random() * 3)],
            metrics: ['cpu', 'memory', 'temperature', 'interfaces'].filter(() => Math.random() > 0.3)
          }
        }))
        dispatch(setDevices(deviceList))
      }
      
      setIsInitializing(false)
    }

    initializeDevices()
  }, [devices.length, dispatch])

  // Filter and search devices
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ipAddresses[0]?.includes(searchTerm) ||
        device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.vendor.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      const matchesType = filters.type.length === 0 || filters.type.includes(device.type)
      
      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(device.status)
      
      // Vendor filter
      const matchesVendor = filters.vendor.length === 0 || filters.vendor.includes(device.vendor)
      
      // Location filter
      const matchesLocation = filters.location.length === 0 || filters.location.includes(device.location)

      return matchesSearch && matchesType && matchesStatus && matchesVendor && matchesLocation
    })
  }, [devices, searchTerm, filters])

  // Get available filter options
  const availableOptions = useMemo(() => {
    return {
      types: [...new Set(devices.map(d => d.type))],
      statuses: [...new Set(devices.map(d => d.status))],
      vendors: [...new Set(devices.map(d => d.vendor))],
      locations: [...new Set(devices.map(d => d.location))]
    }
  }, [devices])

  // Statistics
  const stats = useMemo(() => {
    const total = devices.length
    const online = devices.filter(d => d.status === 'online').length
    const warning = devices.filter(d => d.status === 'warning').length
    const offline = devices.filter(d => d.status === 'offline').length
    const monitored = devices.filter(d => d.monitoring.enabled).length

    return { total, online, warning, offline, monitored }
  }, [devices])

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device)
    setShowDetails(true)
  }

  const handleDeviceEdit = (device: Device) => {
    setEditingDevice(device)
    setShowDeviceForm(true)
  }

  const handleDeviceDelete = (deviceId: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      dispatch(removeDevice(deviceId))
      toast.success('Device deleted successfully')
    }
  }

  const handleDeviceSave = (deviceData: Partial<Device>) => {
    if (editingDevice) {
      dispatch(updateDevice({ ...editingDevice, ...deviceData } as Device))
      toast.success('Device updated successfully')
    } else {
      dispatch(addDevice(deviceData as Device))
      toast.success('Device added successfully')
    }
    setShowDeviceForm(false)
    setEditingDevice(null)
  }

  const handleAddDevice = () => {
    setEditingDevice(null)
    setShowDeviceForm(true)
  }

  const handleExportDevices = () => {
    const csvContent = [
      ['Name', 'Type', 'IP Address', 'Status', 'Location', 'Vendor', 'Model', 'Serial Number'].join(','),
      ...filteredDevices.map(device => [
        device.hostname,
        device.type,
        device.ipAddresses[0],
        device.status,
        device.location,
        device.vendor,
        device.model,
        device.serialNumber
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `device-inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Device inventory exported successfully')
  }

  const handleRefresh = () => {
    // Simulate refresh by updating last seen times
    const updatedDevices = devices.map(device => ({
      ...device,
      lastSeen: new Date().toISOString(),
      cpu: Math.max(0, Math.min(100, device.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(0, Math.min(100, device.memory + (Math.random() - 0.5) * 10)),
      temperature: Math.max(20, Math.min(80, device.temperature + (Math.random() - 0.5) * 5))
    }))
    dispatch(setDevices(updatedDevices))
    toast.success('Device inventory refreshed')
  }

  const clearFilters = () => {
    setFilters({
      type: [],
      status: [],
      vendor: [],
      location: []
    })
    setSearchTerm('')
  }

  // Show loading spinner while initializing or loading
  if (isInitializing || isLoading) {
    return (
      <div className="h-full">
        <EnhancedLoadingSpinner 
          size="xl" 
          message="Initializing Device Inventory..." 
          fullScreen={false}
          variant="quantum"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Device Inventory</h1>
          <p className="text-neutral-400 mt-1">
            Comprehensive network device management and monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportDevices}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleAddDevice}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Devices</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <HardDrive className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Online</p>
              <p className="text-2xl font-bold text-success-400">{stats.online}</p>
            </div>
            <div className="p-3 bg-success-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Warning</p>
              <p className="text-2xl font-bold text-warning-400">{stats.warning}</p>
            </div>
            <div className="p-3 bg-warning-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Offline</p>
              <p className="text-2xl font-bold text-error-400">{stats.offline}</p>
            </div>
            <div className="p-3 bg-error-500/20 rounded-lg">
              <Power className="w-6 h-6 text-error-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Monitored</p>
              <p className="text-2xl font-bold text-primary-400">{stats.monitored}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <DeviceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        availableOptions={availableOptions}
        onClearFilters={clearFilters}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-neutral-400">
        <span>
          Showing {filteredDevices.length} of {devices.length} devices
        </span>
        <span>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Device Table */}
      <DeviceTable
        devices={filteredDevices}
        onDeviceSelect={handleDeviceSelect}
        onDeviceEdit={handleDeviceEdit}
        onDeviceDelete={handleDeviceDelete}
        selectedDevice={selectedDevice}
      />

      {/* Device Details Modal */}
      {showDetails && selectedDevice && (
        <SimpleDeviceDetails
          device={selectedDevice}
          onClose={() => {
            setShowDetails(false)
            setSelectedDevice(null)
          }}
          onEdit={(device) => {
            setShowDetails(false)
            handleDeviceEdit(device)
          }}
        />
      )}
      


      {/* Device Form Modal */}
      {showDeviceForm && (
        <DeviceForm
          device={editingDevice}
          onSave={handleDeviceSave}
          onCancel={() => {
            setShowDeviceForm(false)
            setEditingDevice(null)
          }}
          isEditing={!!editingDevice}
        />
      )}
    </div>
  )
}

export default DeviceInventory