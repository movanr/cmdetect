alter table "public"."diagnosis_result" alter column "computed_status" drop not null;
alter table "public"."diagnosis_result" add column "computed_status" text;
