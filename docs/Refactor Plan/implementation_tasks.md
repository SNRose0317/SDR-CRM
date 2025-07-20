# RBAC (Role-Based Access Control) Implementation Tasks

> **Status:** Planning | **Start Date:** TBD | **Target Completion:** 4 weeks

## Overview

This document outlines the implementation of a flexible Role-Based Access Control system that replaces hardcoded roles with dynamic, configurable roles and permissions. The UI will display based on the logged-in user's role, and APIs will use data relationships rather than user-specific logic.

## Core Principles

1. **Roles are just labels** - Created and managed through UI, not code
2. **Permissions control access** - Code checks permissions, not role names
3. **Hierarchy provides visibility** - Managers see their team's data automatically
4. **UI adapts to user** - Display labels based on logged-in user's role
5. **APIs are data-centric** - Based on table relationships, not user context

---

## Phase 1: Database Foundation (Week 1) ✅ COMPLETE
**Completed:** Jan 19, 2025

### Task 1.1: Create Dynamic Roles Table
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Create:**
  - `drizzle/migrations/0001_create_roles_table.sql`
- **Description:** Replace role enum with dynamic roles table
- **SQL:**
  ```sql
  CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX idx_roles_parent ON roles(parent_role_id);
  CREATE INDEX idx_roles_active ON roles(is_active);
  ```
- **Testing:** Migration rollback test
- **Acceptance Criteria:**
  - Table creates successfully
  - Can store any role name
  - Supports hierarchy through parent_role_id

### Task 1.2: Create Permissions System Tables
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Create:**
  - `drizzle/migrations/0002_create_permissions_tables.sql`
- **Description:** Create permissions and role_permissions tables
- **SQL:**
  ```sql
  CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER REFERENCES users(id),
    PRIMARY KEY (role_id, permission_id)
  );
  
  CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
  ```
- **Acceptance Criteria:**
  - Flexible permission definitions
  - Many-to-many role/permission relationship
  - Audit trail for permission grants

### Task 1.3: Update Users Table
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Create:**
  - `drizzle/migrations/0003_update_users_table.sql`
- **Description:** Replace role enum with role_id reference
- **SQL:**
  ```sql
  -- Add new column
  ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id);
  
  -- Migrate existing role data (will need a mapping)
  UPDATE users SET role_id = 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'sdr' THEN 2
      WHEN role = 'health_coach' THEN 3
      WHEN role = 'patient' THEN 4
    END;
  
  -- After verification, drop old column
  -- ALTER TABLE users DROP COLUMN role;
  ```
- **Dependencies:** Tasks 1.1, 1.2
- **Acceptance Criteria:**
  - Users linked to dynamic roles
  - Existing role data preserved
  - No data loss

### Task 1.4: Create User Roles View
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Create:**
  - `drizzle/migrations/0004_create_user_roles_view.sql`
- **Description:** Create view for easy permission checking
- **SQL:**
  ```sql
  CREATE VIEW user_permissions AS
  SELECT 
    u.id as user_id,
    u.email,
    r.id as role_id,
    r.name as role_name,
    r.display_name as role_display_name,
    p.id as permission_id,
    p.name as permission_name,
    p.resource,
    p.action
  FROM users u
  JOIN roles r ON u.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.permission_id
  WHERE u.deleted_at IS NULL 
    AND r.is_active = true;
  ```
- **Acceptance Criteria:**
  - Efficient permission lookups
  - Includes role hierarchy
  - Excludes inactive roles

### Task 1.5: Seed Initial Permissions
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Create:**
  - `server/seeds/001_initial_permissions.ts`
- **Description:** Create core permissions for the system
- **Sample Permissions:**
  ```typescript
  const permissions = [
    // Persons/Leads/Contacts
    { name: 'persons.view_own', resource: 'persons', action: 'view_own' },
    { name: 'persons.view_team', resource: 'persons', action: 'view_team' },
    { name: 'persons.view_all', resource: 'persons', action: 'view_all' },
    { name: 'persons.edit_own', resource: 'persons', action: 'edit_own' },
    { name: 'persons.edit_team', resource: 'persons', action: 'edit_team' },
    { name: 'persons.edit_all', resource: 'persons', action: 'edit_all' },
    
    // Tasks
    { name: 'tasks.view_own', resource: 'tasks', action: 'view_own' },
    { name: 'tasks.create', resource: 'tasks', action: 'create' },
    
    // Reports
    { name: 'reports.view_team', resource: 'reports', action: 'view_team' },
    { name: 'reports.view_all', resource: 'reports', action: 'view_all' },
    
    // Admin
    { name: 'roles.manage', resource: 'roles', action: 'manage' },
    { name: 'users.manage', resource: 'users', action: 'manage' },
  ];
  ```
