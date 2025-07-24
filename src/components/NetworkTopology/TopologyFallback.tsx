import React from 'react'
import { motion } from 'framer-motion'
import { Network, RefreshCw, Database, Settings } from 'lucide-react'

interface TopologyFallbackProps {
  onRetry?: () => void
  onGenerateData?: () => void
  message?: string
}

const TopologyFallback: React.FC<TopologyFallbackProps> = ({
  onRetry,
  onGenerateData,
  message = "Network topology visualization is currently unavailable"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex items-center justify-center bg-neutral-900"
    >
      <div className="text-center max-w-md mx-auto p-8">
        <div className="relative mb-6">
          <Network className="w-24 h-24 text-neutral-600 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-neutral-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          Topology Unavailable
        </h2>
        
        <p className="text-neutral-400 mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </button>
          )}
          
          {onGenerateData && (
            <button
              onClick={onGenerateData}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors mx-auto"
            >
              <Database className="w-4 h-4" />
              Generate Sample Data
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 mt-4">
            <Settings className="w-4 h-4" />
            <span>Check network configuration or try refreshing the page</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TopologyFallback 