# Contacts Feature

## Overview
Manages active patients through their healthcare journey with a comprehensive 15-stage workflow.

## Structure
```
contacts/
├── components/
│   ├── contact-form.tsx # Contact creation/editing form
│   └── index.ts         # Component exports
├── pages/
│   └── contacts.tsx     # Main contacts management page
└── README.md           # This file
```

## Contact Healthcare Journey (15 Stages)
1. **Intake** - Initial patient onboarding
2. **Initial Labs** - First laboratory tests ordered
3. **Initial Lab Review** - Review of initial lab results
4. **Initial Provider Exam** - First provider consultation
5. **Initial Medication Order** - First prescription issued
6. **1st Follow-up Labs** - Follow-up laboratory tests
7. **First Follow-Up Lab Review** - Review of follow-up results
8. **First Follow-Up Provider Exam** - Follow-up consultation
9. **First Medication Refill** - First prescription renewal
10. **Second Follow-Up Labs** - Second round of follow-up labs
11. **Second Follow-Up Lab Review** - Second lab review
12. **Second Follow-up Provider Exam** - Second follow-up consultation
13. **Second Medication Refill** - Second prescription renewal
14. **Third Medication Refill** - Third prescription renewal
15. **Restart Annual Process** - Annual cycle restart

## Components

### Forms
- **`contact-form.tsx`**: Create and edit contact information with healthcare-specific fields

### Pages
- **`contacts.tsx`**: Main contacts management interface with stage tracking

## Features
- **Contact Management**: Create and edit active patient records
- **Healthcare Stage Tracking**: Progress patients through 15-stage journey
- **Health Coach Assignment**: Assign contacts to health coaches
- **Medical History**: Track patient progression through healthcare stages
- **Stage Analytics**: View contact distribution across healthcare stages
- **Care Coordination**: Manage ongoing patient care

## Data Sources
- `/api/contacts` - CRUD operations for contacts
- `/api/contacts/stats` - Contact statistics by healthcare stage
- `/api/users` - Available health coaches for assignment

## Permissions
- **SDR**: Read-only access to contacts
- **Health Coach**: Full access to assigned contacts, can manage healthcare stages
- **Admin**: Full access to all contact operations

## Related Features
- **Leads**: Contacts are converted from completed leads
- **Tasks**: Contact-related care tasks and follow-ups
- **Appointments**: Healthcare appointments and consultations
- **Users**: Health coach assignment and care coordination