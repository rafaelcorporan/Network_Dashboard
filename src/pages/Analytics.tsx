import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard'
import EnhancedLoadingSpinner from '@/components/Layout/EnhancedLoadingSpinner'

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { topology } = useSelector((state: RootState) => state.network)

  useEffect(() => {
    // Simulate data loading and processing
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      // Wait for network data to be available
      if (topology.devices.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        await new Promise(resolve => setTimeout(resolve, 400))
      }
      
      setIsLoading(false)
    }

    loadAnalytics()
  }, [topology.devices.length])

  if (isLoading) {
    return (
      <div className="h-full">
        <EnhancedLoadingSpinner 
          size="xl" 
          message="Analyzing Network Data..." 
          fullScreen={false}
          variant="morphing"
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
        <h1 className="text-3xl font-bold text-white">Network Analytics</h1>
        <p className="text-neutral-400 mt-1">
          Comprehensive network performance insights and trends
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnalyticsDashboard />
      </motion.div>
    </motion.div>
  )
}

export default Analytics