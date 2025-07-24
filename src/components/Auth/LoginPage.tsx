import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Network, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Lock, 
  Monitor,
  Users,
  Settings,
  Zap
} from 'lucide-react'
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice'
import type { User } from '../../store/slices/authSlice'

const predefinedUsers: Record<string, User> = {
  'admin': {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@enterprise.com',
    role: 'admin',
    permissions: ['*'],
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      refreshInterval: 30000,
      defaultView: '/dashboard',
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  },
  'manager': {
    id: 'mgr-001',
    username: 'manager',
    email: 'manager@enterprise.com',
    role: 'engineer',
    permissions: ['view:dashboard', 'view:devices', 'manage:users', 'view:analytics'],
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'light',
      refreshInterval: 60000,
      defaultView: '/devices',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    }
  },
  'employee': {
    id: 'emp-001',
    username: 'employee',
    email: 'employee@enterprise.com',
    role: 'viewer',
    permissions: ['view:dashboard', 'view:devices'],
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: 'light',
      refreshInterval: 120000,
      defaultView: '/dashboard',
      notifications: {
        email: false,
        push: false,
        sms: false
      }
    }
  }
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    dispatch(loginStart())

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const user = predefinedUsers[username.toLowerCase()]
    if (user && password === 'Aa1234567$$$') {
      const token = `token_${user.id}_${Date.now()}`
      dispatch(loginSuccess({ user, token }))
      navigate('/dashboard')
    } else {
      setError('Invalid credentials. Please try again.')
      dispatch(loginFailure('Invalid credentials'))
    }
    
    setIsLoading(false)
  }

  const handleDemoLogin = (userType: string) => {
    setUsername(userType)
    setPassword('Aa1234567$$$')
    setSelectedDemo(userType)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const demoUsers = [
    {
      type: 'admin',
      title: 'System Administrator',
      icon: Shield,
      description: 'Full system access and configuration',
      color: 'from-red-500 to-red-600',
      permissions: ['All Permissions', 'User Management', 'System Config', 'Security Controls']
    },
    {
      type: 'manager',
      title: 'Network Manager',
      icon: Users,
      description: 'Team management and reporting',
      color: 'from-blue-500 to-blue-600',
      permissions: ['Dashboard Access', 'Device Management', 'Team Oversight', 'Analytics']
    },
    {
      type: 'employee',
      title: 'Network Analyst',
      icon: Monitor,
      description: 'View and monitor network status',
      color: 'from-green-500 to-green-600',
      permissions: ['Dashboard View', 'Device Monitoring', 'Basic Reports', 'Alert Viewing']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding and Features */}
          <motion.div variants={itemVariants} className="text-white space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Enterprise Network Dashboard
                </h1>
              </div>
              <p className="text-xl text-slate-300 leading-relaxed">
                Comprehensive network monitoring and management platform for enterprise environments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-yellow-400" />
                <span className="text-slate-200">Real-time Monitoring</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                <Shield className="w-6 h-6 text-green-400" />
                <span className="text-slate-200">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="text-slate-200">User Management</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                <Settings className="w-6 h-6 text-purple-400" />
                <span className="text-slate-200">Advanced Analytics</span>
              </div>
            </div>

            {/* Demo User Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Demo User Accounts</h3>
              <div className="grid gap-3">
                {demoUsers.map((demo) => {
                  const Icon = demo.icon
                  return (
                    <motion.button
                      key={demo.type}
                      onClick={() => handleDemoLogin(demo.type)}
                      className={`p-4 rounded-lg bg-gradient-to-r ${demo.color} bg-opacity-20 border border-white/10 hover:border-white/20 transition-all duration-200 text-left group ${
                        selectedDemo === demo.type ? 'ring-2 ring-white/30' : ''
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-white" />
                        <div className="flex-1">
                          <div className="font-semibold text-white">{demo.title}</div>
                          <div className="text-sm text-slate-300">{demo.description}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {demo.permissions.slice(0, 2).map((permission) => (
                          <span key={permission} className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                            {permission}
                          </span>
                        ))}
                        {demo.permissions.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-white">
                            +{demo.permissions.length - 2} more
                          </span>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div variants={itemVariants} className="w-full max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-300">Sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage