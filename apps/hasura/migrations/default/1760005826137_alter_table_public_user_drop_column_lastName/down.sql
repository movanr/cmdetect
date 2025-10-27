alter table "public"."user" alter column "lastName" drop not null;
alter table "public"."user" add column "lastName" text;
