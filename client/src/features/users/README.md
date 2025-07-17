# Users Feature

## Overview
Manages system users with role-based access control for healthcare CRM operations.

## Structure
```
users/
├── components/
│   ├── user-form.tsx    # User creation/editing form
│   └── index.ts         # Component exports
├── pages/
│   └── users.tsx        # Main user management page
└── README.md           # This file
```

## User Management

### User Roles
- **SDR (Sales Development Representative)**
  - Manages leads and initial patient contact
  - Full access to leads, read-only access to contacts
  - Can create lead-related tasks and appointments

- **Health Coach**
  - Manages patient care and follow-ups
  - Full access to contacts and healthcare workflows
  - Can create contact-related tasks and appointments
  - Read-only access to leads

- **Admin**
  - Full system access and user management
  - Can manage all leads, contacts, tasks, and appointments
  - User creation, editing, and deactivation
  - System configuration and oversight

### User Status
- **Active** - User can log in and use the system
- **Inactive** - User account is disabled

## Components

### Forms
- **`user-form.tsx`**: Create and edit user accounts with role assignment

### Pages
- **`users.tsx`**: Main user management interface with role filtering and status management

## Features
- **User Creation**: Add new users with role assignment
- **Role Management**: Assign and modify user roles
- **Status Control**: Activate and deactivate user accounts
- **User Filtering**: Filter users by role and status
- **Access Control**: Enforce role-based permissions
- **User Analytics**: View user activity and productivity

## Data Sources
- `/api/users` - CRUD operations for users
- `/api/users/:id/toggle-active` - User status management

## Permissions
- **SDR**: Read-only access to user information
- **Health Coach**: Read-only access to user information
- **Admin**: Full access to user management operations

## Related Features
- **Leads**: SDR assignment and ownership
- **Contacts**: Health coach assignment and care coordination
- **Tasks**: User assignment and workload management
- **Appointments**: Provider scheduling and participation