# RBAC Approach Summary: From Terminology to Permissions

## Why We Changed Direction

### Original Approach: Dynamic Terminology
- Pre-defined domains (healthcare, sales, service)
- Focused on changing labels (patient → customer)
- Required choosing a "domain type"
- Complex field mapping between domains

### New Approach: Role-Based Access Control (RBAC)
- Roles are just labels you create
- Permissions control what users can do
- Hierarchy provides automatic team visibility
- UI displays based on logged-in user's role

## Key Insights from Our Discussion

1. **Your Real Need**: You have many different roles (Marketing, SDR, Health Coaches, Directors, etc.) - not just "healthcare" vs "sales"

2. **No Primary Role**: There's no single "primary internal user" - it depends on relationships and permissions

3. **Mixed Business Model**: Medical providers AND sales teams in the same organization

4. **Simple CRM Pattern**: Every major CRM (Salesforce, HubSpot) uses RBAC, not domain switching

## How RBAC Solves Your Problems

### Flexibility Without Complexity
```yaml
# Your actual roles (created through UI, not code)
CEO
├── Director of Sales
│   ├── SDR Manager
│   │   └── SDR Team
│   └── Customer Success Manager
├── Director of Operations  
│   ├── Health Coach Manager
│   │   └── Health Coaches
│   └── Back Office Manager
└── Medical Director
    └── Medical Providers
```

### Simple Permission Checks
```typescript
// Old way (hardcoded)
if (user.role === 'health_coach' || user.role === 'admin') { }

// New way (permission-based)
if (user.hasPermission('persons.view_assigned')) { }
```

### UI Adapts Automatically
- SDR logs in → sees "Lead Management"
- Health Coach logs in → sees "Patient Care"
- Same code, different permissions

## Implementation Comparison

| Aspect | Original Plan | RBAC Approach |
|--------|--------------|---------------|
| **Complexity** | 5 phases, 40 tasks | 4 phases, 25 tasks |
| **Code Changes** | Extensive refactoring | Mostly permission checks |
| **Flexibility** | Limited to pre-defined domains | Unlimited role configurations |
| **Time to Add Role** | Requires code changes | Just add through UI |
| **Industry Fit** | Must choose a domain | Works for any business |

## Simple API Design

### Data-Centric, Not User-Centric
```typescript
// Good: Based on data relationships
GET /api/persons/123
GET /api/persons?assignedTo=456
GET /api/tasks?personId=123

// Not: Based on user context  
GET /api/my-patients
GET /api/sdr-leads
```

The API returns data based on IDs and relationships. Permission filtering happens in the service layer, keeping APIs simple and reusable.

## Migration Path

1. **Keep Existing Structure**: Don't change leads/contacts/persons tables yet
2. **Add Permission Layer**: New tables for roles/permissions
3. **Update Code Gradually**: Replace role checks with permission checks
4. **UI Adapts**: Based on logged-in user's permissions
5. **Configure Through UI**: No more code changes for new roles

## Real Example

Your "Health Coach" becomes:
```yaml
role:
  name: "Health Coach"
  display_name: "Health Coach"
  permissions:
    - persons.view_assigned
    - persons.edit_assigned  
    - appointments.create
    - appointments.edit_own
    - health_questionnaires.view
    - health_questionnaires.edit
```

If you want to call them "Wellness Advisors" tomorrow, just change the display_name. No code changes needed.

## Benefits

1. **No Pre-defined Domains**: Your business doesn't have to fit our categories
2. **Mix Any Terminology**: Medical providers + sales team = no problem
3. **Standard Pattern**: Same as Salesforce, HubSpot, etc.
4. **Future-Proof**: Add new roles without touching code
5. **Simple APIs**: Based on data, not user context

## Next Steps

1. Review the RBAC implementation plan
2. Decide on initial roles and permissions
3. Begin Phase 1: Database foundation
4. Gradually migrate from hardcoded roles to permissions

This approach gives you the flexibility you need while keeping the implementation simple and maintainable.