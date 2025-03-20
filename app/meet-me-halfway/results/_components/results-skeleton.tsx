"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResultsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Point Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-2">
              <div className="size-5 animate-pulse rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-40 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <div className="size-5 animate-pulse rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-40 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="size-5 animate-pulse rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-64 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>

          <div className="h-[400px] w-full animate-pulse rounded-md bg-gray-200"></div>
        </div>
      </CardContent>
    </Card>
  )
}
