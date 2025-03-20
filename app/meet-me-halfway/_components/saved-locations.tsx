"use client"

import { useState } from "react"
import { Location } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteLocationAction } from "@/actions/db/locations-actions"
import { toast } from "sonner"

interface SavedLocationsProps {
  locations: Location[]
}

export default function SavedLocations({ locations }: SavedLocationsProps) {
  const [savedLocations, setSavedLocations] = useState<Location[]>(locations)

  const handleDelete = async (id: string) => {
    const result = await deleteLocationAction(id)

    if (result.isSuccess) {
      setSavedLocations(savedLocations.filter(location => location.id !== id))
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Locations</CardTitle>
      </CardHeader>
      <CardContent>
        {savedLocations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No saved locations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {savedLocations.map(location => (
              <div
                key={location.id}
                className="hover:bg-accent flex items-center justify-between rounded-md p-2"
              >
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-muted-foreground max-w-[200px] truncate text-sm">
                    {location.address}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(location.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
