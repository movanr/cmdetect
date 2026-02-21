alter table "public"."diagnosis_result"
  add constraint "diagnosis_result_evaluation_id_fkey"
  foreign key (diagnosis_evaluation_id)
  references "public"."diagnosis_evaluation"
  (id) on update no action on delete cascade;
alter table "public"."diagnosis_result" alter column "diagnosis_evaluation_id" drop not null;
alter table "public"."diagnosis_result" add column "diagnosis_evaluation_id" text;
