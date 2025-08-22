-- Drop Better Auth tables in reverse order (considering foreign key dependencies)

-- Drop foreign key constraints first
ALTER TABLE ONLY public.account DROP CONSTRAINT IF EXISTS "account_userId_fkey";
ALTER TABLE ONLY public.session DROP CONSTRAINT IF EXISTS "session_userId_fkey";

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.account;
DROP TABLE IF EXISTS public.session;
DROP TABLE IF EXISTS public.verification;
DROP TABLE IF EXISTS public.jwks;
DROP TABLE IF EXISTS public."user";