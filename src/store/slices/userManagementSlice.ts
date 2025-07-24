import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'client' | 'manager' | 'localAdmin' | 'developer'
export type UserStatus = 'active' | 'disabled' | 'suspended' | 'deleted'
export type MembershipType = 'basic' | 'premium' | 'enterprise' | 'custom'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  role: UserRole
  status: UserStatus
  membershipType: MembershipType
  organizationId?: string
  teamIds: string[]
  permissions: string[]
  registrationDate: string
  lastLogin?: string
  lastActivity?: string
  usageMetrics: {
    dataConsumption: number
    monitoredEntities: number
    uptimePercentage: number
    apiCalls: number
  }
  communicationPreferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    securityAlerts: boolean
  }
  billingInfo?: {
    subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trial'
    nextBillingDate?: string
    subscriptionPlan: string
  }
  apiKeys: string[]
  sessionInfo?: {
    currentSessions: number
    lastIpAddress: string
    deviceInfo: string
  }
}

export interface AuditLog {
  id: string
  userId: string
  adminId: string
  adminName: string
  action: string
  details: Record<string, any>
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface UserFilters {
  role: UserRole[]
  status: UserStatus[]
  membershipType: MembershipType[]
  organizationId: string[]
  dateRange: {
    start?: string
    end?: string
    field: 'registrationDate' | 'lastLogin' | 'lastActivity'
  }
  searchTerm: string
}

interface UserManagementState {
  users: UserProfile[]
  filteredUsers: UserProfile[]
  selectedUser: UserProfile | null
  filters: UserFilters
  auditLogs: AuditLog[]
  pagination: {
    currentPage: number
    pageSize: number
    totalUsers: number
    totalPages: number
  }
  sorting: {
    field: keyof UserProfile
    direction: 'asc' | 'desc'
  }
  isLoading: boolean
  error: string | null
  currentUserRole: UserRole
}

const initialState: UserManagementState = {
  users: [],
  filteredUsers: [],
  selectedUser: null,
  filters: {
    role: [],
    status: [],
    membershipType: [],
    organizationId: [],
    dateRange: {
      field: 'registrationDate'
    },
    searchTerm: ''
  },
  auditLogs: [],
  pagination: {
    currentPage: 1,
    pageSize: 25,
    totalUsers: 0,
    totalPages: 0
  },
  sorting: {
    field: 'registrationDate',
    direction: 'desc'
  },
  isLoading: false,
  error: null,
  currentUserRole: 'developer' // Mock as developer for demo
}

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserProfile[]>) => {
      state.users = action.payload
      state.filteredUsers = applyFilters(action.payload, state.filters, state.sorting)
      updatePagination(state)
      state.isLoading = false
      state.error = null
    },
    addUser: (state, action: PayloadAction<UserProfile>) => {
      state.users.unshift(action.payload)
      state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
      updatePagination(state)
    },
    updateUser: (state, action: PayloadAction<UserProfile>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
        state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload
        }
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload)
      state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
      updatePagination(state)
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null
      }
    },
    updateUserStatus: (state, action: PayloadAction<{ userId: string; status: UserStatus }>) => {
      const user = state.users.find(u => u.id === action.payload.userId)
      if (user) {
        user.status = action.payload.status
        state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser = user
        }
      }
    },
    updateUserMembership: (state, action: PayloadAction<{ userId: string; membershipType: MembershipType }>) => {
      const user = state.users.find(u => u.id === action.payload.userId)
      if (user) {
        user.membershipType = action.payload.membershipType
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser = user
        }
      }
    },
    updateUserPermissions: (state, action: PayloadAction<{ userId: string; permissions: string[] }>) => {
      const user = state.users.find(u => u.id === action.payload.userId)
      if (user) {
        user.permissions = action.payload.permissions
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser = user
        }
      }
    },
    setSelectedUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.selectedUser = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
      state.pagination.currentPage = 1
      updatePagination(state)
    },
    setSorting: (state, action: PayloadAction<{ field: keyof UserProfile; direction: 'asc' | 'desc' }>) => {
      state.sorting = action.payload
      state.filteredUsers = applyFilters(state.users, state.filters, state.sorting)
    },
    setPagination: (state, action: PayloadAction<{ currentPage: number; pageSize: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    addAuditLog: (state, action: PayloadAction<AuditLog>) => {
      state.auditLogs.unshift(action.payload)
    },
    setAuditLogs: (state, action: PayloadAction<AuditLog[]>) => {
      state.auditLogs = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setCurrentUserRole: (state, action: PayloadAction<UserRole>) => {
      state.currentUserRole = action.payload
    }
  }
})

function applyFilters(users: UserProfile[], filters: UserFilters, sorting: UserManagementState['sorting']): UserProfile[] {
  let filtered = users.filter(user => {
    // Role filter
    if (filters.role.length > 0 && !filters.role.includes(user.role)) {
      return false
    }
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(user.status)) {
      return false
    }
    // Membership type filter
    if (filters.membershipType.length > 0 && !filters.membershipType.includes(user.membershipType)) {
      return false
    }
    // Organization filter
    if (filters.organizationId.length > 0 && user.organizationId && !filters.organizationId.includes(user.organizationId)) {
      return false
    }
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const searchableText = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase()
      if (!searchableText.includes(searchLower)) {
        return false
      }
    }
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const dateField = user[filters.dateRange.field] as string
      if (dateField) {
        const date = new Date(dateField)
        if (filters.dateRange.start && date < new Date(filters.dateRange.start)) {
          return false
        }
        if (filters.dateRange.end && date > new Date(filters.dateRange.end)) {
          return false
        }
      }
    }
    return true
  })

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sorting.field]
    const bValue = b[sorting.field]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sorting.direction === 'asc' ? comparison : -comparison
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue
      return sorting.direction === 'asc' ? comparison : -comparison
    }
    
    return 0
  })

  return filtered
}

function updatePagination(state: UserManagementState) {
  state.pagination.totalUsers = state.filteredUsers.length
  state.pagination.totalPages = Math.ceil(state.filteredUsers.length / state.pagination.pageSize)
}

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserMembership,
  updateUserPermissions,
  setSelectedUser,
  setFilters,
  setSorting,
  setPagination,
  addAuditLog,
  setAuditLogs,
  setLoading,
  setError,
  setCurrentUserRole
} = userManagementSlice.actions

export default userManagementSlice.reducer 