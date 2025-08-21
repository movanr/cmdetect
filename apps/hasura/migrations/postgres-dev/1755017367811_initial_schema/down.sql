-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trigger_update_workflow_status ON questionnaire_response;
DROP TRIGGER IF EXISTS trigger_update_registration_status_on_consent ON patient_consent;

-- Drop functions
DROP FUNCTION IF EXISTS update_workflow_status_on_submission() CASCADE;
DROP FUNCTION IF EXISTS update_registration_status_on_consent() CASCADE;

-- Drop indexes (they will be dropped with tables, but explicit is cleaner)
DROP INDEX IF EXISTS idx_practitioner_auth_user_id;
DROP INDEX IF EXISTS idx_practitioner_email;
DROP INDEX IF EXISTS idx_registration_link_token;
DROP INDEX IF EXISTS idx_registration_assigned_to;
DROP INDEX IF EXISTS idx_patient_org_clinic_id;
DROP INDEX IF EXISTS idx_practitioner_org_roles;

-- Drop tables in reverse dependency order (child tables first)
DROP TABLE IF EXISTS questionnaire_response CASCADE;
DROP TABLE IF EXISTS patient_consent CASCADE;
DROP TABLE IF EXISTS patient_registration CASCADE;
DROP TABLE IF EXISTS patient CASCADE;
DROP TABLE IF EXISTS practitioner CASCADE;
DROP TABLE IF EXISTS organization CASCADE;

-- Drop extension (optional - only if you want complete cleanup)
-- DROP EXTENSION IF EXISTS "uuid-ossp";