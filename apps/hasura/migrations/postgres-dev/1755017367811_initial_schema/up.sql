-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organization table first (no dependencies)
CREATE TABLE organization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    address_line1 VARCHAR,
    address_line2 VARCHAR,
    city VARCHAR,
    postal_code VARCHAR,
    country VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    website VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create practitioner table
CREATE TABLE practitioner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    organization_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_practitioner_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organization(id) 
        ON DELETE CASCADE,
    CONSTRAINT practitioner_roles_not_empty 
        CHECK (array_length(roles, 1) > 0),
    CONSTRAINT practitioner_roles_valid 
        CHECK (roles <@ ARRAY['org_admin', 'physician', 'receptionist'])
);

-- Create patient table
CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    clinic_internal_id VARCHAR NOT NULL,
    first_name_encrypted TEXT NOT NULL,
    last_name_encrypted TEXT NOT NULL,
    gender_encrypted TEXT,
    date_of_birth_encrypted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_patient_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organization(id) 
        ON DELETE CASCADE,
    CONSTRAINT uk_patient_clinic_id_org
        UNIQUE (organization_id, clinic_internal_id)
);

-- Create patient_registration table
CREATE TABLE patient_registration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    created_by_practitioner_id UUID NOT NULL,
    assigned_practitioner_id UUID NOT NULL,
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
    first_viewed_by UUID REFERENCES practitioner(id),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_activity_by UUID REFERENCES practitioner(id),
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
    CONSTRAINT fk_registration_created_by
        FOREIGN KEY (created_by_practitioner_id) 
        REFERENCES practitioner(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_registration_assigned_to
        FOREIGN KEY (assigned_practitioner_id) 
        REFERENCES practitioner(id) 
        ON DELETE RESTRICT
);

-- Create patient_consent table
CREATE TABLE patient_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_registration_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_text TEXT NOT NULL,
    consent_version VARCHAR NOT NULL,
    ip_address INET,
    user_agent TEXT,
    consented_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_consent_registration
        FOREIGN KEY (patient_registration_id) 
        REFERENCES patient_registration(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_consent_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organization(id) 
        ON DELETE CASCADE,
    CONSTRAINT uk_consent_per_registration 
        UNIQUE (patient_registration_id)
);

-- Create questionnaire_response table
CREATE TABLE questionnaire_response (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_registration_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    patient_consent_id UUID NOT NULL,
    fhir_resource JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_questionnaire_response_registration
        FOREIGN KEY (patient_registration_id) 
        REFERENCES patient_registration(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_questionnaire_response_consent
        FOREIGN KEY (patient_consent_id) 
        REFERENCES patient_consent(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_questionnaire_response_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organization(id) 
        ON DELETE CASCADE,
    CONSTRAINT uk_response_per_registration 
        UNIQUE (patient_registration_id)
);

-- Essential indexes
CREATE UNIQUE INDEX idx_practitioner_auth_user_id ON practitioner(auth_user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_practitioner_email ON practitioner(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_registration_link_token ON patient_registration(link_token) WHERE deleted_at IS NULL;

-- Core workflow indexes
CREATE INDEX idx_registration_assigned_to ON patient_registration(assigned_practitioner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_org_clinic_id ON patient(organization_id, clinic_internal_id) WHERE deleted_at IS NULL;

-- Organization isolation and role-based filtering
CREATE INDEX idx_practitioner_org_roles ON practitioner(organization_id, roles) WHERE deleted_at IS NULL;

-- Update workflow status when questionnaire is submitted
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

-- Trigger: Automatically update workflow status on questionnaire submission
CREATE TRIGGER trigger_update_workflow_status
    AFTER INSERT ON questionnaire_response
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_status_on_submission();

-- Update registration status based on consent decision
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

-- Trigger: Update registration status when consent is given/denied
CREATE TRIGGER trigger_update_registration_status_on_consent
    AFTER INSERT OR UPDATE ON patient_consent
    FOR EACH ROW
    EXECUTE FUNCTION update_registration_status_on_consent();
