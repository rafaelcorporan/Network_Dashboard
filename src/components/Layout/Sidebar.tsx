import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Network,
  HardDrive,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigationItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary-400' },
  { path: '/topology', icon: Network, label: 'Network Topology', color: 'text-blue-400' },
  { path: '/devices', icon: HardDrive, label: 'Device Inventory', color: 'text-green-400' },
  { path: '/monitoring', icon: Activity, label: 'Monitoring', color: 'text-yellow-400' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts', color: 'text-red-400' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-400' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-neutral-400' },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-neutral-800 border-r border-neutral-700 z-40"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-700">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-lg font-bold text-white">NetMonitor</h1>
              <p className="text-xs text-neutral-400">Enterprise</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Indicator */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="status-indicator status-online"></div>
              <Zap className="w-4 h-4 text-success-400" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm"
              >
                <p className="text-success-400 font-medium">System Online</p>
                <p className="text-neutral-400 text-xs">All services operational</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar