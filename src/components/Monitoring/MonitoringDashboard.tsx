import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setMonitoringData } from '@/store/slices/monitoringSlice'
import MetricChart from '@/components/Charts/MetricChart'
import { generateMockData } from '@/utils/mockData'

const MonitoringDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const monitoring = useSelector((state: RootState) => state.monitoring.data)
  const isLoading = useSelector((state: RootState) => state.monitoring.isLoading)
  const lastUpdated = useSelector((state: RootState) => state.monitoring.lastUpdated)

  // Simulate real-time updates
  useEffect(() => {
    // Initial load
    const { monitoring } = generateMockData()
    dispatch(setMonitoringData(monitoring))
    // Interval updates
    const interval = setInterval(() => {
      const { monitoring } = generateMockData()
      dispatch(setMonitoringData(monitoring))
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  if (isLoading || !monitoring) {
    return <div className="text-center text-neutral-400">Loading monitoring data...</div>
  }

  const summary = monitoring.summary
  const network = monitoring.network

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-400">{summary.totalDevices}</div>
          <div className="text-neutral-400 text-sm">Total Devices</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-success-400">{summary.onlineDevices}</div>
          <div className="text-neutral-400 text-sm">Online Devices</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-error-400">{summary.criticalAlerts}</div>
          <div className="text-neutral-400 text-sm">Critical Alerts</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning-400">{summary.averageLatency.toFixed(1)} ms</div>
          <div className="text-neutral-400 text-sm">Avg. Latency</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{summary.networkUptime.toFixed(2)}%</div>
          <div className="text-neutral-400 text-sm">Network Uptime</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Bandwidth (Inbound)</h2>
          <MetricChart data={network.bandwidth.inbound} title="Inbound" color="#3b82f6" unit=" Mbps" height={220} />
        </div>
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Bandwidth (Outbound)</h2>
          <MetricChart data={network.bandwidth.outbound} title="Outbound" color="#6366f1" unit=" Mbps" height={220} />
        </div>
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Latency</h2>
          <MetricChart data={network.latency} title="Latency" color="#f59e42" unit=" ms" height={220} />
        </div>
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Packet Loss</h2>
          <MetricChart data={network.packetLoss} title="Packet Loss" color="#ef4444" unit=" %" height={220} />
        </div>
        <div className="glass-effect rounded-lg p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-2">Availability</h2>
          <MetricChart data={network.availability} title="Availability" color="#10b981" unit=" %" height={220} />
        </div>
      </div>
      <div className="text-right text-xs text-neutral-500 mt-2">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>
    </div>
  )
}

export default MonitoringDashboard 