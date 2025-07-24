import { configureStore } from '@reduxjs/toolkit'
import networkReducer from './slices/networkSlice'
import alertsReducer from './slices/alertsSlice'
import devicesReducer from './slices/devicesSlice'
import monitoringReducer from './slices/monitoringSlice'
import authReducer from './slices/authSlice'
import userManagementReducer from './slices/userManagementSlice'

export const store = configureStore({
  reducer: {
    network: networkReducer,
    alerts: alertsReducer,
    devices: devicesReducer,
    monitoring: monitoringReducer,
    auth: authReducer,
    userManagement: userManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch