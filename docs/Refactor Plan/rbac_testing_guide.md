# RBAC Testing Guide with Supabase

## Overview

This guide explains how to test the RBAC implementation now that authentication and authorization are handled by Supabase services.

## Testing Environment Setup

### 1. Local Supabase Development

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
cd /path/to/project
supabase start

# Access local services:
# - Studio: http://localhost:54323
# - API: http://localhost:54321
# - DB: postgresql://postgres:postgres@localhost:54322/postgres
```

### 2. Environment Variables

Create `.env.local` for testing:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

## Testing Strategies

### 1. Database-Level Testing (RLS Policies)

#### Test Permission Functions
```sql
-- Connect to local Supabase DB
psql postgresql://postgres:postgres@localhost:54322/postgres

-- Test as different users by setting JWT claims
SET request.jwt.claims = '{
  "sub": "test-user-id",
  "email": "test@example.com",
  "permissions": ["persons.view_own", "persons.edit_own"]
}';

-- Test permission checks
SELECT auth.has_permission('persons.view_own'); -- Should return true
SELECT auth.has_permission('persons.view_all'); -- Should return false

-- Test data access with RLS
SELECT * FROM persons; -- Should only see owned records
```

#### Create Test Fixtures
```sql
-- Create test roles
INSERT INTO roles (name, display_name, description) VALUES
  ('test_admin', 'Test Admin', 'Full access for testing'),
  ('test_sdr', 'Test SDR', 'Sales rep for testing'),
  ('test_manager', 'Test Manager', 'Manager for testing');

-- Assign permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'test_admin';

-- Create test users
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at) VALUES
  ('admin@test.com', crypt('password123', gen_salt('bf')), now()),
  ('sdr@test.com', crypt('password123', gen_salt('bf')), now()),
  ('manager@test.com', crypt('password123', gen_salt('bf')), now());

-- Link users to roles
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'test_admin')
WHERE email = 'admin@test.com';
```

### 2. Custom Access Token Hook Testing

#### Deploy Hook Locally
```bash
# Deploy function to local Supabase
supabase functions deploy custom-access-token

# Test the hook
curl -X POST http://localhost:54321/auth/v1/token?grant_type=password \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Decode the JWT to verify custom claims
# Should see: user_role, permissions[], role_id
```

#### Verify Hook Execution
```sql
-- Check Supabase logs
SELECT * FROM auth.audit_log_entries 
WHERE payload->>'function_name' = 'custom-access-token'
ORDER BY created_at DESC
LIMIT 10;
```

### 3. Integration Testing

#### Test Different User Scenarios
```typescript
// tests/integration/rbac.test.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

describe('RBAC Integration Tests', () => {
  it('SDR can only see their own leads', async () => {
    // Sign in as SDR
    const { data: { session } } = await supabase.auth.signInWithPassword({
      email: 'sdr@test.com',
      password: 'password123'
    })
    
    // Query persons table
    const { data: persons, error } = await supabase
      .from('persons')
      .select('*')
    
    // Should only see owned records
    expect(error).toBeNull()
    expect(persons).toHaveLength(5) // Only SDR's leads
    expect(persons.every(p => p.owner_id === session.user.id)).toBe(true)
  })
  
  it('Manager can see team members leads', async () => {
    // Sign in as Manager
    await supabase.auth.signInWithPassword({
      email: 'manager@test.com',
      password: 'password123'
    })
    
    // Query persons table
    const { data: persons } = await supabase
      .from('persons')
      .select('*')
    
    // Should see team's records
    expect(persons).toHaveLength(25) // Manager + team's leads
  })
  
  it('Permission changes take effect after token refresh', async () => {
    // Sign in
    await supabase.auth.signInWithPassword({
      email: 'sdr@test.com',
      password: 'password123'
    })
    
    // Admin grants new permission
    await grantPermission('sdr@test.com', 'persons.view_all')
    
    // Refresh session
    await supabase.auth.refreshSession()
    
    // Verify new permission in JWT
    const { data: { session } } = await supabase.auth.getSession()
    const claims = parseJWT(session.access_token)
    expect(claims.permissions).toContain('persons.view_all')
  })
})
```

### 4. Frontend Component Testing

#### Mock Supabase Client
```typescript
// tests/mocks/supabase.ts
export const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-jwt',
          user: { id: 'test-id', email: 'test@example.com' }
        }
      }
    }),
    onAuthStateChange: jest.fn()
  }
}

