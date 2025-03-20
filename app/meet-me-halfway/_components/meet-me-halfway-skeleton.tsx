"use client"

export default function MeetMeHalfwaySkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
      <div className="space-y-6">
        <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>

        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
        </div>

        <div className="h-64 animate-pulse rounded bg-gray-200"></div>

        <div className="h-10 w-1/4 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  )
}
