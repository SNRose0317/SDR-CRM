# Dashboard Feature

## Overview
The dashboard provides a comprehensive overview of the HealthCRM system with key metrics, recent activity, and lead statistics.

## Structure
```
dashboard/
├── components/          # Dashboard-specific components
├── pages/
│   └── dashboard.tsx    # Main dashboard page
└── README.md           # This file
```

## Components

### Pages
- **`dashboard.tsx`**: Main dashboard page displaying stats cards, recent activity, and lead progression

## Features
- **Stats Cards**: Display total leads, contacts, tasks, and appointments
- **Recent Activity**: Shows latest system activities and changes
- **Lead Statistics**: Breakdown of leads by status
- **Real-time Updates**: Data refreshes automatically

## Data Sources
- `/api/dashboard/stats` - Overall system statistics
- `/api/activity-logs` - Recent system activity
- `/api/leads/stats` - Lead status breakdown

## Usage
The dashboard is the default landing page for the application, accessible at the root path (`/`).

## Related Features
- Links to all other features through navigation
- Provides quick access to main CRM functions
- Displays data from leads, contacts, tasks, and appointments features