-- Remove the app_uuid column and related constraints/indexes

DROP INDEX IF EXISTS idx_user_app_uuid;
ALTER TABLE public."user" DROP COLUMN IF EXISTS app_uuid;