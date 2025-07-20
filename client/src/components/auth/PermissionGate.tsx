import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PermissionGateProps {
  children: React.ReactNode
  permissions: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  showError?: boolean
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permissions="persons.edit_all">
 *   <Button>Edit All Persons</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGate permissions={["persons.edit_own", "persons.edit_team"]}>
 *   <Button>Edit</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (ALL)
 * <PermissionGate permissions={["persons.view_all", "persons.edit_all"]} requireAll>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate 
 *   permissions="admin.access" 
 *   fallback={<div>You need admin access to view this.</div>}
 * >
 *   <AdminDashboard />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null,
  showError = false 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()
  
  // Convert single permission to array for consistent handling
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
  
  // Check permissions
  let hasRequiredPermissions = false
  
  if (permissionArray.length === 1) {
    hasRequiredPermissions = hasPermission(permissionArray[0])
  } else if (requireAll) {
    hasRequiredPermissions = hasAllPermissions(permissionArray)
  } else {
    hasRequiredPermissions = hasAnyPermission(permissionArray)
  }
  
  // Render based on permission check
  if (hasRequiredPermissions) {
    return <>{children}</>
  }
  
  // Show fallback or error message
  if (fallback) {
    return <>{fallback}</>
  }
  
  if (showError) {
    return (
      <div className="text-red-500 text-sm">
        Insufficient permissions. Required: {permissionArray.join(requireAll ? ' AND ' : ' OR ')}
      </div>
    )
  }
  
  // Return null if no permissions and no fallback
  return null
}

/**
 * Hook version of PermissionGate for programmatic checks
 * 
 * @example
 * const canEdit = usePermissionCheck("persons.edit_all")
 * 
 * @example
 * const canManage = usePermissionCheck(["persons.edit_all", "persons.delete_all"], true)
 */
export function usePermissionCheck(
  permissions: string | string[],
  requireAll = false
): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()
  
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
  
  if (permissionArray.length === 1) {
    return hasPermission(permissionArray[0])
  } else if (requireAll) {
    return hasAllPermissions(permissionArray)
  } else {
    return hasAnyPermission(permissionArray)
  }
}