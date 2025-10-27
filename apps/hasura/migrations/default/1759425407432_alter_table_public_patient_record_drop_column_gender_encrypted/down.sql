alter table "public"."patient_record" alter column "gender_encrypted" drop not null;
alter table "public"."patient_record" add column "gender_encrypted" text;
