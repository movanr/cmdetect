-- Migrate patient_registration table to patient_record with updated schema

-- Step 1: Create new patient_record table with corrected structure
CREATE TABLE patient_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    
    -- Assignment (using user.app_uuid instead of practitioner references)
    created_by UUID NOT NULL,
    assigned_to UUID NOT NULL,

    -- Invite token (changed from VARCHAR to UUID)
    invite_token UUID DEFAULT uuid_generate_v4(),
    invite_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Workflow status (updated enum values)
    workflow_status VARCHAR DEFAULT 'not_started' CHECK (workflow_status IN (
        'not_started',          -- Initial state
        'new_submission',       -- Patient submitted anamnesis  
        'under_review',         -- Physician reviewing anamnesis
        'examination_started',  -- Clinical examination in progress
        'examination_completed', -- Examination done, awaiting diagnosis (fixed typo)
        'diagnosed',           -- Diagnosis complete, treatment planned
        'completed',           -- Case fully completed (renamed from case_closed)
        'archived'             -- Case archived
    )),
    
    -- Patient invite status (renamed from 'status' to 'invite_status')
    invite_status VARCHAR DEFAULT 'pending' CHECK (invite_status IN (
        'pending',         -- Invite created but not sent
        'consent_pending', -- Invite sent, awaiting patient consent
        'consent_denied',  -- Patient refused consent
        'submitted',       -- Patient completed questionnaire
        'cancelled',       -- Invite cancelled
        'expired'          -- Invite expired
    )),
    
    -- Tracking (using user.app_uuid)
    first_viewed_at TIMESTAMP WITH TIME ZONE,
    first_viewed_by UUID,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_activity_by UUID,
    
    -- Clinical notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT fk_record_organization
        FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_patient
        FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_created_by
        FOREIGN KEY (created_by) REFERENCES "user"(app_uuid) ON DELETE RESTRICT,
    CONSTRAINT fk_record_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES "user"(app_uuid) ON DELETE RESTRICT,
    CONSTRAINT fk_record_first_viewed_by
        FOREIGN KEY (first_viewed_by) REFERENCES "user"(app_uuid),
    CONSTRAINT fk_record_last_activity_by
        FOREIGN KEY (last_activity_by) REFERENCES "user"(app_uuid)
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_record_organization ON patient_record(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_record_patient ON patient_record(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_record_created_by ON patient_record(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_record_assigned_to ON patient_record(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_record_workflow_status ON patient_record(workflow_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_record_invite_status ON patient_record(invite_status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_record_invite_token ON patient_record(invite_token) WHERE deleted_at IS NULL;

-- Step 3: Update patient_consent table to reference patient_record
ALTER TABLE patient_consent 
    RENAME COLUMN patient_registration_id TO patient_record_id;

-- Update foreign key constraint
ALTER TABLE patient_consent DROP CONSTRAINT fk_consent_registration;
ALTER TABLE patient_consent
    ADD CONSTRAINT fk_consent_patient_record
    FOREIGN KEY (patient_record_id) REFERENCES patient_record(id) ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE patient_consent DROP CONSTRAINT uk_consent_per_registration;
ALTER TABLE patient_consent ADD CONSTRAINT uk_consent_per_record UNIQUE (patient_record_id);

-- Step 4: Update questionnaire_response table to reference patient_record
ALTER TABLE questionnaire_response 
    RENAME COLUMN patient_registration_id TO patient_record_id;

-- Update foreign key constraint
ALTER TABLE questionnaire_response DROP CONSTRAINT fk_questionnaire_response_registration;
ALTER TABLE questionnaire_response
    ADD CONSTRAINT fk_questionnaire_response_record
    FOREIGN KEY (patient_record_id) REFERENCES patient_record(id) ON DELETE CASCADE;

-- Update unique constraint to support multiple questionnaires per record
-- Drop existing constraint/index if it exists (could be either from initial schema or from multiple responses migration)
DROP INDEX IF EXISTS uk_response_per_questionnaire_registration;
DROP INDEX IF EXISTS idx_questionnaire_response_registration_questionnaire;

-- Recreate unique constraint using new column name
CREATE UNIQUE INDEX uk_response_per_questionnaire_record 
    ON questionnaire_response (patient_record_id, (fhir_resource->>'questionnaire'));

-- Update other indexes to use new column name
CREATE INDEX idx_questionnaire_response_record_questionnaire 
    ON questionnaire_response USING btree (patient_record_id, (fhir_resource->>'questionnaire'));

-- Step 5: Update triggers and functions
-- Update function to work with patient_record
CREATE OR REPLACE FUNCTION update_workflow_status_on_submission()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_record 
    SET 
        workflow_status = 'new_submission',
        invite_status = 'submitted',
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.patient_record_id 
        AND workflow_status = 'not_started';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update consent trigger function
CREATE OR REPLACE FUNCTION update_registration_status_on_consent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_record 
    SET 
        invite_status = CASE 
            WHEN NEW.consent_given = true THEN 'consent_pending'
            WHEN NEW.consent_given = false THEN 'consent_denied'
            ELSE invite_status
        END,
        updated_at = NOW()
    WHERE id = NEW.patient_record_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop old patient_registration table
DROP TABLE patient_registration CASCADE;