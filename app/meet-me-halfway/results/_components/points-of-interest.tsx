"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PoiResponse } from "@/types/poi-types"
import { getRouteAction } from "@/actions/locationiq-actions"
import {
  Clock,
  MapPin,
  Coffee,
  Utensils,
  Beer,
  BookOpen,
  Navigation,
  ExternalLink,
  Film,
  Hotel,
  Music,
  Landmark,
  ArrowUpDown,
  Star,
  StarOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface PointsOfInterestProps {
  pois: PoiResponse[]
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  startAddress: string
  endAddress: string
  onPoiSelect?: (poiId: string) => void
  selectedRoute: "main" | "alternate"
  midpointLat: number
  midpointLng: number
}

interface PoiWithTravelTimes extends PoiResponse {
  osm_id?: string
  travelTimeFromStart?: number
  travelTimeFromEnd?: number
  distanceFromStart?: number
  distanceFromEnd?: number
  totalTravelTime?: number
  travelTimeDifference?: number
  isFavorite?: boolean
}

type SortOption =
  | "name"
  | "distanceFromStart"
  | "distanceFromEnd"
  | "totalTime"
  | "timeDifference"
type FilterOption = "all" | "food" | "activities" | "lodging" | "other"
type MaxTimeDifference = 5 | 10 | 15 | 30 | 999

export default function PointsOfInterest({
  pois,
  startLat,
  startLng,
  endLat,
  endLng,
  startAddress,
  endAddress,
  onPoiSelect,
  selectedRoute,
  midpointLat,
  midpointLng
}: PointsOfInterestProps) {
  const [poisWithTravelTimes, setPoisWithTravelTimes] = useState<
    PoiWithTravelTimes[]
  >([])
  const [activeTab, setActiveTab] = useState<FilterOption>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("totalTime")
  const [maxTimeDifference, setMaxTimeDifference] =
    useState<MaxTimeDifference>(15)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Load favorites from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("mmh-favorites")
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites))
        } catch (e) {
          console.error("Error loading favorites:", e)
        }
      }
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && favorites.length > 0) {
      localStorage.setItem("mmh-favorites", JSON.stringify(favorites))
    }
  }, [favorites])

  // Calculate travel times for POIs
  useEffect(() => {
    const calculateTravelTimes = async () => {
      setIsLoading(true)
      const targetLat = selectedRoute === "main" ? midpointLat : midpointLat
      const targetLng = selectedRoute === "main" ? midpointLng : midpointLng

      const updatedPois = await Promise.all(
        pois.map(async poi => {
          try {
            // Get route from start to POI
            const startRoute = await getRouteAction(
              startLat.toString(),
              startLng.toString(),
              poi.lat,
              poi.lon
            )

            // Get route from POI to end
            const endRoute = await getRouteAction(
              poi.lat,
              poi.lon,
              endLat.toString(),
              endLng.toString()
            )

            const travelTimeFromStart = startRoute.isSuccess
              ? startRoute.data?.duration
              : undefined
            const travelTimeFromEnd = endRoute.isSuccess
              ? endRoute.data?.duration
              : undefined
            const distanceFromStart = startRoute.isSuccess
              ? startRoute.data?.distance
              : undefined
            const distanceFromEnd = endRoute.isSuccess
              ? endRoute.data?.distance
              : undefined

            const totalTravelTime =
              travelTimeFromStart !== undefined &&
              travelTimeFromEnd !== undefined
                ? travelTimeFromStart + travelTimeFromEnd
                : undefined

            const travelTimeDifference =
              travelTimeFromStart !== undefined &&
              travelTimeFromEnd !== undefined
                ? Math.abs(travelTimeFromEnd - travelTimeFromStart)
                : undefined

            return {
              ...poi,
              travelTimeFromStart,
              travelTimeFromEnd,
              distanceFromStart,
              distanceFromEnd,
              totalTravelTime,
              travelTimeDifference,
              isFavorite: favorites.includes(poi.osm_id || "")
            }
          } catch (error) {
            console.error("Error calculating travel times for POI:", error)
            return poi
          }
        })
      )

      setPoisWithTravelTimes(updatedPois)
      setIsLoading(false)
    }

    calculateTravelTimes()
  }, [
    pois,
    startLat,
    startLng,
    endLat,
    endLng,
    favorites,
    selectedRoute,
    midpointLat,
    midpointLng
  ])

  const formatDuration = (minutes?: number): string => {
    if (minutes === undefined) return "N/A"

    // Round to nearest minute
    minutes = Math.round(minutes)

    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }

    return `${mins}m`
  }

  const formatDistance = (meters?: number): string => {
    if (meters === undefined) return "N/A"

    // Convert meters to miles (1 meter = 0.000621371 miles)
    const miles = meters * 0.000621371

    if (miles >= 10) {
      // For longer distances, show only one decimal place
      return `${miles.toFixed(1)} mi`
    } else if (miles >= 0.1) {
      // For medium distances, show one decimal place
      return `${miles.toFixed(1)} mi`
    } else {
      // For very short distances, show in feet (1 mile = 5280 feet)
      const feet = Math.round(miles * 5280)
      return `${feet} ft`
    }
  }

  const getPoiIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "restaurant":
        return <Utensils className="size-4" />
      case "cafe":
        return <Coffee className="size-4" />
      case "park":
        return <MapPin className="size-4" />
      case "bar":
        return <Beer className="size-4" />
      case "pub":
        return <Beer className="size-4" />
      case "library":
        return <BookOpen className="size-4" />
      case "cinema":
        return <Film className="size-4" />
      case "theatre":
      case "theater":
        return <Music className="size-4" />
      case "museum":
        return <Landmark className="size-4" />
      case "hotel":
        return <Hotel className="size-4" />
      default:
        return <MapPin className="size-4" />
    }
  }

  // Group POIs by category for better organization
  const getPoiCategory = (type: string): FilterOption => {
    type = type.toLowerCase()
    if (["restaurant", "cafe", "bar", "pub", "fast_food"].includes(type)) {
      return "food"
    } else if (
      ["park", "cinema", "theatre", "theater", "museum"].includes(type)
    ) {
      return "activities"
    } else if (["hotel", "hostel", "guest_house"].includes(type)) {
      return "lodging"
    } else {
      return "other"
    }
  }

  const sortedAndFilteredPois = poisWithTravelTimes
    .filter(poi => {
      // Filter by category
      if (activeTab !== "all") {
        const category = getPoiCategory(poi.type)
        if (category !== activeTab) return false
      }

      // Filter by time difference
      if (
        poi.travelTimeDifference &&
        poi.travelTimeDifference / 60 > maxTimeDifference
      ) {
        return false
      }

      // Filter favorites
      if (showOnlyFavorites && !poi.isFavorite) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "distanceFromStart":
          return (a.distanceFromStart || 0) - (b.distanceFromStart || 0)
        case "distanceFromEnd":
          return (a.distanceFromEnd || 0) - (b.distanceFromEnd || 0)
        case "totalTime":
          return (a.totalTravelTime || 0) - (b.totalTravelTime || 0)
        case "timeDifference":
          return (a.travelTimeDifference || 0) - (b.travelTimeDifference || 0)
        default:
          return 0
      }
    })

  const toggleFavorite = (poiId: string) => {
    setFavorites(prev => {
      if (prev.includes(poiId)) {
        return prev.filter(id => id !== poiId)
      } else {
        return [...prev, poiId]
      }
    })
  }

  return (
    <Card className="h-[600px] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Points of Interest</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={value => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="distanceFromStart">
                  Distance from Start
                </SelectItem>
                <SelectItem value="distanceFromEnd">
                  Distance from End
                </SelectItem>
                <SelectItem value="totalTime">Total Travel Time</SelectItem>
                <SelectItem value="timeDifference">Time Difference</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={showOnlyFavorites ? "bg-yellow-50" : ""}
            >
              <Star className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={value => setActiveTab(value as FilterOption)}
        >
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="lodging">Lodging</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </div>

          <div className="h-[460px] space-y-4 overflow-y-auto px-2 py-4">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="mx-4">
                    <CardContent className="p-4">
                      <Skeleton className="mb-2 h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
            ) : sortedAndFilteredPois.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">
                No points of interest found for the selected filters.
              </div>
            ) : (
              sortedAndFilteredPois.map(poi => (
                <Card
                  key={poi.osm_id}
                  className={`mx-4 transition-all hover:shadow-md ${
                    selectedPoi === poi.osm_id ? "ring-primary ring-2" : ""
                  }`}
                  onClick={() => {
                    setSelectedPoi(poi.osm_id || null)
                    onPoiSelect?.(poi.osm_id || "")
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {getPoiIcon(poi.type)}
                          <span className="font-medium">{poi.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0"
                            onClick={e => {
                              e.stopPropagation()
                              if (poi.osm_id) toggleFavorite(poi.osm_id)
                            }}
                          >
                            {poi.isFavorite ? (
                              <Star className="size-4 text-yellow-500" />
                            ) : (
                              <StarOff className="size-4" />
                            )}
                          </Button>
                        </div>

                        <div className="text-muted-foreground mb-2 text-sm">
                          {poi.address.road}
                          {poi.address.house_number &&
                            `, ${poi.address.house_number}`}
                          {poi.address.city && `, ${poi.address.city}`}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>
                              From Start:{" "}
                              {formatDuration(
                                poi.travelTimeFromStart &&
                                  poi.travelTimeFromStart / 60
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>
                              From End:{" "}
                              {formatDuration(
                                poi.travelTimeFromEnd &&
                                  poi.travelTimeFromEnd / 60
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="size-3" />
                            <span>
                              From Start:{" "}
                              {formatDistance(poi.distanceFromStart)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="size-3" />
                            <span>
                              From End: {formatDistance(poi.distanceFromEnd)}
                            </span>
                          </div>
                        </div>

                        {poi.travelTimeDifference !== undefined && (
                          <div className="mt-2">
                            <Badge
                              variant={
                                poi.travelTimeDifference / 60 <= 5
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {Math.round(poi.travelTimeDifference / 60)} min
                              difference
                            </Badge>
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Navigation className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`,
                                "_blank"
                              )
                            }
                          >
                            Open in Google Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `http://maps.apple.com/?ll=${poi.lat},${poi.lon}`,
                                "_blank"
                              )
                            }
                          >
                            Open in Apple Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://www.waze.com/ul?ll=${poi.lat},${poi.lon}&navigate=yes`,
                                "_blank"
                              )
                            }
                          >
                            Open in Waze
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