- **Acceptance Criteria:**
  - Core permissions cover all features
  - Naming convention is consistent
  - Granular enough for flexibility

### Task 1.6: Update Drizzle Schema
- [x] **Status:** Complete (Jan 19, 2025)
- **Files to Modify:**
  - `shared/schema.ts`
- **Description:** Update schema with new tables
- **Changes:**
  - Remove userRoleEnum
  - Add roles, permissions, rolePermissions tables
  - Update user table to reference roles
- **Dependencies:** Tasks 1.1-1.4
- **Acceptance Criteria:**
  - Schema compiles without errors
  - Types available for new tables

---

## Phase 2: Permission Service & Middleware (Week 2) ✅ COMPLETE
**Completed:** Jan 19-20, 2025 (Using Supabase Auth & RLS)

### Task 2.1: Create Permission Service
- [x] **Status:** Complete (Jan 19, 2025) - Using Supabase RLS
- **Files to Create:**
  - `server/services/permission.service.ts`
  - `server/services/permission.types.ts`
- **Description:** Core service for permission checking
- **Key Methods:**
  ```typescript
  class PermissionService {
    // Check if user has specific permission
    async hasPermission(userId: number, permission: string): Promise<boolean>
    
    // Get all permissions for user
    async getUserPermissions(userId: number): Promise<Permission[]>
    
    // Check if user can access resource
    async canAccessResource(userId: number, resource: string, resourceId: number): Promise<boolean>
    
    // Get users in hierarchy below
    async getSubordinateUserIds(userId: number): Promise<number[]>
  }
  ```
- **Testing:** Unit tests for all permission scenarios
- **Acceptance Criteria:**
  - Handles role hierarchy
  - Caches permissions for performance
  - Works with any resource type

### Task 2.2: Create Permission Middleware
- [x] **Status:** Complete (Jan 20, 2025) - Created auth middleware
- **Files to Create:**
  - `server/middleware/permission.middleware.ts`
- **Description:** Express middleware for route protection
- **Example Usage:**
  ```typescript
  // Protect routes with permissions
  router.get('/persons', 
    requirePermission('persons.view_own'), 
    personController.list
  );
  
  router.put('/persons/:id', 
    requirePermission('persons.edit_own', 'persons.edit_all'),
    personController.update
  );
  ```
- **Dependencies:** Task 2.1
- **Acceptance Criteria:**
  - Easy to apply to routes
  - Supports multiple permissions (OR logic)
  - Clear error messages

### Task 2.3: Update Authentication to Include Permissions
- [x] **Status:** Complete (Jan 19, 2025) - JWT includes permissions
- **Files to Modify:**
  - `server/services/auth.service.ts`
  - `server/routes/auth.ts`
- **Description:** Include user permissions in auth response
- **Changes:**
  - Add permissions to JWT token or session
  - Include role info in login response
  - Cache permissions for performance
- **Dependencies:** Task 2.1
- **Acceptance Criteria:**
  - Login returns user role and permissions
  - Permissions available throughout request
  - Minimal performance impact

### Task 2.4: Create Role Hierarchy Service
- [x] **Status:** Complete (Jan 19, 2025) - RLS handles hierarchy
- **Files to Create:**
  - `server/services/hierarchy.service.ts`
- **Description:** Handle role hierarchy for data visibility
- **Key Methods:**
  ```typescript
  class HierarchyService {
    // Get all roles below a role in hierarchy
    async getSubordinateRoles(roleId: number): Promise<Role[]>
    
    // Check if one role is above another
    async isRoleAbove(roleId1: number, roleId2: number): Promise<boolean>
    
    // Get all users under a manager
    async getTeamMembers(managerId: number): Promise<User[]>
  }
  ```
- **Acceptance Criteria:**
  - Efficiently traverses hierarchy
  - Handles circular reference prevention
  - Caches hierarchy for performance

---

## Phase 3: API Updates (Week 3) ✅ COMPLETE
**Completed:** Jan 20, 2025

### Task 3.1: Update Person/Lead/Contact APIs
- [x] **Status:** Complete (Jan 20, 2025) - All routes migrated
- **Files to Modify:**
  - `server/routes/api/persons.ts`
  - `server/services/person.service.ts`
- **Description:** Use permissions instead of hardcoded roles
- **Before:**
  ```typescript
  if (user.role === 'admin' || user.role === 'sdr') {
    // Show all leads
  }
  ```
