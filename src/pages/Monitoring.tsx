import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import MonitoringDashboard from '@/components/Monitoring/MonitoringDashboard'
import EnhancedLoadingSpinner from '@/components/Layout/EnhancedLoadingSpinner'

const Monitoring: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { topology } = useSelector((state: RootState) => state.network)

  useEffect(() => {
    // Simulate monitoring system initialization
    const initializeMonitoring = async () => {
      setIsLoading(true)
      
      // Wait for network data and monitoring setup
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setIsLoading(false)
    }

    initializeMonitoring()
  }, [])

  if (isLoading) {
    return (
      <div className="h-full">
        <EnhancedLoadingSpinner 
          size="xl" 
          message="Initializing Real-time Monitoring..." 
          fullScreen={false}
          variant="neural"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold text-white">Real-time Monitoring</h1>
        <p className="text-neutral-400 mt-1">
          Live network performance metrics and system health monitoring
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MonitoringDashboard />
      </motion.div>
    </motion.div>
  )
}

export default Monitoring