alter table "public"."patient_record" alter column "notes" drop not null;
alter table "public"."patient_record" add column "notes" text;
