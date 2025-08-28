alter table "public"."patient_consent" alter column "user_agent" drop not null;
alter table "public"."patient_consent" add column "user_agent" text;
