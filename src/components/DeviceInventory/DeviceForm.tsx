import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Save,
  Settings,
  Wifi,
  Activity,
  Shield,
  HardDrive,
  Cpu,
  MapPin,
  Network,
  Eye,
  EyeOff
} from 'lucide-react'
import { Device } from '@/store/slices/devicesSlice'

interface DeviceFormProps {
  device?: Device | null
  onSave: (device: Partial<Device>) => void
  onCancel: () => void
  isEditing?: boolean
}

const DeviceForm: React.FC<DeviceFormProps> = ({
  device,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    label: '',
    type: 'router' as Device['type'],
    ip: '',
    location: '',
    vendor: '',
    model: '',
    serialNumber: '',
    firmwareVersion: '',
    snmpCommunity: '',
    credentials: {
      username: '',
      protocol: 'ssh' as 'ssh' | 'telnet' | 'snmp'
    },
    monitoring: {
      enabled: true,
      interval: 300,
      metrics: ['cpu', 'memory', 'temperature', 'interfaces']
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (device && isEditing) {
      setFormData({
        label: device.label,
        type: device.type,
        ip: device.ip,
        location: device.location,
        vendor: device.vendor,
        model: device.model,
        serialNumber: device.serialNumber,
        firmwareVersion: device.firmwareVersion,
        snmpCommunity: device.snmpCommunity || '',
        credentials: device.credentials || {
          username: '',
          protocol: 'ssh'
        },
        monitoring: device.monitoring
      })
    }
  }, [device, isEditing])

  const deviceTypes = [
    { value: 'router', label: 'Router', icon: Wifi },
    { value: 'switch', label: 'Switch', icon: Activity },
    { value: 'firewall', label: 'Firewall', icon: Shield },
    { value: 'server', label: 'Server', icon: HardDrive },
    { value: 'workstation', label: 'Workstation', icon: Cpu },
    { value: 'access-point', label: 'Access Point', icon: Wifi }
  ]

  const vendors = ['Cisco', 'Juniper', 'Arista', 'HP', 'Dell', 'Fortinet', 'Palo Alto', 'Other']
  const locations = ['Data Center 1', 'Data Center 2', 'Branch Office', 'Remote Site', 'Other']
  const protocols = ['ssh', 'telnet', 'snmp']
  const availableMetrics = ['cpu', 'memory', 'temperature', 'interfaces', 'bandwidth', 'latency']

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.label.trim()) {
      newErrors.label = 'Device name is required'
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required'
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip)) {
      newErrors.ip = 'Invalid IP address format'
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor is required'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const deviceData: Partial<Device> = {
      ...formData,
      id: device?.id || `device-${Date.now()}`,
      status: device?.status || 'offline',
      uptime: device?.uptime || 0,
      cpu: device?.cpu || 0,
      memory: device?.memory || 0,
      temperature: device?.temperature || 25,
      interfaces: device?.interfaces || [],
      lastSeen: device?.lastSeen || new Date().toISOString()
    }

    onSave(deviceData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleCredentialsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }))
  }

  const handleMonitoringChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [field]: value
      }
    }))
  }

  const handleMetricToggle = (metric: string) => {
    const currentMetrics = formData.monitoring.metrics
    const newMetrics = currentMetrics.includes(metric)
      ? currentMetrics.filter(m => m !== metric)
      : [...currentMetrics, metric]
    
    handleMonitoringChange('metrics', newMetrics)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600/20 rounded-lg">
              <Settings className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Device' : 'Add New Device'}
              </h2>
              <p className="text-neutral-400">
                {isEditing ? 'Update device information' : 'Configure a new network device'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className={`w-full bg-neutral-700 border rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.label ? 'border-error-500' : 'border-neutral-600'
                    }`}
                    placeholder="e.g., Router-01"
                  />
                  {errors.label && (
                    <p className="text-error-400 text-sm mt-1">{errors.label}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Device Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {deviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => handleInputChange('ip', e.target.value)}
                    className={`w-full bg-neutral-700 border rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono ${
                      errors.ip ? 'border-error-500' : 'border-neutral-600'
                    }`}
                    placeholder="192.168.1.1"
                  />
                  {errors.ip && (
                    <p className="text-error-400 text-sm mt-1">{errors.ip}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full bg-neutral-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.location ? 'border-error-500' : 'border-neutral-600'
                    }`}
                  >
                    <option value="">Select location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-error-400 text-sm mt-1">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hardware Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Hardware Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Vendor *
                  </label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    className={`w-full bg-neutral-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.vendor ? 'border-error-500' : 'border-neutral-600'
                    }`}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </select>
                  {errors.vendor && (
                    <p className="text-error-400 text-sm mt-1">{errors.vendor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className={`w-full bg-neutral-700 border rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.model ? 'border-error-500' : 'border-neutral-600'
                    }`}
                    placeholder="e.g., ISR4331"
                  />
                  {errors.model && (
                    <p className="text-error-400 text-sm mt-1">{errors.model}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="e.g., FTX1234567A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Firmware Version
                  </label>
                  <input
                    type="text"
                    value={formData.firmwareVersion}
                    onChange={(e) => handleInputChange('firmwareVersion', e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 16.09.04"
                  />
                </div>
              </div>
            </div>

            {/* Access Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Access Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    SNMP Community
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.snmpCommunity}
                      onChange={(e) => handleInputChange('snmpCommunity', e.target.value)}
                      className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="public"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Access Protocol
                  </label>
                  <select
                    value={formData.credentials.protocol}
                    onChange={(e) => handleCredentialsChange('protocol', e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {protocols.map((protocol) => (
                      <option key={protocol} value={protocol}>
                        {protocol.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.credentials.username}
                    onChange={(e) => handleCredentialsChange('username', e.target.value)}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="admin"
                  />
                </div>
              </div>
            </div>

            {/* Monitoring Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Monitoring Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="monitoring-enabled"
                    checked={formData.monitoring.enabled}
                    onChange={(e) => handleMonitoringChange('enabled', e.target.checked)}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="monitoring-enabled" className="text-white font-medium">
                    Enable monitoring for this device
                  </label>
                </div>

                {formData.monitoring.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Monitoring Interval (seconds)
                      </label>
                      <select
                        value={formData.monitoring.interval}
                        onChange={(e) => handleMonitoringChange('interval', parseInt(e.target.value))}
                        className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                        <option value={600}>10 minutes</option>
                        <option value={1800}>30 minutes</option>
                        <option value={3600}>1 hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-3">
                        Metrics to Monitor
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableMetrics.map((metric) => (
                          <label key={metric} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.monitoring.metrics.includes(metric)}
                              onChange={() => handleMetricToggle(metric)}
                              className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-300 capitalize">{metric}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default DeviceForm