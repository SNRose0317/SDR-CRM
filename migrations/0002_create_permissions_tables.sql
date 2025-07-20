-- Create permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- Create indexes for performance
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Insert core permissions for the system
INSERT INTO permissions (name, resource, action, description) VALUES
    -- Persons/Leads/Contacts permissions
    ('persons.view_own', 'persons', 'view_own', 'View only persons assigned to the user'),
    ('persons.view_team', 'persons', 'view_team', 'View persons assigned to team members in hierarchy'),
    ('persons.view_all', 'persons', 'view_all', 'View all persons in the system'),
    ('persons.create', 'persons', 'create', 'Create new persons/leads/contacts'),
    ('persons.edit_own', 'persons', 'edit_own', 'Edit only persons assigned to the user'),
    ('persons.edit_team', 'persons', 'edit_team', 'Edit persons assigned to team members'),
    ('persons.edit_all', 'persons', 'edit_all', 'Edit all persons in the system'),
    ('persons.delete_own', 'persons', 'delete_own', 'Delete only persons assigned to the user'),
    ('persons.delete_team', 'persons', 'delete_team', 'Delete persons assigned to team members'),
    ('persons.delete_all', 'persons', 'delete_all', 'Delete all persons in the system'),
    
    -- Tasks permissions
    ('tasks.view_own', 'tasks', 'view_own', 'View only tasks assigned to the user'),
    ('tasks.view_team', 'tasks', 'view_team', 'View tasks assigned to team members'),
    ('tasks.view_all', 'tasks', 'view_all', 'View all tasks in the system'),
    ('tasks.create', 'tasks', 'create', 'Create new tasks'),
    ('tasks.edit_own', 'tasks', 'edit_own', 'Edit only tasks assigned to the user'),
    ('tasks.edit_all', 'tasks', 'edit_all', 'Edit all tasks in the system'),
    ('tasks.delete_own', 'tasks', 'delete_own', 'Delete only tasks assigned to the user'),
    ('tasks.delete_all', 'tasks', 'delete_all', 'Delete all tasks in the system'),
    
    -- Appointments permissions
    ('appointments.view_own', 'appointments', 'view_own', 'View only appointments for the user'),
    ('appointments.view_team', 'appointments', 'view_team', 'View appointments for team members'),
    ('appointments.view_all', 'appointments', 'view_all', 'View all appointments'),
    ('appointments.create', 'appointments', 'create', 'Create new appointments'),
    ('appointments.edit_own', 'appointments', 'edit_own', 'Edit only user''s appointments'),
    ('appointments.edit_all', 'appointments', 'edit_all', 'Edit all appointments'),
    ('appointments.delete_own', 'appointments', 'delete_own', 'Delete only user''s appointments'),
    ('appointments.delete_all', 'appointments', 'delete_all', 'Delete all appointments'),
    
    -- Reports permissions
    ('reports.view_own', 'reports', 'view_own', 'View reports for own data only'),
    ('reports.view_team', 'reports', 'view_team', 'View reports for team data'),
    ('reports.view_all', 'reports', 'view_all', 'View all system reports'),
    ('reports.export', 'reports', 'export', 'Export report data'),
    
    -- Health Records permissions (for healthcare functionality)
    ('health_records.view', 'health_records', 'view', 'View patient health records'),
    ('health_records.edit', 'health_records', 'edit', 'Edit patient health records'),
    ('health_records.create', 'health_records', 'create', 'Create new health records'),
    
    -- Deals/Sales permissions (for sales functionality)
    ('deals.view_own', 'deals', 'view_own', 'View only deals assigned to user'),
    ('deals.view_team', 'deals', 'view_team', 'View deals for team members'),
    ('deals.view_all', 'deals', 'view_all', 'View all deals'),
    ('deals.create', 'deals', 'create', 'Create new deals'),
    ('deals.edit_own', 'deals', 'edit_own', 'Edit only deals assigned to user'),
    ('deals.edit_all', 'deals', 'edit_all', 'Edit all deals'),
    
    -- Admin permissions
    ('roles.view', 'roles', 'view', 'View role definitions'),
    ('roles.manage', 'roles', 'manage', 'Create, edit, and delete roles'),
    ('permissions.view', 'permissions', 'view', 'View permission definitions'),
    ('permissions.manage', 'permissions', 'manage', 'Assign and revoke permissions'),
    ('users.view', 'users', 'view', 'View user accounts'),
    ('users.manage', 'users', 'manage', 'Create, edit, and delete users'),
    ('settings.view', 'settings', 'view', 'View system settings'),
    ('settings.manage', 'settings', 'manage', 'Modify system settings'),
    
    -- Portal permissions (for external users)
    ('portal.access', 'portal', 'access', 'Access the patient/client portal'),
    ('portal.view_own_data', 'portal', 'view_own_data', 'View own data in portal'),
    ('portal.edit_own_data', 'portal', 'edit_own_data', 'Edit own data in portal');

-- Assign initial permissions to roles based on current functionality
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- SDR permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sdr' AND p.name IN (
    'persons.view_own',
    'persons.view_team',
    'persons.create',
    'persons.edit_own',
    'persons.edit_team',
    'tasks.view_own',
    'tasks.view_team',
    'tasks.create',
    'tasks.edit_own',
    'appointments.view_own',
    'appointments.create',
    'appointments.edit_own',
    'reports.view_own',
    'reports.view_team',
    'deals.view_own',
    'deals.view_team',
    'deals.create',
    'deals.edit_own'
);

-- Health Coach permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'health_coach' AND p.name IN (
    'persons.view_own',
    'persons.view_team',
    'persons.edit_own',
    'tasks.view_own',
    'tasks.create',
    'tasks.edit_own',
    'appointments.view_own',
    'appointments.view_team',
    'appointments.create',
    'appointments.edit_own',
    'health_records.view',
    'health_records.edit',
    'health_records.create',
    'reports.view_own'
);

-- Patient permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'patient' AND p.name IN (
    'portal.access',
    'portal.view_own_data',
    'portal.edit_own_data',
    'appointments.view_own',
    'tasks.view_own'
);

-- Add comments for documentation
COMMENT ON TABLE permissions IS 'Fine-grained permissions for RBAC system';
COMMENT ON COLUMN permissions.name IS 'Unique permission identifier (format: resource.action)';
COMMENT ON COLUMN permissions.resource IS 'Resource being accessed (persons, tasks, etc.)';
COMMENT ON COLUMN permissions.action IS 'Action being performed (view_own, edit_all, etc.)';

COMMENT ON TABLE role_permissions IS 'Junction table linking roles to permissions';
COMMENT ON COLUMN role_permissions.granted_by IS 'User who granted this permission (for audit trail)';