- **After:**
  ```typescript
  if (await permissionService.hasPermission(user.id, 'persons.view_all')) {
    // Show all persons
  } else if (await permissionService.hasPermission(user.id, 'persons.view_team')) {
    // Show team's persons
  } else {
    // Show only own persons
  }
  ```
- **Dependencies:** Phase 2 complete
- **Acceptance Criteria:**
  - No hardcoded role checks
  - Respects permission hierarchy
  - Performance maintained

### Task 3.2: Implement Data Filtering Based on Hierarchy
- [x] **Status:** Complete (Jan 20, 2025) - RLS handles filtering
- **Files to Create:**
  - `server/utils/query-filters.ts`
- **Description:** Add query filters based on user permissions
- **Example:**
  ```typescript
  async function applyPermissionFilter(query, userId, resource) {
    const perms = await permissionService.getUserPermissions(userId);
    
    if (perms.includes(`${resource}.view_all`)) {
      return query; // No filter
    } else if (perms.includes(`${resource}.view_team`)) {
      const teamIds = await hierarchyService.getTeamMembers(userId);
      return query.where(in(persons.ownerId, teamIds));
    } else {
      return query.where(eq(persons.ownerId, userId));
    }
  }
  ```
- **Acceptance Criteria:**
  - Works with any resource type
  - Efficient SQL queries
  - Testable and reusable

### Task 3.3: Update Task and Appointment APIs
- [x] **Status:** Complete (Jan 20, 2025) - Created -supabase.ts routes
- **Files to Modify:**
  - `server/routes/api/tasks.ts`
  - `server/routes/api/appointments.ts`
- **Description:** Apply same permission pattern
- **Dependencies:** Task 3.2
- **Acceptance Criteria:**
  - Consistent permission checking
  - Hierarchy-aware filtering
  - No breaking changes

### Task 3.4: Create Simple Data APIs
- [x] **Status:** Complete (Jan 20, 2025) - All APIs data-centric
- **Description:** Ensure APIs are data-centric, not user-centric
- **Principles:**
  - APIs return data based on IDs and relationships
  - Permission filtering happens at service layer
  - No user context in API responses
- **Example:**
  ```typescript
  // Good: Data-centric
  GET /api/persons/:id
  GET /api/persons?assignedTo=123
  
  // Bad: User-centric
  GET /api/my-persons
  GET /api/persons-for-role/sdr
  ```
- **Acceptance Criteria:**
  - RESTful resource-based endpoints
  - Consistent query parameters
  - Clear API documentation

---

## Phase 4: UI Updates (Week 4) ✅ MOSTLY COMPLETE
**Completed:** Jan 20, 2025 (except Role Management UI)

### Task 4.1: Create User Context with Role Info
- [x] **Status:** Complete (Jan 19, 2025) - AuthContext created
- **Files to Create:**
  - `client/src/contexts/UserContext.tsx`
  - `client/src/hooks/useUser.ts`
- **Description:** Provide user role and permissions to UI
- **Features:**
  ```typescript
  interface UserContextValue {
    user: User;
    role: Role;
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    canViewResource: (resource: string, ownerId?: number) => boolean;
  }
  ```
- **Acceptance Criteria:**
  - Role info available throughout app
  - Permission checking utilities
  - Updates on login/logout

### Task 4.2: Create Permission-Based UI Components
- [x] **Status:** Complete (Jan 19, 2025) - PermissionGate component
- **Files to Create:**
  - `client/src/components/PermissionGate.tsx`
  - `client/src/components/RoleGate.tsx`
- **Description:** Components for conditional rendering
- **Usage:**
  ```typescript
  <PermissionGate permission="persons.edit_all">
    <Button>Edit Any Person</Button>
  </PermissionGate>
  
  <PermissionGate permission={["persons.edit_own", "persons.edit_team"]} requireAll={false}>
    <Button>Edit</Button>
  </PermissionGate>
  ```
- **Dependencies:** Task 4.1
- **Acceptance Criteria:**
  - Clean API for permission checks
  - Handles multiple permissions
  - No flickering on load

### Task 4.3: Update Navigation Based on Permissions
- [x] **Status:** Complete (Jan 20, 2025) - sidebar-rbac.tsx
- **Files to Modify:**
  - `client/src/features/layout/components/app-sidebar.tsx`
  - `client/src/features/layout/components/nav-main.tsx`
- **Description:** Show/hide menu items based on permissions
- **Changes:**
  - Remove hardcoded role checks
  - Use permission gates for menu items
  - Dynamic menu based on user permissions
