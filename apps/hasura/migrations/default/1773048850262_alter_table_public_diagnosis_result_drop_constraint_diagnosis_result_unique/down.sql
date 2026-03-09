alter table "public"."diagnosis_result" add constraint "diagnosis_result_patient_record_id_region_side_diagnosis_id_key" unique ("patient_record_id", "region", "side", "diagnosis_id");
