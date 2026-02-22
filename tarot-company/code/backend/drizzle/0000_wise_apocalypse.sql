CREATE TABLE "devices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "devices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"device_token" text NOT NULL,
	"disclosed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "devices_device_token_unique" UNIQUE("device_token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" text NOT NULL,
	"device_token" text NOT NULL,
	"ontology_version_id" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"transcript_text" text,
	"feature_vector" jsonb,
	"domain" text,
	"stage_a_status" text,
	"stage_a_latency_ms" integer,
	"spread_shape" text,
	"major_tier" integer,
	"matchscore_mode" text,
	"cards" jsonb,
	"stage_b_latency_ms" integer,
	"cache_hit" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "stage_b_cache" (
	"ontology_version_id" text NOT NULL,
	"cache_key_hash" text NOT NULL,
	"card_id" text NOT NULL,
	"orientation" text NOT NULL,
	"position" text NOT NULL,
	"interpretation_commit" text,
	"interpretation_exploratory_a" text,
	"interpretation_exploratory_b" text,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stage_b_cache_ontology_version_id_cache_key_hash_pk" PRIMARY KEY("ontology_version_id","cache_key_hash")
);
--> statement-breakpoint
CREATE TABLE "telemetry_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "telemetry_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" text,
	"device_token" text,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sessions_device_token_idx" ON "sessions" USING btree ("device_token");--> statement-breakpoint
CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");