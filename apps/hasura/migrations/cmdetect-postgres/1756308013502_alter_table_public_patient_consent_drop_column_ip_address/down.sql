alter table "public"."patient_consent" alter column "ip_address" drop not null;
alter table "public"."patient_consent" add column "ip_address" inet;