// Mock custom claims
export const mockClaims = {
  userRole: 'sdr',
  userRoleDisplay: 'Sales Rep',
  permissions: ['persons.view_own', 'persons.edit_own'],
  rbacInitialized: true
}
```

#### Test Permission Gates
```typescript
// tests/components/PermissionGate.test.tsx
import { render } from '@testing-library/react'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { AuthContext } from '@/contexts/AuthContext'

const mockAuthContext = {
  hasPermission: (perm: string) => mockClaims.permissions.includes(perm),
  hasAnyPermission: (perms: string[]) => perms.some(p => mockClaims.permissions.includes(p)),
  hasAllPermissions: (perms: string[]) => perms.every(p => mockClaims.permissions.includes(p))
}

describe('PermissionGate', () => {
  it('renders children when user has permission', () => {
    const { getByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <PermissionGate permissions="persons.view_own">
          <div>Protected Content</div>
        </PermissionGate>
      </AuthContext.Provider>
    )
    
    expect(getByText('Protected Content')).toBeInTheDocument()
  })
  
  it('renders fallback when user lacks permission', () => {
    const { getByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <PermissionGate 
          permissions="admin.access"
          fallback={<div>Access Denied</div>}
        >
          <div>Admin Only</div>
        </PermissionGate>
      </AuthContext.Provider>
    )
    
    expect(getByText('Access Denied')).toBeInTheDocument()
  })
})
```

### 5. E2E Testing with Playwright

```typescript
// tests/e2e/rbac.spec.ts
import { test, expect } from '@playwright/test'

test.describe('RBAC E2E Tests', () => {
  test('SDR workflow', async ({ page }) => {
    // Login as SDR
    await page.goto('/login')
    await page.fill('[name="email"]', 'sdr@test.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Verify dashboard shows SDR content
    await expect(page.locator('h1')).toContainText('Sales Development Representative Dashboard')
    
    // Verify can see leads
    await page.click('a[href="/persons"]')
    await expect(page.locator('h1')).toContainText('Leads')
    
    // Verify cannot see admin menu
    await expect(page.locator('a[href="/admin"]')).not.toBeVisible()
  })
  
  test('Permission-based UI elements', async ({ page }) => {
    // Login as manager
    await loginAs(page, 'manager@test.com')
    
    // Should see team reports
    await expect(page.locator('a[href="/reports"]')).toBeVisible()
    
    // Should see "View Team" option
    await page.goto('/persons')
    await expect(page.locator('text=Showing your team\'s persons')).toBeVisible()
  })
})
```

## Testing Checklist

### Phase 1: Database Foundation ✅
- [x] Migrations are reversible
- [x] Roles table supports hierarchy
- [x] Permissions follow naming convention
- [x] User permissions view is efficient
- [ ] Test data seeds work correctly

### Phase 2: Supabase Auth ✅
- [ ] Custom access token hook deployed
- [ ] JWT contains custom claims
- [ ] RLS policies use JWT claims
- [ ] Frontend receives permissions
- [ ] Auth context provides helpers

### Phase 3: API Updates
- [ ] Remove hardcoded role checks
- [ ] APIs use Supabase client
- [ ] RLS filters data correctly
- [ ] No performance regression
- [ ] Error messages are clear

### Phase 4: UI Updates
- [ ] Permission gates work
- [ ] Navigation adapts to role
- [ ] Forms check permissions
- [ ] No UI flashing
- [ ] Role management UI works

## Common Issues and Solutions

### Issue: Permissions not in JWT
**Solution:** Check custom access token hook is deployed and enabled

### Issue: RLS blocking all access
**Solution:** Verify JWT claims with `SELECT auth.jwt()`

### Issue: UI not updating after permission change
**Solution:** Force token refresh: `await supabase.auth.refreshSession()`

### Issue: Test user creation fails
**Solution:** Use service role key for admin operations

## Performance Testing

```sql
-- Test permission check performance
EXPLAIN ANALYZE SELECT auth.has_permission('persons.view_all');

-- Test RLS query performance
EXPLAIN ANALYZE SELECT * FROM persons WHERE auth.has_permission('persons.view_team');

-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%auth.%'
ORDER BY mean_exec_time DESC;
```

## Security Testing

1. **JWT Tampering**: Verify modified JWTs are rejected
2. **Permission Escalation**: Test users cannot grant themselves permissions
3. **SQL Injection**: Test RLS policies are injection-safe
4. **Token Expiry**: Verify expired tokens are rejected

## Next Steps

1. Set up CI/CD pipeline with tests
2. Create test data generators
3. Add performance benchmarks
4. Document test scenarios
5. Create troubleshooting playbook