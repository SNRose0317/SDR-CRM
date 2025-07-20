-- Add role_id column to users table to reference dynamic roles
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id);

-- Create temporary mapping of existing enum values to new role IDs
-- This assumes the roles were inserted in order from the previous migration
UPDATE users 
SET role_id = roles.id
FROM roles
WHERE users.role::text = roles.name;

-- Verify all users have been assigned a role_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE role_id IS NULL) THEN
        RAISE EXCEPTION 'Some users do not have a role_id assigned. Migration cannot continue.';
    END IF;
END $$;

-- Make role_id NOT NULL after all users have been assigned
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

-- Create index for performance
CREATE INDEX idx_users_role_id ON users(role_id);

-- Add trigger to update updated_at timestamp for users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN users.role_id IS 'Reference to dynamic role (replaces role enum)';

-- Note: The old 'role' column is NOT dropped in this migration to allow for rollback
-- It will be dropped in a future migration after confirming the new system works
-- To rollback: UPDATE users SET role_id = NULL; ALTER TABLE users DROP COLUMN role_id;