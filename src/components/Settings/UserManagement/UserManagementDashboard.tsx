import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setUsers, setAuditLogs, setCurrentUserRole } from '@/store/slices/userManagementSlice'
import { generateMockUserManagementData } from '@/utils/mockUserData'
import { Users, Shield, UserCheck, Code, Settings, Activity } from 'lucide-react'
import ClientUserManagement from './ClientUserManagement'
import ManagerUserManagement from './ManagerUserManagement'
import LocalAdminUserManagement from './LocalAdminUserManagement'
import DeveloperUserManagement from './DeveloperUserManagement'
import AuditLogViewer from './AuditLogViewer'

type ManagementPanel = 'clients' | 'managers' | 'localAdmins' | 'developers' | 'audit'

const UserManagementDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const { currentUserRole } = useSelector((state: RootState) => state.userManagement)
  const [activePanel, setActivePanel] = useState<ManagementPanel>('clients')

  useEffect(() => {
    // Load mock data
    const { users, auditLogs } = generateMockUserManagementData()
    dispatch(setUsers(users))
    dispatch(setAuditLogs(auditLogs))
  }, [dispatch])

  // Role-based access control
  const hasAccessToPanel = (panel: ManagementPanel): boolean => {
    switch (currentUserRole) {
      case 'developer':
        return true // Developers have access to all panels
      case 'localAdmin':
        return ['clients', 'managers', 'audit'].includes(panel)
      case 'manager':
        return ['clients'].includes(panel)
      default:
        return false
    }
  }

  const availablePanels = [
    { id: 'clients' as ManagementPanel, label: 'Client Users', icon: Users, description: 'Manage client user accounts' },
    { id: 'managers' as ManagementPanel, label: 'Manager Users', icon: UserCheck, description: 'Manage manager accounts' },
    { id: 'localAdmins' as ManagementPanel, label: 'Local Admins', icon: Shield, description: 'Manage local administrator accounts' },
    { id: 'developers' as ManagementPanel, label: 'Developers', icon: Code, description: 'Manage developer accounts (Developer access only)' },
    { id: 'audit' as ManagementPanel, label: 'Audit Logs', icon: Activity, description: 'View audit trail and system logs' }
  ].filter(panel => hasAccessToPanel(panel.id))

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'clients':
        return <ClientUserManagement />
      case 'managers':
        return <ManagerUserManagement />
      case 'localAdmins':
        return <LocalAdminUserManagement />
      case 'developers':
        return <DeveloperUserManagement />
      case 'audit':
        return <AuditLogViewer />
      default:
        return <ClientUserManagement />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-neutral-400">
            Manage user accounts, permissions, and access control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Current Role:</span>
          <select
            className="bg-neutral-800 text-white rounded px-3 py-1 text-sm border border-neutral-700"
            value={currentUserRole}
            onChange={(e) => dispatch(setCurrentUserRole(e.target.value as any))}
          >
            <option value="client">Client</option>
            <option value="manager">Manager</option>
            <option value="localAdmin">Local Admin</option>
            <option value="developer">Developer</option>
          </select>
        </div>
      </div>

      {/* Access Control Warning */}
      {currentUserRole === 'client' && (
        <div className="bg-warning-500/20 border border-warning-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-warning-400" />
            <span className="text-warning-400 font-medium">Access Restricted</span>
          </div>
          <p className="text-warning-300 text-sm mt-1">
            You do not have sufficient permissions to access user management features.
          </p>
        </div>
      )}

      {/* Panel Navigation */}
      {availablePanels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {availablePanels.map((panel) => {
            const Icon = panel.icon
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                  activePanel === panel.id
                    ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                    : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-700/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{panel.label}</span>
                </div>
                <p className="text-xs text-neutral-400">{panel.description}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Active Panel Content */}
      {availablePanels.length > 0 && (
        <div className="glass-effect rounded-lg p-6">
          {renderActivePanel()}
        </div>
      )}
    </div>
  )
}

export default UserManagementDashboard 