DO $$ BEGIN
 CREATE TYPE "public"."poi_type" AS ENUM('restaurant', 'cafe', 'park', 'bar', 'library', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"start_location_address" text NOT NULL,
	"start_location_lat" text NOT NULL,
	"start_location_lng" text NOT NULL,
	"end_location_address" text NOT NULL,
	"end_location_lat" text NOT NULL,
	"end_location_lng" text NOT NULL,
	"midpoint_lat" text NOT NULL,
	"midpoint_lng" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pois" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"type" "poi_type" NOT NULL,
	"travel_time_from_start" text,
	"travel_time_from_end" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pois" ADD CONSTRAINT "pois_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
