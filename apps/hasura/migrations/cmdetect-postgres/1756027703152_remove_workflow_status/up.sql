-- Remove workflow_status column and all related functions, triggers and indices

-- Step 1: Drop index for workflow_status
DROP INDEX IF EXISTS idx_record_workflow_status;

-- Step 2: Drop the workflow status trigger and function
DROP TRIGGER IF EXISTS trigger_update_workflow_status_on_submission ON questionnaire_response;
DROP FUNCTION IF EXISTS update_workflow_status_on_submission() CASCADE;

-- Step 3: Remove the workflow_status column
ALTER TABLE patient_record DROP COLUMN IF EXISTS workflow_status;