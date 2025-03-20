"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

interface MapProps {
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

const MapComponent = dynamic<MapProps>(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-lg bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})

export default function Map(props: MapProps) {
  // Ensure all coordinates are valid numbers
  const validStartLat = Number.isFinite(props.startLat) ? props.startLat : 0
  const validStartLng = Number.isFinite(props.startLng) ? props.startLng : 0
  const validEndLat = Number.isFinite(props.endLat) ? props.endLat : 0
  const validEndLng = Number.isFinite(props.endLng) ? props.endLng : 0
  const validMidpointLat = Number.isFinite(props.midpointLat)
    ? props.midpointLat
    : validStartLat
  const validMidpointLng = Number.isFinite(props.midpointLng)
    ? props.midpointLng
    : validStartLng
  const validAltMidpointLat = Number.isFinite(props.alternateMidpointLat)
    ? props.alternateMidpointLat
    : validMidpointLat
  const validAltMidpointLng = Number.isFinite(props.alternateMidpointLng)
    ? props.alternateMidpointLng
    : validMidpointLng

  return (
    <MapComponent
      {...props}
      startLat={validStartLat}
      startLng={validStartLng}
      endLat={validEndLat}
      endLng={validEndLng}
      midpointLat={validMidpointLat}
      midpointLng={validMidpointLng}
      alternateMidpointLat={validAltMidpointLat}
      alternateMidpointLng={validAltMidpointLng}
    />
  )
}
