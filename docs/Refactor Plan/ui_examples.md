# UI Role Adaptation Examples

## How the UI Adapts Based on Logged-In User

The same codebase displays different content based on who's logged in. No domain switching needed.

### Example 1: Navigation Menu

#### When SDR Logs In:
```
Dashboard
├── My Leads
├── Team Pipeline  
├── Call Queue
└── Reports
```

#### When Health Coach Logs In:
```
Dashboard
├── My Patients
├── Appointments
├── Care Plans
└── Health Records
```

#### When Director Logs In:
```
Dashboard
├── All Persons
├── Team Overview
├── Analytics
├── Reports
└── Settings
```

### Example 2: Person List Page

#### SDR View:
```typescript
// The same PersonList component
<PersonList />

// Displays as:
<h1>Lead Management</h1>
<Button>Add New Lead</Button>
<Table>
  <th>Lead Name</th>
  <th>Status</th>
  <th>Last Contact</th>
  <th>Score</th>
</Table>
```

#### Health Coach View:
```typescript
// The same PersonList component
<PersonList />

// Displays as:
<h1>Patient Care</h1>
<Button>Add New Patient</Button>
<Table>
  <th>Patient Name</th>
  <th>Care Stage</th>
  <th>Last Visit</th>
  <th>Health Score</th>
</Table>
```

### Example 3: Code Implementation

```typescript
// PersonList.tsx
export function PersonList() {
  const { user, role, hasPermission } = useUser();
  
  // Get role-specific configuration
  const config = getRoleConfig(role.name);
  
  return (
    <div>
      {/* Title adapts to role */}
      <h1>{config.entityManagementTitle || 'Records'}</h1>
      
      {/* Only show add button if permitted */}
      {hasPermission('persons.create') && (
        <Button>
          Add New {config.entitySingular || 'Record'}
        </Button>
      )}
      
      {/* Table columns based on role */}
      <Table>
        <thead>
          <tr>
            <th>{config.entitySingular} Name</th>
            <th>{config.statusLabel || 'Status'}</th>
            <th>{config.lastActionLabel || 'Last Action'}</th>
            {config.showScore && <th>Score</th>}
          </tr>
        </thead>
        {/* Data filtered by permissions automatically */}
      </Table>
    </div>
  );
}
```

### Example 4: Role Configurations

```typescript
// Role configurations stored in database
const roleConfigs = {
  'SDR': {
    entitySingular: 'Lead',
    entityPlural: 'Leads',
    entityManagementTitle: 'Lead Management',
    statusLabel: 'Lead Status',
    lastActionLabel: 'Last Contact',
    showScore: true,
    scoreLabel: 'Lead Score'
  },
  
  'Health Coach': {
    entitySingular: 'Patient',
    entityPlural: 'Patients', 
    entityManagementTitle: 'Patient Care',
    statusLabel: 'Care Stage',
    lastActionLabel: 'Last Visit',
    showScore: true,
    scoreLabel: 'Health Score'
  },
  
  'Customer Success': {
    entitySingular: 'Client',
    entityPlural: 'Clients',
    entityManagementTitle: 'Client Success',
    statusLabel: 'Account Status',
    lastActionLabel: 'Last Check-in',
    showScore: false
  }
};
```

### Example 5: Permission-Based Features

```typescript
// Same component, different features based on permissions
export function PersonDetail({ personId }) {
  const { hasPermission } = useUser();
  const person = usePerson(personId);
  
  return (
    <div>
      {/* Everyone can view basic info */}
      <PersonInfo person={person} />
      
      {/* Only those with edit permission see edit button */}
      {hasPermission('persons.edit_own', 'persons.edit_all') && (
        <Button>Edit</Button>
      )}
      
      {/* Only those with appointment permission see scheduling */}
      {hasPermission('appointments.create') && (
        <ScheduleSection personId={personId} />
      )}
      
      {/* Only medical roles see health records */}
      {hasPermission('health_records.view') && (
        <HealthRecordsSection personId={personId} />
      )}
      
      {/* Only sales roles see deal information */}
      {hasPermission('deals.view') && (
        <DealsSection personId={personId} />
      )}
    </div>
  );
}
```

## Key Principles

1. **One Codebase**: No separate "healthcare" or "sales" versions
2. **Role-Based Display**: UI elements show based on who's logged in
3. **Permission Gates**: Features appear only if user has permission
4. **Configurable Labels**: Each role can have custom terminology
5. **Data Filtering**: API returns only data user can access

## Benefits

- **No Domain Switching**: User's role determines what they see
- **Flexible Terminology**: Each role can use different terms
- **Mixed Business Support**: Medical + Sales + Service in one system
- **Simple Implementation**: Just check permissions and show config
- **Easy Maintenance**: Add new roles without changing code

## Portal Example

When external users (patients/clients/customers) log in:

```typescript
// Portal detects external user type
if (user.isExternal) {
  const portalConfig = getPortalConfig(user.organization);
  
  return (
    <PortalLayout>
      <h1>Welcome to {portalConfig.portalName}</h1>
      <p>Your {portalConfig.providerTerm} will see you soon</p>
    </PortalLayout>
  );
}
```

Different organizations can configure:
- Portal name: "Patient Portal" vs "Client Portal"
- Provider term: "Health Coach" vs "Advisor" vs "Representative"
- Features: Which portal features are enabled

All through configuration, no code changes!