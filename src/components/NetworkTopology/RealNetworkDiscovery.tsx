import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setTopology } from '@/store/slices/networkSlice'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Settings, Shield, Wifi, Database, AlertTriangle,
  CheckCircle, Clock, RefreshCw, Eye, EyeOff, Activity, Zap,
  Network, Server, Users, Info, X, ChevronDown, ChevronUp
} from 'lucide-react'
import DataPipeline, { DataPipelineConfig, ModuleState } from '@/services/DataPipeline'
import toast from 'react-hot-toast'

interface RealNetworkDiscoveryProps {
  onDataSourceChange?: (isLiveData: boolean, source: string) => void
}

const RealNetworkDiscovery: React.FC<RealNetworkDiscoveryProps> = ({
  onDataSourceChange
}) => {
  const dispatch = useDispatch()
  const { topology } = useSelector((state: RootState) => state.network)
  
  const [dataPipeline, setDataPipeline] = useState<DataPipeline | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [moduleStates, setModuleStates] = useState<Map<string, ModuleState>>(new Map())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showModuleDetails, setShowModuleDetails] = useState(false)
  const [dataSource, setDataSource] = useState<{ isLiveData: boolean; source: string }>({
    isLiveData: false,
    source: 'mock-data'
  })
  
  const [config, setConfig] = useState<DataPipelineConfig>({
    enableRealDataCollection: false,
    fallbackToMockData: true,
    scanInterval: 5, // minutes
    maxRetries: 3,
    timeout: 30 // seconds
  })

  // Initialize DataPipeline
  useEffect(() => {
    const initializePipeline = async () => {
      try {
        console.log('🔧 Initializing DataPipeline...')
        const pipeline = DataPipeline.getInstance(config)
        setDataPipeline(pipeline)
        setIsInitialized(true)
        
        // Load initial topology data
        const topologyData = await pipeline.getTopologyData()
        dispatch(setTopology(topologyData.topology))
        
        setDataSource({
          isLiveData: topologyData.isLiveData,
          source: topologyData.source
        })
        
        onDataSourceChange?.(topologyData.isLiveData, topologyData.source)
        
        console.log('✅ DataPipeline initialized')
      } catch (error) {
        console.error('❌ Failed to initialize DataPipeline:', error)
        toast.error('Failed to initialize network discovery')
      }
    }

    if (!isInitialized) {
      initializePipeline()
    }
  }, [isInitialized, config, dispatch, onDataSourceChange])

  // Update module states periodically
  useEffect(() => {
    if (!dataPipeline) return

    const updateStates = () => {
      const states = dataPipeline.getModuleStates()
      setModuleStates(states)
    }

    // Initial update
    updateStates()

    // Set up periodic updates
    const interval = setInterval(updateStates, 2000)
    return () => clearInterval(interval)
  }, [dataPipeline])

  // Start real data collection
  const handleStartScanning = useCallback(async () => {
    if (!dataPipeline || isScanning) return

    setIsScanning(true)
    
    try {
      console.log('🚀 Starting real network discovery...')
      toast.loading('Starting network discovery...', { id: 'scan-start' })
      
      await dataPipeline.startDataCollection()
      
      // Update topology with latest data
      const topologyData = await dataPipeline.getTopologyData()
      dispatch(setTopology(topologyData.topology))
      
      setDataSource({
        isLiveData: topologyData.isLiveData,
        source: topologyData.source
      })
      
      onDataSourceChange?.(topologyData.isLiveData, topologyData.source)
      
      toast.success('Network discovery started', { id: 'scan-start' })
      console.log('✅ Network discovery started')
      
    } catch (error) {
      console.error('❌ Failed to start network discovery:', error)
      toast.error('Failed to start network discovery', { id: 'scan-start' })
    } finally {
      setIsScanning(false)
    }
  }, [dataPipeline, isScanning, dispatch, onDataSourceChange])

  // Stop data collection
  const handleStopScanning = useCallback(async () => {
    if (!dataPipeline) return

    try {
      console.log('🛑 Stopping network discovery...')
      toast.loading('Stopping network discovery...', { id: 'scan-stop' })
      
      await dataPipeline.stopDataCollection()
      
      toast.success('Network discovery stopped', { id: 'scan-stop' })
      console.log('✅ Network discovery stopped')
      
    } catch (error) {
      console.error('❌ Failed to stop network discovery:', error)
      toast.error('Failed to stop network discovery', { id: 'scan-stop' })
    }
  }, [dataPipeline])

  // Request privilege elevation
  const handleRequestElevation = useCallback(async () => {
    if (!dataPipeline) return

    try {
      console.log('🔐 Requesting privilege elevation...')
      toast.loading('Requesting elevated privileges...', { id: 'elevation' })
      
      const success = await dataPipeline.requestPrivilegeElevation(
        'Enhanced network discovery requires administrative privileges to access ARP tables and perform comprehensive scans.'
      )
      
      if (success) {
        toast.success('Elevated privileges granted', { id: 'elevation' })
        console.log('✅ Privilege elevation successful')
      } else {
        toast.error('Privilege elevation denied', { id: 'elevation' })
        console.warn('⚠️ Privilege elevation failed')
      }
      
    } catch (error) {
      console.error('❌ Privilege elevation error:', error)
      toast.error('Privilege elevation failed', { id: 'elevation' })
    }
  }, [dataPipeline])

  // Update configuration
  const handleConfigUpdate = useCallback((newConfig: Partial<DataPipelineConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    
    if (dataPipeline) {
      dataPipeline.updateConfig(newConfig)
    }
  }, [config, dataPipeline])

  // Get status icon for data source
  const getDataSourceIcon = () => {
    if (dataSource.isLiveData) {
      return <Activity className="w-4 h-4 text-success-400" />
    } else {
      return <Database className="w-4 h-4 text-warning-400" />
    }
  }

  // Get status color for modules
  const getModuleStatusColor = (state: ModuleState) => {
    if (state.isLiveDataAvailable) return 'text-success-400'
    if (state.error) return 'text-error-400'
    return 'text-warning-400'
  }

  // Get privilege level icon
  const getPrivilegeLevelIcon = (level: 'user' | 'elevated' | 'failed') => {
    switch (level) {
      case 'elevated':
        return <Shield className="w-4 h-4 text-success-400" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-error-400" />
      default:
        return <Users className="w-4 h-4 text-warning-400" />
    }
  }

  if (!isInitialized) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-primary-400 animate-spin" />
          <span className="text-white">Initializing Network Discovery...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Real Network Discovery</h3>
          <div className="flex items-center gap-2 px-2 py-1 bg-neutral-700 rounded-md">
            {getDataSourceIcon()}
            <span className="text-xs text-neutral-300">
              {dataSource.isLiveData ? 'Live Data' : 'Mock Data'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
          title="Advanced Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-neutral-400">Data Source</span>
          </div>
          <div className="text-sm font-medium text-white capitalize">
            {dataSource.source.replace('-', ' ')}
          </div>
        </div>
        
        <div className="bg-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-warning-400" />
            <span className="text-xs text-neutral-400">Last Scan</span>
          </div>
          <div className="text-sm font-medium text-white">
            {Array.from(moduleStates.values()).find(s => s.lastScanTime)?.lastScanTime 
              ? new Date(Array.from(moduleStates.values()).find(s => s.lastScanTime)!.lastScanTime!).toLocaleTimeString()
              : 'Never'}
          </div>
        </div>
        
        <div className="bg-neutral-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-success-400" />
            <span className="text-xs text-neutral-400">Active Modules</span>
          </div>
          <div className="text-sm font-medium text-white">
            {Array.from(moduleStates.values()).filter(s => s.isLiveDataAvailable).length} / {moduleStates.size}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableRealDataCollection}
              onChange={(e) => handleConfigUpdate({ enableRealDataCollection: e.target.checked })}
              className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
            />
            <span className="text-sm text-neutral-300">Enable Real Data Collection</span>
          </label>
        </div>
        
        {config.enableRealDataCollection && (
          <>
            <button
              onClick={handleStartScanning}
              disabled={isScanning}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Scan
                </>
              )}
            </button>
            
            <button
              onClick={handleStopScanning}
              className="flex items-center gap-2 px-3 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Stop
            </button>
            
            <button
              onClick={handleRequestElevation}
              className="flex items-center gap-2 px-3 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors"
              title="Request elevated privileges for comprehensive scanning"
            >
              <Shield className="w-4 h-4" />
              Elevate
            </button>
          </>
        )}
        
        <button
          onClick={() => setShowModuleDetails(!showModuleDetails)}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
        >
          <Info className="w-4 h-4" />
          Modules
          {showModuleDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Module Details */}
      <AnimatePresence>
        {showModuleDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-neutral-300">Module Status</h4>
            <div className="grid grid-cols-1 gap-2">
              {Array.from(moduleStates.entries()).map(([name, state]) => (
                <div key={name} className="bg-neutral-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        state.isLiveDataAvailable ? 'bg-success-500' : 
                        state.error ? 'bg-error-500' : 'bg-warning-500'
                      }`}></div>
                      <span className="text-sm font-medium text-white capitalize">
                        {name.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getPrivilegeLevelIcon(state.privilegeLevel)}
                      <span className={`text-xs ${getModuleStatusColor(state)}`}>
                        {state.isLiveDataAvailable ? 'Live' : state.error ? 'Failed' : 'Mock'}
                      </span>
                    </div>
                  </div>
                  
                  {state.error && (
                    <div className="mt-2 text-xs text-error-400 bg-error-900/20 rounded px-2 py-1">
                      {state.error}
                    </div>
                  )}
                  
                  <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-neutral-400">
                    <div>
                      <span>Last Scan: </span>
                      <span className="text-neutral-300">
                        {state.lastScanTime ? new Date(state.lastScanTime).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span>Duration: </span>
                      <span className="text-neutral-300">
                        {state.scanDuration > 0 ? `${state.scanDuration}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-700 pt-4 space-y-4"
          >
            <h4 className="text-sm font-medium text-neutral-300">Advanced Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Scan Interval (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.scanInterval}
                  onChange={(e) => handleConfigUpdate({ scanInterval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Timeout (seconds)</label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={config.timeout}
                  onChange={(e) => handleConfigUpdate({ timeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.fallbackToMockData}
                  onChange={(e) => handleConfigUpdate({ fallbackToMockData: e.target.checked })}
                  className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
                />
                <span className="text-sm text-neutral-300">Fallback to Mock Data</span>
              </label>
            </div>
            
            <div className="text-xs text-neutral-400 bg-neutral-900/50 rounded-lg p-3">
              <strong>Note:</strong> Real network discovery requires appropriate permissions and may trigger security software warnings. 
              The system will automatically fallback to mock data if real data collection fails.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RealNetworkDiscovery 