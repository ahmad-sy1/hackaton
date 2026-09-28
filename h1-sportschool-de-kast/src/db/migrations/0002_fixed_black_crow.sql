CREATE TABLE "visit_logs" (
	"visit_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visit_logs_visit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"subscription_type_id" integer NOT NULL,
	"visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"access_granted" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_subscription_type_id_Subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."Subscriptions"("subscription_id") ON DELETE no action ON UPDATE no action;