import React, { useState, useEffect } from 'react'
import { MagnifyingGlass, MapPin, Compass as NavigationIcon, CaretRight } from '@phosphor-icons/react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { navigationService } from '../services/navigation'
import type { Location } from '../services/navigation'

const Navigation: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [navigating, setNavigating] = useState(false)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const response = await navigationService.getAllLocations()
      setLocations(response.data)
      setFilteredLocations(response.data)
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load locations',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredLocations(locations)
      return
    }

    const filtered = locations.filter((loc) => {
      const lowerQuery = query.toLowerCase()
      return (
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.building.toLowerCase().includes(lowerQuery) ||
        loc.description.toLowerCase().includes(lowerQuery) ||
        loc.category.toLowerCase().includes(lowerQuery)
      )
    })
    setFilteredLocations(filtered)
  }

  const handleNavigate = async (location: Location) => {
    try {
      setNavigating(true)
      setSelectedLocation(location)

      // Determine travel mode
      const travelMode = location.locationId === 'MainGate' || location.locationId === 'Station' ? 'driving' : 'walking'

      await navigationService.openMapsNavigation(location.building, travelMode)

      toast.current?.show({
        severity: 'success',
        summary: 'Navigation Started',
        detail: `Opening Google Maps for ${location.name}`,
        life: 3000,
      })
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Navigation Error',
        detail: 'Failed to open navigation',
        life: 3000,
      })
    } finally {
      setNavigating(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return 'var(--blue-500)'
      case 'hostel':
        return 'var(--green-500)'
      case 'facility':
        return 'var(--purple-500)'
      case 'gateway':
        return 'var(--orange-500)'
      default:
        return 'var(--gray-500)'
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-jakarta" style={{ backgroundColor: 'var(--color-background)' }}>
      <Toast ref={toast} />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <MapPin size={36} weight="fill" />
          Campus Navigator
        </h1>
        <p className="text-blue-100">Find your way around XMUM Sepang Campus with one-click navigation</p>
      </div>

      {/* Search Section */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputText
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search locations (e.g., A1, Library, Hostel)..."
                className="w-full pl-10 py-3 text-lg"
                style={{
                  border: '2px solid var(--blue-500)',
                  borderRadius: '8px',
                }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Found <strong>{filteredLocations.length}</strong> location{filteredLocations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="2" fill="var(--surface-ground)" />
            </div>
          ) : filteredLocations.length === 0 ? (
            <Card className="p-6 text-center bg-white">
              <div className="text-gray-500">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No locations found matching your search</p>
                <Button
                  label="Clear Search"
                  className="mt-4"
                  onClick={() => handleSearch('')}
                  severity="secondary"
                />
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map((location) => (
                <Card
                  key={location.locationId}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  style={{
                    borderLeft: `5px solid ${getCategoryColor(location.category)}`,
                  }}
                  onClick={() => handleNavigate(location)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{location.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{location.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getCategoryColor(location.category) }}
                        >
                          {location.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                          Building {location.building}
                        </span>
                        {location.travelMode && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            {location.travelMode.charAt(0).toUpperCase() + location.travelMode.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      icon={<NavigationIcon size={20} weight="fill" />}
                      className="p-button-rounded p-button-lg flex-shrink-0"
                      style={{
                        backgroundColor: getCategoryColor(location.category),
                        border: 'none',
                      }}
                      loading={navigating && selectedLocation?.locationId === location.locationId}
                      onClick={() => handleNavigate(location)}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CaretRight size={20} weight="fill" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['A1', 'A3', 'B1', 'D1', 'Main Gate', 'Station'].map((quickLocation) => {
              const loc = locations.find((l) => l.building === quickLocation || l.name.includes(quickLocation))
              return loc ? (
                <Button
                  key={quickLocation}
                  label={quickLocation}
                  icon={<NavigationIcon size={16} />}
                  className="p-button-sm"
                  severity="secondary"
                  onClick={() => handleNavigate(loc)}
                  loading={navigating && selectedLocation?.locationId === loc.locationId}
                />
              ) : null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
