import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import EnhancedLoadingSpinner from './EnhancedLoadingSpinner'

interface PageTransitionProps {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (location !== displayLocation) {
      setIsLoading(true)
      setProgress(0)
      
      // Simulate progressive loading
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 50)
      
      // Complete loading after transition time
      const timer = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setDisplayLocation(location)
          setIsLoading(false)
          setProgress(0)
        }, 200)
      }, 600)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [location, displayLocation])

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  }

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Loading Dashboard...'
      case '/topology': return 'Loading Network Topology...'
      case '/devices': return 'Loading Device Inventory...'
      case '/monitoring': return 'Loading Monitoring...'
      case '/alerts': return 'Loading Alerts...'
      case '/analytics': return 'Loading Analytics...'
      case '/settings': return 'Loading Settings...'
      default: return 'Loading...'
    }
  }

  const getAnimationVariant = (pathname: string) => {
    switch (pathname) {
      case '/topology': return 'neural'
      case '/devices': return 'quantum'
      case '/monitoring': return 'neural'
      case '/analytics': return 'morphing'
      default: return 'neural'
    }
  }

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <EnhancedLoadingSpinner 
              size="xl" 
              message={getPageTitle(location.pathname)} 
              fullScreen={false}
              progress={progress}
              variant={getAnimationVariant(location.pathname) as 'quantum' | 'neural' | 'morphing'}
            />
          </motion.div>
        ) : (
          <motion.div
            key={displayLocation.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PageTransition 