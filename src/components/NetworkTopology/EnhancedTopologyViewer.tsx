import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  NetworkDevice, 
  NetworkConnection, 
  TopologyFilter,
  PathTrace,
  setSelectedDevice,
  setSelectedConnection,
  setFilters,
  setLayoutType,
  setPathTrace,
  updateDevicePosition
} from '@/store/slices/networkSlice'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import cola from 'cytoscape-cola'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ZoomIn, ZoomOut, Maximize, RotateCcw, Settings,
  Download, Upload, Eye, EyeOff, Route, Share, Layers, Grid,
  MapPin, Wifi, Server, Shield, Router, Monitor, HardDrive,
  AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Network
} from 'lucide-react'
import EnhancedLoadingSpinner from '../Layout/EnhancedLoadingSpinner'

// Register Cytoscape extensions
cytoscape.use(dagre)
cytoscape.use(cola)

interface EnhancedTopologyViewerProps {
  devices: NetworkDevice[]
  connections: NetworkConnection[]
  className?: string
}

const EnhancedTopologyViewer: React.FC<EnhancedTopologyViewerProps> = ({
  devices = [],
  connections = [],
  className = ''
}) => {
  const dispatch = useDispatch()
  const { 
    selectedDevice, 
    selectedConnection, 
    filters, 
    layoutType, 
    pathTrace,
    realTimeUpdates 
  } = useSelector((state: RootState) => state.network)

  // Ensure we have valid arrays
  const safeDevices = Array.isArray(devices) ? devices : []
  const safeConnections = Array.isArray(connections) ? connections : []

  console.log('🎯 EnhancedTopologyViewer props:', {
    devices: safeDevices.length,
    connections: safeConnections.length,
    devicesType: typeof devices,
    connectionsType: typeof connections
  })

  const cyRef = useRef<cytoscape.Core | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isTracing, setIsTracing] = useState(false)
  const [traceSource, setTraceSource] = useState<string>('')
  const [traceTarget, setTraceTarget] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm)
  const [highlightedDevices, setHighlightedDevices] = useState<Set<string>>(new Set())
  const [isInitializing, setIsInitializing] = useState(true)
  const [isRendering, setIsRendering] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Initialize component
  useEffect(() => {
    console.log('🎯 EnhancedTopologyViewer initializing...')
    console.log('📊 Received data:', { devices: safeDevices.length, connections: safeConnections.length })
    
    const timer = setTimeout(() => {
      console.log('✅ EnhancedTopologyViewer initialization complete')
      setIsInitializing(false)
      setIsRendering(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [safeDevices.length, safeConnections.length])

  // Show loading spinner while initializing or when no data
  if (isInitializing) {
    return (
      <div className={`h-full ${className}`}>
        <EnhancedLoadingSpinner 
          size="lg" 
          message="Loading Network Visualization..." 
          fullScreen={false}
          variant="neural"
        />
      </div>
    )
  }

  // Show error state if something went wrong
  if (hasError) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-error-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Visualization Error</h3>
          <p className="text-neutral-400 mb-4">Failed to load network topology visualization</p>
          <button
            onClick={() => {
              setHasError(false)
              setIsInitializing(true)
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show loading if no devices available
  if (safeDevices.length === 0) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Network className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Network Data</h3>
          <p className="text-neutral-400">No devices found to display in the topology</p>
        </div>
      </div>
    )
  }

  // Filter devices and connections based on current filters
  const filteredDevices = useMemo(() => {
    return safeDevices.filter(device => {
      // Device type filter
      if (filters.deviceTypes.length > 0 && !filters.deviceTypes.includes(device.type)) {
        return false
      }
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(device.status)) {
        return false
      }
      
      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(device.location)) {
        return false
      }
      
      // Data center filter
      if (filters.dataCenters.length > 0 && !filters.dataCenters.includes(device.dataCenter)) {
        return false
      }
      
      // VLAN filter
      if (filters.vlans.length > 0) {
        const deviceVlans = device.vlans.map(v => v.id)
        if (!filters.vlans.some(vlan => deviceVlans.includes(vlan))) {
          return false
        }
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        return (
          device.hostname.toLowerCase().includes(term) ||
          device.ipAddresses.some(ip => ip.includes(term)) ||
          device.macAddresses.some(mac => mac.toLowerCase().includes(term)) ||
          device.vendor.toLowerCase().includes(term) ||
          device.model.toLowerCase().includes(term)
        )
      }
      
      // Show offline devices filter
      if (!filters.showOfflineDevices && device.status === 'offline') {
        return false
      }
      
      return true
    })
  }, [safeDevices, filters])

  const filteredConnections = useMemo(() => {
    if (!filters.showConnections) return []
    
    return safeConnections.filter(connection => {
      // Only show connections between visible devices
      const sourceVisible = filteredDevices.some(d => d.id === connection.source)
      const targetVisible = filteredDevices.some(d => d.id === connection.target)
      return sourceVisible && targetVisible
    })
  }, [safeConnections, filteredDevices, filters.showConnections])

  // Convert devices and connections to Cytoscape elements
  const elements = useMemo(() => {
    const nodes = filteredDevices.map(device => ({
      data: {
        id: device.id,
        label: device.hostname,
        type: device.type,
        status: device.status,
        vendor: device.vendor,
        model: device.model,
        location: device.location,
        dataCenter: device.dataCenter,
        ipAddresses: device.ipAddresses,
        interfaces: device.interfaces,
        cpu: device.cpu,
        memory: device.memory
      },
      position: device.position
    }))

    const edges = filteredConnections.map(connection => ({
      data: {
        id: connection.id,
        source: connection.source,
        target: connection.target,
        type: connection.type,
        status: connection.status,
        bandwidth: connection.bandwidth,
        utilization: connection.utilization,
        latency: connection.latency
      }
    }))

    return [...nodes, ...edges]
  }, [filteredDevices, filteredConnections])

  // Device icon mapping
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router': return Router
      case 'switch': return Grid
      case 'firewall': return Shield
      case 'server': return Server
      case 'workstation': return Monitor
      case 'access-point': return Wifi
      case 'load-balancer': return Layers
      case 'hypervisor': return HardDrive
      default: return Monitor
    }
  }

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e'
      case 'warning': return '#f59e0b'
      case 'offline': return '#ef4444'
      case 'unknown': return '#6b7280'
      default: return '#6b7280'
    }
  }

  // Device shape mapping
  const getDeviceShape = (type: string) => {
    switch (type) {
      case 'router': return 'diamond'
      case 'switch': return 'rectangle'
      case 'firewall': return 'triangle'
      case 'server': return 'round-rectangle'
      case 'workstation': return 'ellipse'
      case 'access-point': return 'hexagon'
      case 'load-balancer': return 'octagon'
      default: return 'ellipse'
    }
  }

  // Cytoscape stylesheet
  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => getStatusColor(ele.data('status')),
        'border-color': '#374151',
        'border-width': 2,
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#f9fafb',
        'font-size': '10px',
        'font-weight': 'bold',
        'text-outline-width': 2,
        'text-outline-color': '#1f2937',
        'width': (ele: any) => {
          const baseSize = 50
          const importance = ele.data('interfaces')?.length || 1
          return Math.min(80, baseSize + importance * 2)
        },
        'height': (ele: any) => {
          const baseSize = 50
          const importance = ele.data('interfaces')?.length || 1
          return Math.min(80, baseSize + importance * 2)
        },
        'shape': (ele: any) => getDeviceShape(ele.data('type')),
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s',
        'z-index': 1
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#3b82f6',
        'border-width': 4,
        'z-index': 10,
        'overlay-color': '#3b82f6',
        'overlay-opacity': 0.2
      }
    },
    {
      selector: 'node:hover',
      style: {
        'border-color': '#60a5fa',
        'border-width': 3,
        'z-index': 5
      }
    },
    {
      selector: 'node.highlighted',
      style: {
        'background-color': '#fbbf24',
        'border-color': '#f59e0b',
        'border-width': 3,
        'z-index': 8
      }
    },
    {
      selector: 'node.trace-path',
      style: {
        'background-color': '#8b5cf6',
        'border-color': '#7c3aed',
        'border-width': 4,
        'z-index': 9
      }
    },
    {
      selector: 'edge',
      style: {
        'width': (ele: any) => {
          const utilization = ele.data('utilization') || 0
          return Math.max(2, utilization / 20)
        },
        'line-color': (ele: any) => {
          const status = ele.data('status')
          switch (status) {
            case 'active': return '#22c55e'
            case 'inactive': return '#6b7280'
            case 'error': return '#ef4444'
            case 'degraded': return '#f59e0b'
            default: return '#6b7280'
          }
        },
        'target-arrow-color': (ele: any) => {
          const status = ele.data('status')
          switch (status) {
            case 'active': return '#22c55e'
            case 'inactive': return '#6b7280'
            case 'error': return '#ef4444'
            case 'degraded': return '#f59e0b'
            default: return '#6b7280'
          }
        },
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'opacity': 0.7,
        'transition-property': 'line-color, width, opacity',
        'transition-duration': '0.3s',
        'z-index': 1
      }
    },
    {
      selector: 'edge:hover',
      style: {
        'opacity': 1,
        'width': (ele: any) => {
          const utilization = ele.data('utilization') || 0
          return Math.max(4, utilization / 15)
        },
        'z-index': 5
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
        'opacity': 1,
        'z-index': 10
      }
    },
    {
      selector: 'edge.trace-path',
      style: {
        'line-color': '#8b5cf6',
        'target-arrow-color': '#8b5cf6',
        'width': 6,
        'opacity': 1,
        'z-index': 9
      }
    }
  ]

  // Layout configurations
  const layoutConfigs = {
    hierarchical: {
      name: 'dagre',
      rankDir: 'TB',
      spacingFactor: 1.5,
      nodeDimensionsIncludeLabels: true,
      animate: true,
      animationDuration: 1000
    },
    force: {
      name: 'cola',
      animate: true,
      refresh: 1,
      maxSimulationTime: 4000,
      ungrabifyWhileSimulating: false,
      fit: true,
      padding: 50,
      nodeSpacing: 100,
      edgeLength: 150
    },
    circular: {
      name: 'circle',
      fit: true,
      padding: 50,
      spacingFactor: 2,
      animate: true,
      animationDuration: 1000
    },
    grid: {
      name: 'grid',
      fit: true,
      padding: 50,
      spacingFactor: 1.5,
      animate: true,
      animationDuration: 1000
    },
    custom: {
      name: 'preset',
      fit: true,
      padding: 50
    }
  }

  // Event handlers
  const handleNodeTap = useCallback((event: any) => {
    const node = event.target
    const nodeData = node.data()
    const device = safeDevices.find(d => d.id === nodeData.id)
    
    if (device) {
      dispatch(setSelectedDevice(device))
      
      // Path tracing mode
      if (isTracing) {
        if (!traceSource) {
          setTraceSource(device.id)
        } else if (!traceTarget && device.id !== traceSource) {
          setTraceTarget(device.id)
          performPathTrace(traceSource, device.id)
        } else {
          // Reset tracing
          setTraceSource(device.id)
          setTraceTarget('')
          dispatch(setPathTrace(null))
        }
      }
    }
  }, [safeDevices, dispatch, isTracing, traceSource, traceTarget])

  const handleEdgeTap = useCallback((event: any) => {
    const edge = event.target
    const edgeData = edge.data()
    const connection = safeConnections.find(c => c.id === edgeData.id)
    
    if (connection) {
      dispatch(setSelectedConnection(connection))
    }
  }, [safeConnections, dispatch])

  const handleNodeDrag = useCallback((event: any) => {
    const node = event.target
    const position = node.position()
    const deviceId = node.data('id')
    
    dispatch(updateDevicePosition({ deviceId, position }))
  }, [dispatch])

  // Search functionality
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    dispatch(setFilters({ searchTerm: term }))
    
    if (term) {
      const matchingDevices = safeDevices.filter(device => 
        device.hostname.toLowerCase().includes(term.toLowerCase()) ||
        device.ipAddresses.some(ip => ip.includes(term)) ||
        device.macAddresses.some(mac => mac.toLowerCase().includes(term.toLowerCase()))
      )
      
      const deviceIds = new Set(matchingDevices.map(d => d.id))
      setHighlightedDevices(deviceIds)
      
      // Focus on first matching device
      if (matchingDevices.length > 0 && cyRef.current) {
        const firstDevice = cyRef.current.getElementById(matchingDevices[0].id)
        cyRef.current.center(firstDevice)
        cyRef.current.zoom(1.5)
      }
    } else {
      setHighlightedDevices(new Set())
    }
  }, [safeDevices, dispatch])

  // Path tracing
  const performPathTrace = useCallback(async (sourceId: string, targetId: string) => {
    console.log(`🔍 Tracing path from ${sourceId} to ${targetId}`)
    
    // Simulate path tracing algorithm
    const trace: PathTrace = {
      id: `trace-${Date.now()}`,
      source: sourceId,
      target: targetId,
      hops: [],
      totalLatency: 0,
      status: 'complete',
      timestamp: new Date().toISOString()
    }
    
    // Simple path finding using BFS
    const visited = new Set<string>()
    const queue = [{ deviceId: sourceId, path: [sourceId], latency: 0 }]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      
      if (current.deviceId === targetId) {
        // Found path
        trace.hops = current.path.map((deviceId, index) => ({
          deviceId,
          interface: `eth${index}`,
          latency: Math.random() * 10,
          packetLoss: Math.random() * 0.01
        }))
        trace.totalLatency = current.latency
        break
      }
      
      if (visited.has(current.deviceId)) continue
      visited.add(current.deviceId)
      
      // Find connected devices
      const connectedDevices = safeConnections
        .filter(conn => conn.source === current.deviceId || conn.target === current.deviceId)
        .map(conn => conn.source === current.deviceId ? conn.target : conn.source)
      
      for (const nextDevice of connectedDevices) {
        if (!visited.has(nextDevice)) {
          queue.push({
            deviceId: nextDevice,
            path: [...current.path, nextDevice],
            latency: current.latency + Math.random() * 5
          })
        }
      }
    }
    
    dispatch(setPathTrace(trace))
    setIsTracing(false)
    setTraceSource('')
    setTraceTarget('')
  }, [safeConnections, dispatch])

  // Layout controls
  const handleLayoutChange = useCallback((newLayout: typeof layoutType) => {
    dispatch(setLayoutType(newLayout))
  }, [dispatch])

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
      cyRef.current.center()
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
      cyRef.current.center()
    }
  }, [])

  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit()
    }
  }, [])

  const handleReset = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(1)
      cyRef.current.center()
      cyRef.current.layout(layoutConfigs[layoutType]).run()
    }
  }, [layoutType])

  // Export functionality
  const handleExport = useCallback((format: 'png' | 'jpg' | 'json') => {
    if (!cyRef.current) return
    
    if (format === 'json') {
      const data = {
        devices: filteredDevices,
        connections: filteredConnections,
        layout: layoutType,
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `network-topology-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const dataUrl = cyRef.current.png({
        output: 'blob',
        bg: '#1f2937',
        full: true,
        scale: 2
      })
      
      const a = document.createElement('a')
      a.href = URL.createObjectURL(dataUrl as Blob)
      a.download = `network-topology-${Date.now()}.${format}`
      a.click()
    }
  }, [filteredDevices, filteredConnections, layoutType])

  // Initialize Cytoscape
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', handleNodeTap)
      cyRef.current.on('tap', 'edge', handleEdgeTap)
      cyRef.current.on('dragfree', 'node', handleNodeDrag)
      
      // Apply highlighting
      cyRef.current.nodes().removeClass('highlighted trace-path')
      cyRef.current.edges().removeClass('trace-path')
      
      // Highlight search results
      highlightedDevices.forEach(deviceId => {
        cyRef.current?.getElementById(deviceId).addClass('highlighted')
      })
      
      // Highlight path trace
      if (pathTrace) {
        pathTrace.hops.forEach(hop => {
          cyRef.current?.getElementById(hop.deviceId).addClass('trace-path')
        })
        
        // Highlight connections in path
        for (let i = 0; i < pathTrace.hops.length - 1; i++) {
          const sourceId = pathTrace.hops[i].deviceId
          const targetId = pathTrace.hops[i + 1].deviceId
          const edge = cyRef.current?.edges().filter(e => 
            (e.data('source') === sourceId && e.data('target') === targetId) ||
            (e.data('source') === targetId && e.data('target') === sourceId)
          )
          edge?.addClass('trace-path')
        }
      }
    }
    
    return () => {
      if (cyRef.current) {
        cyRef.current.off('tap', 'node', handleNodeTap)
        cyRef.current.off('tap', 'edge', handleEdgeTap)
        cyRef.current.off('dragfree', 'node', handleNodeDrag)
      }
    }
  }, [handleNodeTap, handleEdgeTap, handleNodeDrag, highlightedDevices, pathTrace])

  // Apply layout when it changes
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      const layout = cyRef.current.layout(layoutConfigs[layoutType])
      layout.run()
    }
  }, [layoutType, elements])

  // Log when elements change
  useEffect(() => {
    console.log('🔄 Elements updated:', { 
      nodes: filteredDevices.length, 
      edges: filteredConnections.length,
      total: elements.length 
    })
  }, [elements.length, filteredDevices.length, filteredConnections.length])

  return (
    <div className={`relative w-full h-full bg-neutral-900 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-64 pl-10 pr-4 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors backdrop-blur-sm ${
              showFilters ? 'bg-primary-600 text-white' : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {/* Path tracing */}
          <button
            onClick={() => setIsTracing(!isTracing)}
            className={`p-2 rounded-lg transition-colors backdrop-blur-sm ${
              isTracing ? 'bg-purple-600 text-white' : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Path Tracing"
          >
            <Route className="w-4 h-4" />
          </button>
        </div>
        
        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Layout selector */}
          <select
            value={layoutType}
            onChange={(e) => handleLayoutChange(e.target.value as typeof layoutType)}
            className="px-3 py-2 bg-neutral-800/90 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 backdrop-blur-sm"
          >
            <option value="hierarchical">Hierarchical</option>
            <option value="force">Force Directed</option>
            <option value="circular">Circular</option>
            <option value="grid">Grid</option>
            <option value="custom">Custom</option>
          </select>
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-neutral-800/90 rounded-lg backdrop-blur-sm">
            <button
              onClick={handleZoomIn}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-l-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
              title="Fit to Screen"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-r-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Export */}
          <div className="relative">
            <button
              onClick={() => handleExport('png')}
              className="p-2 bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors backdrop-blur-sm"
              title="Export as PNG"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors backdrop-blur-sm ${
              showSettings ? 'bg-primary-600 text-white' : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 px-4 py-2 bg-neutral-800/90 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-sm text-neutral-300">
              {filteredDevices.filter(d => d.status === 'online').length} Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-sm text-neutral-300">
              {filteredDevices.filter(d => d.status === 'warning').length} Warning
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full"></div>
            <span className="text-sm text-neutral-300">
              {filteredDevices.filter(d => d.status === 'offline').length} Offline
            </span>
          </div>
          <div className="text-sm text-neutral-400">
            {filteredConnections.length} Connections
          </div>
        </div>
      </div>
      
      {/* Tracing indicator */}
      {isTracing && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/90 text-white rounded-lg backdrop-blur-sm">
            <Route className="w-4 h-4" />
            <span className="text-sm">
              {!traceSource ? 'Select source device' : !traceTarget ? 'Select target device' : 'Tracing path...'}
            </span>
          </div>
        </div>
      )}
      
      {/* Cytoscape component */}
      {/* @ts-ignore - Cytoscape types are not fully compatible */}
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layoutConfigs[layoutType]}
        cy={(cy: any) => {
          try {
            cyRef.current = cy
            setHasError(false)
          } catch (error) {
            console.error('Cytoscape initialization error:', error)
            setHasError(true)
          }
        }}
        wheelSensitivity={0.2}
        minZoom={0.1}
        maxZoom={3}
      />
      
      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-16 left-4 w-80 bg-neutral-800/95 backdrop-blur-sm rounded-lg border border-neutral-700 p-4 z-20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
            
            {/* Device types */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Device Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['router', 'switch', 'firewall', 'server', 'workstation', 'access-point'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.deviceTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.deviceTypes, type]
                          : filters.deviceTypes.filter(t => t !== type)
                        dispatch(setFilters({ deviceTypes: newTypes }))
                      }}
                      className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
                    />
                    <span className="text-sm text-neutral-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
              <div className="flex gap-2">
                {['online', 'warning', 'offline'].map(status => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={(e) => {
                        const newStatuses = e.target.checked
                          ? [...filters.statuses, status]
                          : filters.statuses.filter(s => s !== status)
                        dispatch(setFilters({ statuses: newStatuses }))
                      }}
                      className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
                    />
                    <span className="text-sm text-neutral-300 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Show connections */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.showConnections}
                  onChange={(e) => dispatch(setFilters({ showConnections: e.target.checked }))}
                  className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
                />
                <span className="text-sm text-neutral-300">Show Connections</span>
              </label>
            </div>
            
            {/* Show offline devices */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.showOfflineDevices}
                  onChange={(e) => dispatch(setFilters({ showOfflineDevices: e.target.checked }))}
                  className="rounded border-neutral-600 bg-neutral-700 text-primary-600"
                />
                <span className="text-sm text-neutral-300">Show Offline Devices</span>
              </label>
            </div>
            
            {/* Clear filters */}
            <button
              onClick={() => dispatch(setFilters({
                deviceTypes: [],
                statuses: [],
                locations: [],
                dataCenters: [],
                vlans: [],
                searchTerm: '',
                showOfflineDevices: true,
                showConnections: true
              }))}
              className="w-full px-3 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-neutral-800/90 backdrop-blur-sm rounded-lg p-3 z-10">
        <h4 className="text-sm font-medium text-white mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-neutral-300">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-neutral-300">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full"></div>
            <span className="text-neutral-300">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <Router className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-300">Router</span>
          </div>
          <div className="flex items-center gap-2">
            <Grid className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-300">Switch</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-300">Firewall</span>
          </div>
        </div>
      </div>
      
      {/* Real-time indicator */}
      {realTimeUpdates && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-success-600/90 text-white rounded-lg backdrop-blur-sm z-10">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm">Live</span>
        </div>
      )}
    </div>
  )
}

export default EnhancedTopologyViewer 