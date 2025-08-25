-- Remove invite_status column and all related functions, triggers and indices

-- Step 1: Drop index for invite_status
DROP INDEX IF EXISTS idx_record_invite_status;

-- Step 2: Update trigger functions to remove invite_status references
CREATE OR REPLACE FUNCTION update_workflow_status_on_submission()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patient_record 
    SET 
        workflow_status = 'new_submission',
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
        updated_at = NOW()
    WHERE id = NEW.patient_record_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Remove the invite_status column
ALTER TABLE patient_record DROP COLUMN IF EXISTS invite_status;