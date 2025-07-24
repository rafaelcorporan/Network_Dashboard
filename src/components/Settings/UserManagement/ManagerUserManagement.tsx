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
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Users, Shield, CheckCircle, AlertCircle, Ban, UserPlus, Users as UsersIcon } from 'lucide-react'
import UserProfileModal from './UserProfileModal'
import AccountCreationModal from './AccountProvisioning/AccountCreationModal'
import BulkAccountCreation from './AccountProvisioning/BulkAccountCreation'

const ManagerUserManagement: React.FC = () => {
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

  // Filter to show only manager users
  const managerUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role === 'manager')
  }, [filteredUsers])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    return managerUsers.slice(startIndex, startIndex + pagination.pageSize)
  }, [managerUsers, pagination])

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
      action: 'manager_status_changed',
      details: { newStatus },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
  }

  const handlePermissionsUpdate = (userId: string, newPermissions: string[]) => {
    dispatch(updateUserPermissions({ userId, permissions: newPermissions }))
    dispatch(addAuditLog({
      id: `audit-${Date.now()}`,
      userId,
      adminId: 'current-admin',
      adminName: 'Current Admin',
      action: 'manager_permissions_updated',
      details: { newPermissions },
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

  const canManageManagers = ['developer', 'localAdmin'].includes(currentUserRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Manager Users</h3>
          <p className="text-sm text-neutral-400">Manage users with managerial roles and team oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-400">
            {managerUsers.length} managers found
          </div>
          {canManageManagers && (
            <>
              <button
                onClick={() => setShowBulkCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <UsersIcon className="w-4 h-4" />
                Bulk Create
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Create Manager
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search managers by name, email..."
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

      {/* Managers Table */}
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
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Teams</th>
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
                    <Shield className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-neutral-400">Manager</div>
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
                <td className="py-3 px-4 text-neutral-300">
                  {user.organizationId || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-neutral-400" />
                    <span className="text-sm text-neutral-300">{user.teamIds.length}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 2).map((permission, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-primary-600/20 text-primary-400 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                    {user.permissions.length > 2 && (
                      <span className="text-xs text-neutral-400">
                        +{user.permissions.length - 2}
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
                    {canManageManagers && (
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
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, managerUsers.length)} of {managerUsers.length} managers
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
            Page {pagination.currentPage} of {Math.ceil(managerUsers.length / pagination.pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= Math.ceil(managerUsers.length / pagination.pageSize)}
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
        preselectedRole="manager"
      />

      {/* Bulk Account Creation Modal */}
      <BulkAccountCreation
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
      />
    </div>
  )
}

export default ManagerUserManagement 