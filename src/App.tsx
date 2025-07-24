import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/Layout/Layout'
import PageTransition from './components/Layout/PageTransition'
import LoadingComparison from './components/Layout/LoadingComparison'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NetworkTopology from './pages/NetworkTopology'
import DeviceInventory from './pages/DeviceInventory'
import Monitoring from './pages/Monitoring'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { setTopology } from '@/store/slices/networkSlice'
import { generateMockDeviceInventory } from '@/utils/mockDeviceData'
import { useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Initialize mock data on app start (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      const initializeMockData = () => {
        // Generate mock devices for network topology
        const mockDevices = generateMockDeviceInventory()
        
        // Initialize network topology with mock devices
        dispatch(setTopology({
          devices: mockDevices,
          connections: [],
          subnets: [],
          lastUpdated: new Date().toISOString(),
          discoveryStats: {
            totalDevices: mockDevices.length,
            devicesByType: mockDevices.reduce((acc: any, device) => {
              acc[device.type] = (acc[device.type] || 0) + 1
              return acc
            }, {}),
            devicesByStatus: mockDevices.reduce((acc: any, device) => {
              acc[device.status] = (acc[device.status] || 0) + 1
              return acc
            }, {}),
            devicesByLocation: mockDevices.reduce((acc: any, device) => {
              acc[device.location] = (acc[device.location] || 0) + 1
              return acc
            }, {}),
            totalConnections: 0,
            discoveryMethods: { ping: mockDevices.length, snmp: Math.floor(mockDevices.length * 0.8) },
            lastScanDuration: 120,
            coverage: 95
          }
        }))
      }

      initializeMockData()
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <PageTransition>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/topology" element={
            <ProtectedRoute>
              <NetworkTopology />
            </ProtectedRoute>
          } />
          <Route path="/devices" element={
            <ProtectedRoute>
              <DeviceInventory />
            </ProtectedRoute>
          } />
          <Route path="/monitoring" element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requiredRole={['admin', 'engineer']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/loading-comparison" element={
            <ProtectedRoute>
              <LoadingComparison />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </PageTransition>
    </Layout>
  )
}

export default App