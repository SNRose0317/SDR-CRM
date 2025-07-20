# Enabling Supabase Routes

## Quick Steps to Enable RBAC Routes

### 1. Backup Current Routes
```bash
cp server/routes.ts server/routes-legacy.ts
```

### 2. Replace Routes File
```bash
cp server/routes-with-supabase.ts server/routes.ts
```

### 3. Set Environment Variable
In your `.env.local` file:
```env
USE_SUPABASE_AUTH=true
```

### 4. Restart Server
```bash
npm run dev
```

## What This Does

When `USE_SUPABASE_AUTH=true`:
- Uses `/api/leads` → `leads-supabase.ts` (with RLS)
- Uses `/api/contacts` → `contacts-supabase.ts` (with RLS)
- Uses `/api/tasks` → `tasks-supabase.ts` (with RLS)
- Uses `/api/appointments` → `appointments-supabase.ts` (with RLS)

When `USE_SUPABASE_AUTH=false` (or not set):
- Uses original routes without Supabase

## Rollback

To rollback:
1. Set `USE_SUPABASE_AUTH=false` in `.env.local`
2. Restart server

Or restore original routes:
```bash
cp server/routes-legacy.ts server/routes.ts
```

## Testing

After enabling, test with:
```bash
# Get your JWT token from login
curl http://localhost:5000/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The response should only include leads you have permission to see based on your role.