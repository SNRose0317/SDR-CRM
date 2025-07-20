# Supabase Auth Configuration Guide

This guide documents the Supabase Auth settings and configurations needed for the RBAC implementation.

## Phase 2A: Configure Supabase Auth

### Task 2A.1: Supabase Dashboard Configuration

Navigate to your Supabase project dashboard and configure the following settings:

#### 1. Authentication Settings (Dashboard > Authentication > Configuration)

**Email Auth:**
- ✅ Enable Email Signup
- ✅ Enable Email Confirmation (recommended)
- ✅ Confirm email = true (for security)

**Password Requirements:**
- Minimum password length: 8 characters
- ✅ Require at least one uppercase letter
- ✅ Require at least one lowercase letter  
- ✅ Require at least one number
- ✅ Require at least one special character

**JWT Settings:**
- JWT Expiry: 3600 seconds (1 hour) - default is fine
- ✅ Enable JWT Secret rotation (for security)

#### 2. Email Templates (Dashboard > Authentication > Email Templates)

Update the following templates to match your brand:

- **Confirm Signup:** Customize the email sent when users sign up
- **Reset Password:** Customize the password reset email
- **Magic Link:** If using passwordless auth
- **Change Email Address:** When users update their email

#### 3. URL Configuration (Dashboard > Authentication > URL Configuration)

Set these URLs based on your application:

```
Site URL: https://your-app.com (or http://localhost:3000 for development)
Redirect URLs: 
  - https://your-app.com/auth/callback
  - http://localhost:3000/auth/callback (for development)
```

#### 4. Auth Providers (Optional)

If you want to enable social login:
- Navigate to Dashboard > Authentication > Providers
- Enable desired providers (Google, GitHub, etc.)
- Follow the setup instructions for each provider

### Supabase Auth Features We're Using

1. **Built-in User Management**
   - User signup/login with email/password
   - Automatic password hashing (bcrypt)
   - Session management with JWTs

2. **Row Level Security Integration**
   - `auth.uid()` - Current user's ID
   - `auth.jwt()` - Full JWT with custom claims
   - `auth.role()` - User's role (we'll enhance this)

3. **Custom Claims via Auth Hooks**
   - Add user_role and permissions to JWT
   - Available in every RLS policy
   - No need for additional lookups

### What This Replaces

Instead of building:
- ❌ Custom auth service
- ❌ Session management  
- ❌ Password hashing logic
- ❌ JWT generation/validation
- ❌ Token refresh logic

We get:
- ✅ Enterprise-grade auth out of the box
- ✅ Automatic security best practices
- ✅ Built-in session management
- ✅ Seamless RLS integration

### Next Steps

After configuring these settings:
1. Create the Custom Access Token Hook (Task 2A.2)
2. Update RLS policies to use JWT claims (Task 2A.3)
3. Set up Supabase client in frontend (Task 2B.1)

### Testing Auth Configuration

You can test the auth setup using Supabase's SQL Editor:

```sql
-- Check if a user can sign up
SELECT auth.uid(); -- Should return NULL when not authenticated

-- After creating a test user via the dashboard
-- Check JWT contents (when authenticated)
SELECT auth.jwt();
```

### Important Notes

- Keep your project's anon key and service role key secure
- Never expose the service role key to the client
- Use environment variables for all keys
- Enable RLS on all tables before going to production