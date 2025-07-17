# Tasks Feature

## Overview
Manages action items and follow-ups across the healthcare organization with priority-based assignment and tracking.

## Structure
```
tasks/
├── components/
│   ├── task-form.tsx    # Task creation/editing form
│   └── index.ts         # Component exports
├── pages/
│   └── tasks.tsx        # Main task management page
└── README.md           # This file
```

## Task Management

### Priority Levels
- **Urgent** - Immediate attention required (red)
- **High** - Important, complete within 24 hours (orange)
- **Medium** - Standard priority, complete within 3 days (yellow)
- **Low** - Low priority, complete within 1 week (green)

### Task Status
- **Pending** - Task created but not started
- **In Progress** - Task being worked on
- **Completed** - Task finished
- **Cancelled** - Task no longer needed

### Task Types
- **Lead Follow-ups** - Following up on lead interactions
- **Contact Care Tasks** - Patient care and follow-up tasks
- **Administrative Tasks** - System and process tasks
- **Appointment Reminders** - Healthcare appointment follow-ups

## Components

### Forms
- **`task-form.tsx`**: Create and edit tasks with priority, assignment, and due dates

### Pages
- **`tasks.tsx`**: Main task management interface with filtering and status tracking

## Features
- **Task Creation**: Create tasks with detailed information and assignments
- **Priority Management**: Set and track task priorities
- **Assignment System**: Assign tasks to specific users
- **Due Date Tracking**: Monitor task deadlines and overdue items
- **Status Progression**: Track task completion through workflow
- **Task Filtering**: Filter by status, priority, assignee, and related entities
- **Task Analytics**: View task completion rates and productivity metrics

## Data Sources
- `/api/tasks` - CRUD operations for tasks
- `/api/tasks/stats` - Task statistics and analytics
- `/api/users` - Available users for task assignment
- `/api/leads` - Related leads for task context
- `/api/contacts` - Related contacts for task context

## Permissions
- **SDR**: Create and manage lead-related tasks
- **Health Coach**: Create and manage contact-related tasks
- **Admin**: Full access to all task operations

## Related Features
- **Leads**: Lead-related follow-up tasks
- **Contacts**: Patient care and follow-up tasks
- **Appointments**: Appointment preparation and follow-up tasks
- **Users**: Task assignment and workload management