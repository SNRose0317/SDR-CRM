-- Seed RBAC Data
-- This file sets up initial roles, permissions, and test users for the RBAC system

-- Clear existing data (for development only)
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE permissions CASCADE;
TRUNCATE TABLE roles CASCADE;

-- Insert base roles with hierarchy
INSERT INTO roles (name, display_name, description, parent_role_id) VALUES
  ('admin', 'Administrator', 'Full system access', NULL),
  ('director', 'Director', 'Director level access', NULL),
  ('manager', 'Manager', 'Team management access', NULL),
  ('sdr', 'Sales Development Rep', 'Sales representative access', NULL),
  ('health_coach', 'Health Coach', 'Patient care access', NULL),
  ('patient', 'Patient', 'Patient portal access', NULL);

-- Update hierarchy relationships
UPDATE roles SET parent_role_id = (SELECT id FROM roles WHERE name = 'admin') 
WHERE name = 'director';

UPDATE roles SET parent_role_id = (SELECT id FROM roles WHERE name = 'director') 
WHERE name = 'manager';

UPDATE roles SET parent_role_id = (SELECT id FROM roles WHERE name = 'manager') 
WHERE name IN ('sdr', 'health_coach');

-- Insert permissions by resource
-- Persons/Leads/Contacts permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('persons.view_own', 'persons', 'view_own', 'View own assigned persons'),
  ('persons.view_team', 'persons', 'view_team', 'View team members persons'),
  ('persons.view_all', 'persons', 'view_all', 'View all persons in system'),
  ('persons.create', 'persons', 'create', 'Create new persons'),
  ('persons.edit_own', 'persons', 'edit_own', 'Edit own assigned persons'),
  ('persons.edit_team', 'persons', 'edit_team', 'Edit team members persons'),
  ('persons.edit_all', 'persons', 'edit_all', 'Edit any person'),
  ('persons.delete_own', 'persons', 'delete_own', 'Delete own persons'),
  ('persons.delete_team', 'persons', 'delete_team', 'Delete team persons'),
  ('persons.delete_all', 'persons', 'delete_all', 'Delete any person'),
  ('persons.claim', 'persons', 'claim', 'Claim unassigned persons'),
  ('persons.transfer', 'persons', 'transfer', 'Transfer persons between users');

-- Tasks permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('tasks.view_own', 'tasks', 'view_own', 'View own tasks'),
  ('tasks.view_team', 'tasks', 'view_team', 'View team tasks'),
  ('tasks.view_all', 'tasks', 'view_all', 'View all tasks'),
  ('tasks.create', 'tasks', 'create', 'Create tasks'),
  ('tasks.edit_own', 'tasks', 'edit_own', 'Edit own tasks'),
  ('tasks.edit_team', 'tasks', 'edit_team', 'Edit team tasks'),
  ('tasks.edit_all', 'tasks', 'edit_all', 'Edit any task'),
  ('tasks.delete_own', 'tasks', 'delete_own', 'Delete own tasks'),
  ('tasks.delete_team', 'tasks', 'delete_team', 'Delete team tasks'),
  ('tasks.delete_all', 'tasks', 'delete_all', 'Delete any task');

-- Appointments permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('appointments.view_own', 'appointments', 'view_own', 'View own appointments'),
  ('appointments.view_team', 'appointments', 'view_team', 'View team appointments'),
  ('appointments.view_all', 'appointments', 'view_all', 'View all appointments'),
  ('appointments.create', 'appointments', 'create', 'Create appointments'),
  ('appointments.edit_own', 'appointments', 'edit_own', 'Edit own appointments'),
  ('appointments.edit_team', 'appointments', 'edit_team', 'Edit team appointments'),
  ('appointments.edit_all', 'appointments', 'edit_all', 'Edit any appointment'),
  ('appointments.delete_own', 'appointments', 'delete_own', 'Delete own appointments'),
  ('appointments.delete_team', 'appointments', 'delete_team', 'Delete team appointments'),
  ('appointments.delete_all', 'appointments', 'delete_all', 'Delete any appointment');

-- Reports permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('reports.view_own', 'reports', 'view_own', 'View own performance reports'),
  ('reports.view_team', 'reports', 'view_team', 'View team reports'),
  ('reports.view_all', 'reports', 'view_all', 'View all reports'),
  ('reports.export', 'reports', 'export', 'Export report data');

-- Health/Medical permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('health_records.view', 'health_records', 'view', 'View health records'),
  ('health_records.edit', 'health_records', 'edit', 'Edit health records'),
  ('health_questionnaires.view', 'health_questionnaires', 'view', 'View health questionnaires'),
  ('health_questionnaires.edit', 'health_questionnaires', 'edit', 'Edit health questionnaires'),
  ('health_questionnaires.submit', 'health_questionnaires', 'submit', 'Submit health questionnaires');

