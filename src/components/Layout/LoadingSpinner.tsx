import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, Network } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-neutral-900/95 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated Network Icons */}
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className={`${sizeClasses[size]} border-2 border-primary-500/30 rounded-full`} />
          </motion.div>
          
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1"
          >
            <div className={`${sizeClasses[size]} border-2 border-primary-400/50 rounded-full border-dashed`} style={{
              width: size === 'xl' ? '3.5rem' : size === 'lg' ? '2.5rem' : size === 'md' ? '1.5rem' : '1rem',
              height: size === 'xl' ? '3.5rem' : size === 'lg' ? '2.5rem' : size === 'md' ? '1.5rem' : '1rem'
            }} />
          </motion.div>
          
          {/* Center icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Network className={`${
              size === 'xl' ? 'w-6 h-6' : 
              size === 'lg' ? 'w-5 h-5' : 
              size === 'md' ? 'w-4 h-4' : 'w-3 h-3'
            } text-primary-400`} />
          </motion.div>
          
          {/* Pulsing dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="absolute w-1 h-1 bg-primary-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateY(-${
                  size === 'xl' ? '2rem' : 
                  size === 'lg' ? '1.5rem' : 
                  size === 'md' ? '1rem' : '0.75rem'
                })`
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-center"
        >
          <p className="text-white font-medium mb-1">{message}</p>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1 h-1 bg-primary-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Activity indicators */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Activity className="w-4 h-4 text-success-400" />
          </motion.div>
          <motion.div
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <Zap className="w-4 h-4 text-warning-400" />
          </motion.div>
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <Network className="w-4 h-4 text-primary-400" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner 