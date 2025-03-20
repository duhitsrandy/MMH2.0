/*
<ai_context>
Contains the types for the Meet-Me-Halfway app.
</ai_context>
*/

export interface Location {
  id: string
  userId: string
  name: string
  address: string
  latitude: string
  longitude: string
  createdAt: Date
  updatedAt: Date
}

export interface Search {
  id: string
  userId: string
  startLocationAddress: string
  startLocationLat: string
  startLocationLng: string
  endLocationAddress: string
  endLocationLat: string
  endLocationLng: string
  midpointLat: string
  midpointLng: string
  createdAt: Date
  updatedAt: Date
}

export interface Poi {
  id: string
  searchId: string
  name: string
  address: string
  latitude: string
  longitude: string
  type: PoiType
  travelTimeFromStart?: string
  travelTimeFromEnd?: string
  createdAt: Date
  updatedAt: Date
}

export type PoiType =
  | "restaurant"
  | "cafe"
  | "park"
  | "bar"
  | "library"
  | "other"

export interface GeocodingResponse {
  lat: string
  lon: string
  display_name: string
}

export interface RouteResponse {
  geometry: {
    coordinates: [number, number][]
    type: string
  }
  legs: any[]
  distance: number
  duration: number
  weight: number
}

export interface MidpointResponse {
  lat: string
  lon: string
}

export interface PoiResponse {
  name: string
  address: {
    road?: string
    house_number?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  lat: string
  lon: string
  type: string
}
