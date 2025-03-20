"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectSearch } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, ArrowRight, Trash2 } from "lucide-react"
import { deleteSearchAction } from "@/actions/db/searches-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface SavedSearchesListProps {
  searches: SelectSearch[]
}

export default function SavedSearchesList({
  searches
}: SavedSearchesListProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchIdToDelete, setSearchIdToDelete] = useState<string | null>(null)

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleUseSearch = (search: SelectSearch) => {
    router.push(
      `/meet-me-halfway/results?startLat=${search.startLocationLat}&startLng=${search.startLocationLng}&startAddress=${encodeURIComponent(search.startLocationAddress)}&endLat=${search.endLocationLat}&endLng=${search.endLocationLng}&endAddress=${encodeURIComponent(search.endLocationAddress)}`
    )
  }

  const handleDeleteSearch = async (id: string) => {
    setIsDeleting(true)

    try {
      const result = await deleteSearchAction(id)

      if (result.isSuccess) {
        toast.success("Search deleted successfully")
        router.refresh()
      } else {
        toast.error(`Error deleting search: ${result.message}`)
      }
    } catch (error) {
      toast.error("An error occurred while deleting the search")
      console.error("Error deleting search:", error)
    } finally {
      setIsDeleting(false)
      setSearchIdToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {searches.map(search => (
        <Card key={search.id} className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Clock className="text-muted-foreground mt-1 size-4" />
                  <span className="text-muted-foreground text-sm">
                    {formatDate(search.createdAt)}
                  </span>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchIdToDelete(search.id)}
                    >
                      <Trash2 className="text-muted-foreground size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this saved search.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSearch(search.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="mt-1 size-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Start Location</p>
                    <p className="text-muted-foreground text-sm">
                      {search.startLocationAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="mt-1 size-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">End Location</p>
                    <p className="text-muted-foreground text-sm">
                      {search.endLocationAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => handleUseSearch(search)}
                >
                  <span>Use This Search</span>
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
