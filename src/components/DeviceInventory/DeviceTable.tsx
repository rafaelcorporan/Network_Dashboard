import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2,
  Power,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Cpu,
  HardDrive,
  Thermometer,
  Activity,
  ChevronDown,
  ChevronUp,
  MoreHorizontal
} from 'lucide-react'
import { Device } from '@/store/slices/devicesSlice'

interface DeviceTableProps {
  devices: Device[]
  onDeviceSelect: (device: Device) => void
  onDeviceEdit: (device: Device) => void
  onDeviceDelete: (deviceId: string) => void
  selectedDevice: Device | null
}

type SortField = 'hostname' | 'type' | 'status' | 'ipAddresses' | 'location' | 'vendor' | 'lastSeen'
type SortDirection = 'asc' | 'desc'

const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onDeviceSelect,
  onDeviceEdit,
  onDeviceDelete,
  selectedDevice
}) => {
  const [sortField, setSortField] = useState<SortField>('hostname')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())
  const [showActions, setShowActions] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedDevices = [...devices].sort((a, b) => {
    let aValue: any
    let bValue: any
    
    if (sortField === 'ipAddresses') {
      aValue = a.ipAddresses[0] || ''
      bValue = b.ipAddresses[0] || ''
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
    }

    if (sortField === 'lastSeen') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-success-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-400" />
      case 'offline':
        return <Power className="w-4 h-4 text-error-400" />
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router':
        return <Wifi className="w-4 h-4 text-primary-400" />
      case 'switch':
        return <Activity className="w-4 h-4 text-blue-400" />
      case 'firewall':
        return <Shield className="w-4 h-4 text-red-400" />
      case 'server':
        return <HardDrive className="w-4 h-4 text-green-400" />
      case 'workstation':
        return <Cpu className="w-4 h-4 text-purple-400" />
      case 'access-point':
        return <Wifi className="w-4 h-4 text-yellow-400" />
      default:
        return <Settings className="w-4 h-4 text-neutral-400" />
    }
  }

  const handleSelectDevice = (deviceId: string) => {
    const newSelected = new Set(selectedDevices)
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId)
    } else {
      newSelected.add(deviceId)
    }
    setSelectedDevices(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedDevices.size === devices.length) {
      setSelectedDevices(new Set())
    } else {
      setSelectedDevices(new Set(devices.map(d => d.id)))
    }
  }

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  )

  return (
    <div className="glass-effect rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-700">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedDevices.size === devices.length && devices.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <SortableHeader field="hostname">Device</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="ipAddresses">IP Address</SortableHeader>
              <SortableHeader field="location">Location</SortableHeader>
              <SortableHeader field="vendor">Vendor</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Performance
              </th>
              <SortableHeader field="lastSeen">Last Seen</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-neutral-800/30 divide-y divide-neutral-700">
            {sortedDevices.map((device, index) => (
              <motion.tr
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-neutral-700/50 transition-colors cursor-pointer ${
                  selectedDevice?.id === device.id ? 'bg-primary-600/20 border-l-4 border-primary-500' : ''
                }`}
                onClick={() => onDeviceSelect(device)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedDevices.has(device.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectDevice(device.id)
                    }}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(device.type)}
                    <div>
                      <div className="text-sm font-medium text-white">{device.hostname}</div>
                      <div className="text-sm text-neutral-400">{device.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    device.type === 'router' ? 'bg-primary-500/20 text-primary-400' :
                    device.type === 'switch' ? 'bg-blue-500/20 text-blue-400' :
                    device.type === 'firewall' ? 'bg-red-500/20 text-red-400' :
                    device.type === 'server' ? 'bg-green-500/20 text-green-400' :
                    device.type === 'workstation' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {device.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(device.status)}
                    <span className={`text-sm font-medium capitalize ${
                      device.status === 'online' ? 'text-success-400' :
                      device.status === 'warning' ? 'text-warning-400' :
                      'text-error-400'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300 font-mono">
                  {device.ipAddresses[0] || ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-neutral-300">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {device.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                  {device.vendor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-primary-400" />
                      <span className="text-xs text-neutral-400">{device.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-success-400" />
                      <span className="text-xs text-neutral-400">{device.memory}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-warning-400" />
                      <span className="text-xs text-neutral-400">{device.temperature}°C</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                  {new Date(device.lastSeen || device.lastDiscovered).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowActions(showActions === device.id ? null : device.id)
                      }}
                      className="text-neutral-400 hover:text-white transition-colors p-1 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {showActions === device.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 z-10"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceSelect(device)
                              setShowActions(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 w-full text-left"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceEdit(device)
                              setShowActions(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 w-full text-left"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Device
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add configure action
                              setShowActions(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 w-full text-left"
                          >
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                          <hr className="my-1 border-neutral-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeviceDelete(device.id)
                              setShowActions(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-error-400 hover:bg-neutral-700 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Device
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {devices.length === 0 && (
        <div className="text-center py-12">
          <HardDrive className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">No devices found</p>
        </div>
      )}
    </div>
  )
}

export default DeviceTable