import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { 
  Settings, 
  Monitor, 
  Bell, 
  User, 
  Save, 
  RotateCcw, 
  Users,
  Shield
} from 'lucide-react'
import UserManagementDashboard from './UserManagement/UserManagementDashboard'

const SettingsPanel: React.FC = () => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState<'userManagement' | 'general' | 'monitoring' | 'notifications' | 'account'>('userManagement')

  // Mock settings state
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    refreshInterval: 30,
    realTimeUpdates: true,
    emailNotifications: true,
    soundNotifications: false,
    pushNotifications: true
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Mock save functionality
    console.log('Settings saved:', settings)
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    // Mock reset functionality
    setSettings({
      theme: 'dark',
      language: 'en',
      refreshInterval: 30,
      realTimeUpdates: true,
      emailNotifications: true,
      soundNotifications: false,
      pushNotifications: true
    })
    alert('Settings reset to defaults!')
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const tabs = [
    { id: 'userManagement' as const, label: 'User Management', icon: Users },
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'monitoring' as const, label: 'Monitoring', icon: Monitor },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'account' as const, label: 'Account', icon: User }
  ]

  const renderUserManagementTab = () => (
    <UserManagementDashboard />
  )

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Monitoring Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <select
              value={settings.refreshInterval}
              onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Real-time Updates
              </label>
              <p className="text-xs text-neutral-400">
                Enable real-time data updates
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('realTimeUpdates', !settings.realTimeUpdates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.realTimeUpdates ? 'bg-primary-600' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.realTimeUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Email Notifications
              </label>
              <p className="text-xs text-neutral-400">
                Receive alerts via email
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-primary-600' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Sound Notifications
              </label>
              <p className="text-xs text-neutral-400">
                Play sound for alerts
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('soundNotifications', !settings.soundNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundNotifications ? 'bg-primary-600' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Push Notifications
              </label>
              <p className="text-xs text-neutral-400">
                Browser push notifications
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pushNotifications ? 'bg-primary-600' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        
        <div className="space-y-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Admin User</div>
                <div className="text-neutral-400 text-sm">admin@netmonitor.com</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-700">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'userManagement':
        return renderUserManagementTab()
      case 'general':
        return renderGeneralTab()
      case 'monitoring':
        return renderMonitoringTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'account':
        return renderAccountTab()
      default:
        return renderUserManagementTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-neutral-700">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Action Buttons - Only show for non-user management tabs */}
      {activeTab !== 'userManagement' && activeTab !== 'account' && (
        <div className="flex items-center gap-4 pt-6 border-t border-neutral-700">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  )
}

export default SettingsPanel 