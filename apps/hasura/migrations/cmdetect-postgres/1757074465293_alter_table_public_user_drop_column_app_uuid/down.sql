alter table "public"."user" alter column "app_uuid" drop not null;
alter table "public"."user" add column "app_uuid" text;
