-- Restore invite_status column and all related functions, triggers and indices

-- Step 1: Add back the invite_status column
ALTER TABLE patient_record ADD COLUMN invite_status VARCHAR DEFAULT 'pending' CHECK (invite_status IN (
    'pending',         -- Invite created but not sent
    'consent_pending', -- Invite sent, awaiting patient consent
    'consent_denied',  -- Patient refused consent
    'submitted',       -- Patient completed questionnaire
    'cancelled',       -- Invite cancelled
    'expired'          -- Invite expired
));

-- Step 2: Create index for invite_status
CREATE INDEX idx_record_invite_status ON patient_record(invite_status) WHERE deleted_at IS NULL;

-- Step 3: Restore trigger functions with invite_status references
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