CREATE OR REPLACE FUNCTION smart_update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is a soft delete operation
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        -- Soft delete: only set deleted_at, preserve updated_at
        NEW.deleted_at = NOW();
        NEW.updated_at = OLD.updated_at;
    -- Check if this is a soft restore operation  
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
        -- Soft restore: clear deleted_at and update updated_at
        NEW.deleted_at = NULL;
        NEW.updated_at = NOW();
    -- Regular update (deleted_at unchanged)
    ELSIF OLD.deleted_at IS NOT DISTINCT FROM NEW.deleted_at THEN
        -- Normal update: only update updated_at
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table
CREATE TRIGGER trigger_smart_timestamps
    BEFORE UPDATE ON practitioner
    FOR EACH ROW
    EXECUTE FUNCTION smart_update_timestamps();

CREATE TRIGGER trigger_smart_timestamps
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION smart_update_timestamps();

-- Repeat for all tables with soft deletes...

-- add deleted_by column for audit purposes