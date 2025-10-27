alter table "public"."patient_record"
  add constraint "patient_record_assigned_to_fkey"
  foreign key (assigned_to)
  references "public"."user"
  (id) on update no action on delete restrict;
alter table "public"."patient_record" alter column "assigned_to" drop not null;
alter table "public"."patient_record" add column "assigned_to" text;
