import { createClient } from '@supabase/supabase-js'
import type { Database } from '@shared/schema-types' // You'll need to generate these types

// These should come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
})

// Helper function to get the current user's session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// Helper function to decode JWT and get custom claims
export function getCustomClaims(accessToken: string) {
  try {
    // Decode the JWT (this is safe for client-side as we're not verifying the signature)
    const base64Url = accessToken.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    const claims = JSON.parse(jsonPayload)
    
    return {
      userRole: claims.user_role as string | null,
      userRoleDisplay: claims.user_role_display as string | null,
      roleId: claims.role_id as number | null,
      permissions: claims.permissions as string[] | [],
      rbacInitialized: claims.rbac_initialized as boolean | false,
    }
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return {
      userRole: null,
      userRoleDisplay: null,
      roleId: null,
      permissions: [],
      rbacInitialized: false,
    }
  }
}

// Helper function to check if user has a permission
export function hasPermission(accessToken: string | null, permission: string): boolean {
  if (!accessToken) return false
  
  const claims = getCustomClaims(accessToken)
  return claims.permissions.includes(permission)
}

// Helper function to check if user has any of the permissions
export function hasAnyPermission(accessToken: string | null, permissions: string[]): boolean {
  if (!accessToken) return false
  
  const claims = getCustomClaims(accessToken)
  return permissions.some(permission => claims.permissions.includes(permission))
}

// Helper function to check if user has all of the permissions
export function hasAllPermissions(accessToken: string | null, permissions: string[]): boolean {
  if (!accessToken) return false
  
  const claims = getCustomClaims(accessToken)
  return permissions.every(permission => claims.permissions.includes(permission))
}

// Auth event listener setup
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error('Sign in error:', error)
    throw error
  }
  
  return data
}

// Sign up with email and password
export async function signUp(email: string, password: string, metadata?: { firstName?: string; lastName?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  
  if (error) {
    console.error('Sign up error:', error)
    throw error
  }
  
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// Password reset request
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) {
    console.error('Password reset error:', error)
    throw error
  }
  
  return data
}

// Update password
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  if (error) {
    console.error('Update password error:', error)
    throw error
  }
  
  return data
}