# RBAC Deployment Checklist

## Pre-Deployment Verification
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged in to Supabase CLI (`supabase login`)
- [ ] Have Supabase project reference ID ready
- [ ] Have access to Supabase dashboard

## Step 1: Deploy Custom Access Token Hook

### 1.1 Link to Your Project
```bash
cd /Users/nick/Documents/SDR-CRM
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.2 Deploy the Function
```bash
supabase functions deploy custom-access-token
```

### 1.3 Verify Deployment
```bash
supabase functions list
# Should show custom-access-token as deployed
```

## Step 2: Configure Hook in Dashboard

1. [ ] Go to [Supabase Dashboard](https://app.supabase.com)
2. [ ] Select your project
3. [ ] Navigate to **Authentication** → **Hooks**
4. [ ] Find **Custom Access Token** section
5. [ ] Click **Add new hook**
6. [ ] Configure:
   - [ ] **Enabled**: ✅
   - [ ] **Hook Name**: `RBAC Claims`
   - [ ] **Function**: Select `custom-access-token` from dropdown
   - [ ] **HTTP Method**: POST
   - [ ] **Timeout**: 5000ms
7. [ ] Click **Save**

## Step 3: Run Database Migrations

### 3.1 Check Current Database State
```bash
# Optional: Check what migrations will be applied
supabase db diff
```

### 3.2 Run All Migrations
```bash
supabase db push
```

### 3.3 Seed RBAC Data
```bash
supabase db execute -f migrations/seed_rbac_data.sql
```

### 3.4 Verify in SQL Editor
Run these queries in Supabase SQL Editor:
```sql
-- Check roles
SELECT * FROM roles ORDER BY name;

-- Check permissions (should be 60+ rows)
SELECT COUNT(*) as permission_count FROM permissions;

-- Check role-permission mappings
SELECT r.name as role, COUNT(rp.permission_id) as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;

-- Check test users have roles
SELECT email, role_id FROM auth.users u
JOIN users ON users.id = u.id
ORDER BY email;
```

## Step 4: Test Authentication

### 4.1 Test Login via cURL
Replace YOUR_PROJECT and YOUR_ANON_KEY:
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sdr1@test.com",
    "password": "password123"
  }'
```

### 4.2 Verify JWT Contents
1. [ ] Copy the `access_token` from response
2. [ ] Go to [jwt.io](https://jwt.io)
3. [ ] Paste token and verify it contains:
   - [ ] `user_role`: "sdr"
   - [ ] `user_role_display`: "Sales Development Representative"
   - [ ] `permissions`: Array with SDR permissions
   - [ ] `role_id`: Number
   - [ ] `rbac_initialized`: true

### 4.3 Test RLS Policies
In SQL Editor, test different users:
```sql
-- First, get the user ID for testing
SELECT id, email FROM auth.users WHERE email = 'admin@test.com';

-- Set the authenticated user (replace with actual ID)
SET request.jwt.claims = '{
  "sub": "USER_ID_HERE",
  "role": "authenticated",
  "user_role": "admin",
  "permissions": ["persons.view_all", "persons.edit_all"]
}';

-- Test queries
SELECT COUNT(*) FROM leads; -- Admin should see all
SELECT auth.has_permission('persons.view_all'); -- Should return true
```

## Step 5: Configure Application

### 5.1 Update Environment Variables
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Get these from Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Enable Supabase auth
USE_SUPABASE_AUTH=true

# Existing settings
PORT=5000
NODE_ENV=development
```

### 5.2 Test Local Application
```bash
# Start the server
npm run dev

# In another terminal, test the API
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Step 6: Monitor & Troubleshoot

### 6.1 Check Function Logs
1. [ ] Go to **Functions** in Supabase dashboard
2. [ ] Click on `custom-access-token`
3. [ ] View **Logs** tab

### 6.2 Common Issues

**Permissions not in JWT:**
- [ ] Verify hook is enabled
- [ ] Check user has role_id in users table
- [ ] Review function logs

**401 Unauthorized:**
- [ ] Verify token is being sent
- [ ] Check token hasn't expired
- [ ] Ensure anon key is correct

**403 Forbidden (RLS):**
- [ ] Check JWT claims with `SELECT auth.jwt()`
- [ ] Verify permissions with `SELECT auth.has_permission('...')`
- [ ] Review RLS policies

## Post-Deployment Tasks

### Immediate:
- [ ] Test login for all 5 test users
- [ ] Verify each user sees appropriate data
- [ ] Check performance metrics
- [ ] Document any issues

### Next Phase:
- [ ] Complete API migration (contacts, tasks, appointments)
- [ ] Update UI components with permission checks
- [ ] Create role management interface
- [ ] Plan production rollout

## Rollback Procedure

If critical issues occur:
1. Disable hook in Authentication settings
2. Set `USE_SUPABASE_AUTH=false` in environment
3. Restart application
4. Investigate and fix issues
5. Re-attempt deployment

## Success Criteria
- [ ] All test users can log in
- [ ] JWT contains custom claims
- [ ] RLS policies filter data correctly
- [ ] No unauthorized access possible
- [ ] Performance acceptable (<100ms API responses)