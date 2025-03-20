"use server"

import { db } from "@/db/db"
import { InsertPoi, SelectPoi, poisTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

export async function createPoiAction(
  poi: InsertPoi
): Promise<ActionState<SelectPoi>> {
  try {
    const [newPoi] = await db.insert(poisTable).values(poi).returning()
    return {
      isSuccess: true,
      message: "POI created successfully",
      data: newPoi
    }
  } catch (error) {
    console.error("Error creating POI:", error)
    return { isSuccess: false, message: "Failed to create POI" }
  }
}

export async function getPoisBySearchAction(
  searchId: string
): Promise<ActionState<SelectPoi[]>> {
  try {
    const pois = await db.query.pois.findMany({
      where: eq(poisTable.searchId, searchId),
      orderBy: (pois) => [pois.createdAt.desc()]
    })
    return {
      isSuccess: true,
      message: "POIs retrieved successfully",
      data: pois
    }
  } catch (error) {
    console.error("Error getting POIs:", error)
    return { isSuccess: false, message: "Failed to get POIs" }
  }
}

export async function getPoiAction(
  id: string
): Promise<ActionState<SelectPoi>> {
  try {
    const poi = await db.query.pois.findFirst({
      where: eq(poisTable.id, id)
    })

    if (!poi) {
      return { isSuccess: false, message: "POI not found" }
    }

    return {
      isSuccess: true,
      message: "POI retrieved successfully",
      data: poi
    }
  } catch (error) {
    console.error("Error getting POI:", error)
    return { isSuccess: false, message: "Failed to get POI" }
  }
}

export async function updatePoiAction(
  id: string,
  data: Partial<InsertPoi>
): Promise<ActionState<SelectPoi>> {
  try {
    const [updatedPoi] = await db
      .update(poisTable)
      .set(data)
      .where(eq(poisTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "POI updated successfully",
      data: updatedPoi
    }
  } catch (error) {
    console.error("Error updating POI:", error)
    return { isSuccess: false, message: "Failed to update POI" }
  }
}

export async function deletePoiAction(id: string): Promise<ActionState<void>> {
  try {
    await db.delete(poisTable).where(eq(poisTable.id, id))
    return {
      isSuccess: true,
      message: "POI deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting POI:", error)
    return { isSuccess: false, message: "Failed to delete POI" }
  }
}

export async function deletePoisBySearchAction(
  searchId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(poisTable).where(eq(poisTable.searchId, searchId))
    return {
      isSuccess: true,
      message: "POIs deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting POIs:", error)
    return { isSuccess: false, message: "Failed to delete POIs" }
  }
} 