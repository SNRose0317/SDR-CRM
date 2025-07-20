-- Create helper functions for authorization using JWT claims

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION auth.has_permission(required_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the permission exists in the user's JWT permissions array
  RETURN (
    SELECT auth.jwt() -> 'permissions' ? required_permission
  );
END;
$$;

-- Function to check if user has any of the provided permissions
CREATE OR REPLACE FUNCTION auth.has_any_permission(VARIADIC required_permissions text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if any of the permissions exist in the user's JWT permissions array
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM unnest(required_permissions) AS perm
      WHERE auth.jwt() -> 'permissions' ? perm
    )
  );
END;
$$;

-- Function to get user's role from JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'user_role', 'anonymous')::text;
$$;

-- Function to get user's role ID from JWT
CREATE OR REPLACE FUNCTION auth.user_role_id()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() ->> 'role_id')::integer, 0);
$$;

-- Function to check if current user is in the hierarchy above another user
CREATE OR REPLACE FUNCTION auth.is_above_in_hierarchy(subordinate_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role_id integer;
  subordinate_role_id integer;
BEGIN
  -- Get current user's role_id from JWT
  current_user_role_id := auth.user_role_id();
  
  -- Get subordinate's role_id
  SELECT role_id INTO subordinate_role_id
  FROM users
  WHERE id = subordinate_user_id;
  
  -- Check if current user's role is above subordinate's role in hierarchy
  RETURN EXISTS (
    WITH RECURSIVE role_hierarchy AS (
      -- Start with subordinate's role
      SELECT id, parent_role_id
      FROM roles
      WHERE id = subordinate_role_id
      
      UNION ALL
      
      -- Traverse up the hierarchy
      SELECT r.id, r.parent_role_id
      FROM roles r
      INNER JOIN role_hierarchy rh ON r.id = rh.parent_role_id
    )
    SELECT 1
    FROM role_hierarchy
    WHERE parent_role_id = current_user_role_id
  );
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION auth.has_permission IS 'Check if the current user has a specific permission based on JWT claims';
COMMENT ON FUNCTION auth.has_any_permission IS 'Check if the current user has any of the provided permissions based on JWT claims';
COMMENT ON FUNCTION auth.user_role IS 'Get the current user role name from JWT claims';
COMMENT ON FUNCTION auth.user_role_id IS 'Get the current user role ID from JWT claims';
COMMENT ON FUNCTION auth.is_above_in_hierarchy IS 'Check if current user is above another user in the role hierarchy';

-- Example RLS Policies using JWT claims
-- These are examples - apply similar patterns to your actual tables

-- Enable RLS on persons table (if not already enabled)
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (be careful in production!)
DROP POLICY IF EXISTS "Users can view their own persons" ON persons;
DROP POLICY IF EXISTS "Users can view team persons" ON persons;
DROP POLICY IF EXISTS "Users can view all persons" ON persons;
DROP POLICY IF EXISTS "Users can create persons" ON persons;
DROP POLICY IF EXISTS "Users can update own persons" ON persons;
DROP POLICY IF EXISTS "Users can update team persons" ON persons;

-- Create new policies using JWT claims

-- View policies
CREATE POLICY "View own persons"
ON persons FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  AND auth.has_permission('persons.view_own')
);

CREATE POLICY "View team persons"
ON persons FOR SELECT
TO authenticated
USING (
  auth.has_permission('persons.view_team')
  AND auth.is_above_in_hierarchy(owner_id)
);

CREATE POLICY "View all persons"
ON persons FOR SELECT
TO authenticated
USING (
  auth.has_permission('persons.view_all')
);

-- Create policy
CREATE POLICY "Create persons"
ON persons FOR INSERT
TO authenticated
WITH CHECK (
  auth.has_permission('persons.create')
  AND owner_id = auth.uid() -- Can only create for themselves initially
);

-- Update policies
CREATE POLICY "Update own persons"
ON persons FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND auth.has_permission('persons.edit_own')
)
WITH CHECK (
  owner_id = auth.uid() -- Can't change ownership
  AND auth.has_permission('persons.edit_own')
);

CREATE POLICY "Update team persons"
ON persons FOR UPDATE
TO authenticated  
USING (
  auth.has_permission('persons.edit_team')
  AND auth.is_above_in_hierarchy(owner_id)
)
WITH CHECK (
  auth.has_permission('persons.edit_team')
  AND auth.is_above_in_hierarchy(owner_id)
);

CREATE POLICY "Update all persons"
ON persons FOR UPDATE
TO authenticated
USING (
  auth.has_permission('persons.edit_all')
)
WITH CHECK (
  auth.has_permission('persons.edit_all')
);

-- Delete policies (similar pattern)
CREATE POLICY "Delete own persons"
ON persons FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
  AND auth.has_permission('persons.delete_own')
);

CREATE POLICY "Delete team persons"
ON persons FOR DELETE
TO authenticated
USING (
  auth.has_permission('persons.delete_team')
  AND auth.is_above_in_hierarchy(owner_id)
);

CREATE POLICY "Delete all persons"
ON persons FOR DELETE
TO authenticated
USING (
  auth.has_permission('persons.delete_all')
);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION auth.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_any_permission TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role_id TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_above_in_hierarchy TO authenticated;

-- Example of checking multiple permissions with OR logic
-- This policy allows viewing if user has ANY of these permissions
CREATE POLICY "View persons with any view permission"
ON persons FOR SELECT
TO authenticated
USING (
  (owner_id = auth.uid() AND auth.has_permission('persons.view_own'))
  OR
  (auth.has_permission('persons.view_team') AND auth.is_above_in_hierarchy(owner_id))
  OR
  auth.has_permission('persons.view_all')
);

-- Note: The above is an alternative approach - choose one pattern and stick with it
-- The separate policies approach (used above) is often clearer
DROP POLICY IF EXISTS "View persons with any view permission" ON persons;