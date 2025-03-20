"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ResultsMap from "../_components/results-map"
import ResultsSkeleton from "../_components/results-skeleton"
import PointsOfInterest from "../_components/points-of-interest"
import {
  calculateMidpointAction,
  searchPoisAction
} from "@/actions/locationiq-actions"
import { getSearchAction } from "@/actions/db/searches-actions"
import { getPoisBySearchAction } from "@/actions/db/pois-actions"

interface SearchResultsPageProps {
  params: {
    searchId: string
  }
  searchParams: {
    startLat?: string
    startLng?: string
    startAddress?: string
    endLat?: string
    endLng?: string
    endAddress?: string
    selectedRoute?: string
  }
}

export default async function SearchResultsPage({
  params,
  searchParams
}: SearchResultsPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Meet Me Halfway Results
      </h1>

      <div className="w-full">
        <Suspense fallback={<ResultsSkeleton />}>
          <ResultsMapFetcher
            searchId={params.searchId}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  )
}

async function ResultsMapFetcher({
  searchId,
  searchParams
}: {
  searchId: string
  searchParams: SearchResultsPageProps["searchParams"]
}) {
  // Get the search from the database
  const searchResult = await getSearchAction(searchId)

  if (!searchResult.isSuccess) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">Error Finding Search</h2>
        <p className="text-muted-foreground">{searchResult.message}</p>
      </div>
    )
  }

  const search = searchResult.data

  // Use query params if provided, otherwise use search data
  const startLat = searchParams.startLat || search.startLocationLat
  const startLng = searchParams.startLng || search.startLocationLng
  const startAddress = searchParams.startAddress || search.startLocationAddress
  const endLat = searchParams.endLat || search.endLocationLat
  const endLng = searchParams.endLng || search.endLocationLng
  const endAddress = searchParams.endAddress || search.endLocationAddress
  const selectedRoute = searchParams.selectedRoute || "main"

  // Calculate midpoint if not already calculated
  let midpointLat = search.midpointLat
  let midpointLng = search.midpointLng

  if (midpointLat === "0" && midpointLng === "0") {
    const midpointResult = await calculateMidpointAction(
      startLat,
      startLng,
      endLat,
      endLng
    )

    if (!midpointResult.isSuccess) {
      return (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">Error Finding Midpoint</h2>
          <p className="text-muted-foreground">{midpointResult.message}</p>
        </div>
      )
    }

    midpointLat = midpointResult.data.lat
    midpointLng = midpointResult.data.lon
  }

  return (
    <ResultsMap
      startLat={startLat}
      startLng={startLng}
      startAddress={startAddress}
      endLat={endLat}
      endLng={endLng}
      endAddress={endAddress}
      selectedRoute={selectedRoute as "main" | "alternate"}
      onRouteSelect={() => {}}
    />
  )
}

async function PointsOfInterestFetcher({
  searchId,
  searchParams
}: {
  searchId: string
  searchParams: SearchResultsPageProps["searchParams"]
}) {
  // Get the search from the database
  const searchResult = await getSearchAction(searchId)

  if (!searchResult.isSuccess) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">Error Finding Search</h2>
        <p className="text-muted-foreground">{searchResult.message}</p>
      </div>
    )
  }

  const search = searchResult.data

  // Use query params if provided, otherwise use search data
  const startLat = searchParams.startLat || search.startLocationLat
  const startLng = searchParams.startLng || search.startLocationLng
  const endLat = searchParams.endLat || search.endLocationLat
  const endLng = searchParams.endLng || search.endLocationLng

  // Check if we already have POIs for this search
  const poisResult = await getPoisBySearchAction(searchId)

  if (poisResult.isSuccess && poisResult.data.length > 0) {
    // Convert DB POIs to the format expected by the PointsOfInterest component
    const formattedPois = poisResult.data.map(poi => ({
      name: poi.name,
      address: {
        road: poi.address.split(",")[0] || "",
        house_number: "",
        city: poi.address.split(",")[1]?.trim() || ""
      },
      lat: poi.latitude,
      lon: poi.longitude,
      type: poi.type,
      travelTimeFromStart: poi.travelTimeFromStart,
      travelTimeFromEnd: poi.travelTimeFromEnd
    }))

    return (
      <PointsOfInterest
        pois={formattedPois}
        startLat={startLat}
        startLng={startLng}
        endLat={endLat}
        endLng={endLng}
      />
    )
  }

  // Calculate midpoint if not already calculated
  let midpointLat = search.midpointLat
  let midpointLng = search.midpointLng

  if (midpointLat === "0" && midpointLng === "0") {
    const midpointResult = await calculateMidpointAction(
      startLat,
      startLng,
      endLat,
      endLng
    )

    if (!midpointResult.isSuccess) {
      return (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">
            Error Finding Points of Interest
          </h2>
          <p className="text-muted-foreground">{midpointResult.message}</p>
        </div>
      )
    }

    midpointLat = midpointResult.data.lat
    midpointLng = midpointResult.data.lon
  }

  // Search for POIs
  const poisSearchResult = await searchPoisAction(midpointLat, midpointLng)

  if (!poisSearchResult.isSuccess) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">
          No Points of Interest Found
        </h2>
        <p className="text-muted-foreground">{poisSearchResult.message}</p>
      </div>
    )
  }

  return (
    <PointsOfInterest
      pois={poisSearchResult.data}
      startLat={startLat}
      startLng={startLng}
      endLat={endLat}
      endLng={endLng}
    />
  )
}
