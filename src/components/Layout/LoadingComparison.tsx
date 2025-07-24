import React, { useState } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import EnhancedLoadingSpinner from './EnhancedLoadingSpinner'

const LoadingComparison: React.FC = () => {
  const [progress, setProgress] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<'quantum' | 'neural' | 'morphing'>('neural')

  // Simulate progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0
        return prev + Math.random() * 10
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Loading Animation Comparison
        </h1>
        
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedVariant('neural')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedVariant === 'neural' 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Neural Network
          </button>
          <button
            onClick={() => setSelectedVariant('quantum')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedVariant === 'quantum' 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Quantum Dots
          </button>
          <button
            onClick={() => setSelectedVariant('morphing')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedVariant === 'morphing' 
                ? 'bg-primary-600 text-white' 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Morphing Shapes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Loading Spinner */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Original Loading Spinner
            </h2>
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner 
                size="xl" 
                message="Original Animation..." 
                fullScreen={false}
              />
            </div>
            <div className="mt-4 text-neutral-400 text-sm">
              <h3 className="font-medium text-white mb-2">Features:</h3>
              <ul className="space-y-1">
                <li>• Rotating rings and network icons</li>
                <li>• Pulsing dots in orbital patterns</li>
                <li>• Activity indicators</li>
                <li>• Basic animations</li>
              </ul>
            </div>
          </motion.div>

          {/* Enhanced Loading Spinner */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Enhanced Loading Spinner
            </h2>
            <div className="h-96 flex items-center justify-center">
              <EnhancedLoadingSpinner 
                size="xl" 
                message="Enhanced Animation..." 
                fullScreen={false}
                progress={progress}
                variant={selectedVariant}
              />
            </div>
            <div className="mt-4 text-neutral-400 text-sm">
              <h3 className="font-medium text-white mb-2">Enhanced Features:</h3>
              <ul className="space-y-1">
                <li>• Multiple animation variants</li>
                <li>• Progress tracking with visual feedback</li>
                <li>• SVG-based morphing shapes</li>
                <li>• Neural network connections</li>
                <li>• Quantum particle effects</li>
                <li>• Gradient backgrounds and glow effects</li>
                <li>• Enhanced accessibility</li>
                <li>• Better performance optimization</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Comparison Summary */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-primary-900/20 to-purple-900/20 rounded-xl p-6 border border-primary-500/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            🏆 Recommendation: Enhanced Loading Spinner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-400 mb-2">✅ Advantages:</h4>
              <ul className="text-neutral-300 text-sm space-y-1">
                <li>• More visually appealing and modern</li>
                <li>• Multiple animation variants for different contexts</li>
                <li>• Progress tracking capability</li>
                <li>• Better user engagement</li>
                <li>• Enhanced accessibility features</li>
                <li>• GPU-accelerated animations</li>
                <li>• Customizable themes and colors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-400 mb-2">⚡ Performance:</h4>
              <ul className="text-neutral-300 text-sm space-y-1">
                <li>• SVG-based for crisp rendering</li>
                <li>• Optimized for 60fps animations</li>
                <li>• Reduced motion support</li>
                <li>• Lightweight bundle size</li>
                <li>• Hardware acceleration ready</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingComparison 