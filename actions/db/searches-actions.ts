"use server"

import { db } from "@/db/db"
import { InsertSearch, SelectSearch, searchesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createSearchAction(
  search: InsertSearch
): Promise<ActionState<SelectSearch>> {
  try {
    const [newSearch] = await db.insert(searchesTable).values(search).returning()
    return {
      isSuccess: true,
      message: "Search created successfully",
      data: newSearch
    }
  } catch (error) {
    console.error("Error creating search:", error)
    return { isSuccess: false, message: "Failed to create search" }
  }
}

export async function getSearchesAction(
  userId: string
): Promise<ActionState<SelectSearch[]>> {
  try {
    const searches = await db.query.searches.findMany({
      where: eq(searchesTable.userId, userId),
      orderBy: (searches) => [searches.createdAt.desc()]
    })
    return {
      isSuccess: true,
      message: "Searches retrieved successfully",
      data: searches
    }
  } catch (error) {
    console.error("Error getting searches:", error)
    return { isSuccess: false, message: "Failed to get searches" }
  }
}

export async function getSearchAction(
  id: string
): Promise<ActionState<SelectSearch>> {
  try {
    const search = await db.query.searches.findFirst({
      where: eq(searchesTable.id, id)
    })

    if (!search) {
      return { isSuccess: false, message: "Search not found" }
    }

    return {
      isSuccess: true,
      message: "Search retrieved successfully",
      data: search
    }
  } catch (error) {
    console.error("Error getting search:", error)
    return { isSuccess: false, message: "Failed to get search" }
  }
}

export async function updateSearchAction(
  id: string,
  data: Partial<InsertSearch>
): Promise<ActionState<SelectSearch>> {
  try {
    const [updatedSearch] = await db
      .update(searchesTable)
      .set(data)
      .where(eq(searchesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Search updated successfully",
      data: updatedSearch
    }
  } catch (error) {
    console.error("Error updating search:", error)
    return { isSuccess: false, message: "Failed to update search" }
  }
}

export async function deleteSearchAction(id: string): Promise<ActionState<void>> {
  try {
    await db.delete(searchesTable).where(eq(searchesTable.id, id))
    return {
      isSuccess: true,
      message: "Search deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting search:", error)
    return { isSuccess: false, message: "Failed to delete search" }
  }
} 