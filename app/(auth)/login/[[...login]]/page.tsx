/*
<ai_context>
This client page provides the login form from Clerk.
</ai_context>
*/

"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <SignIn
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
      />
    </div>
  )
}
