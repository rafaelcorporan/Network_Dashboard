import React from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Settings,
  Cpu,
  HardDrive,
  Thermometer,
  Wifi,
  Activity,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Network,
  Power,
  AlertTriangle,
  CheckCircle,
  Edit,
  Download,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react'
import { Device } from '@/store/slices/devicesSlice'
import MetricChart from '@/components/Charts/MetricChart'

interface DeviceDetailsProps {
  device: Device
  onClose: () => void
  onEdit: (device: Device) => void
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onClose, onEdit }) => {
  // Mock performance data for demonstration
  const mockPerformanceData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
    value: Math.random() * 100,
    unit: '%'
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success-400 bg-success-500/20'
      case 'warning': return 'text-warning-400 bg-warning-500/20'
      case 'offline': return 'text-error-400 bg-error-500/20'
      default: return 'text-neutral-400 bg-neutral-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Wifi className="w-6 h-6 text-primary-400" />
      case 'switch': return <Activity className="w-6 h-6 text-blue-400" />
      case 'firewall': return <Shield className="w-6 h-6 text-red-400" />
      case 'server': return <HardDrive className="w-6 h-6 text-green-400" />
      case 'workstation': return <Cpu className="w-6 h-6 text-purple-400" />
      case 'access-point': return <Wifi className="w-6 h-6 text-yellow-400" />
      default: return <Settings className="w-6 h-6 text-neutral-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-700 rounded-lg">
              {getTypeIcon(device.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{device.hostname || device.label}</h2>
              <p className="text-neutral-400">{device.vendor} {device.model}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(device.status)}`}>
              {device.status}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(device)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-effect rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Device Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">IP Address:</span>
                    <span className="text-white font-mono">{device.ipAddresses?.[0] || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Type:</span>
                    <span className="text-white capitalize">{device.type || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Serial Number:</span>
                    <span className="text-white font-mono">{device.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Firmware:</span>
                    <span className="text-white">{device.firmwareVersion || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Location & Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Location:</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span className="text-white">{device.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Uptime:</span>
                    <span className="text-white">
                      {device.uptime ? `${Math.floor(device.uptime / 24)}d ${device.uptime % 24}h` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Last Seen:</span>
                    <span className="text-white">
                      {device.lastSeen || device.lastDiscovered ? 
                        new Date(device.lastSeen || device.lastDiscovered).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Monitoring:</span>
                    <span className={`text-sm ${device.monitoring?.enabled ? 'text-success-400' : 'text-error-400'}`}>
                      {device.monitoring?.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary-400" />
                      <span className="text-neutral-400">CPU Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${device.cpu}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{device.cpu}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-success-400" />
                      <span className="text-neutral-400">Memory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-success-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${device.memory}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">{device.memory}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-warning-400" />
                      <span className="text-neutral-400">Temperature</span>
                    </div>
                    <span className="text-white text-sm font-medium">{device.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Interfaces */}
            <div className="glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Interfaces ({device.interfaces?.length || 0})
                </h3>
                <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(device.interfaces || []).slice(0, 6).map((iface) => (
                  <div key={iface.id} className="bg-neutral-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          iface.status === 'up' ? 'bg-success-500' : 'bg-error-500'
                        }`} />
                        <span className="font-medium text-white">{iface.name}</span>
                      </div>
                      <span className="text-xs text-neutral-400 uppercase">{iface.type}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Speed:</span>
                        <span className="text-white">{iface.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Utilization:</span>
                        <span className="text-white">{iface.utilization}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Errors:</span>
                        <span className={`${iface.errors > 0 ? 'text-warning-400' : 'text-success-400'}`}>
                          {iface.errors}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary-400" />
                    CPU Usage (24h)
                  </h3>
                  <button className="text-primary-400 hover:text-primary-300">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <MetricChart
                  data={mockPerformanceData}
                  title="CPU Usage"
                  color="#3b82f6"
                  unit="%"
                  height={200}
                />
              </div>

              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-success-400" />
                    Memory Usage (24h)
                  </h3>
                  <button className="text-primary-400 hover:text-primary-300">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
                <MetricChart
                  data={mockPerformanceData.map(d => ({ ...d, value: d.value * 0.8 }))}
                  title="Memory Usage"
                  color="#22c55e"
                  unit="%"
                  height={200}
                />
              </div>
            </div>

            {/* Configuration & Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5" />
                  Configuration
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">SNMP Community:</span>
                    <span className="text-white font-mono">
                      {device.snmpCommunity ? '••••••••' : 'Not configured'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">SSH Access:</span>
                    <span className={`text-sm ${device.credentials ? 'text-success-400' : 'text-error-400'}`}>
                      {device.credentials ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Config Backup:</span>
                    <span className={`text-sm ${device.configBackup ? 'text-success-400' : 'text-warning-400'}`}>
                      {device.configBackup ? 'Available' : 'Not available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Last Backup:</span>
                    <span className="text-white text-sm">
                      {device.configBackup ? '2 hours ago' : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5" />
                  Monitoring Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Status:</span>
                    <span className={`text-sm ${device.monitoring.enabled ? 'text-success-400' : 'text-error-400'}`}>
                      {device.monitoring.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Interval:</span>
                    <span className="text-white">{device.monitoring.interval}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Metrics:</span>
                    <span className="text-white">{device.monitoring.metrics.length} active</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-neutral-400 text-sm mb-2">Active Metrics:</p>
                    <div className="flex flex-wrap gap-1">
                      {device.monitoring.metrics.map((metric, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DeviceDetails