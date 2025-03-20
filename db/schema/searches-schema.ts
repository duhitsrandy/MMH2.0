import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const searchesTable = pgTable("searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  startLocationAddress: text("start_location_address").notNull(),
  startLocationLat: text("start_location_lat").notNull(),
  startLocationLng: text("start_location_lng").notNull(),
  endLocationAddress: text("end_location_address").notNull(),
  endLocationLat: text("end_location_lat").notNull(),
  endLocationLng: text("end_location_lng").notNull(),
  midpointLat: text("midpoint_lat").notNull(),
  midpointLng: text("midpoint_lng").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSearch = typeof searchesTable.$inferInsert
export type SelectSearch = typeof searchesTable.$inferSelect
