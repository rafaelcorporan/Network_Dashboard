import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { 
  setFilters, 
  setSorting, 
  setPagination, 
  setSelectedUser, 
  updateUserStatus, 
  updateUserMembership,
  addAuditLog 
} from '@/store/slices/userManagementSlice'
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Ban, CheckCircle, AlertCircle, UserPlus, Users } from 'lucide-react'
import UserProfileModal from './UserProfileModal'
import AccountCreationModal from './AccountProvisioning/AccountCreationModal'
import BulkAccountCreation from './AccountProvisioning/BulkAccountCreation'

const ClientUserManagement: React.FC = () => {
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

  // Filter to show only client users
  const clientUsers = useMemo(() => {
    return filteredUsers.filter(user => user.role === 'client')
  }, [filteredUsers])

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    return clientUsers.slice(startIndex, startIndex + pagination.pageSize)
  }, [clientUsers, pagination])

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

  const handleMembershipFilter = (membership: string) => {
    const currentMemberships = filters.membershipType
    const newMemberships = currentMemberships.includes(membership as any)
      ? currentMemberships.filter(m => m !== membership)
      : [...currentMemberships, membership as any]
    dispatch(setFilters({ membershipType: newMemberships }))
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
      action: 'status_changed',
      details: { newStatus },
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent
    }))
  }

  const handleMembershipChange = (userId: string, newMembership: string) => {
    dispatch(updateUserMembership({ userId, membershipType: newMembership as any }))
    dispatch(addAuditLog({
      id: `audit-${Date.now()}`,
      userId,
      adminId: 'current-admin',
      adminName: 'Current Admin',
      action: 'membership_updated',
      details: { newMembership },
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

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'enterprise': return 'text-purple-400'
      case 'premium': return 'text-blue-400'
      case 'basic': return 'text-green-400'
      default: return 'text-neutral-400'
    }
  }

  const canManageUsers = ['developer', 'localAdmin', 'manager'].includes(currentUserRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Client Users</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-400">
            {clientUsers.length} users found
          </div>
          {canManageUsers && (
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
                Create Account
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
            placeholder="Search by name, email..."
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

        {/* Membership Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Plan:</span>
          {['basic', 'premium', 'enterprise'].map(plan => (
            <button
              key={plan}
              onClick={() => handleMembershipFilter(plan)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filters.membershipType.includes(plan as any)
                  ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                  : 'border-neutral-700 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
              <th className="text-left py-3 px-4 text-neutral-400 font-medium">Membership</th>
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
                  <div>
                    <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-neutral-400">{user.organizationId}</div>
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
                  <span className={`${getMembershipColor(user.membershipType)} font-medium`}>
                    {user.membershipType}
                  </span>
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
                    {canManageUsers && (
                      <>
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <select
                          value={user.membershipType}
                          onChange={(e) => handleMembershipChange(user.id, e.target.value)}
                          className="text-xs bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </>
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
          Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, clientUsers.length)} of {clientUsers.length} users
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
            Page {pagination.currentPage} of {Math.ceil(clientUsers.length / pagination.pageSize)}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= Math.ceil(clientUsers.length / pagination.pageSize)}
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
        preselectedRole="client"
      />

      {/* Bulk Account Creation Modal */}
      <BulkAccountCreation
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
      />
    </div>
  )
}

export default ClientUserManagement 