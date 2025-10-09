alter table "public"."patient_record"
  add constraint "patient_record_first_viewed_by_fkey"
  foreign key (first_viewed_by)
  references "public"."user"
  (id) on update no action on delete set null;
alter table "public"."patient_record" alter column "first_viewed_by" drop not null;
alter table "public"."patient_record" add column "first_viewed_by" text;
