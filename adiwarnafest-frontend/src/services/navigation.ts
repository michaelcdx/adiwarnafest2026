import { apiFetch } from './http'

export type Location = {
  locationId: string
  name: string
  building: string
  description: string
  latitude: number
  longitude: number
  category: string
  travelMode: string
}

export type NavigationRequest = {
  destination: string
  travelMode?: string
}

export type NavigationResponse = {
  googleMapsUrl: string
  destination: Location
  travelMode: string
  instructions: string
}

export type LocationsResponse = {
  success: boolean
  data: Location[]
  count: number
}

export type LocationResponse = {
  success: boolean
  data: Location
}

export type NavigationUrlResponse = {
  success: boolean
  data: NavigationResponse
}

export const navigationService = {
  getAllLocations: () =>
    apiFetch<LocationsResponse>('/api/public/navigation/locations'),

  getLocationByName: (name: string) =>
    apiFetch<LocationResponse>(`/api/public/navigation/location?name=${encodeURIComponent(name)}`),

  getNavigationUrl: (destination: string, travelMode: string = 'walking') =>
    apiFetch<NavigationUrlResponse>('/api/public/navigation/navigate', {
      method: 'POST',
      body: {
        destination,
        travelMode,
      },
    }),

  openMapsNavigation: (destination: string, travelMode: string = 'walking') => {
    return navigationService.getNavigationUrl(destination, travelMode).then((response) => {
      if (response.data?.googleMapsUrl) {
        window.open(response.data.googleMapsUrl, '_blank')
        return response.data
      }
      throw new Error('Failed to generate navigation URL')
    })
  },
}
