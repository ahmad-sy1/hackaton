CREATE TABLE "Subscriptions" (
	"subscription_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Subscriptions_subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subscription_name" varchar(50) NOT NULL,
	"subscription_limit" integer
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subscription_id" integer NOT NULL,
	"firstname" varchar(100) NOT NULL,
	"lastname" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"pin_hash" varchar(255) NOT NULL,
	"subscription_start" date NOT NULL,
	"subscription_end" date,
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visit_logs" (
	"visit_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "visit_logs_visit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"subscription_type_id" integer NOT NULL,
	"visit_date" timestamp with time zone DEFAULT now() NOT NULL,
	"access_granted" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Users" ADD CONSTRAINT "Users_subscription_id_Subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."Subscriptions"("subscription_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD CONSTRAINT "visit_logs_subscription_type_id_Subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."Subscriptions"("subscription_id") ON DELETE no action ON UPDATE no action;