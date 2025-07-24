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
  addAuditLog 
} from '@/store/slices/userManagementSlice'
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Shield, Building, CheckCircle, AlertCircle, Ban, Settings, UserPlus, Users } from 'lucide-react'
import UserProfileModal from './UserProfileModal'
import AccountCreationModal from './AccountProvisioning/AccountCreationModal'
import BulkAccountCreation from './AccountProvisioning/BulkAccountCreation'

const LocalAdminUserManagement: React.FC = () => {
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

  // Filter to show only local admin users
  const localAdminUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role === 'localAdmin')
  }, [filteredUsers])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    return localAdminUsers.slice(startIndex, startIndex + pagination.pageSize)
  }, [localAdminUsers, pagination])

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
      action: 'localadmin_status_changed',
      details: { newStatus },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400'
      case 'suspended': return 'text-warning-400'
      case 'disabled': return 'text-error-400'
      default: return 'text-neutral-400'
    }
  }

  const canManageLocalAdmins = currentUserRole === 'developer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Local Administrator Users</h3>
          <p className="text-sm text-neutral-400">Manage local administrators with organization-level privileges</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-400">
            {localAdminUsers.length} local admins found
          </div>
          {canManageLocalAdmins && (
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
                Create Local Admin
              </button>
            </>
          )}
        </div>
      </div>

      {/* Access Warning */}
      {!canManageLocalAdmins && (
        <div className="bg-warning-500/20 border border-warning-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-warning-400" />
            <span className="text-warning-400 font-medium">Limited Access</span>
          </div>
          <p className="text-warning-300 text-sm mt-1">
            Only developers can modify local administrator accounts. You have read-only access.
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search local admins by name, email..."
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

      {/* Local Admins Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                <button onClick={() => handleSort('firstName')} className="flex items-center gap-1 hover:text-white">
                  Name
                </button>
              </th>
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-white">
                  Email
                </button>
              </th>
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Organization</th>
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Admin Scope</th>
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Permissions</th>
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
                      <Shield className="w-4 h-4 text-purple-400" />
                      <Settings className="w-2 h-2 text-purple-300 absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-neutral-400">Local Administrator</div>
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
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-neutral-400" />
                    <span className="text-neutral-300">{user.organizationId || 'Global'}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                    Organization Level
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 3).map((permission, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-primary-600/20 text-primary-400 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                    {user.permissions.length > 3 && (
                      <span className="text-xs text-neutral-400">
                        +{user.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-400 text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewProfile(user)}
                      className="p-1 text-neutral-400 hover:text-primary-400 transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canManageLocalAdmins && (
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, localAdminUsers.length)} of {localAdminUsers.length} local admins
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
            Page {pagination.currentPage} of {Math.ceil(localAdminUsers.length / pagination.pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= Math.ceil(localAdminUsers.length / pagination.pageSize)}
            className="p-2 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
        preselectedRole="localAdmin"
      />

      {/* Bulk Account Creation Modal */}
      <BulkAccountCreation
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
      />
    </div>
  )
}

export default LocalAdminUserManagement 