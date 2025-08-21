-- Remove indexes
DROP INDEX IF EXISTS idx_questionnaire_response_registration_questionnaire;
DROP INDEX IF EXISTS idx_questionnaire_response_questionnaire;

-- Remove unique index
DROP INDEX IF EXISTS uk_response_per_questionnaire_registration;

-- Restore original unique constraint (one response per registration)
ALTER TABLE questionnaire_response ADD CONSTRAINT uk_response_per_registration 
    UNIQUE (patient_registration_id);