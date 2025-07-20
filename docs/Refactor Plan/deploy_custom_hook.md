# Deploying the Custom Access Token Hook

## Overview
The custom access token hook adds RBAC claims (role and permissions) to JWTs when users authenticate. This enables Row Level Security (RLS) policies to check permissions directly from the JWT without additional database queries.

## Prerequisites
1. Supabase CLI installed: `brew install supabase/tap/supabase`
2. Supabase project created
3. Database migrations completed (roles, permissions tables)

## Deployment Steps

### 1. Deploy the Function

```bash
# Navigate to project root
cd /Users/nick/Documents/SDR-CRM

# Login to Supabase (if not already)
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the custom access token function
supabase functions deploy custom-access-token
```

### 2. Configure the Hook in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Hooks**
3. Under **Custom Access Token**, click **Add Hook**
4. Configure:
   - **Hook Name**: `custom-access-token`
   - **Enabled**: ✅ Yes
   - **HTTP URI**: Select your deployed `custom-access-token` function
   - **HTTP Method**: `POST`
   - **HTTP Timeout**: `5000` (5 seconds)

### 3. Test the Hook

#### Test via API
```bash
# Sign in and check the JWT
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your-password"
  }'
```

#### Decode and Verify JWT
Use [jwt.io](https://jwt.io) or a script to decode the access_token and verify it contains:
- `user_role`: The user's role name
- `user_role_display`: Human-readable role name
- `role_id`: The role ID
- `permissions`: Array of permission strings
- `rbac_initialized`: true

#### Test in SQL Editor
```sql
-- After signing in via the dashboard
SELECT auth.jwt();

-- Check specific claims
SELECT auth.jwt() -> 'user_role' as role;
SELECT auth.jwt() -> 'permissions' as permissions;

-- Test permission function
SELECT auth.has_permission('persons.view_own');
```

### 4. Monitor Hook Execution

Check function logs in Supabase Dashboard:
1. Go to **Functions** → `custom-access-token`
2. Click **Logs** tab
3. Look for successful executions and any errors

## Troubleshooting

### Hook Not Executing
- Verify function is deployed: Check Functions list in dashboard
- Ensure hook is enabled in Authentication settings
- Check function logs for errors

### Missing Permissions in JWT
- Verify user has a role assigned in the `users` table
- Check that role has permissions in `role_permissions` table
- Ensure `user_permissions` view exists and works

### Performance Issues
- The hook adds ~50-100ms to login time
- Consider caching strategy if permission queries are slow
- Monitor function execution time in logs

## Local Development

For local testing with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Deploy function locally
supabase functions serve custom-access-token

# Test with local API
curl -X POST 'http://localhost:54321/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_LOCAL_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

## Security Considerations

1. **Service Role Key**: The function uses the service role key to fetch user data. This is secure because:
   - Function runs in Supabase's secure environment
   - Service key is never exposed to clients
   - Function only adds claims, cannot modify user data

2. **Error Handling**: On any error, the function returns original claims to prevent auth failures

3. **Performance**: Claims are cached in JWT until token refresh (1 hour default)

## Next Steps

After deploying the hook:
1. Test with different user roles
2. Verify RLS policies work with JWT claims
3. Update frontend to use permission helpers
4. Monitor performance and adjust if needed