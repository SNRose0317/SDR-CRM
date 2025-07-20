-- Create a view for efficient permission checking
-- This view flattens the user -> role -> permissions relationship
CREATE OR REPLACE VIEW user_permissions AS
WITH RECURSIVE role_hierarchy AS (
    -- Base case: user's direct role
    SELECT 
        u.id as user_id,
        u.email,
        r.id as role_id,
        r.name as role_name,
        r.display_name as role_display_name,
        r.parent_role_id,
        1 as hierarchy_level
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE r.is_active = true
    
    UNION ALL
    
    -- Recursive case: inherit permissions from parent roles
    SELECT 
        rh.user_id,
        rh.email,
        r.id as role_id,
        r.name as role_name,
        r.display_name as role_display_name,
        r.parent_role_id,
        rh.hierarchy_level + 1 as hierarchy_level
    FROM role_hierarchy rh
    INNER JOIN roles r ON rh.parent_role_id = r.id
    WHERE r.is_active = true
)
SELECT DISTINCT
    rh.user_id,
    rh.email,
    rh.role_id,
    rh.role_name,
    rh.role_display_name,
    p.id as permission_id,
    p.name as permission_name,
    p.resource,
    p.action,
    p.description as permission_description,
    MIN(rh.hierarchy_level) as inherited_from_level
FROM role_hierarchy rh
INNER JOIN role_permissions rp ON rh.role_id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
GROUP BY 
    rh.user_id,
    rh.email,
    rh.role_id,
    rh.role_name,
    rh.role_display_name,
    p.id,
    p.name,
    p.resource,
    p.action,
    p.description;

-- Create indexes on the base tables to optimize the view
CREATE INDEX IF NOT EXISTS idx_users_role_id_email ON users(role_id, email);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_permission ON role_permissions(role_id, permission_id);

-- Create a simplified view for quick permission checks
CREATE OR REPLACE VIEW user_permission_check AS
SELECT DISTINCT
    user_id,
    permission_name
FROM user_permissions;

-- Create a view to show team hierarchy for data visibility
CREATE OR REPLACE VIEW user_team_hierarchy AS
WITH RECURSIVE team_hierarchy AS (
    -- Base case: user sees their own data
    SELECT 
        u.id as manager_id,
        u.id as subordinate_id,
        u.email as manager_email,
        u.email as subordinate_email,
        0 as hierarchy_depth
    FROM users u
    
    UNION ALL
    
    -- Recursive case: managers see their team's data
    SELECT 
        th.manager_id,
        u.id as subordinate_id,
        th.manager_email,
        u.email as subordinate_email,
        th.hierarchy_depth + 1 as hierarchy_depth
    FROM team_hierarchy th
    INNER JOIN users u ON u.role_id IN (
        SELECT r2.id 
        FROM roles r1 
        INNER JOIN roles r2 ON r2.parent_role_id = r1.id
        INNER JOIN users u2 ON u2.id = th.subordinate_id AND u2.role_id = r1.id
    )
    WHERE th.hierarchy_depth < 10 -- Prevent infinite recursion
)
SELECT DISTINCT * FROM team_hierarchy;

-- Add comments for documentation
COMMENT ON VIEW user_permissions IS 'Flattened view of all permissions for each user, including inherited permissions from parent roles';
COMMENT ON VIEW user_permission_check IS 'Simplified view for quick permission lookups by user_id and permission_name';
COMMENT ON VIEW user_team_hierarchy IS 'Shows which users can see which other users data based on role hierarchy';