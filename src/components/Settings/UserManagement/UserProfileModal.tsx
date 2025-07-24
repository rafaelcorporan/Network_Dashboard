import React, { useState } from 'react'
import { UserProfile } from '@/store/slices/userManagementSlice'
import { X, User, CreditCard, Shield, Activity, MapPin, Phone, Mail, Calendar, Server } from 'lucide-react'

interface UserProfileModalProps {
  user: UserProfile
  onClose: () => void
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'usage' | 'billing' | 'permissions' | 'sessions'>('profile')

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'usage' as const, label: 'Usage', icon: Activity },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'permissions' as const, label: 'Permissions', icon: Shield },
    { id: 'sessions' as const, label: 'Sessions', icon: Server }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">First Name</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            {user.firstName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Last Name</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            {user.lastName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400" />
            {user.email}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Phone</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-neutral-400" />
            {user.phone || 'Not provided'}
          </div>
        </div>
      </div>

      {/* Address */}
      {user.address && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Address</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex items-start gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
            <div>
              <div>{user.address.street}</div>
              <div>{user.address.city}, {user.address.state} {user.address.zipCode}</div>
              <div>{user.address.country}</div>
            </div>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            <span className="capitalize">{user.role}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
            <span className={`capitalize ${
              user.status === 'active' ? 'text-success-400' :
              user.status === 'suspended' ? 'text-warning-400' :
              'text-error-400'
            }`}>
              {user.status}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Membership</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
            <span className={`capitalize ${
              user.membershipType === 'enterprise' ? 'text-purple-400' :
              user.membershipType === 'premium' ? 'text-blue-400' :
              'text-green-400'
            }`}>
              {user.membershipType}
            </span>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Registration Date</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            {new Date(user.registrationDate).toLocaleDateString()}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Last Login</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Last Activity</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Communication Preferences</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(user.communicationPreferences).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${value ? 'bg-success-400' : 'bg-neutral-600'}`} />
              <span className="text-sm text-neutral-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary-400">{user.usageMetrics.dataConsumption}</div>
          <div className="text-sm text-neutral-400">GB Data Used</div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-success-400">{user.usageMetrics.monitoredEntities}</div>
          <div className="text-sm text-neutral-400">Monitored Entities</div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{user.usageMetrics.uptimePercentage.toFixed(2)}%</div>
          <div className="text-sm text-neutral-400">Uptime</div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-warning-400">{user.usageMetrics.apiCalls.toLocaleString()}</div>
          <div className="text-sm text-neutral-400">API Calls</div>
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      {user.billingInfo ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Subscription Status</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                <span className={`capitalize ${
                  user.billingInfo.subscriptionStatus === 'active' ? 'text-success-400' :
                  user.billingInfo.subscriptionStatus === 'trial' ? 'text-blue-400' :
                  'text-error-400'
                }`}>
                  {user.billingInfo.subscriptionStatus}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Subscription Plan</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
                {user.billingInfo.subscriptionPlan}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Next Billing Date</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
                {user.billingInfo.nextBillingDate ? new Date(user.billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-neutral-400">
          No billing information available
        </div>
      )}
    </div>
  )

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Assigned Permissions</label>
        <div className="bg-neutral-800 border border-neutral-700 rounded p-4">
          {user.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-sm"
                >
                  {permission}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-neutral-400">No permissions assigned</div>
          )}
        </div>
      </div>

      {user.organizationId && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Organization</label>
          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
            {user.organizationId}
          </div>
        </div>
      )}

      {user.teamIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Teams</label>
          <div className="flex flex-wrap gap-2">
            {user.teamIds.map((teamId, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-sm"
              >
                {teamId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderSessionsTab = () => (
    <div className="space-y-6">
      {user.sessionInfo ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Active Sessions</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
                {user.sessionInfo.currentSessions}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Last IP Address</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white font-mono">
                {user.sessionInfo.lastIpAddress}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Device Info</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white">
                {user.sessionInfo.deviceInfo}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">API Keys</label>
            <div className="space-y-2">
              {user.apiKeys.map((key, index) => (
                <div key={index} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white font-mono text-sm">
                  {key}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-neutral-400">
          No session information available
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab()
      case 'usage': return renderUsageTab()
      case 'billing': return renderBillingTab()
      case 'permissions': return renderPermissionsTab()
      case 'sessions': return renderSessionsTab()
      default: return renderProfileTab()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-neutral-400">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal 