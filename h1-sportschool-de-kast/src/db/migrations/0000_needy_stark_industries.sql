CREATE TABLE "Subscriptions" (
	"subscription_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Subscriptions_subscription_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"subscription_name" varchar(50) NOT NULL,
	"subscription_limit" integer
);
