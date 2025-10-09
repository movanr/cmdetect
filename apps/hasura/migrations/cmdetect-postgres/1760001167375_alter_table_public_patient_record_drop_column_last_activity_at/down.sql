alter table "public"."patient_record" alter column "last_activity_at" drop not null;
alter table "public"."patient_record" add column "last_activity_at" timestamptz;
