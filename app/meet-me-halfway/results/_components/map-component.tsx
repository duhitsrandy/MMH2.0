"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
  Popup
} from "react-leaflet"

// Initialize Leaflet icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png"
  })
}

// Create custom icons
const createIcons = () => ({
  startIcon: new L.Icon({
    iconUrl: "/start-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }),
  endIcon: new L.Icon({
    iconUrl: "/end-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }),
  midpointIcon: new L.Icon({
    iconUrl: "/midpoint-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }),
  poiIcon: new L.Icon({
    iconUrl: "/poi-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  })
})

interface MapComponentProps {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  startAddress: string
  endAddress: string
  midpointLat: number
  midpointLng: number
  alternateMidpointLat: number
  alternateMidpointLng: number
  mainRoute: any
  alternateRoute: any
  showAlternateRoute: boolean
  selectedRoute: "main" | "alternate"
  onRouteSelect: (route: "main" | "alternate") => void
  pois: any[]
  showPois: boolean
}

// Component to fit bounds when route changes
function FitBounds({ route }: { route: any }) {
  const map = useMap()

  useEffect(() => {
    if (!route) return

    const bounds = L.latLngBounds([])
    route.geometry.coordinates.forEach((coord: [number, number]) => {
      bounds.extend([coord[1], coord[0]])
    })
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, route])

  return null
}

export default function MapComponent({
  startLat,
  startLng,
  endLat,
  endLng,
  startAddress,
  endAddress,
  midpointLat,
  midpointLng,
  alternateMidpointLat,
  alternateMidpointLng,
  mainRoute,
  alternateRoute,
  showAlternateRoute,
  selectedRoute,
  onRouteSelect,
  pois,
  showPois
}: MapComponentProps) {
  const [icons, setIcons] = useState<ReturnType<typeof createIcons> | null>(
    null
  )

  useEffect(() => {
    setIcons(createIcons())
  }, [])

  // Convert GeoJSON coordinates to LatLng arrays for Polyline
  const mainRouteCoords =
    mainRoute?.geometry?.coordinates?.map((coord: [number, number]) => [
      coord[1],
      coord[0]
    ]) || []

  const alternateRouteCoords =
    alternateRoute?.geometry?.coordinates?.map((coord: [number, number]) => [
      coord[1],
      coord[0]
    ]) || []

  if (!icons) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[midpointLat, midpointLng]}
      zoom={13}
      className="size-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Main Route */}
      {mainRouteCoords.length > 0 && (
        <Polyline
          positions={mainRouteCoords}
          pathOptions={{
            color: selectedRoute === "main" ? "#3b82f6" : "#93c5fd",
            weight: selectedRoute === "main" ? 6 : 4
          }}
          eventHandlers={{
            click: () => onRouteSelect("main")
          }}
        />
      )}

      {/* Alternate Route */}
      {alternateRouteCoords.length > 0 && showAlternateRoute && (
        <Polyline
          positions={alternateRouteCoords}
          pathOptions={{
            color: selectedRoute === "alternate" ? "#ef4444" : "#fca5a5",
            weight: selectedRoute === "alternate" ? 6 : 4
          }}
          eventHandlers={{
            click: () => onRouteSelect("alternate")
          }}
        />
      )}

      {/* Start Marker */}
      <Marker position={[startLat, startLng]} icon={icons.startIcon}>
        <Popup>
          <div className="font-medium">Start: {startAddress}</div>
        </Popup>
      </Marker>

      {/* End Marker */}
      <Marker position={[endLat, endLng]} icon={icons.endIcon}>
        <Popup>
          <div className="font-medium">End: {endAddress}</div>
        </Popup>
      </Marker>

      {/* Main Midpoint Marker */}
      <Marker
        position={[midpointLat, midpointLng]}
        icon={icons.midpointIcon}
        eventHandlers={{
          click: () => onRouteSelect("main")
        }}
      >
        <Popup>
          <div className="font-medium">Midpoint (Main Route)</div>
        </Popup>
      </Marker>

      {/* Alternate Midpoint Marker */}
      {showAlternateRoute && (
        <Marker
          position={[alternateMidpointLat, alternateMidpointLng]}
          icon={icons.midpointIcon}
          eventHandlers={{
            click: () => onRouteSelect("alternate")
          }}
        >
          <Popup>
            <div className="font-medium">Midpoint (Alternate Route)</div>
          </Popup>
        </Marker>
      )}

      {/* POI Markers */}
      {showPois &&
        pois.map((poi: any) => (
          <Marker
            key={poi.id}
            position={[Number(poi.lat) || 0, Number(poi.lon) || 0]}
            icon={icons.poiIcon}
          >
            <Popup>
              <div>
                <div className="font-medium">{poi.name || poi.tags.name}</div>
                <div className="text-muted-foreground text-sm">
                  {poi.tags.amenity || poi.tags.leisure || poi.tags.tourism}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Fit bounds to route */}
      <FitBounds
        route={selectedRoute === "main" ? mainRoute : alternateRoute}
      />
    </MapContainer>
  )
}
