import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import AlertsTable from '@/components/Alerts/AlertsTable'
import EnhancedLoadingSpinner from '@/components/Layout/EnhancedLoadingSpinner'

const Alerts: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { alerts } = useSelector((state: RootState) => state.alerts)

  useEffect(() => {
    // Simulate alerts loading
    const loadAlerts = async () => {
      setIsLoading(true)
      
      // Wait for alerts data to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsLoading(false)
    }

    loadAlerts()
  }, [])

  if (isLoading) {
    return (
      <div className="h-full">
        <EnhancedLoadingSpinner 
          size="xl" 
          message="Loading Network Alerts..." 
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
        <h1 className="text-3xl font-bold text-white">Network Alerts</h1>
        <p className="text-neutral-400 mt-1">
          Monitor and manage network alerts and notifications
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AlertsTable />
      </motion.div>
    </motion.div>
  )
}

export default Alerts