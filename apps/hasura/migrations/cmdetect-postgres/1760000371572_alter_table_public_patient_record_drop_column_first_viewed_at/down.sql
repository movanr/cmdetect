alter table "public"."patient_record" alter column "first_viewed_at" drop not null;
alter table "public"."patient_record" add column "first_viewed_at" timestamptz;
