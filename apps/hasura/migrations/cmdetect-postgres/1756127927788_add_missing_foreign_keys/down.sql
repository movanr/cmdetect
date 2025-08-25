-- Drop foreign key constraints added in the up migration

-- Drop patient table foreign keys
ALTER TABLE public.patient
    DROP CONSTRAINT IF EXISTS patient_organization_id_fkey;

-- Drop patient consent table foreign keys
ALTER TABLE public.patient_consent
    DROP CONSTRAINT IF EXISTS patient_consent_patient_record_id_fkey;

ALTER TABLE public.patient_consent
    DROP CONSTRAINT IF EXISTS patient_consent_organization_id_fkey;

-- Drop questionnaire response table foreign keys
ALTER TABLE public.questionnaire_response
    DROP CONSTRAINT IF EXISTS questionnaire_response_patient_record_id_fkey;

ALTER TABLE public.questionnaire_response
    DROP CONSTRAINT IF EXISTS questionnaire_response_organization_id_fkey;

ALTER TABLE public.questionnaire_response
    DROP CONSTRAINT IF EXISTS questionnaire_response_patient_consent_id_fkey;

-- Drop user table foreign key
ALTER TABLE public."user"
    DROP CONSTRAINT IF EXISTS user_organizationId_fkey;