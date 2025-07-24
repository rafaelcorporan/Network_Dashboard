import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setMonitoringData } from '@/store/slices/monitoringSlice'
import { setAlerts } from '@/store/slices/alertsSlice'
import { setTopology } from '@/store/slices/networkSlice'
import MetricChart from '@/components/Charts/MetricChart'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Network,
  Server,
  Shield,
  TrendingUp,
  Wifi,
  Zap
} from 'lucide-react'
import { generateMockData } from '@/utils/mockData'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch()
  const { data: monitoringData } = useSelector((state: RootState) => state.monitoring)
  const { alerts } = useSelector((state: RootState) => state.alerts)
  const { topology } = useSelector((state: RootState) => state.network)

  useEffect(() => {
    // Initialize with mock data
    const mockData = generateMockData()
    dispatch(setMonitoringData(mockData.monitoring))
    dispatch(setAlerts(mockData.alerts))
    dispatch(setTopology(mockData.topology))

    // Set up real-time updates
    const interval = setInterval(() => {
      const updatedData = generateMockData()
      dispatch(setMonitoringData(updatedData.monitoring))
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'critical' && !alert.resolved
  ).length

  const warningAlerts = alerts.filter(alert => 
    alert.severity === 'warning' && !alert.resolved
  ).length

  const metrics = [
    {
      title: 'Network Uptime',
      value: `${monitoringData.summary.networkUptime.toFixed(2)}%`,
      change: '+0.12%',
      trend: 'up',
      icon: Wifi,
      color: 'text-success-400',
      bgColor: 'bg-success-500/10'
    },
    {
      title: 'Active Devices',
      value: `${monitoringData.summary.onlineDevices}/${monitoringData.summary.totalDevices}`,
      change: '+2',
      trend: 'up',
      icon: Server,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10'
    },
    {
      title: 'Avg Latency',
      value: `${monitoringData.summary.averageLatency.toFixed(1)}ms`,
      change: '-2.3ms',
      trend: 'down',
      icon: Activity,
      color: 'text-warning-400',
      bgColor: 'bg-warning-500/10'
    },
    {
      title: 'Critical Alerts',
      value: criticalAlerts.toString(),
      change: criticalAlerts > 0 ? `+${criticalAlerts}` : '0',
      trend: criticalAlerts > 0 ? 'up' : 'neutral',
      icon: AlertTriangle,
      color: criticalAlerts > 0 ? 'text-error-400' : 'text-success-400',
      bgColor: criticalAlerts > 0 ? 'bg-error-500/10' : 'bg-success-500/10'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Network Dashboard</h1>
          <p className="text-neutral-400 mt-1">
            Real-time monitoring and analytics for your enterprise network
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="metric-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-success-400' : 
                metric.trend === 'down' ? 'text-error-400' : 'text-neutral-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${
                  metric.trend === 'down' ? 'rotate-180' : ''
                }`} />
                <span>{metric.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-neutral-400 text-sm">{metric.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Traffic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Network Traffic</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-xs text-neutral-400">Inbound</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-xs text-neutral-400">Outbound</span>
              </div>
            </div>
          </div>
          <MetricChart
            data={monitoringData.network.bandwidth.inbound}
            title="Inbound Traffic"
            color="#3b82f6"
            unit=" Mbps"
            height={250}
          />
        </motion.div>

        {/* Latency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Network Latency</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Activity className="w-4 h-4" />
              <span>Real-time</span>
            </div>
          </div>
          <MetricChart
            data={monitoringData.network.latency}
            title="Latency"
            color="#f59e0b"
            unit="ms"
            height={250}
          />
        </motion.div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-warning-400" />
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === 'critical' ? 'bg-error-500' :
                  alert.severity === 'warning' ? 'bg-warning-500' :
                  'bg-primary-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{alert.title}</p>
                  <p className="text-xs text-neutral-400">{alert.source}</p>
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Network Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Network Health</h3>
            <Shield className="w-5 h-5 text-success-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Core Network</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-400" />
                <span className="text-sm text-success-400">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Security</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-400" />
                <span className="text-sm text-success-400">Secure</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Performance</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-400" />
                <span className="text-sm text-warning-400">Degraded</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Backup Systems</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-400" />
                <span className="text-sm text-success-400">Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="metric-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
            <Network className="w-5 h-5 text-primary-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Total Bandwidth</span>
              <span className="text-sm font-medium text-white">10 Gbps</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Peak Usage</span>
              <span className="text-sm font-medium text-white">7.2 Gbps</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Data Centers</span>
              <span className="text-sm font-medium text-white">3 Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Redundancy</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-success-400" />
                <span className="text-sm font-medium text-success-400">99.9%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard