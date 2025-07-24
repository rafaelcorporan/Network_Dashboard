import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon,
  Calendar, User, Shield, AlertTriangle, Info, Download, Eye, Clock
} from 'lucide-react'

const AuditLogViewer: React.FC = () => {
  const { auditLogs, currentUserRole } = useSelector((state: RootState) => state.userManagement)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string[]>([])
  const [severityFilter, setSeverityFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const searchableText = `${log.adminName} ${log.action} ${log.details?.targetUser || ''}`.toLowerCase()
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      // Action filter
      if (actionFilter.length > 0 && !actionFilter.includes(log.action)) {
        return false
      }

      // Severity filter (from details)
      if (severityFilter.length > 0) {
        const severity = log.details?.severity || 'low'
        if (!severityFilter.includes(severity)) {
          return false
        }
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const logDate = new Date(log.timestamp)
        if (dateRange.start && logDate < new Date(dateRange.start)) {
          return false
        }
        if (dateRange.end && logDate > new Date(dateRange.end)) {
          return false
        }
      }

      return true
    })
  }, [auditLogs, searchTerm, actionFilter, severityFilter, dateRange])

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredLogs.slice(startIndex, startIndex + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const handleActionFilter = (action: string) => {
    setActionFilter(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    )
  }

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    )
  }

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Admin', 'Action', 'Target User', 'IP Address', 'Severity', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.adminName,
        log.action,
        log.details?.targetUser || '',
        log.ipAddress,
        log.details?.severity || 'low',
        JSON.stringify(log.details).replace(/,/g, ';')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error-400'
      case 'high': return 'text-warning-400'
      case 'medium': return 'text-blue-400'
      case 'low': return 'text-success-400'
      default: return 'text-neutral-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Info className="w-4 h-4" />
      case 'low': return <Info className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('permanent')) return 'text-error-400'
    if (action.includes('status') || action.includes('suspend')) return 'text-warning-400'
    if (action.includes('create') || action.includes('add')) return 'text-success-400'
    if (action.includes('impersonation')) return 'text-purple-400'
    return 'text-primary-400'
  }

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))]
  const uniqueSeverities = ['critical', 'high', 'medium', 'low']

  const canViewAuditLogs = ['developer', 'localAdmin'].includes(currentUserRole)

  if (!canViewAuditLogs) {
    return (
      <div className="space-y-6">
        <div className="bg-warning-500/20 border border-warning-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-warning-400" />
            <span className="text-warning-400 font-medium">Access Restricted</span>
          </div>
          <p className="text-warning-300 text-sm mt-1">
            Audit log access requires Local Admin or Developer privileges.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Audit Logs</h3>
          <p className="text-sm text-neutral-400">View and analyze system audit trail</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            {filteredLogs.length} of {auditLogs.length} logs
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          <input
            type="date"
            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <input
            type="date"
            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>

        {/* Action Filter */}
        <div>
          <div className="text-sm text-neutral-400 mb-2">Actions:</div>
          <div className="flex flex-wrap gap-1">
            {uniqueActions.slice(0, 3).map(action => (
              <button
                key={action}
                onClick={() => handleActionFilter(action)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  actionFilter.includes(action)
                    ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                    : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {action.replace(/_/g, ' ')}
              </button>
            ))}
            {uniqueActions.length > 3 && (
              <span className="text-xs text-neutral-400 px-2 py-1">
                +{uniqueActions.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Severity Filter */}
        <div>
          <div className="text-sm text-neutral-400 mb-2">Severity:</div>
          <div className="flex flex-wrap gap-1">
            {uniqueSeverities.map(severity => (
              <button
                key={severity}
                onClick={() => handleSeverityFilter(severity)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                  severityFilter.includes(severity)
                    ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                    : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-2">
        {paginatedLogs.map((log) => {
          const isExpanded = expandedLogs.has(log.id)
          const severity = log.details?.severity || 'low'
          
          return (
            <div key={log.id} className="bg-neutral-800/50 rounded-lg border border-neutral-700">
              <div 
                className="p-4 cursor-pointer hover:bg-neutral-700/30 transition-colors"
                onClick={() => toggleLogExpansion(log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${getSeverityColor(severity)}`}>
                      {getSeverityIcon(severity)}
                      <span className="text-xs font-medium uppercase">{severity}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span className="text-sm text-neutral-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-neutral-400" />
                      <span className="text-sm text-neutral-300">{log.adminName}</span>
                    </div>

                    <div className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">{log.ipAddress}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Summary line */}
                <div className="mt-2 text-sm text-neutral-400">
                  {log.details?.targetUser && (
                    <span>Target: <span className="text-neutral-300">{log.details.targetUser}</span></span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-700">
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-400 font-medium">User ID</div>
                        <div className="text-neutral-300 font-mono">{log.userId}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 font-medium">Admin ID</div>
                        <div className="text-neutral-300 font-mono">{log.adminId}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 font-medium">User Agent</div>
                        <div className="text-neutral-300 text-xs truncate">{log.userAgent}</div>
                      </div>
                    </div>

                    {/* Details Object */}
                    <div>
                      <div className="text-neutral-400 font-medium mb-2">Details</div>
                      <div className="bg-neutral-900 rounded p-3 font-mono text-xs text-neutral-300 overflow-x-auto">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-neutral-300">
            Page {currentPage} of {Math.ceil(filteredLogs.length / pageSize)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredLogs.length / pageSize), prev + 1))}
            disabled={currentPage >= Math.ceil(filteredLogs.length / pageSize)}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditLogViewer 