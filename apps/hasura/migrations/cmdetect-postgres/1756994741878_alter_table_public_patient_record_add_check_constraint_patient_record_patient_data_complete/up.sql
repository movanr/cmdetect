alter table "public"."patient_record" drop constraint "patient_record_patient_data_complete";
alter table "public"."patient_record" add constraint "patient_record_patient_data_complete" check (    (first_name_encrypted IS NULL AND 
     last_name_encrypted IS NULL AND 
     gender_encrypted IS NULL AND 
     date_of_birth_encrypted IS NULL AND 
     patient_data_completed_at IS NULL) OR
    (first_name_encrypted IS NOT NULL AND 
     last_name_encrypted IS NOT NULL AND 
     gender_encrypted IS NOT NULL AND 
     date_of_birth_encrypted IS NOT NULL AND 
     patient_data_completed_at IS NOT NULL AND
     length(trim(first_name_encrypted)) > 0 AND 
     length(trim(last_name_encrypted)) > 0 AND
     length(trim(gender_encrypted)) > 0 AND
     length(trim(date_of_birth_encrypted)) > 0)
);
