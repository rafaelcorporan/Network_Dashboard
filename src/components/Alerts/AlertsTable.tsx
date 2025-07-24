import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import {
  setAlerts,
  acknowledgeAlert,
  resolveAlert,
  setFilters,
} from '@/store/slices/alertsSlice'
import { generateMockData } from '@/utils/mockData'
import { AlertTriangle, CheckCircle, Info, Shield, Activity, Server, Network, Filter, RefreshCw } from 'lucide-react'

const severityColors: Record<string, string> = {
  critical: 'text-error-400',
  warning: 'text-warning-400',
  info: 'text-blue-400',
  success: 'text-success-400',
}

const categoryIcons: Record<string, React.ReactNode> = {
  network: <Network className="w-4 h-4 text-primary-400" />,
  security: <Shield className="w-4 h-4 text-red-400" />,
  performance: <Activity className="w-4 h-4 text-yellow-400" />,
  system: <Server className="w-4 h-4 text-green-400" />,
}

const AlertsTable: React.FC = () => {
  const dispatch = useDispatch()
  const alerts = useSelector((state: RootState) => state.alerts.filteredAlerts)
  const filters = useSelector((state: RootState) => state.alerts.filters)
  const isLoading = useSelector((state: RootState) => state.alerts.isLoading)

  // Simulate real-time updates
  useEffect(() => {
    const { alerts } = generateMockData()
    dispatch(setAlerts(alerts))
    const interval = setInterval(() => {
      const { alerts } = generateMockData()
      dispatch(setAlerts(alerts))
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  const handleAcknowledge = (id: string) => {
    dispatch(acknowledgeAlert(id))
  }
  const handleResolve = (id: string) => {
    dispatch(resolveAlert(id))
  }

  const handleFilterChange = (type: 'severity' | 'category', value: string) => {
    const current = filters[type] as string[]
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    dispatch(setFilters({ [type]: newValues }))
  }

  const severities = ['critical', 'warning', 'info', 'success']
  const categories = ['network', 'security', 'performance', 'system']

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-400 text-sm">Severity:</span>
          {severities.map((sev) => (
            <button
              key={sev}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                filters.severity.includes(sev)
                  ? severityColors[sev] + ' border-current bg-neutral-800'
                  : 'text-neutral-400 border-neutral-700 hover:bg-neutral-800'
              }`}
              onClick={() => handleFilterChange('severity', sev)}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-sm">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                filters.category.includes(cat)
                  ? 'text-primary-400 border-current bg-neutral-800'
                  : 'text-neutral-400 border-neutral-700 hover:bg-neutral-800'
              }`}
              onClick={() => handleFilterChange('category', cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700 text-xs"
          onClick={() => {
            const { alerts } = generateMockData()
            dispatch(setAlerts(alerts))
          }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
      {/* Alerts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-700">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-neutral-800/30 divide-y divide-neutral-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-400">Loading alerts...</td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-neutral-400">No alerts found</td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-neutral-700/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 font-medium ${severityColors[alert.severity]}`}>
                      {alert.severity === 'critical' && <AlertTriangle className="w-4 h-4" />}
                      {alert.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-warning-400" />}
                      {alert.severity === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                      {alert.severity === 'success' && <CheckCircle className="w-4 h-4 text-success-400" />}
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{alert.title}</div>
                    <div className="text-xs text-neutral-400">{alert.description}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {categoryIcons[alert.category]}
                      {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-300 font-mono">{alert.source}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-400">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      alert.resolved
                        ? 'text-success-400'
                        : alert.acknowledged
                        ? 'text-warning-400'
                        : 'text-error-400'
                    }`}>
                      {alert.resolved
                        ? 'Resolved'
                        : alert.acknowledged
                        ? 'Acknowledged'
                        : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <button
                          className="px-2 py-1 rounded bg-warning-500/20 text-warning-400 text-xs font-medium hover:bg-warning-500/40"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </button>
                      )}
                      {!alert.resolved && (
                        <button
                          className="px-2 py-1 rounded bg-success-500/20 text-success-400 text-xs font-medium hover:bg-success-500/40"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AlertsTable 