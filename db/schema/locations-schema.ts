import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const locationsTable = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertLocation = typeof locationsTable.$inferInsert
export type SelectLocation = typeof locationsTable.$inferSelect