- **Dependencies:** Tasks 4.1, 4.2
- **Acceptance Criteria:**
  - Menu reflects user permissions
  - No broken links
  - Smooth loading experience

### Task 4.4: Display Role-Specific Labels
- [x] **Status:** Complete (Jan 20, 2025) - Dynamic labels in UI
- **Files to Modify:**
  - Various UI components
- **Description:** Show labels based on logged-in user's role
- **Example:**
  ```typescript
  // In PersonList component
  const { role } = useUser();
  
  return (
    <h1>{role.display_name} Dashboard</h1>
    <p>Manage your {role.manages_entity_type || 'records'}</p>
  );
  ```
- **Acceptance Criteria:**
  - UI adapts to user role
  - Labels make sense in context
  - Fallbacks for missing config

### Task 4.5: Update Forms to Check Edit Permissions
- [x] **Status:** Complete (Jan 20, 2025) - Example in leads-rbac.tsx
- **Files to Modify:**
  - All form components
- **Description:** Disable/hide fields based on permissions
- **Implementation:**
  ```typescript
  const canEdit = hasPermission('persons.edit_own') || 
                  (isTeamMember && hasPermission('persons.edit_team')) ||
                  hasPermission('persons.edit_all');
  
  <Input 
    disabled={!canEdit}
    value={person.name}
    onChange={...}
  />
  ```
- **Acceptance Criteria:**
  - Forms respect permissions
  - Clear messaging when disabled
  - No data loss on permission change

### Task 4.6: Create Role Management UI
- [ ] **Status:** Pending (Optional - can be added later)
- **Files to Create:**
  - `client/src/features/admin/pages/roles-page.tsx`
  - `client/src/features/admin/components/role-form.tsx`
  - `client/src/features/admin/components/permission-matrix.tsx`
- **Description:** UI for managing roles and permissions
- **Features:**
  - Create/edit/delete roles
  - Drag-drop hierarchy builder
  - Permission assignment matrix
  - Role cloning for quick setup
- **Acceptance Criteria:**
  - Intuitive role management
  - Permission changes take effect immediately
  - Audit trail for changes

---

## Testing Strategy

### Unit Tests
- Permission service logic
- Hierarchy calculations
- Permission middleware
- UI permission gates

### Integration Tests
- API permission enforcement
- Data filtering accuracy
- Role hierarchy traversal
- Login with permissions

### E2E Tests
- Complete user journeys with different roles
- Permission changes affecting access
- Hierarchy-based data visibility

---

## Migration Strategy

### Phase 1: Parallel Systems
- New permission system alongside old role enum
- Both systems work during transition
- No breaking changes

### Phase 2: Gradual Migration
- Update APIs one by one
- Test thoroughly with both systems
- Monitor for issues

### Phase 3: Cutover
- Switch authentication to new system
- Remove old role checks
- Clean up legacy code

### Phase 4: Cleanup
- Remove old role enum
- Delete migration code
- Update documentation

---

## Success Criteria

1. **Flexibility**
   - [ ] Can create any role through UI (pending Role Management UI)
   - [ ] Can assign any combination of permissions
   - [ ] Can modify without code changes

2. **Performance**
   - [ ] Permission checks < 10ms (needs testing)
   - [ ] No N+1 queries (RLS should handle this)
   - [ ] Efficient caching (built into Supabase)

3. **User Experience**
   - [ ] UI adapts to user role (implemented, needs testing)
   - [ ] Clear permission messages
   - [ ] No confusing terminology

4. **Developer Experience**
   - [ ] Simple permission checks (achieved with RLS)
   - [ ] Consistent patterns (all routes use same pattern)
   - [ ] Good documentation (comprehensive docs created)

---

## Example Role Configurations

### Your Organization
```yaml
CEO:
  permissions: [all]
  
Director of Sales:
  inherits_from: CEO
  permissions: [persons.*, tasks.*, reports.*]
  
SDR Manager:
  inherits_from: Director of Sales
  permissions: [persons.view_team, persons.edit_team]
  
SDR:
  inherits_from: SDR Manager
  permissions: [persons.view_own, persons.edit_own, tasks.create]

Health Coach:
  permissions: [persons.view_assigned, persons.edit_assigned, appointments.*]
```

### Another Organization (Law Firm)
```yaml
Managing Partner:
  permissions: [all]
  
Senior Associate:
  permissions: [clients.*, cases.*, documents.*]
  
Junior Associate:
  inherits_from: Senior Associate
  permissions: [clients.view_assigned, cases.view_assigned]
```

The same system handles both without any code changes!