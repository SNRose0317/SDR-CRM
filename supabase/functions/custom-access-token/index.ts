import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface CustomAccessTokenHookRequest {
  user_id: string
  claims: Record<string, any>
  authentication_method: string
}

interface CustomAccessTokenHookResponse {
  claims: Record<string, any>
}

serve(async (req: Request) => {
  try {
    const { user_id, claims } = await req.json() as CustomAccessTokenHookRequest
    
    // Import Supabase client - using service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch user's role and permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        role_id,
        role:roles!inner(
          id,
          name,
          display_name,
          parent_role_id
        )
      `)
      .eq('id', user_id)
      .single()
    
    if (userError || !userData) {
      console.error('Error fetching user role:', userError)
      // Return original claims if we can't fetch role
      return new Response(
        JSON.stringify({ claims }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Fetch all permissions for the user's role (including inherited from parent roles)
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('permission_name')
      .eq('user_id', user_id)
    
    if (permError) {
      console.error('Error fetching permissions:', permError)
    }
    
    // Add custom claims to the JWT
    const customClaims = {
      ...claims,
      // Add role information
      user_role: userData.role?.name || null,
      user_role_display: userData.role?.display_name || null,
      role_id: userData.role_id,
      // Add flattened permissions array for easy checking in RLS
      permissions: permissions?.map(p => p.permission_name) || [],
      // Add a claim to indicate this hook was executed
      rbac_initialized: true
    }
    
    return new Response(
      JSON.stringify({ claims: customClaims } as CustomAccessTokenHookResponse),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Custom access token hook error:', error)
    // Return original claims on error to prevent auth failure
    return new Response(
      JSON.stringify({ claims: {} }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/* 
Example JWT after this hook runs:
{
  "aud": "authenticated",
  "exp": 1234567890,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  // Custom claims added by this hook:
  "user_role": "sdr",
  "user_role_display": "Sales Development Representative", 
  "role_id": 2,
  "permissions": [
    "persons.view_own",
    "persons.view_team", 
    "persons.create",
    "persons.edit_own",
    "tasks.view_own",
    "tasks.create"
  ],
  "rbac_initialized": true
}
*/