"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ResultsMap from "./_components/results-map"
import ResultsSkeleton from "./_components/results-skeleton"

interface SearchParams {
  startLat?: string
  startLng?: string
  startAddress?: string
  endLat?: string
  endLng?: string
  endAddress?: string
  selectedRoute?: string
  midpointLat?: string
  midpointLng?: string
  alternateMidpointLat?: string
  alternateMidpointLng?: string
}

export default async function ResultsPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const {
    startLat = "0",
    startLng = "0",
    endLat = "0",
    endLng = "0",
    startAddress = "",
    endAddress = "",
    selectedRoute = "main",
    midpointLat = "0",
    midpointLng = "0",
    alternateMidpointLat = "0",
    alternateMidpointLng = "0"
  } = searchParams

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Meet Me Halfway Results</h1>

      <div className="w-full">
        <Suspense fallback={<ResultsSkeleton />}>
          <ResultsMap
            startLat={startLat}
            startLng={startLng}
            endLat={endLat}
            endLng={endLng}
            startAddress={startAddress}
            endAddress={endAddress}
            selectedRoute={selectedRoute as "main" | "alternate"}
            onRouteSelect={() => {}}
          />
        </Suspense>
      </div>
    </div>
  )
}