-- Administrative permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('users.view', 'users', 'view', 'View user list'),
  ('users.create', 'users', 'create', 'Create new users'),
  ('users.edit', 'users', 'edit', 'Edit user details'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.manage', 'users', 'manage', 'Full user management'),
  ('roles.view', 'roles', 'view', 'View roles'),
  ('roles.manage', 'roles', 'manage', 'Manage roles and permissions'),
  ('workflows.view', 'workflows', 'view', 'View workflows'),
  ('workflows.manage', 'workflows', 'manage', 'Manage workflows'),
  ('rules.view', 'rules', 'view', 'View business rules'),
  ('rules.manage', 'rules', 'manage', 'Manage business rules'),
  ('settings.view', 'settings', 'view', 'View system settings'),
  ('settings.manage', 'settings', 'manage', 'Manage system settings');

-- Dialer permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('dialer.use', 'dialer', 'use', 'Use the dialer system'),
  ('dialer.view_recordings', 'dialer', 'view_recordings', 'View call recordings'),
  ('dialer.manage_campaigns', 'dialer', 'manage_campaigns', 'Manage dialer campaigns');

-- Assign permissions to roles
-- Admin gets everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- Director permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'director'
  AND p.name IN (
    'persons.view_all', 'persons.edit_all', 'persons.create', 'persons.transfer',
    'tasks.view_all', 'tasks.edit_all', 'tasks.create',
    'appointments.view_all', 'appointments.edit_all', 'appointments.create',
    'reports.view_all', 'reports.export',
    'users.view', 'users.edit',
    'workflows.view', 'rules.view',
    'dialer.view_recordings', 'dialer.manage_campaigns'
  );

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager'
  AND p.name IN (
    'persons.view_team', 'persons.edit_team', 'persons.create', 'persons.claim', 'persons.transfer',
    'tasks.view_team', 'tasks.edit_team', 'tasks.create',
    'appointments.view_team', 'appointments.edit_team', 'appointments.create',
    'reports.view_team', 'reports.export',
    'users.view',
    'dialer.use', 'dialer.view_recordings'
  );

-- SDR permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sdr'
  AND p.name IN (
    'persons.view_own', 'persons.edit_own', 'persons.create', 'persons.claim',
    'tasks.view_own', 'tasks.edit_own', 'tasks.create',
    'appointments.view_own', 'appointments.edit_own', 'appointments.create',
    'reports.view_own',
    'dialer.use'
  );

-- Health Coach permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'health_coach'
  AND p.name IN (
    'persons.view_own', 'persons.edit_own',
    'tasks.view_own', 'tasks.edit_own', 'tasks.create',
    'appointments.view_own', 'appointments.edit_own', 'appointments.create',
    'health_records.view', 'health_records.edit',
    'health_questionnaires.view', 'health_questionnaires.edit',
    'reports.view_own'
  );

-- Patient permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'patient'
  AND p.name IN (
    'appointments.view_own',
    'health_records.view',
    'health_questionnaires.view', 'health_questionnaires.submit'
  );

-- Create test users with different roles
-- Note: In production, users would be created through Supabase Auth
-- This is just for testing the role assignments

-- First, ensure test users exist in auth.users (if not already)
-- These would normally be created via Supabase Auth signup
DO $$
BEGIN
  -- Only insert if users don't exist
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'director@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('33333333-3333-3333-3333-333333333333', 'manager@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('44444444-4444-4444-4444-444444444444', 'sdr1@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('55555555-5555-5555-5555-555555555555', 'sdr2@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('66666666-6666-6666-6666-666666666666', 'healthcoach@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
    ('77777777-7777-7777-7777-777777777777', 'patient@test.com', crypt('password123', gen_salt('bf')), now(), now(), now())
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Update users table with roles
INSERT INTO users (id, email, first_name, last_name, role_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@test.com', 'Admin', 'User', (SELECT id FROM roles WHERE name = 'admin')),
  ('22222222-2222-2222-2222-222222222222', 'director@test.com', 'Director', 'User', (SELECT id FROM roles WHERE name = 'director')),
  ('33333333-3333-3333-3333-333333333333', 'manager@test.com', 'Manager', 'User', (SELECT id FROM roles WHERE name = 'manager')),
  ('44444444-4444-4444-4444-444444444444', 'sdr1@test.com', 'SDR', 'One', (SELECT id FROM roles WHERE name = 'sdr')),
  ('55555555-5555-5555-5555-555555555555', 'sdr2@test.com', 'SDR', 'Two', (SELECT id FROM roles WHERE name = 'sdr')),
  ('66666666-6666-6666-6666-666666666666', 'healthcoach@test.com', 'Health', 'Coach', (SELECT id FROM roles WHERE name = 'health_coach')),
  ('77777777-7777-7777-7777-777777777777', 'patient@test.com', 'Patient', 'User', (SELECT id FROM roles WHERE name = 'patient'))
ON CONFLICT (id) DO UPDATE
SET role_id = EXCLUDED.role_id;

-- Verify the setup
SELECT 
  r.name as role_name,
  r.display_name,
  COUNT(DISTINCT rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.display_name
ORDER BY r.name;