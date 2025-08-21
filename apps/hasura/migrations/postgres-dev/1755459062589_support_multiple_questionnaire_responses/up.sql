-- Remove existing unique constraint that limits to one response per registration
ALTER TABLE questionnaire_response DROP CONSTRAINT uk_response_per_registration;

-- Add unique index using JSONB field directly: one response per questionnaire per registration
CREATE UNIQUE INDEX uk_response_per_questionnaire_registration 
    ON questionnaire_response (patient_registration_id, (fhir_resource->>'questionnaire'));

-- Add performance index on questionnaire field within JSONB
CREATE INDEX idx_questionnaire_response_questionnaire ON questionnaire_response USING btree ((fhir_resource->>'questionnaire'));

-- Add compound index for registration + questionnaire queries
CREATE INDEX idx_questionnaire_response_registration_questionnaire ON questionnaire_response USING btree (patient_registration_id, (fhir_resource->>'questionnaire'));