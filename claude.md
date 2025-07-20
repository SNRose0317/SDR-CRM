# SDR-CRM Project Context

## Project Overview
HealthCRM SDR System - A customer relationship management system with complex roles (Marketing, SDR, Health Coaches, Medical Providers, etc.) being refactored to use Role-Based Access Control (RBAC) for flexibility.

## Current State (January 2025)
- Three overlapping person tables: `leads`, `contacts`, `persons`
- Hardcoded role enums: `['sdr', 'health_coach', 'admin', 'patient']`
- Complex permissions and data duplication issues
- Working features: SDR workflow, dialer, lead claiming, HHQ tracking, patient portal
- **RBAC Implementation COMPLETE** - All 4 phases implemented, committed to git, ready for Supabase deployment

## Active Refactoring Plans

### PIVOTED: From Dynamic Terminology to RBAC Approach
**Why:** User has multiple complex roles (Directors, Managers, various teams) that don't fit pre-defined domains. Need flexibility to create any role through UI.

### NEW: RBAC Implementation Plan
**Location:** `/docs/Refactor Plan/implementation_tasks.md`
**Status:** All Phases Complete - Ready for Deployment
**Key Features:**
- Replace hardcoded role enum with dynamic roles table
- Permission-based access control (not role names)
- Hierarchical roles with automatic team visibility
- UI adapts based on logged-in user's role
- APIs remain data-centric (not user-centric)

### Implementation Phases:
1. **Week 1:** Database Foundation - 6 tasks
2. **Week 2:** Permission Services - 4 tasks
3. **Week 3:** API Updates - 4 tasks
4. **Week 4:** UI Updates - 6 tasks

**Total:** 20 tasks (simplified from original 40)

## Recent Changes
- PIVOTED from dynamic terminology to RBAC approach after user feedback
- User needs flexibility for many roles: Marketing, SDR, Health Coaches, Directors, etc.
- Realized pre-defined domains (healthcare/sales) too limiting
- Adopted industry-standard RBAC pattern (like Salesforce, HubSpot)
- **Jan 19, 2025:** Completed Phase 1 - Database Foundation
  - Created migration files for roles, permissions, role_permissions tables
  - Updated users table to support roleId
  - Created user_permissions view for efficient lookups
  - Updated Drizzle schema with new RBAC tables
  - Created seed file for initial permissions
- **Jan 19, 2025:** Completed Phase 2 - Supabase Auth Integration
  - Configured Supabase Auth settings documentation
  - Created custom access token hook to add roles/permissions to JWT
  - Created auth helper functions and RLS policies using JWT claims
  - Set up Supabase client in frontend with permission helpers
  - Created AuthContext and PermissionGate components
  - Documented complete auth implementation with examples
- **Jan 20, 2025:** Prepared for Remaining Phases
  - Created comprehensive deployment guide
  - Created API migration guide for Phase 3
  - Created UI update examples for Phase 4
  - Created testing guide for RBAC with Supabase
- **Jan 20, 2025:** Completed Implementation of Phase 3 & 4
  - Installed @supabase/supabase-js dependency
  - Created Supabase server configuration
  - Created authentication middleware with JWT support
  - Created new storage-supabase.ts implementation
  - Migrated ALL routes to use Supabase client (leads, contacts, tasks, appointments)
  - Created parallel running system with USE_SUPABASE_AUTH flag
  - Updated sidebar navigation with PermissionGate
  - Created role-adaptive UI components
  - Created comprehensive deployment documentation
  - System is now deployment-ready

## Key Technical Decisions
- **Database:** Dynamic roles table instead of enum
- **Permissions:** Check permissions, not role names in code
- **Hierarchy:** Parent roles see team data automatically  
- **UI:** Displays based on logged-in user's role and permissions
- **API:** Data-centric endpoints (not user-centric)

## Next Steps (Deployment Phase)
1. ✅ RBAC implementation committed to git (commit d4b85b9)
2. 🔄 Deploy custom access token hook to Supabase
3. 🔄 Run migrations and seed data in SDR-CRM-RBAC project
4. 🔄 Test RLS policies with different user roles  
5. 🔄 Test parallel running with USE_SUPABASE_AUTH=true
6. 📋 Create production deployment plan

## Important Files

### Current RBAC Implementation (Active)
- `/docs/Refactor Plan/implementation_tasks.md` - RBAC implementation plan (20 tasks)
- `/docs/Refactor Plan/approach_summary.md` - Why RBAC over terminology approach
- `/docs/Refactor Plan/ui_examples.md` - How UI adapts to user roles
- `/docs/Refactor Plan/progress_tracker.md` - Progress tracking for RBAC
- `/docs/Refactor Plan/current_status_summary.md` - Current implementation status
- `/docs/Refactor Plan/deployment_steps.md` - Step-by-step deployment guide
- `/docs/Refactor Plan/rbac_testing_guide.md` - Comprehensive testing guide
- `/docs/Refactor Plan/phase3_api_migration_guide.md` - API update guide
- `/docs/Refactor Plan/phase4_ui_updates_examples.md` - UI component examples
- `/migrations/seed_rbac_data.sql` - Seed data for roles and permissions

### Previous Plans (For Reference - Deprecated)
- `/docs/crm_refactor_plan_dynamic.md` - Original dynamic terminology plan
- `/docs/crm_refactor_plan_revised.md` - Healthcare-only refactoring plan
- `/docs/EHR_CRM_Dynamic_frontend&backend.md` - Dynamic terminology analysis

## Architecture Notes
- Monorepo structure with Next.js frontend
- Supabase backend with PostgreSQL
- TypeScript throughout with Drizzle ORM
- Row-level security (RLS) for access control

## RBAC Configuration Example
```typescript
// Example role hierarchy
const roles = {
  'CEO': { permissions: ['*'] },
  'Director of Sales': { 
    parent: 'CEO',
    permissions: ['persons.*', 'reports.*']
  },
  'SDR Manager': {
    parent: 'Director of Sales', 
    permissions: ['persons.view_team', 'persons.edit_team']
  },
  'SDR': {
    parent: 'SDR Manager',
    permissions: ['persons.view_own', 'persons.edit_own']
  }
};

// UI displays based on logged-in user
if (user.role.name === 'SDR') {
  // Shows "Lead Management"
} else if (user.role.name === 'Health Coach') {
  // Shows "Patient Care"
}
```

## Testing Considerations
- All existing workflows must continue working
- Permission checks < 10ms
- Hierarchy traversal efficient
- Zero data loss during migration
- UI adapts correctly to user role