import React from 'react'
import { motion } from 'framer-motion'
import { X, Wifi, HardDrive, Cpu, Settings, Shield, Activity } from 'lucide-react'
import { Device } from '@/store/slices/devicesSlice'

interface SimpleDeviceDetailsProps {
  device: Device
  onClose: () => void
  onEdit: (device: Device) => void
}

const SimpleDeviceDetails: React.FC<SimpleDeviceDetailsProps> = ({ device, onClose, onEdit }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Wifi className="w-6 h-6 text-primary-400" />
      case 'switch': return <Activity className="w-6 h-6 text-blue-400" />
      case 'firewall': return <Shield className="w-6 h-6 text-red-400" />
      case 'server': return <HardDrive className="w-6 h-6 text-green-400" />
      case 'workstation': return <Cpu className="w-6 h-6 text-purple-400" />
      default: return <Settings className="w-6 h-6 text-neutral-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success-400 bg-success-500/20'
      case 'warning': return 'text-warning-400 bg-warning-500/20'
      case 'offline': return 'text-error-400 bg-error-500/20'
      default: return 'text-neutral-400 bg-neutral-500/20'
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
        className="bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neutral-700 rounded-lg">
              {getTypeIcon(device.type || 'unknown')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {device.hostname || device.label || 'Unknown Device'}
              </h2>
              <p className="text-neutral-400">
                {device.vendor || 'Unknown'} {device.model || 'Model'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(device.status || 'unknown')}`}>
              {device.status || 'unknown'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Device Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">IP Address:</span>
                  <span className="text-white font-mono">
                    {device.ipAddresses?.[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Type:</span>
                  <span className="text-white capitalize">{device.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Serial:</span>
                  <span className="text-white font-mono">{device.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Location:</span>
                  <span className="text-white">{device.location || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">CPU:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-neutral-600 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(device.cpu || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{device.cpu || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Memory:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-neutral-600 rounded-full h-2">
                      <div 
                        className="bg-success-500 h-2 rounded-full"
                        style={{ width: `${Math.min(device.memory || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{device.memory || 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Temperature:</span>
                  <span className="text-white">{device.temperature || 'N/A'}°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Interfaces Summary */}
          <div className="bg-neutral-700/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              Network Interfaces ({device.interfaces?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(device.interfaces || []).slice(0, 4).map((iface, index) => (
                <div key={iface.id || index} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      iface.status === 'up' ? 'bg-success-500' : 'bg-error-500'
                    }`} />
                    <span className="text-white text-sm">{iface.name || `Interface ${index + 1}`}</span>
                  </div>
                  <span className="text-neutral-400 text-sm">{iface.speed || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(device)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Edit Device
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SimpleDeviceDetails 