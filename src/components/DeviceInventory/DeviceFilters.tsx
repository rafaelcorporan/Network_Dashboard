import React from 'react'
import { motion } from 'framer-motion'
import {
  Filter,
  X,
  Search,
  MapPin,
  Settings,
  Wifi,
  Activity,
  Shield,
  HardDrive,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Power,
  Clock
} from 'lucide-react'

interface DeviceFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: {
    type: string[]
    status: string[]
    vendor: string[]
    location: string[]
  }
  onFiltersChange: (filters: any) => void
  availableOptions: {
    types: string[]
    statuses: string[]
    vendors: string[]
    locations: string[]
  }
  onClearFilters: () => void
}

const DeviceFilters: React.FC<DeviceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  availableOptions,
  onClearFilters
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Wifi className="w-4 h-4" />
      case 'switch': return <Activity className="w-4 h-4" />
      case 'firewall': return <Shield className="w-4 h-4" />
      case 'server': return <HardDrive className="w-4 h-4" />
      case 'workstation': return <Cpu className="w-4 h-4" />
      case 'access-point': return <Wifi className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-success-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning-400" />
      case 'offline': return <Power className="w-4 h-4 text-error-400" />
      default: return <Clock className="w-4 h-4 text-neutral-400" />
    }
  }

  const handleFilterToggle = (category: keyof typeof filters, value: string) => {
    const currentValues = filters[category]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    onFiltersChange({
      ...filters,
      [category]: newValues
    })
  }

  const activeFiltersCount = Object.values(filters).flat().length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search devices by name, IP, model, or serial number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-3 text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="glass-effect rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-neutral-400" />
            <span className="font-medium text-white">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Device Type Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Device Type</label>
            <div className="space-y-2">
              {availableOptions.types.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => handleFilterToggle('type', type)}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm text-neutral-300 capitalize">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Status</label>
            <div className="space-y-2">
              {availableOptions.statuses.map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleFilterToggle('status', status)}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm text-neutral-300 capitalize">{status}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Vendor Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Vendor</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableOptions.vendors.map((vendor) => (
                <label key={vendor} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.vendor.includes(vendor)}
                    onChange={() => handleFilterToggle('vendor', vendor)}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-300">{vendor}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableOptions.locations.map((location) => (
                <label key={location} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.location.includes(location)}
                    onChange={() => handleFilterToggle('location', location)}
                    className="rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span className="text-sm text-neutral-300">{location}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(filters).map(([category, values]) =>
            values.map((value) => (
              <motion.span
                key={`${category}-${value}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600/20 text-primary-400 text-sm rounded-full"
              >
                <span className="capitalize">{category}: {value}</span>
                <button
                  onClick={() => handleFilterToggle(category as keyof typeof filters, value)}
                  className="hover:text-primary-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}

export default DeviceFilters