-- Restore workflow_status column and all related functions, triggers and indices

-- Step 1: Add back the workflow_status column
ALTER TABLE patient_record ADD COLUMN workflow_status VARCHAR DEFAULT 'not_started' CHECK (workflow_status IN (
    'not_started',          -- Initial state
    'new_submission',       -- Patient submitted anamnesis  
    'under_review',         -- Physician reviewing anamnesis
    'examination_started',  -- Clinical examination in progress
    'examination_completed', -- Examination done, awaiting diagnosis
    'diagnosed',           -- Diagnosis complete, treatment planned
    'completed',           -- Case fully completed
    'archived'             -- Case archived
));

-- Step 2: Create index for workflow_status
CREATE INDEX idx_record_workflow_status ON patient_record(workflow_status) WHERE deleted_at IS NULL;

-- Step 3: Restore the workflow status trigger function
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

-- Step 4: Create trigger for workflow status updates
CREATE TRIGGER trigger_update_workflow_status_on_submission
    AFTER INSERT ON questionnaire_response
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_status_on_submission();