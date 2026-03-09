CREATE  INDEX "diagnosis_result_unique" on
  "public"."diagnosis_result" using btree ("diagnosis_id", "patient_record_id", "region", "side");
