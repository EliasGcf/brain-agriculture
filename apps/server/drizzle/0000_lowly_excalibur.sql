CREATE TABLE "farms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"total_area" numeric(12, 2) NOT NULL,
	"arable_area" numeric(12, 2) NOT NULL,
	"vegetation_area" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "farms_total_area_positive" CHECK ("farms"."total_area" > 0),
	CONSTRAINT "farms_arable_area_non_negative" CHECK ("farms"."arable_area" >= 0),
	CONSTRAINT "farms_vegetation_area_non_negative" CHECK ("farms"."vegetation_area" >= 0),
	CONSTRAINT "farms_allocated_areas_within_total" CHECK ("farms"."arable_area" + "farms"."vegetation_area" <= "farms"."total_area")
);
--> statement-breakpoint
CREATE TABLE "harvests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "harvests_farm_id_name_unique" UNIQUE("farm_id","name")
);
--> statement-breakpoint
CREATE TABLE "planted_crops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"harvest_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "producers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "producers_document_unique" UNIQUE("document")
);
--> statement-breakpoint
ALTER TABLE "farms" ADD CONSTRAINT "farms_producer_id_producers_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."producers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "planted_crops" ADD CONSTRAINT "planted_crops_harvest_id_harvests_id_fk" FOREIGN KEY ("harvest_id") REFERENCES "public"."harvests"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "farms_producer_id_idx" ON "farms" USING btree ("producer_id");--> statement-breakpoint
CREATE INDEX "farms_state_idx" ON "farms" USING btree ("state");--> statement-breakpoint
CREATE INDEX "farms_city_idx" ON "farms" USING btree ("city");--> statement-breakpoint
CREATE INDEX "planted_crops_harvest_id_idx" ON "planted_crops" USING btree ("harvest_id");--> statement-breakpoint
CREATE INDEX "producers_name_idx" ON "producers" USING btree ("name");