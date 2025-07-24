import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, Network, Cpu, Database, Shield } from 'lucide-react'

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  progress?: number // 0-100
  variant?: 'quantum' | 'neural' | 'holographic' | 'morphing'
}

const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({ 
  size = 'lg', 
  message = 'Loading...', 
  fullScreen = false,
  progress = 0,
  variant = 'neural'
}) => {
  const [animationPhase, setAnimationPhase] = useState(0)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  // Generate particles for quantum effect
  useEffect(() => {
    const particleCount = size === 'xl' ? 12 : size === 'lg' ? 8 : 6
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.cos((i * 2 * Math.PI) / particleCount) * 40,
      y: Math.sin((i * 2 * Math.PI) / particleCount) * 40,
      delay: i * 0.1
    }))
    setParticles(newParticles)
  }, [size])

  // Animation phase cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sizeConfig = {
    sm: { container: 'w-16 h-16', icon: 'w-4 h-4', text: 'text-sm' },
    md: { container: 'w-24 h-24', icon: 'w-5 h-5', text: 'text-base' },
    lg: { container: 'w-32 h-32', icon: 'w-6 h-6', text: 'text-lg' },
    xl: { container: 'w-40 h-40', icon: 'w-8 h-8', text: 'text-xl' }
  }

  const config = sizeConfig[size]

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-neutral-900/98 backdrop-blur-md z-50 flex items-center justify-center'
    : 'flex items-center justify-center min-h-[400px] w-full'

  // Quantum Dot Animation
  const QuantumLoader = () => (
    <div className={`relative ${config.container}`}>
      <svg 
        viewBox="0 0 120 120" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }}
      >
        {/* Central core */}
        <motion.circle
          cx="60"
          cy="60"
          r="8"
          fill="url(#coreGradient)"
          animate={{
            r: [8, 12, 8],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Quantum particles */}
        {particles.map((particle) => (
          <motion.circle
            key={particle.id}
            cx="60"
            cy="60"
            r="3"
            fill="#3b82f6"
            animate={{
              x: [0, particle.x, 0],
              y: [0, particle.y, 0],
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Energy rings */}
        {[20, 35, 50].map((radius, i) => (
          <motion.circle
            key={i}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="1"
            strokeDasharray="5,5"
            animate={{
              rotate: [0, 360],
              strokeDashoffset: [0, -10]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Progress ring */}
        <motion.circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke="#1f2937"
          strokeWidth="2"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 55}`}
          strokeDashoffset={`${2 * Math.PI * 55 * (1 - progress / 100)}`}
          style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }}
        />
        
        {/* Gradients */}
        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <linearGradient id="ringGradient">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="progressGradient">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )

  // Neural Network Animation
  const NeuralLoader = () => (
    <div className={`relative ${config.container}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Neural nodes */}
        {[
          { x: 60, y: 30, size: 4 },
          { x: 30, y: 60, size: 6 },
          { x: 90, y: 60, size: 6 },
          { x: 45, y: 90, size: 4 },
          { x: 75, y: 90, size: 4 },
          { x: 60, y: 60, size: 8 }
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="#3b82f6"
            animate={{
              r: [node.size, node.size + 2, node.size],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Neural connections */}
        {[
          { x1: 60, y1: 30, x2: 30, y2: 60 },
          { x1: 60, y1: 30, x2: 90, y2: 60 },
          { x1: 30, y1: 60, x2: 60, y2: 60 },
          { x1: 90, y1: 60, x2: 60, y2: 60 },
          { x1: 60, y1: 60, x2: 45, y2: 90 },
          { x1: 60, y1: 60, x2: 75, y2: 90 }
        ].map((connection, i) => (
          <motion.line
            key={i}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            stroke="#3b82f6"
            strokeWidth="1"
            opacity="0.4"
            animate={{
              strokeDasharray: ["0,100", "50,50", "100,0"],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Data pulse */}
        <motion.circle
          cx="60"
          cy="60"
          r="2"
          fill="#10b981"
          animate={{
            r: [2, 20, 2],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </svg>
    </div>
  )

  // Morphing Shapes Animation
  const MorphingLoader = () => (
    <div className={`relative ${config.container}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.path
          d="M60,20 L100,60 L60,100 L20,60 Z"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          animate={{
            d: [
              "M60,20 L100,60 L60,100 L20,60 Z", // Diamond
              "M60,20 Q100,20 100,60 Q100,100 60,100 Q20,100 20,60 Q20,20 60,20 Z", // Circle
              "M20,40 L100,40 L100,80 L20,80 Z", // Rectangle
              "M60,20 L100,60 L60,100 L20,60 Z" // Back to diamond
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Inner morphing shape */}
        <motion.path
          d="M60,30 L80,60 L60,90 L40,60 Z"
          fill="url(#morphGradient)"
          animate={{
            d: [
              "M60,30 L80,60 L60,90 L40,60 Z",
              "M60,30 Q80,30 80,60 Q80,90 60,90 Q40,90 40,60 Q40,30 60,30 Z",
              "M40,50 L80,50 L80,70 L40,70 Z",
              "M60,30 L80,60 L60,90 L40,60 Z"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <defs>
          <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )

  const renderAnimation = () => {
    switch (variant) {
      case 'quantum': return <QuantumLoader />
      case 'neural': return <NeuralLoader />
      case 'morphing': return <MorphingLoader />
      default: return <NeuralLoader />
    }
  }

  return (
    <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-6">
        {/* Main Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {renderAnimation()}
        </motion.div>

        {/* Progress indicator */}
        {progress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className={`${config.text} font-bold text-primary-400 mb-2`}>
              {Math.round(progress)}%
            </div>
            <div className="w-48 h-1 bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Loading text with enhanced animation */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-center"
        >
          <p className={`text-white font-medium mb-2 ${config.text}`}>{message}</p>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 bg-primary-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Enhanced activity indicators */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { Icon: Database, color: 'text-blue-400', delay: 0 },
            { Icon: Network, color: 'text-green-400', delay: 0.3 },
            { Icon: Shield, color: 'text-purple-400', delay: 0.6 },
            { Icon: Cpu, color: 'text-yellow-400', delay: 0.9 }
          ].map(({ Icon, color, delay }, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              }}
            >
              <Icon className={`${config.icon} ${color}`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Accessibility text for screen readers */}
        <div className="sr-only">
          Loading content, please wait. {progress > 0 && `${Math.round(progress)}% complete.`}
        </div>
      </div>
    </div>
  )
}

export default EnhancedLoadingSpinner 