-- Add missing critical foreign key relationships

-- Patient table foreign keys
ALTER TABLE public.patient
    ADD CONSTRAINT patient_organization_id_fkey 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organization(id) 
    ON DELETE RESTRICT;

-- Patient consent table foreign keys
ALTER TABLE public.patient_consent
    ADD CONSTRAINT patient_consent_patient_record_id_fkey 
    FOREIGN KEY (patient_record_id) 
    REFERENCES public.patient_record(id) 
    ON DELETE CASCADE;

ALTER TABLE public.patient_consent
    ADD CONSTRAINT patient_consent_organization_id_fkey 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organization(id) 
    ON DELETE RESTRICT;

-- Questionnaire response table foreign keys
ALTER TABLE public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_patient_record_id_fkey 
    FOREIGN KEY (patient_record_id) 
    REFERENCES public.patient_record(id) 
    ON DELETE CASCADE;

ALTER TABLE public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_organization_id_fkey 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organization(id) 
    ON DELETE RESTRICT;

ALTER TABLE public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_patient_consent_id_fkey 
    FOREIGN KEY (patient_consent_id) 
    REFERENCES public.patient_consent(id) 
    ON DELETE RESTRICT;

-- User table foreign key for organization relationship
ALTER TABLE public."user"
    ADD CONSTRAINT user_organizationId_fkey 
    FOREIGN KEY ("organizationId") 
    REFERENCES public.organization(id) 
    ON DELETE SET NULL;