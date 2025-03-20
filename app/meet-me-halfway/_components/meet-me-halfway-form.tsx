"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Location } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { geocodeLocationAction } from "@/actions/locationiq-actions"
import { createSearchAction } from "@/actions/db/searches-actions"
import { createLocationAction } from "@/actions/db/locations-actions"

interface MeetMeHalfwayFormProps {
  initialLocations: Location[]
  onFindMidpoint: (data: {
    startLat: string
    startLng: string
    startAddress: string
    endLat: string
    endLng: string
    endAddress: string
  }) => void
}

export default function MeetMeHalfwayForm({
  initialLocations,
  onFindMidpoint
}: MeetMeHalfwayFormProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()

  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [startLocationId, setStartLocationId] = useState("")
  const [endLocationId, setEndLocationId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [saveStartLocation, setSaveStartLocation] = useState(false)
  const [startLocationName, setStartLocationName] = useState("")
  const [saveEndLocation, setSaveEndLocation] = useState(false)
  const [endLocationName, setEndLocationName] = useState("")

  useEffect(() => {
    setLocations(initialLocations)
  }, [initialLocations])

  const handleStartLocationSelect = (locationId: string) => {
    setStartLocationId(locationId)

    if (locationId === "custom") {
      setStartAddress("")
      return
    }

    const location = locations.find(loc => loc.id === locationId)
    if (location) {
      setStartAddress(location.address)
    }
  }

  const handleEndLocationSelect = (locationId: string) => {
    setEndLocationId(locationId)

    if (locationId === "custom") {
      setEndAddress("")
      return
    }

    const location = locations.find(loc => loc.id === locationId)
    if (location) {
      setEndAddress(location.address)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startAddress || !endAddress) {
      toast.error("Please enter both start and end addresses")
      return
    }

    setIsLoading(true)

    try {
      // Geocode start location
      const startResult = await geocodeLocationAction(startAddress)
      if (!startResult.isSuccess) {
        toast.error(`Start address: ${startResult.message}`)
        setIsLoading(false)
        return
      }

      // Geocode end location
      const endResult = await geocodeLocationAction(endAddress)
      if (!endResult.isSuccess) {
        toast.error(`End address: ${endResult.message}`)
        setIsLoading(false)
        return
      }

      // Save locations if requested
      if (isSignedIn && saveStartLocation && startLocationName) {
        const newLocation = {
          userId: user.id,
          name: startLocationName,
          address: startAddress,
          latitude: startResult.data.lat,
          longitude: startResult.data.lon
        }

        await createLocationAction(newLocation)
      }

      if (isSignedIn && saveEndLocation && endLocationName) {
        const newLocation = {
          userId: user.id,
          name: endLocationName,
          address: endAddress,
          latitude: endResult.data.lat,
          longitude: endResult.data.lon
        }

        await createLocationAction(newLocation)
      }

      // Create search record if user is signed in
      if (isSignedIn) {
        await createSearchAction({
          userId: user.id,
          startLocationAddress: startAddress,
          startLocationLat: startResult.data.lat,
          startLocationLng: startResult.data.lon,
          endLocationAddress: endAddress,
          endLocationLat: endResult.data.lat,
          endLocationLng: endResult.data.lon,
          midpointLat: "0", // Will be updated in the results page
          midpointLng: "0" // Will be updated in the results page
        })
      }

      // Call onFindMidpoint with the data
      onFindMidpoint({
        startLat: startResult.data.lat,
        startLng: startResult.data.lon,
        startAddress: startAddress,
        endLat: endResult.data.lat,
        endLng: endResult.data.lon,
        endAddress: endAddress
      })
    } catch (error) {
      console.error("Error processing form:", error)
      toast.error("An error occurred while processing your request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find a Midpoint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startLocation">Start Location</Label>
              {locations.length > 0 && (
                <Select
                  value={startLocationId}
                  onValueChange={handleStartLocationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved location or enter custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      Enter custom location
                    </SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex gap-2">
                <Input
                  id="startLocation"
                  placeholder="Enter start address"
                  value={startAddress}
                  onChange={e => setStartAddress(e.target.value)}
                  required
                />
                {isSignedIn && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSaveStartLocation(!saveStartLocation)}
                    className={saveStartLocation ? "bg-primary/10" : ""}
                  >
                    <MapPin className="mr-2 size-4" />
                    Save
                  </Button>
                )}
              </div>
              {saveStartLocation && (
                <Input
                  placeholder="Location name (e.g. Home, Work)"
                  value={startLocationName}
                  onChange={e => setStartLocationName(e.target.value)}
                  className="mt-2"
                  required={saveStartLocation}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endLocation">End Location</Label>
              {locations.length > 0 && (
                <Select
                  value={endLocationId}
                  onValueChange={handleEndLocationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved location or enter custom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      Enter custom location
                    </SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex gap-2">
                <Input
                  id="endLocation"
                  placeholder="Enter end address"
                  value={endAddress}
                  onChange={e => setEndAddress(e.target.value)}
                  required
                />
                {isSignedIn && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSaveEndLocation(!saveEndLocation)}
                    className={saveEndLocation ? "bg-primary/10" : ""}
                  >
                    <MapPin className="mr-2 size-4" />
                    Save
                  </Button>
                )}
              </div>
              {saveEndLocation && (
                <Input
                  placeholder="Location name (e.g. Friend's House, Office)"
                  value={endLocationName}
                  onChange={e => setEndLocationName(e.target.value)}
                  className="mt-2"
                  required={saveEndLocation}
                />
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Finding Midpoint...
              </>
            ) : (
              "Find Midpoint"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
