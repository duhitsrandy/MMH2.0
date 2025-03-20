"use server"

import { redirect } from "next/navigation"

// Redirect the root route to the Meet-Me-Halfway page
export default async function HomePage() {
  redirect("/meet-me-halfway")
}
