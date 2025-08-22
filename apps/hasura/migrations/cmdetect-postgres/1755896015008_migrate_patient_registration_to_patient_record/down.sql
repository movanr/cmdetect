-- Rollback migration: Revert patient_record back to patient_registration

-- Step 1: Recreate patient_registration table with original structure
CREATE TABLE patient_registration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    created_by_user_id text,
    assigned_user_id text,
    link_token VARCHAR UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
    link_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    status VARCHAR DEFAULT 'pending' CHECK (status IN (
        'pending', 'consent_pending', 'consent_denied', 
        'submitted', 'cancelled', 'expired'
    )),
    
    workflow_status VARCHAR DEFAULT 'not_started' CHECK (workflow_status IN (
        'not_started', 'new_submission', 'under_review', 
        'examination_started', 'examination_complete', 
        'diagnosed', 'case_closed', 'archived'
    )),
    
    first_viewed_at TIMESTAMP WITH TIME ZONE,
    first_viewed_by_user_id text,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_activity_by_user_id text,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT fk_registration_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organization(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_registration_patient
        FOREIGN KEY (patient_id) 
        REFERENCES patient(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_registration_created_by_user 
        FOREIGN KEY (created_by_user_id) 
        REFERENCES "user"(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_registration_assigned_to_user 
        FOREIGN KEY (assigned_user_id) 
        REFERENCES "user"(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_registration_first_viewed_by_user 
        FOREIGN KEY (first_viewed_by_user_id) 
        REFERENCES "user"(id),
    CONSTRAINT fk_registration_last_activity_by_user 
        FOREIGN KEY (last_activity_by_user_id) 
        REFERENCES "user"(id)
);

-- Step 2: Recreate original indexes
CREATE UNIQUE INDEX idx_registration_link_token ON patient_registration(link_token) WHERE deleted_at IS NULL;
CREATE INDEX idx_registration_created_by_user ON patient_registration(created_by_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_registration_assigned_to_user ON patient_registration(assigned_user_id) WHERE deleted_at IS NULL;

-- Step 3: Update patient_consent table to reference patient_registration
ALTER TABLE patient_consent DROP CONSTRAINT fk_consent_patient_record;
ALTER TABLE patient_consent 
    RENAME COLUMN patient_record_id TO patient_registration_id;

ALTER TABLE patient_consent
    ADD CONSTRAINT fk_consent_registration
    FOREIGN KEY (patient_registration_id) REFERENCES patient_registration(id) ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE patient_consent DROP CONSTRAINT uk_consent_per_record;
ALTER TABLE patient_consent ADD CONSTRAINT uk_consent_per_registration UNIQUE (patient_registration_id);

-- Step 4: Update questionnaire_response table to reference patient_registration
ALTER TABLE questionnaire_response DROP CONSTRAINT fk_questionnaire_response_record;
ALTER TABLE questionnaire_response 
    RENAME COLUMN patient_record_id TO patient_registration_id;

ALTER TABLE questionnaire_response
    ADD CONSTRAINT fk_questionnaire_response_registration
    FOREIGN KEY (patient_registration_id) REFERENCES patient_registration(id) ON DELETE CASCADE;

-- Update unique constraint back to original multiple questionnaire support
ALTER TABLE questionnaire_response DROP CONSTRAINT uk_response_per_questionnaire_record;
DROP INDEX idx_questionnaire_response_record_questionnaire;

-- Recreate original indexes
CREATE UNIQUE INDEX uk_response_per_questionnaire_registration 
    ON questionnaire_response (patient_registration_id, (fhir_resource->>'questionnaire'));

CREATE INDEX idx_questionnaire_response_registration_questionnaire 
    ON questionnaire_response USING btree (patient_registration_id, (fhir_resource->>'questionnaire'));

-- Step 5: Restore original trigger functions
CREATE OR REPLACE FUNCTION update_workflow_status_on_submission()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_registration 
    SET 
        workflow_status = 'new_submission',
        status = 'submitted',
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.patient_registration_id 
        AND workflow_status = 'not_started';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_registration_status_on_consent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_registration 
    SET 
        status = CASE 
            WHEN NEW.consent_given = true THEN 'consent_pending'
            WHEN NEW.consent_given = false THEN 'consent_denied'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.patient_registration_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop patient_record table
DROP TABLE patient_record CASCADE;