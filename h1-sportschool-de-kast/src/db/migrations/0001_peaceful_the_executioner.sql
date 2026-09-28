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
ALTER TABLE "Users" ADD CONSTRAINT "Users_subscription_id_Subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."Subscriptions"("subscription_id") ON DELETE no action ON UPDATE no action;