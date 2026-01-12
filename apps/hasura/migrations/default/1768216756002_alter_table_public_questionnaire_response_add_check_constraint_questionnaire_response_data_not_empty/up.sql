alter table "public"."questionnaire_response" drop constraint "questionnaire_response_fhir_not_empty";
alter table "public"."questionnaire_response" add constraint "questionnaire_response_data_not_empty" check (jsonb_typeof(response_data) = 'object'::text AND response_data <> '{}'::jsonb);
