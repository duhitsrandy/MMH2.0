"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { getSearchesAction } from "@/actions/db/searches-actions"
import SavedSearchesList from "./_components/saved-searches-list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

export default async function SavedSearchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Saved Searches</h1>

      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Your Saved Searches</CardTitle>
          <CardDescription>
            View and reuse your previous searches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SavedSearchesSkeleton />}>
            <SavedSearchesFetcher />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SavedSearchesFetcher() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Please sign in to view your saved searches.
        </p>
      </div>
    )
  }

  const searchesResult = await getSearchesAction(userId)

  if (!searchesResult.isSuccess) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Error loading saved searches: {searchesResult.message}
        </p>
      </div>
    )
  }

  if (searchesResult.data.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          You don't have any saved searches yet.
        </p>
        <p className="text-muted-foreground mt-2">
          When you search for meeting points, they will be saved here for future
          reference.
        </p>
      </div>
    )
  }

  return <SavedSearchesList searches={searchesResult.data} />
}

function SavedSearchesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-md border p-4">
          <div className="mb-2 h-5 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
