import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setDevices } from '@/store/slices/devicesSlice'
import { setMonitoringData } from '@/store/slices/monitoringSlice'
import { generateMockData } from '@/utils/mockData'
import { Pie, Bar } from 'react-chartjs-2'
import MetricChart from '@/components/Charts/MetricChart'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle)

const AnalyticsDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const devices = useSelector((state: RootState) => state.devices.devices)
  const monitoring = useSelector((state: RootState) => state.monitoring.data)

  // Simulate real-time updates
  useEffect(() => {
    const { topology, monitoring } = generateMockData()
    // Use the devices from topology (already in correct format)
    const devices = topology.devices.map((device) => ({
      ...device,
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      firmwareVersion: device.firmwareVersion || '1.0.0',
      lastSeen: device.lastDiscovered || new Date().toISOString(),
      monitoring: {
        enabled: true,
        interval: 60,
        metrics: ['cpu', 'memory', 'temperature'],
      },
    }))
    dispatch(setDevices(devices))
    dispatch(setMonitoringData(monitoring))
    const interval = setInterval(() => {
      const { topology, monitoring } = generateMockData()
      const devices = topology.devices.map((device) => ({
        ...device,
        serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        firmwareVersion: device.firmwareVersion || '1.0.0',
        lastSeen: device.lastDiscovered || new Date().toISOString(),
        monitoring: {
          enabled: true,
          interval: 60,
          metrics: ['cpu', 'memory', 'temperature'],
        },
      }))
      dispatch(setDevices(devices))
      dispatch(setMonitoringData(monitoring))
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  // Device type distribution
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    devices.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1
    })
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            '#3b82f6', '#6366f1', '#ef4444', '#10b981', '#a78bfa', '#f59e42', '#fbbf24', '#f472b6',
          ],
        },
      ],
    }
  }, [devices])

  // Vendor distribution
  const vendorData = useMemo(() => {
    const counts: Record<string, number> = {}
    devices.forEach((d) => {
      counts[d.vendor] = (counts[d.vendor] || 0) + 1
    })
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [
            '#3b82f6', '#6366f1', '#ef4444', '#10b981', '#a78bfa', '#f59e42', '#fbbf24', '#f472b6',
          ],
        },
      ],
    }
  }, [devices])

  // Top 5 devices by CPU
  const topCpu = useMemo(() => {
    return [...devices]
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map((d) => ({ label: d.label, cpu: d.cpu }))
  }, [devices])

  const topCpuData = {
    labels: topCpu.map((d) => d.label),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: topCpu.map((d) => d.cpu),
        backgroundColor: '#ef4444',
      },
    ],
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-400">{devices.length}</div>
          <div className="text-neutral-400 text-sm">Total Devices</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-400">{monitoring.summary.onlineDevices}</div>
          <div className="text-neutral-400 text-sm">Online Devices</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-error-400">{monitoring.summary.criticalAlerts}</div>
          <div className="text-neutral-400 text-sm">Critical Alerts</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{monitoring.summary.networkUptime?.toFixed(2)}%</div>
          <div className="text-neutral-400 text-sm">Network Uptime</div>
        </div>
      </div>
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Device Type Distribution</h2>
          <Pie data={typeData} />
        </div>
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Vendor Distribution</h2>
          <Pie data={vendorData} />
        </div>
        <div className="glass-effect rounded-lg p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-2">Top 5 Devices by CPU Usage</h2>
          <Bar data={topCpuData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
              y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' }, beginAtZero: true, max: 100 },
            },
          }} />
        </div>
      </div>
      {/* Network Trends */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Network Latency Trend</h2>
        <MetricChart data={monitoring.network.latency} title="Latency" color="#f59e42" unit=" ms" height={220} />
      </div>
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Network Bandwidth (Inbound)</h2>
        <MetricChart data={monitoring.network.bandwidth.inbound} title="Inbound Bandwidth" color="#3b82f6" unit=" Mbps" height={220} />
      </div>
    </div>
  )
}

export default AnalyticsDashboard 