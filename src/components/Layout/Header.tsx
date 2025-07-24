import React from 'react'
import { motion } from 'framer-motion'
import {
  Menu,
  Bell,
  Search,
  User,
  RefreshCw,
  Wifi,
  Shield,
  Clock,
  LogOut
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { data: monitoringData } = useSelector((state: RootState) => state.monitoring)
  const { alerts } = useSelector((state: RootState) => state.alerts)
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'critical' && !alert.resolved
  ).length

  const currentTime = new Date().toLocaleTimeString()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'System Administrator'
      case 'engineer': return 'Network Manager'
      case 'viewer': return 'Network Analyst'
      default: return 'User'
    }
  }

  return (
    <header className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-neutral-400" />
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-success-400" />
            <span className="text-sm text-neutral-300">
              {monitoringData.summary.onlineDevices}/{monitoringData.summary.totalDevices} Online
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-neutral-300">
              Network Secure
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search devices, alerts..."
            className="bg-neutral-700 border border-neutral-600 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-primary-500 w-64"
          />
        </div>

        {/* Refresh */}
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-neutral-400" />
        </motion.button>

        {/* Alerts */}
        <div className="relative">
          <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4 text-neutral-400" />
            {criticalAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {criticalAlerts}
              </motion.span>
            )}
          </button>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <Clock className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-200 capitalize">{user?.username || 'User'}</p>
            <p className="text-xs text-neutral-400">{user ? getRoleDisplayName(user.role) : 'Unknown Role'}</p>
          </div>
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-neutral-400 hover:text-neutral-200" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header