# Appointments Feature

## Overview
Manages healthcare appointments and consultations with scheduling, status tracking, and integration with leads and contacts.

## Structure
```
appointments/
├── components/
│   ├── appointment-form.tsx # Appointment creation/editing form
│   └── index.ts             # Component exports
├── pages/
│   └── appointments.tsx     # Main appointment management page
└── README.md               # This file
```

## Appointment Management

### Appointment Types
- **Initial Consultations** - First patient meetings
- **Follow-up Visits** - Ongoing patient care appointments
- **Lab Review Appointments** - Review of laboratory results
- **Provider Examinations** - Clinical examinations

### Appointment Status
- **Scheduled** - Appointment confirmed and scheduled
- **Completed** - Appointment finished successfully
- **Cancelled** - Appointment cancelled by patient or provider
- **No Show** - Patient didn't attend scheduled appointment

## Components

### Forms
- **`appointment-form.tsx`**: Schedule and edit appointments with participant and meeting details

### Pages
- **`appointments.tsx`**: Main appointment management interface with calendar view and filtering

## Features
- **Appointment Scheduling**: Create appointments with date, time, and duration
- **Participant Management**: Link appointments to users, leads, or contacts
- **Status Tracking**: Monitor appointment status and outcomes
- **Meeting Integration**: Support for video meeting links
- **Appointment Filtering**: Filter by status, date, participant, and type
- **Calendar View**: Visual appointment scheduling interface
- **Reminder System**: Track upcoming appointments and notifications

## Data Sources
- `/api/appointments` - CRUD operations for appointments
- `/api/users` - Available users for appointment assignment
- `/api/leads` - Leads for appointment scheduling
- `/api/contacts` - Contacts for appointment scheduling

## Permissions
- **SDR**: Schedule appointments for leads
- **Health Coach**: Schedule appointments for contacts
- **Admin**: Full access to all appointment operations

## Related Features
- **Leads**: Initial consultation scheduling
- **Contacts**: Ongoing healthcare appointment management
- **Tasks**: Appointment preparation and follow-up tasks
- **Users**: Provider scheduling and availability