import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  setFilters, 
  setSorting, 
  setPagination, 
  setSelectedUser, 
  updateUserStatus, 
  updateUserPermissions,
  deleteUser,
  addAuditLog 
} from '@/store/slices/userManagementSlice'
import { 
  Search, Filter, ChevronLeft, ChevronRight, Eye, Code, Terminal, 
  CheckCircle, AlertCircle, Ban, Trash2, UserX, Key, Shield, 
  AlertTriangle, Settings, Edit3, Copy, UserPlus, Users
} from 'lucide-react'
import UserProfileModal from './UserProfileModal'
import AccountCreationModal from './AccountProvisioning/AccountCreationModal'
import BulkAccountCreation from './AccountProvisioning/BulkAccountCreation'

const DeveloperUserManagement: React.FC = () => {
  const dispatch = useDispatch()
  const { 
    filteredUsers, 
    filters, 
    sorting, 
    pagination, 
    selectedUser, 
    currentUserRole 
  } = useSelector((state: RootState) => state.userManagement)

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm)
  const [showDangerousActions, setShowDangerousActions] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: string; userId: string } | null>(null)

  // Filter to show only developer users
  const developerUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role === 'developer')
  }, [filteredUsers])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    return developerUsers.slice(startIndex, startIndex + pagination.pageSize)
  }, [developerUsers, pagination])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    dispatch(setFilters({ searchTerm: term }))
  }

  const handleStatusFilter = (status: string) => {
    const currentStatuses = filters.status
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status as any]
    dispatch(setFilters({ status: newStatuses }))
  }

  const handleSort = (field: string) => {
    const newDirection = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc'
    dispatch(setSorting({ field: field as any, direction: newDirection }))
  }

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, currentPage: page }))
  }

  const handleViewProfile = (user: any) => {
    dispatch(setSelectedUser(user))
    setShowProfileModal(true)
  }

  const handleStatusChange = (userId: string, newStatus: string) => {
    dispatch(updateUserStatus({ userId, status: newStatus as any }))
    dispatch(addAuditLog({
      id: `audit-${Date.now()}`,
      userId,
      adminId: 'current-admin',
      adminName: 'Current Admin',
      action: 'developer_status_changed',
      details: { newStatus, severity: 'high' },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
  }

  const handleImpersonate = (userId: string) => {
    // Mock impersonation functionality
    dispatch(addAuditLog({
      id: `audit-${Date.now()}`,
      userId,
      adminId: 'current-admin',
      adminName: 'Current Admin',
      action: 'user_impersonation',
      details: { severity: 'critical', purpose: 'debugging' },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
    alert(`Impersonating user ${userId} (Mock functionality)`)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirmAction?.type === 'delete' && confirmAction.userId === userId) {
      dispatch(deleteUser(userId))
      dispatch(addAuditLog({
        id: `audit-${Date.now()}`,
        userId,
        adminId: 'current-admin',
        adminName: 'Current Admin',
        action: 'user_permanent_deletion',
        details: { severity: 'critical', irreversible: true },
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent
      }))
      setConfirmAction(null)
    } else {
      setConfirmAction({ type: 'delete', userId })
    }
  }

  const handleResetApiKeys = (userId: string) => {
    dispatch(addAuditLog({
      id: `audit-${Date.now()}`,
      userId,
      adminId: 'current-admin',
      adminName: 'Current Admin',
      action: 'api_keys_reset',
      details: { severity: 'high' },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
    alert(`API keys reset for user ${userId} (Mock functionality)`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400'
      case 'suspended': return 'text-warning-400'
      case 'disabled': return 'text-error-400'
      default: return 'text-neutral-400'
    }
  }

  const isDeveloper = currentUserRole === 'developer'

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-error-400" />
          <span className="text-error-400 font-medium">CRITICAL ACCESS LEVEL</span>
        </div>
        <p className="text-error-300 text-sm mt-1">
          This panel provides unrestricted access to all user accounts. All actions are logged and monitored. 
          Use extreme caution when performing any operations.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Developer User Management</h3>
          <p className="text-sm text-neutral-400">Complete administrative control over all platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-neutral-400">
            {developerUsers.length} developers found
          </div>
          {isDeveloper && (
            <>
              <button
                onClick={() => setShowBulkCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                Bulk Create
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Create Developer
              </button>
            </>
          )}
          <button
            onClick={() => setShowDangerousActions(!showDangerousActions)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              showDangerousActions
                ? 'bg-error-600/20 border-error-500 text-error-400'
                : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {showDangerousActions ? 'Hide' : 'Show'} Dangerous Actions
          </button>
        </div>
      </div>

      {/* Access Control */}
      {!isDeveloper && (
        <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-error-400" />
            <span className="text-error-400 font-medium">ACCESS DENIED</span>
          </div>
          <p className="text-error-300 text-sm mt-1">
            Developer user management requires Developer-level authentication. Access restricted.
          </p>
        </div>
      )}

      {isDeveloper && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search developers by name, email, ID..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-400">Status:</span>
              {['active', 'suspended', 'disabled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    filters.status.includes(status as any)
                      ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                      : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Developers Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    <button onClick={() => handleSort('firstName')} className="flex items-center gap-1 hover:text-white">
                      Developer
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-white">
                      Email
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">Access Level</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">API Keys</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    <button onClick={() => handleSort('lastLogin')} className="flex items-center gap-1 hover:text-white">
                      Last Login
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Code className="w-4 h-4 text-green-400" />
                          <Terminal className="w-2 h-2 text-green-300 absolute -bottom-0.5 -right-0.5" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-neutral-400 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 ${getStatusColor(user.status)}`}>
                        {user.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {user.status === 'suspended' && <AlertCircle className="w-3 h-3" />}
                        {user.status === 'disabled' && <Ban className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
                        FULL ACCESS
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-neutral-400" />
                        <span className="text-sm text-neutral-300">{user.apiKeys.length}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="p-1 text-neutral-400 hover:text-primary-400 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="disabled">Disabled</option>
                        </select>

                        {showDangerousActions && (
                          <>
                            <button
                              onClick={() => handleImpersonate(user.id)}
                              className="p-1 text-warning-400 hover:text-warning-300 transition-colors"
                              title="Impersonate User (DANGEROUS)"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleResetApiKeys(user.id)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Reset API Keys"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className={`p-1 transition-colors ${
                                confirmAction?.type === 'delete' && confirmAction.userId === user.id
                                  ? 'text-error-300 bg-error-500/20'
                                  : 'text-error-400 hover:text-error-300'
                              }`}
                              title={confirmAction?.type === 'delete' && confirmAction.userId === user.id ? 'Click again to confirm PERMANENT deletion' : 'Delete User (PERMANENT)'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dangerous Actions Warning */}
          {showDangerousActions && (
            <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-error-400 mt-0.5" />
                <div>
                  <div className="text-error-400 font-medium">Dangerous Actions Enabled</div>
                  <div className="text-error-300 text-sm mt-1">
                    <div>• <UserX className="w-3 h-3 inline" /> Impersonate: Log in as any user (leaves audit trail)</div>
                    <div>• <Key className="w-3 h-3 inline" /> Reset API Keys: Invalidate all user API keys</div>
                    <div>• <Trash2 className="w-3 h-3 inline" /> Delete: Permanently remove user (IRREVERSIBLE)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, developerUsers.length)} of {developerUsers.length} developers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-300">
                Page {pagination.currentPage} of {Math.ceil(developerUsers.length / pagination.pageSize)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= Math.ceil(developerUsers.length / pagination.pageSize)}
                className="p-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Account Creation Modal */}
      <AccountCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        preselectedRole="developer"
      />

      {/* Bulk Account Creation Modal */}
      <BulkAccountCreation
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
      />
    </div>
  )
}

export default DeveloperUserManagement 