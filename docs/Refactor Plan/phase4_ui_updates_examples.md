# Phase 4: UI Updates Examples

## 1. Update Navigation with PermissionGate

### Current Navigation (sidebar.tsx)

```typescript
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: UserPlus },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Users", href: "/users", icon: User },
  { name: "Workflows", href: "/workflows", icon: Zap },
  { name: "Rules", href: "/rules", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];
```

### Updated Navigation with Permissions

```typescript
// client/src/shared/components/layout/sidebar.tsx
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";
// ... other imports

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permissions?: string | string[];
  requireAll?: boolean;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, claims } = useAuth();

  // Define navigation with permissions
  const navigation: NavItem[] = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: LayoutDashboard 
    },
    { 
      name: claims.userRole === 'sdr' ? "Leads" : "Persons", 
      href: "/leads", 
      icon: UserPlus,
      permissions: ["persons.view_own", "persons.view_team", "persons.view_all"]
    },
    { 
      name: "Contacts", 
      href: "/contacts", 
      icon: Users,
      permissions: ["persons.view_own", "persons.view_team", "persons.view_all"]
    },
    { 
      name: "Tasks", 
      href: "/tasks", 
      icon: CheckSquare,
      permissions: ["tasks.view_own", "tasks.view_team", "tasks.view_all"]
    },
    { 
      name: "Appointments", 
      href: "/appointments", 
      icon: Calendar,
      permissions: ["appointments.view_own", "appointments.view_team", "appointments.view_all"]
    },
    { 
      name: "Users", 
      href: "/users", 
      icon: User,
      permissions: "users.view"
    },
    { 
      name: "Workflows", 
      href: "/workflows", 
      icon: Zap,
      permissions: ["workflows.view", "workflows.manage"]
    },
    { 
      name: "Rules", 
      href: "/rules", 
      icon: Shield,
      permissions: ["rules.view", "rules.manage"]
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings,
      permissions: ["settings.view", "settings.manage"]
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = location === item.href;
    
    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted"
        )}
        onClick={() => onClose()}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    );

    // Wrap in PermissionGate if permissions are defined
    if (item.permissions) {
      return (
        <PermissionGate
          key={item.href}
          permissions={item.permissions}
          requireAll={item.requireAll}
        >
          {linkContent}
        </PermissionGate>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 surface border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">
            {claims.userRoleDisplay || 'CRM'}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map(renderNavItem)}
        </nav>

        {/* User info */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {claims.userRoleDisplay || claims.userRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

## 2. Add Role-Specific Labels

### Dashboard Page Example

```typescript
// client/src/features/dashboard/pages/dashboard.tsx
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function Dashboard() {
  const { claims } = useAuth();
  
  // Role-specific content
  const getDashboardTitle = () => {
    switch (claims.userRole) {
      case 'sdr':
        return 'Sales Dashboard';
      case 'health_coach':
        return 'Patient Care Dashboard';
      case 'manager':
        return 'Team Management Dashboard';
      case 'director':
        return 'Executive Dashboard';
      default:
        return `${claims.userRoleDisplay} Dashboard`;
    }
  };

  const getEntityName = () => {
    switch (claims.userRole) {
      case 'sdr':
        return 'leads';
      case 'health_coach':
        return 'patients';
      default:
        return 'persons';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your {getEntityName()} overview.
        </p>
      </div>

      {/* Role-specific sections */}
      <PermissionGate permissions="persons.view_own">
        <DashboardSection title={`My ${getEntityName()}`}>
          {/* Personal metrics */}
        </DashboardSection>
      </PermissionGate>

      <PermissionGate permissions="persons.view_team">
        <DashboardSection title="Team Performance">
          {/* Team metrics */}
        </DashboardSection>
      </PermissionGate>

      <PermissionGate permissions="reports.view_all">
        <DashboardSection title="Organization Overview">
          {/* Company-wide metrics */}
        </DashboardSection>
      </PermissionGate>
    </div>
  );
}
```

## 3. Update Forms with Permission Checks

### Lead/Person Edit Form

```typescript
// client/src/features/leads/components/lead-form.tsx
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate, usePermissionCheck } from "@/components/auth/PermissionGate";

