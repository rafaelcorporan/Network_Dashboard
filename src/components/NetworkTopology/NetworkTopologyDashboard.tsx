import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setTopology, NetworkDevice } from '@/store/slices/networkSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Network, RefreshCw, X, Monitor, Cpu, HardDrive, Wifi, MapPin, Clock, Activity, Shield, Server, Router, Smartphone } from 'lucide-react'
import { generateMockNetworkData } from './MockDataGenerator'
import EnhancedLoadingSpinner from '../Layout/EnhancedLoadingSpinner'

const NetworkTopologyDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const { topology } = useSelector((state: RootState) => state.network)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null)

  // Initialize with mock data
  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      try {
        console.log('🚀 Initializing NetworkTopologyDashboard...')
        
        // Show loading for a brief moment
        await new Promise(resolve => setTimeout(resolve, 800))
        
        if (!mounted) return

        // Generate mock data
        const mockData = generateMockNetworkData()
        console.log('📊 Generated mock data:', mockData.devices.length, 'devices')
        
        dispatch(setTopology(mockData))
        
        if (mounted) {
          setIsInitializing(false)
          console.log('✅ NetworkTopologyDashboard initialized successfully')
        }
      } catch (err) {
        console.error('❌ Failed to initialize topology:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize')
          setIsInitializing(false)
        }
      }
    }

    initializeData()

    return () => {
      mounted = false
    }
  }, [dispatch])

  // Device icon helper
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router': return Router
      case 'switch': return Network
      case 'server': return Server
      case 'firewall': return Shield
      case 'access_point': return Wifi
      case 'workstation': return Monitor
      case 'phone': return Smartphone
      default: return Monitor
    }
  }

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Device Details Modal
  const DeviceDetailsModal = ({ device, onClose }: { device: NetworkDevice; onClose: () => void }) => {
    const DeviceIcon = getDeviceIcon(device.type)
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                device.status === 'online' ? 'bg-success-500/20 text-success-400' :
                device.status === 'warning' ? 'bg-warning-500/20 text-warning-400' : 
                'bg-error-500/20 text-error-400'
              }`}>
                <DeviceIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{device.hostname}</h2>
                <p className="text-neutral-400 capitalize">{device.type} • {device.location}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'online' ? 'bg-success-500' :
                        device.status === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                      }`}></div>
                      <span className="text-white capitalize">{device.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Hostname:</span>
                    <span className="text-white">{device.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Type:</span>
                    <span className="text-white capitalize">{device.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Vendor:</span>
                    <span className="text-white">{device.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Model:</span>
                    <span className="text-white">{device.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">OS Version:</span>
                    <span className="text-white">{device.osVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Location:</span>
                    <span className="text-white">{device.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Uptime:</span>
                    <span className="text-white">{formatUptime(device.uptime)}</span>
                  </div>
                </div>
              </div>

              {/* Network Information */}
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-neutral-400">IP Addresses:</span>
                    <div className="mt-1 space-y-1">
                      {device.ipAddresses.map((ip, index) => (
                        <div key={index} className="text-white font-mono text-sm bg-neutral-600 px-2 py-1 rounded">
                          {ip}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400">MAC Addresses:</span>
                    <div className="mt-1 space-y-1">
                      {device.macAddresses.map((mac, index) => (
                        <div key={index} className="text-white font-mono text-sm bg-neutral-600 px-2 py-1 rounded">
                          {mac}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance & Interfaces */}
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  {device.cpu > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-400">CPU Usage:</span>
                        <span className="text-white">{device.cpu}%</span>
                      </div>
                      <div className="w-full bg-neutral-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            device.cpu > 80 ? 'bg-error-500' : 
                            device.cpu > 60 ? 'bg-warning-500' : 'bg-success-500'
                          }`}
                          style={{ width: `${device.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {device.memory > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-400">Memory Usage:</span>
                        <span className="text-white">{device.memory}%</span>
                      </div>
                      <div className="w-full bg-neutral-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            device.memory > 80 ? 'bg-error-500' : 
                            device.memory > 60 ? 'bg-warning-500' : 'bg-success-500'
                          }`}
                          style={{ width: `${device.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400">{device.interfaces.length}</div>
                      <div className="text-xs text-neutral-400">Interfaces</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-400">{device.vlans.length}</div>
                      <div className="text-xs text-neutral-400">VLANs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interfaces */}
              <div className="bg-neutral-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Network Interfaces
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {device.interfaces.slice(0, 8).map((netInterface, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-600 rounded">
                      <div>
                        <div className="text-white font-medium">{netInterface.name}</div>
                        <div className="text-xs text-neutral-400">{netInterface.type}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded ${
                          netInterface.status === 'up' ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400'
                        }`}>
                          {netInterface.status}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">{netInterface.speed}</div>
                      </div>
                    </div>
                  ))}
                  {device.interfaces.length > 8 && (
                    <div className="text-center text-sm text-neutral-400 py-2">
                      +{device.interfaces.length - 8} more interfaces
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              {device.services && device.services.length > 0 && (
                <div className="bg-neutral-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Running Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {device.services.slice(0, 12).map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-sm">
                        {service.service}:{service.port}
                      </span>
                    ))}
                    {device.services.length > 12 && (
                      <span className="px-2 py-1 bg-neutral-600 text-neutral-400 rounded text-sm">
                        +{device.services.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-700 bg-neutral-750">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-400">
                Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Ping Device
                </button>
                <button className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Generate fresh data
  const generateFreshData = useCallback(() => {
    try {
      const mockData = generateMockNetworkData()
      dispatch(setTopology(mockData))
      console.log('✅ Generated fresh mock data:', mockData.devices.length, 'devices')
    } catch (err) {
      console.error('❌ Failed to generate mock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate data')
    }
  }, [dispatch])

  // Loading state
  if (isInitializing) {
    return (
      <div className="h-full">
        <EnhancedLoadingSpinner 
          size="xl" 
          message="Initializing Network Discovery..." 
          fullScreen={false}
          variant="neural"
        />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <Database className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Initialization Error</h3>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              generateFreshData()
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!topology || !topology.devices || topology.devices.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <Database className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Network Data</h3>
          <p className="text-neutral-400 mb-4">Click below to generate sample network data</p>
          <button
            onClick={generateFreshData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Generate Sample Data
          </button>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col bg-neutral-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-700">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Network Topology</h1>
            <p className="text-neutral-400 text-sm">
              Network infrastructure visualization ({topology.devices.length} devices)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateFreshData}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Main visualization area */}
        <div className="flex-1 p-6">
          <div className="h-full bg-neutral-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-white">Network Devices</h3>
              <p className="text-sm text-neutral-400">
                {topology.devices.length} devices discovered
              </p>
            </div>
            
            {/* Device Grid */}
            <div className="p-4 h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {topology.devices.slice(0, 20).map((device) => (
                  <div
                    key={device.id}
                    className="bg-neutral-700 rounded-lg p-3 hover:bg-neutral-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'online' ? 'bg-success-500' :
                        device.status === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                      }`}></div>
                      <span className="text-white font-medium text-sm truncate">
                        {device.hostname}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Type:</span>
                        <span className="text-neutral-300 capitalize">{device.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">IP:</span>
                        <span className="text-neutral-300">{device.ipAddresses[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-neutral-300 truncate">{device.location}</span>
                      </div>
                      {device.cpu > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">CPU:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-1 bg-neutral-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-500 transition-all"
                                style={{ width: `${device.cpu}%` }}
                              ></div>
                            </div>
                            <span className="text-neutral-300">{device.cpu}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {topology.devices.length > 20 && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-neutral-400">
                    Showing 20 of {topology.devices.length} devices
                  </div>
                  <button className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    View All Devices
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-80 border-l border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Network Overview</h3>
          
          <div className="space-y-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Devices:</span>
                  <span className="text-white">{topology.devices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Connections:</span>
                  <span className="text-white">{topology.connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Last Updated:</span>
                  <span className="text-white">
                    {new Date(topology.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Device Types</h4>
              <div className="space-y-1">
                {Object.entries(topology.discoveryStats.devicesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-neutral-400 capitalize">{type}:</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Device Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-neutral-400">Online</span>
                  </div>
                  <span className="text-white">
                    {topology.devices.filter(d => d.status === 'online').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    <span className="text-neutral-400">Warning</span>
                  </div>
                  <span className="text-white">
                    {topology.devices.filter(d => d.status === 'warning').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                    <span className="text-neutral-400">Offline</span>
                  </div>
                  <span className="text-white">
                    {topology.devices.filter(d => d.status === 'offline').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={generateFreshData}
                  className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Refresh Network Data
                </button>
                <button className="w-full px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors text-sm">
                  Export Topology
                </button>
                <button className="w-full px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors text-sm">
                  Network Health Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Details Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <DeviceDetailsModal 
            device={selectedDevice} 
            onClose={() => setSelectedDevice(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default NetworkTopologyDashboard 