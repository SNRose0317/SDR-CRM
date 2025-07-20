# Enabling RBAC UI Components

## Quick Steps to Enable RBAC UI

### 1. Update Environment Variables
In your `.env.local` file, add:
```env
# Enable RBAC UI components
NEXT_PUBLIC_USE_RBAC_AUTH=true
```

### 2. Replace Main Layout
```bash
# Backup current layout
cp client/src/shared/components/layout/main-layout.tsx client/src/shared/components/layout/main-layout-legacy.tsx

# Use RBAC-aware layout
cp client/src/shared/components/layout/main-layout-rbac.tsx client/src/shared/components/layout/main-layout.tsx
```

### 3. Restart Development Server
```bash
npm run dev
```

## What This Changes

When `NEXT_PUBLIC_USE_RBAC_AUTH=true`:
- Uses `sidebar-rbac.tsx` with PermissionGate components
- Shows role-specific menu labels (Leads/Patients/Persons)
- Displays user role in sidebar
- Shows "Manage Roles" for admins
- Hides menu items based on permissions

When `NEXT_PUBLIC_USE_RBAC_AUTH=false`:
- Uses original sidebar without permission checks
- Shows all menu items to all users

## Complete RBAC Setup

For full RBAC functionality, enable both:
```env
# Server-side: Enable Supabase auth and RLS
USE_SUPABASE_AUTH=true

# Client-side: Enable RBAC UI components  
NEXT_PUBLIC_USE_RBAC_AUTH=true
```

## Testing Permission Gates

1. Log in as different users:
   - `admin@test.com` → See all menu items
   - `sdr1@test.com` → See "Leads" instead of "Patients"
   - `healthcoach@test.com` → See "Patients" instead of "Leads"
   - `patient@test.com` → Limited menu items

2. Check that menu items are hidden/shown based on permissions

3. Verify role display in user profile section

## Rollback

To rollback UI changes:
1. Set `NEXT_PUBLIC_USE_RBAC_AUTH=false` in `.env.local`
2. Restart server

Or restore original layout:
```bash
cp client/src/shared/components/layout/main-layout-legacy.tsx client/src/shared/components/layout/main-layout.tsx
```