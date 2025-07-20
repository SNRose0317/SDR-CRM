-- Create dynamic roles table to replace hardcoded role enum
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_roles_parent ON roles(parent_role_id);
CREATE INDEX idx_roles_active ON roles(is_active);
CREATE INDEX idx_roles_name ON roles(name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial roles to match existing enum values
INSERT INTO roles (name, display_name, description, parent_role_id, is_active) VALUES
    ('admin', 'Administrator', 'Full system access and configuration', NULL, true),
    ('sdr', 'Sales Development Representative', 'Sales team member focused on lead generation', NULL, true),
    ('health_coach', 'Health Coach', 'Healthcare provider supporting patient care', NULL, true),
    ('patient', 'Patient', 'Patient accessing their own health information', NULL, true);

-- Add comments for documentation
COMMENT ON TABLE roles IS 'Dynamic role definitions replacing hardcoded role enum';
COMMENT ON COLUMN roles.name IS 'Unique identifier for the role (used in code)';
COMMENT ON COLUMN roles.display_name IS 'Human-readable name shown in UI';
COMMENT ON COLUMN roles.parent_role_id IS 'Parent role for hierarchy (managers see subordinate data)';