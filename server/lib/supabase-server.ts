import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client for server-side admin operations
 * This client bypasses RLS and should only be used for admin tasks
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Create a Supabase client with a user's access token
 * This client respects RLS policies based on the user's permissions
 */
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create an anonymous Supabase client
 * Used for public operations like login/signup
 */
export const supabaseAnon = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Type exports for better TypeScript support
export type SupabaseClient = ReturnType<typeof createClient>;
export type UserSupabaseClient = ReturnType<typeof createUserClient>;