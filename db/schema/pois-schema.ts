import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { searchesTable } from "./searches-schema"

export const poiTypeEnum = pgEnum("poi_type", [
  "restaurant",
  "cafe",
  "park",
  "bar",
  "library",
  "other"
])

export const poisTable = pgTable("pois", {
  id: uuid("id").defaultRandom().primaryKey(),
  searchId: uuid("search_id")
    .references(() => searchesTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  type: poiTypeEnum("type").notNull(),
  travelTimeFromStart: text("travel_time_from_start"),
  travelTimeFromEnd: text("travel_time_from_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPoi = typeof poisTable.$inferInsert
export type SelectPoi = typeof poisTable.$inferSelect
