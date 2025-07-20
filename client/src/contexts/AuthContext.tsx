import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { 
  supabase, 
  getCustomClaims, 
  hasPermission, 
  hasAnyPermission,
  hasAllPermissions,
  onAuthStateChange 
} from '@/lib/supabase'

interface CustomClaims {
  userRole: string | null
  userRoleDisplay: string | null
  roleId: number | null
  permissions: string[]
  rbacInitialized: boolean
}

interface AuthContextType {
  // Auth state
  user: User | null
  session: Session | null
  loading: boolean
  
  // Custom claims from JWT
  claims: CustomClaims
  
  // Permission helpers
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [claims, setClaims] = useState<CustomClaims>({
    userRole: null,
    userRoleDisplay: null,
    roleId: null,
    permissions: [],
    rbacInitialized: false,
  })
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
        setClaims(getCustomClaims(session.access_token))
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      
      if (session) {
        setSession(session)
        setUser(session.user)
        setClaims(getCustomClaims(session.access_token))
      } else {
        setSession(null)
        setUser(null)
        setClaims({
          userRole: null,
          userRoleDisplay: null,
          roleId: null,
          permissions: [],
          rbacInitialized: false,
        })
      }
      
      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in')
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          // Redirect to login page
          window.location.href = '/login'
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User updated')
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Permission check functions using current session
  const checkPermission = (permission: string) => {
    return hasPermission(session?.access_token || null, permission)
  }

  const checkAnyPermission = (permissions: string[]) => {
    return hasAnyPermission(session?.access_token || null, permissions)
  }

  const checkAllPermissions = (permissions: string[]) => {
    return hasAllPermissions(session?.access_token || null, permissions)
  }

  // Auth actions
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
    
    // Session will be updated via onAuthStateChange
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    
    if (error) {
      throw error
    }
    
    // Note: User may need to confirm email before they can sign in
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    // Session will be cleared via onAuthStateChange
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    claims,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    permissions?: string[]
    requireAll?: boolean
  }
) {
  return function ProtectedComponent(props: P) {
    const { user, loading, hasAnyPermission, hasAllPermissions } = useAuth()
    
    useEffect(() => {
      if (!loading && !user) {
        // Redirect to login if not authenticated
        window.location.href = options?.redirectTo || '/login'
      }
      
      if (!loading && user && options?.permissions) {
        // Check permissions
        const hasRequiredPermissions = options.requireAll
          ? hasAllPermissions(options.permissions)
          : hasAnyPermission(options.permissions)
          
        if (!hasRequiredPermissions) {
          // Redirect to unauthorized page
          window.location.href = '/unauthorized'
        }
      }
    }, [loading, user])
    
    if (loading) {
      return <div>Loading...</div>
    }
    
    if (!user) {
      return null
    }
    
    if (options?.permissions) {
      const hasRequiredPermissions = options.requireAll
        ? hasAllPermissions(options.permissions)
        : hasAnyPermission(options.permissions)
        
      if (!hasRequiredPermissions) {
        return null
      }
    }
    
    return <Component {...props} />
  }
}

// Hook for protecting components
export function useRequireAuth(options?: {
  redirectTo?: string
  permissions?: string[]
  requireAll?: boolean
}) {
  const { user, loading, hasAnyPermission, hasAllPermissions } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = options?.redirectTo || '/login'
      } else if (options?.permissions) {
        const hasRequiredPermissions = options.requireAll
          ? hasAllPermissions(options.permissions)
          : hasAnyPermission(options.permissions)
          
        if (!hasRequiredPermissions) {
          window.location.href = '/unauthorized'
        } else {
          setAuthorized(true)
        }
      } else {
        setAuthorized(true)
      }
    }
  }, [loading, user, options])
  
  return { authorized, loading }
}