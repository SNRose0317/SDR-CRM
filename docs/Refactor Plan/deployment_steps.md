# RBAC Deployment Steps

## Prerequisites
- Supabase CLI installed and logged in
- Supabase project created
- Access to Supabase dashboard

## Step-by-Step Deployment Guide

### 1. Deploy Custom Access Token Hook

```bash
# From project root
cd /Users/nick/Documents/SDR-CRM

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the custom access token function
supabase functions deploy custom-access-token

# Verify deployment
supabase functions list
```

### 2. Configure Hook in Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Hooks**
4. Find **Custom Access Token** section
5. Click **Add new hook**
6. Configure:
   - **Enabled**: ✅
   - **Hook Name**: `RBAC Claims`
   - **Function**: Select `custom-access-token` from dropdown
   - **HTTP Method**: POST
   - **Timeout**: 5000ms
7. Click **Save**

### 3. Run Migrations

```bash
# Run all migrations in order
supabase db push

# Or run individually:
supabase db execute -f migrations/0001_create_roles_table.sql
supabase db execute -f migrations/0002_create_permissions_tables.sql
supabase db execute -f migrations/0003_update_users_table.sql
supabase db execute -f migrations/0004_create_user_permissions_view.sql
supabase db execute -f migrations/0005_create_auth_functions_and_policies.sql

# Seed initial data
supabase db execute -f migrations/seed_rbac_data.sql
```

### 4. Test the Implementation

#### A. Test via Supabase Dashboard SQL Editor

```sql
-- Check roles were created
SELECT * FROM roles ORDER BY name;

-- Check permissions were created
SELECT * FROM permissions ORDER BY resource, action;

-- Check role-permission mappings
SELECT 
  r.name as role,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;

-- Test auth functions
SELECT auth.has_permission('persons.view_own'); -- Will be NULL if not logged in
```

#### B. Test Authentication Flow

```bash
# Test login and check JWT
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sdr1@test.com",
    "password": "password123"
  }'
```

Copy the `access_token` from response and decode at [jwt.io](https://jwt.io) to verify it contains:
- `user_role`: "sdr"
- `permissions`: Array of permission strings
- `role_id`: Role ID number
- `rbac_initialized`: true

#### C. Test RLS Policies

In SQL Editor, test as different users:

```sql
-- Login as admin@test.com via dashboard first, then:
SELECT auth.uid(); -- Should show user ID
SELECT auth.jwt() -> 'user_role'; -- Should show 'admin'
SELECT * FROM persons; -- Should see all records

-- Login as sdr1@test.com, then:
SELECT auth.uid();
SELECT auth.jwt() -> 'permissions'; -- Should show SDR permissions
SELECT * FROM persons; -- Should only see owned records
```

### 5. Verify in Application

```typescript
// In your React app, test authentication
import { supabase } from '@/lib/supabase'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'sdr1@test.com',
  password: 'password123'
})

// Check session has custom claims
const session = await supabase.auth.getSession()
console.log(session.data.session?.access_token) // Decode this to see claims
```

### 6. Monitor & Troubleshoot

#### Check Function Logs
1. Go to **Functions** in Supabase dashboard
2. Click on `custom-access-token`
3. View **Logs** tab for execution details

#### Common Issues

**Issue: Permissions not in JWT**
- Check hook is enabled in Authentication settings
- Verify user has role_id in users table
- Check function logs for errors

**Issue: RLS blocking all access**
- Verify you're logged in: `SELECT auth.uid()`
- Check JWT claims: `SELECT auth.jwt()`
- Test permission function: `SELECT auth.has_permission('persons.view_own')`

**Issue: Migration fails**
- Check for existing tables/conflicts
- Run migrations one at a time
- Check Supabase logs for detailed errors

### 7. Next Steps

Once deployment is verified:
1. Update environment variables in your app
2. Test all user roles thoroughly
3. Begin Phase 3: Update APIs to use Supabase client
4. Monitor performance and adjust as needed

## Rollback Plan

If issues arise:

```sql
-- Disable RLS policies temporarily
ALTER TABLE persons DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
-- etc for other tables

-- Or remove hook in dashboard and restart
```

Keep old permission system in place until new system is fully tested.