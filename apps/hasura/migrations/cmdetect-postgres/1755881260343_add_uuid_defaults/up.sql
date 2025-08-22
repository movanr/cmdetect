-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hybrid approach: Keep Better Auth IDs as-is, add separate UUID for interoperability
-- Add app_uuid column to user table for standard UUID format

ALTER TABLE public."user" 
    ADD COLUMN app_uuid uuid DEFAULT uuid_generate_v4() UNIQUE;

-- Create index for performance on app_uuid lookups
CREATE INDEX idx_user_app_uuid ON public."user"(app_uuid);

-- Add app_uuid to existing users (for existing data)
UPDATE public."user" SET app_uuid = uuid_generate_v4() WHERE app_uuid IS NULL;