# RBAC Deployment Quick Reference

## 🚀 Quick Start Commands

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
supabase login
```

### 2. Link Project
```bash
cd /Users/nick/Documents/SDR-CRM
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy Everything
```bash
# Deploy function
supabase functions deploy custom-access-token

# Run migrations
supabase db push
supabase db execute -f migrations/seed_rbac_data.sql
```

### 4. Configure Dashboard
Go to: **Authentication → Hooks → Add Custom Access Token**

### 5. Setup Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase keys
```

### 6. Enable RBAC
```bash
# Backup and switch routes
cp server/routes.ts server/routes-legacy.ts
cp server/routes-with-supabase.ts server/routes.ts

# Backup and switch UI
cp client/src/shared/components/layout/main-layout.tsx client/src/shared/components/layout/main-layout-legacy.tsx
cp client/src/shared/components/layout/main-layout-rbac.tsx client/src/shared/components/layout/main-layout.tsx
```

### 7. Start Testing
```bash
npm run dev
```

## 📱 Test Users
All passwords: `password123`
- admin@test.com
- manager@test.com
- sdr1@test.com
- healthcoach@test.com
- patient@test.com

## 🔍 Quick Checks

### Check JWT Claims
1. Login as any user
2. Open Browser DevTools → Network
3. Find login request
4. Check response for `access_token`
5. Paste in jwt.io

### Test RLS in SQL Editor
```sql
-- Set user context
SET request.jwt.claims = '{"sub": "USER_ID", "permissions": ["persons.view_own"]}';

-- Test queries
SELECT * FROM leads;
SELECT auth.has_permission('persons.view_own');
```

## 🚨 Quick Fixes

### JWT Missing Claims
- Check hook is enabled
- Check function logs
- Verify user has role_id

### 401/403 Errors
- Check .env.local keys
- Verify USE_SUPABASE_AUTH=true
- Check token in Authorization header

### UI Not Updating
- Verify NEXT_PUBLIC_USE_RBAC_AUTH=true
- Hard refresh browser (Cmd+Shift+R)

## 🔄 Rollback
```bash
# In .env.local
USE_SUPABASE_AUTH=false
NEXT_PUBLIC_USE_RBAC_AUTH=false

# Restart server
npm run dev
```