import React, { useEffect, useRef, useState } from 'react'
// @ts-ignore
import CytoscapeComponent from 'react-cytoscapejs'
// @ts-ignore
import cytoscape from 'cytoscape'
// @ts-ignore
import dagre from 'cytoscape-dagre'
// @ts-ignore
import cola from 'cytoscape-cola'
import { NetworkDevice, NetworkConnection } from '@/store/slices/networkSlice'
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'

cytoscape.use(dagre)
cytoscape.use(cola)

interface TopologyViewerProps {
  devices: NetworkDevice[]
  connections: NetworkConnection[]
  onDeviceSelect: (device: NetworkDevice | null) => void
  selectedDevice: NetworkDevice | null
}

const TopologyViewer: React.FC<TopologyViewerProps> = ({
  devices,
  connections,
  onDeviceSelect,
  selectedDevice
}) => {
  const cyRef = useRef<any>(null)
  const [layout, setLayout] = useState<'dagre' | 'cola' | 'circle' | 'grid'>('dagre')

  const elements = [
    ...devices.map(device => ({
      data: {
        id: device.id,
        label: device.hostname,
        type: device.type,
        status: device.status,
        vendor: device.vendor,
        model: device.model,
        location: device.location,
        ipAddresses: device.ipAddresses
      }
    })),
    ...connections.map(connection => ({
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
  ]

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e'
      case 'warning': return '#f59e0b'
      case 'offline': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getNodeShape = (type: string) => {
    switch (type) {
      case 'router': return 'diamond'
      case 'switch': return 'rectangle'
      case 'firewall': return 'triangle'
      case 'server': return 'round-rectangle'
      case 'workstation': return 'ellipse'
      case 'access-point': return 'hexagon'
      default: return 'ellipse'
    }
  }

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': (ele: any) => getNodeColor(ele.data('status')),
        'border-color': '#374151',
        'border-width': 2,
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#f9fafb',
        'font-size': '12px',
        'font-weight': 'bold',
        'text-outline-width': 2,
        'text-outline-color': '#1f2937',
        'width': 60,
        'height': 60,
        'shape': (ele: any) => getNodeShape(ele.data('type')),
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#3b82f6',
        'border-width': 4,
        'width': 80,
        'height': 80,
        'z-index': 10
      }
    },
    {
      selector: 'node:hover',
      style: {
        'border-color': '#60a5fa',
        'border-width': 3
      }
    },
    {
      selector: 'edge',
      style: {
        'width': (ele: any) => {
          const utilization = ele.data('utilization') || 0
          return Math.max(2, utilization / 10)
        },
        'line-color': (ele: any) => {
          const status = ele.data('status')
          switch (status) {
            case 'active': return '#22c55e'
            case 'inactive': return '#6b7280'
            case 'error': return '#ef4444'
            default: return '#6b7280'
          }
        },
        'target-arrow-color': (ele: any) => {
          const status = ele.data('status')
          switch (status) {
            case 'active': return '#22c55e'
            case 'inactive': return '#6b7280'
            case 'error': return '#ef4444'
            default: return '#6b7280'
          }
        },
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'opacity': 0.8,
        'transition-property': 'line-color, width',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'edge:hover',
      style: {
        'opacity': 1,
        'width': (ele: any) => {
          const utilization = ele.data('utilization') || 0
          return Math.max(4, utilization / 8)
        }
      }
    }
  ]

  const layoutOptions = {
    dagre: {
      name: 'dagre',
      rankDir: 'TB',
      spacingFactor: 1.5,
      nodeDimensionsIncludeLabels: true
    },
    cola: {
      name: 'cola',
      animate: true,
      refresh: 1,
      maxSimulationTime: 4000,
      ungrabifyWhileSimulating: false,
      fit: true,
      padding: 30,
      nodeSpacing: 100
    },
    circle: {
      name: 'circle',
      fit: true,
      padding: 30,
      spacingFactor: 2
    },
    grid: {
      name: 'grid',
      fit: true,
      padding: 30,
      spacingFactor: 1.5
    }
  }

  const handleNodeTap = (event: any) => {
    const node = event.target
    const nodeData = node.data()
    const networkDevice = devices.find(d => d.id === nodeData.id)
    onDeviceSelect(networkDevice || null)
  }

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
      cyRef.current.center()
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
      cyRef.current.center()
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit()
    }
  }

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.zoom(1)
      cyRef.current.center()
      cyRef.current.layout(layoutOptions[layout]).run()
    }
  }

  const handleLayoutChange = (newLayout: typeof layout) => {
    setLayout(newLayout)
    if (cyRef.current) {
      cyRef.current.layout(layoutOptions[newLayout]).run()
    }
  }

  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', handleNodeTap)
      
      return () => {
        cyRef.current?.off('tap', 'node', handleNodeTap)
      }
    }
  }, [devices, onDeviceSelect])

  useEffect(() => {
    if (cyRef.current && selectedDevice) {
      cyRef.current.nodes().removeClass('selected')
      cyRef.current.getElementById(selectedDevice.id).addClass('selected')
    }
  }, [selectedDevice])

  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Layout selector */}
        <select
          value={layout}
          onChange={(e) => handleLayoutChange(e.target.value as typeof layout)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="dagre">Hierarchical</option>
          <option value="cola">Force Directed</option>
          <option value="circle">Circular</option>
          <option value="grid">Grid</option>
        </select>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-neutral-800 rounded-lg">
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
      </div>

      {/* Cytoscape component */}
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layoutOptions[layout]}
        cy={(cy: any) => {
          cyRef.current = cy
        }}
        wheelSensitivity={0.2}
        minZoom={0.1}
        maxZoom={3}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-neutral-800/90 backdrop-blur-sm rounded-lg p-3 z-10">
        <h4 className="text-sm font-medium text-white mb-2">Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-xs text-neutral-300">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <span className="text-xs text-neutral-300">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error-500 rounded-full"></div>
            <span className="text-xs text-neutral-300">Offline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopologyViewer 