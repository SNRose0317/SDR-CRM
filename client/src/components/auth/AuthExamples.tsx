import React from 'react'
import { useAuth, withAuth, useRequireAuth } from '@/contexts/AuthContext'
import { PermissionGate, usePermissionCheck } from './PermissionGate'

/**
 * Example: Basic authentication check
 */
export function UserProfile() {
  const { user, claims } = useAuth()
  
  if (!user) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {user.email}</p>
      <p>Role: {claims.userRoleDisplay || claims.userRole || 'No role'}</p>
      <p>Permissions: {claims.permissions.length}</p>
    </div>
  )
}

/**
 * Example: Protected page component using HOC
 */
export const AdminDashboard = withAuth(
  () => {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>This page requires authentication and admin permissions</p>
      </div>
    )
  },
  {
    permissions: ['roles.manage', 'users.manage'],
    requireAll: false, // User needs at least one of these permissions
    redirectTo: '/login'
  }
)

/**
 * Example: Protected component using hook
 */
export function ManagerDashboard() {
  const { authorized, loading } = useRequireAuth({
    permissions: ['persons.view_team', 'reports.view_team'],
    requireAll: false
  })
  
  if (loading) {
    return <div>Checking permissions...</div>
  }
  
  if (!authorized) {
    return null // Will redirect
  }
  
  return (
    <div>
      <h1>Manager Dashboard</h1>
      <p>View your team's performance</p>
    </div>
  )
}

/**
 * Example: Conditional UI rendering based on permissions
 */
export function PersonList() {
  const { claims } = useAuth()
  const canCreate = usePermissionCheck('persons.create')
  const canViewAll = usePermissionCheck('persons.view_all')
  const canEditAny = usePermissionCheck(['persons.edit_team', 'persons.edit_all'])
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>
          {canViewAll ? 'All Persons' : `${claims.userRoleDisplay} Dashboard`}
        </h1>
        
        {/* Only show create button if user has permission */}
        <PermissionGate permissions="persons.create">
          <button className="btn btn-primary">
            Add New Person
          </button>
        </PermissionGate>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            {canEditAny && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {/* Table rows would go here */}
        </tbody>
      </table>
      
      {/* Different messages based on permissions */}
      <PermissionGate 
        permissions="persons.view_own"
        fallback={
          <p>You don't have permission to view any persons.</p>
        }
      >
        <PermissionGate permissions="persons.view_all">
          <p>Showing all persons in the system.</p>
        </PermissionGate>
        
        <PermissionGate 
          permissions="persons.view_team"
          fallback={<p>Showing only your assigned persons.</p>}
        >
          <p>Showing your team's persons.</p>
        </PermissionGate>
      </PermissionGate>
    </div>
  )
}

/**
 * Example: Role-based navigation
 */
export function Navigation() {
  const { user, claims } = useAuth()
  
  if (!user) {
    return (
      <nav>
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
      </nav>
    )
  }
  
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      {/* Sales team navigation */}
      <PermissionGate permissions={['persons.view_own', 'persons.view_team', 'persons.view_all']}>
        <a href="/persons">
          {claims.userRole === 'sdr' ? 'Leads' : 'Persons'}
        </a>
      </PermissionGate>
      
      {/* Healthcare navigation */}
      <PermissionGate permissions="health_records.view">
        <a href="/patients">Patients</a>
      </PermissionGate>
      
      {/* Manager navigation */}
      <PermissionGate permissions={['reports.view_team', 'reports.view_all']}>
        <a href="/reports">Reports</a>
      </PermissionGate>
      
      {/* Admin navigation */}
      <PermissionGate permissions={['roles.manage', 'users.manage']}>
        <a href="/admin">Admin</a>
      </PermissionGate>
      
      <button onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
    </nav>
  )
}

/**
 * Example: Form with field-level permissions
 */
export function PersonEditForm({ person }: { person: any }) {
  const canEditBasic = usePermissionCheck(['persons.edit_own', 'persons.edit_team', 'persons.edit_all'])
  const canEditSensitive = usePermissionCheck('persons.edit_all')
  const canDelete = usePermissionCheck(['persons.delete_own', 'persons.delete_team', 'persons.delete_all'])
  
  return (
    <form>
      <fieldset disabled={!canEditBasic}>
        <label>
          Name:
          <input type="text" defaultValue={person.name} />
        </label>
        
        <label>
          Email:
          <input type="email" defaultValue={person.email} />
        </label>
      </fieldset>
      
      {/* Only admins can edit sensitive fields */}
      <PermissionGate permissions="persons.edit_all">
        <fieldset>
          <label>
            Owner:
            <select defaultValue={person.ownerId}>
              {/* Owner options */}
            </select>
          </label>
          
          <label>
            Internal Notes:
            <textarea defaultValue={person.internalNotes} />
          </label>
        </fieldset>
      </PermissionGate>
      
      <div className="flex gap-2">
        <button type="submit" disabled={!canEditBasic}>
          Save Changes
        </button>
        
        <PermissionGate permissions={['persons.delete_own', 'persons.delete_team', 'persons.delete_all']}>
          <button type="button" className="btn-danger">
            Delete Person
          </button>
        </PermissionGate>
      </div>
    </form>
  )
}