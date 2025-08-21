-- Part 2: Add foreign key constraints to connect patient_registration with Better Auth user table

-- 1. Rename practitioner columns to user columns and convert UUID to TEXT
ALTER TABLE patient_registration 
    RENAME COLUMN created_by_practitioner_id TO created_by_user_id,
    RENAME COLUMN assigned_practitioner_id TO assigned_to_user_id;

-- 2. Convert user ID columns from UUID to TEXT to match Better Auth user.id type
ALTER TABLE patient_registration 
    ALTER COLUMN created_by_user_id TYPE TEXT,
    ALTER COLUMN assigned_to_user_id TYPE TEXT,
    ALTER COLUMN first_viewed_by TYPE TEXT,
    ALTER COLUMN last_activity_by TYPE TEXT;

-- 3. Add foreign key constraints pointing to Better Auth user table (TEXT to TEXT)
ALTER TABLE patient_registration 
    ADD CONSTRAINT fk_registration_created_by_user
        FOREIGN KEY (created_by_user_id) 
        REFERENCES "user"(id) 
        ON DELETE RESTRICT,
    ADD CONSTRAINT fk_registration_assigned_to_user
        FOREIGN KEY (assigned_to_user_id) 
        REFERENCES "user"(id) 
        ON DELETE RESTRICT,
    ADD CONSTRAINT fk_registration_first_viewed_by_user
        FOREIGN KEY (first_viewed_by) 
        REFERENCES "user"(id) 
        ON DELETE SET NULL,
    ADD CONSTRAINT fk_registration_last_activity_by_user
        FOREIGN KEY (last_activity_by) 
        REFERENCES "user"(id) 
        ON DELETE SET NULL;

-- 4. Convert user.organizationId from TEXT to UUID to match organization.id
ALTER TABLE "user" 
    ALTER COLUMN "organizationId" TYPE UUID USING "organizationId"::UUID;

-- 5. Add foreign key constraint from user to organization
ALTER TABLE "user" 
    ADD CONSTRAINT fk_user_organization
        FOREIGN KEY ("organizationId") 
        REFERENCES organization(id) 
        ON DELETE SET NULL;

-- 6. Add role validation constraint to user table
ALTER TABLE "user" 
    ADD CONSTRAINT user_roles_valid 
        CHECK (roles <@ ARRAY['org_admin', 'physician', 'receptionist']);

-- 7. Add performance indexes on user table
CREATE INDEX idx_user_organization_roles ON "user"("organizationId", roles) WHERE "deletedAt" IS NULL;
CREATE INDEX idx_user_active ON "user"("isActive") WHERE "deletedAt" IS NULL;