export function LeadForm({ lead, onSubmit }: LeadFormProps) {
  const { claims } = useAuth();
  const canEditBasic = usePermissionCheck(['persons.edit_own', 'persons.edit_team', 'persons.edit_all']);
  const canEditOwner = usePermissionCheck(['persons.edit_team', 'persons.edit_all']);
  const canDelete = usePermissionCheck(['persons.delete_own', 'persons.delete_team', 'persons.delete_all']);
  
  // Check if user can edit this specific lead
  const canEditThisLead = () => {
    if (usePermissionCheck('persons.edit_all')) return true;
    if (usePermissionCheck('persons.edit_team') && isTeamMember(lead.ownerId)) return true;
    if (usePermissionCheck('persons.edit_own') && lead.ownerId === user.id) return true;
    return false;
  };

  const isDisabled = !canEditThisLead();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Name"
            name="name"
            defaultValue={lead.name}
            disabled={isDisabled}
            required
          />
          
          <FormField
            label="Email"
            name="email"
            type="email"
            defaultValue={lead.email}
            disabled={isDisabled}
          />
          
          <FormField
            label="Phone"
            name="phone"
            defaultValue={lead.phone}
            disabled={isDisabled}
          />
          
          {/* Only show owner field if user can reassign */}
          <PermissionGate permissions={['persons.transfer', 'persons.edit_team', 'persons.edit_all']}>
            <FormField
              label="Owner"
              name="ownerId"
              type="select"
              defaultValue={lead.ownerId}
              disabled={!canEditOwner}
            >
              <option value="">Unassigned</option>
              {/* Populate with team members based on permissions */}
            </FormField>
          </PermissionGate>
        </CardContent>
      </Card>

      {/* Sensitive Information - Admin Only */}
      <PermissionGate permissions="persons.edit_all">
        <Card>
          <CardHeader>
            <CardTitle>Internal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Internal Notes"
              name="internalNotes"
              type="textarea"
              defaultValue={lead.internalNotes}
              rows={4}
            />
            
            <FormField
              label="Priority Score"
              name="priorityScore"
              type="number"
              defaultValue={lead.priorityScore}
              min={0}
              max={100}
            />
          </CardContent>
        </Card>
      </PermissionGate>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isDisabled}
        >
          Save Changes
        </Button>
        
        <PermissionGate 
          permissions={['persons.delete_own', 'persons.delete_team', 'persons.delete_all']}
        >
          {canDelete && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={onDelete}
            >
              Delete {claims.userRole === 'sdr' ? 'Lead' : 'Person'}
            </Button>
          )}
        </PermissionGate>
      </div>
    </form>
  );
}
```

## 4. Create Role Management UI

### Role Management Page

```typescript
// client/src/features/admin/pages/roles-page.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { RoleForm } from '../components/role-form';
import { PermissionMatrix } from '../components/permission-matrix';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    // Fetch roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    // Fetch permissions
    const { data: permsData } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action');
    
    setRoles(rolesData || []);
    setPermissions(permsData || []);
  };

  return (
    <PermissionGate 
      permissions="roles.manage"
      fallback={
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage roles.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Role Management</h1>
          <Button onClick={() => setSelectedRole('new')}>
            Create New Role
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role List */}
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {roles.map(role => (
                  <li key={role.id}>
                    <button
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "w-full text-left p-2 rounded hover:bg-muted",
                        selectedRole?.id === role.id && "bg-muted"
                      )}
                    >
                      <div className="font-medium">{role.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.name}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Role Details/Form */}
          <div className="lg:col-span-2">
            {selectedRole && (
              <RoleForm 
                role={selectedRole === 'new' ? null : selectedRole}
                roles={roles}
                onSave={handleRoleSave}
                onCancel={() => setSelectedRole(null)}
              />
            )}
          </div>
        </div>

        {/* Permission Matrix */}
        {selectedRole && selectedRole !== 'new' && (
          <PermissionMatrix
            role={selectedRole}
            permissions={permissions}
            onUpdate={handlePermissionUpdate}
          />
        )}
      </div>
    </PermissionGate>
  );
}
```

### Permission Matrix Component

```typescript
// client/src/features/admin/components/permission-matrix.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/shared/components/ui/checkbox';

export function PermissionMatrix({ role, permissions, onUpdate }) {
  const [rolePermissions, setRolePermissions] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRolePermissions();
  }, [role.id]);

  const loadRolePermissions = async () => {
    const { data } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', role.id);
    
    setRolePermissions(new Set(data?.map(rp => rp.permission_id) || []));
  };

  const togglePermission = async (permissionId: number) => {
    setLoading(true);
    
    if (rolePermissions.has(permissionId)) {
      // Remove permission
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id)
        .eq('permission_id', permissionId);
      
      setRolePermissions(prev => {
        const next = new Set(prev);
        next.delete(permissionId);
        return next;
      });
    } else {
      // Add permission
      await supabase
        .from('role_permissions')
        .insert({
          role_id: role.id,
          permission_id: permissionId
        });
      
      setRolePermissions(prev => new Set([...prev, permissionId]));
    }
    
    setLoading(false);
    onUpdate();
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions for {role.display_name}</CardTitle>
        <CardDescription>
          Check the permissions this role should have
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource}>
              <h3 className="font-semibold capitalize mb-2">
                {resource.replace('_', ' ')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {perms.map(perm => (
                  <label 
                    key={perm.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={rolePermissions.has(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                      disabled={loading}
                    />
                    <span className="text-sm">
                      {perm.action.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Implementation Order

1. **Update Navigation** - Quick win, immediate visual impact
2. **Add Role Labels** - Improves user experience
3. **Update Forms** - Critical for security
4. **Create Admin UI** - Enables self-service role management

## Testing Each Component

```typescript
// Test navigation renders correctly for different roles
describe('Navigation', () => {
  it('shows only permitted items for SDR', () => {
    const { queryByText } = render(
      <MockAuthProvider role="sdr" permissions={['persons.view_own']}>
        <Sidebar />
      </MockAuthProvider>
    );
    
    expect(queryByText('Leads')).toBeInTheDocument();
    expect(queryByText('Users')).not.toBeInTheDocument();
    expect(queryByText('Workflows')).not.toBeInTheDocument();
  });
});
```