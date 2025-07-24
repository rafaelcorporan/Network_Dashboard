import React from 'react'
import { motion } from 'framer-motion'
import NetworkTopologyDashboard from '@/components/NetworkTopology/NetworkTopologyDashboard'
import ErrorBoundary from '@/components/Layout/ErrorBoundary'

const NetworkTopology: React.FC = () => {
  console.log('🌐 NetworkTopology page rendering...')

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <NetworkTopologyDashboard />
      </motion.div>
    </ErrorBoundary>
  )
}

export default NetworkTopology