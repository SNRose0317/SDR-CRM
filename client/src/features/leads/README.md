# Leads Feature

## Overview
Manages potential customers through the healthcare lead qualification process with a 5-stage pipeline.

## Structure
```
leads/
├── components/
│   ├── lead-form.tsx    # Lead creation/editing form
│   └── index.ts         # Component exports
├── pages/
│   └── leads.tsx        # Main leads management page
└── README.md           # This file
```

## Lead Pipeline (5 Stages)
1. **HHQ Started** - Health questionnaire initiated
2. **HHQ Signed** - Health questionnaire completed and signed
3. **Booking: Not Paid** - Appointment booking started but payment pending
4. **Booking: Paid/Not Booked** - Payment completed but appointment slot not selected
5. **Booking: Paid/Booked** - Fully booked and ready for conversion to contact

## Components

### Forms
- **`lead-form.tsx`**: Create and edit lead information with validation

### Pages
- **`leads.tsx`**: Main leads management interface with data table and filtering

## Features
- **Lead Creation**: Add new leads with required information
- **Lead Editing**: Update existing lead information
- **Status Management**: Progress leads through pipeline stages
- **Lead Assignment**: Assign leads to SDR representatives
- **Data Filtering**: Filter leads by status, owner, and search terms
- **Lead Statistics**: View lead progression metrics

## Data Sources
- `/api/leads` - CRUD operations for leads
- `/api/leads/stats` - Lead statistics by status
- `/api/users` - Available SDR representatives for assignment

## Permissions
- **SDR**: Full access to leads, can create, edit, and manage status
- **Health Coach**: Read-only access to leads
- **Admin**: Full access to all lead operations

## Related Features
- **Contacts**: Leads convert to contacts when pipeline is complete
- **Tasks**: Lead-related tasks and follow-ups
- **Users**: SDR assignment and ownership