alter table "public"."diagnosis_result" alter column "practitioner_decision" drop not null;
alter table "public"."diagnosis_result" add column "practitioner_decision" text;
