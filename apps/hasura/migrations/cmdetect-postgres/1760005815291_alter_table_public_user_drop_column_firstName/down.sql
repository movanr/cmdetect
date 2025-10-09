alter table "public"."user" alter column "firstName" drop not null;
alter table "public"."user" add column "firstName" text;
