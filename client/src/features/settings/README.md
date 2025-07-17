# Settings Feature

## Overview
Provides system configuration and user preferences management for the HealthCRM application.

## Structure
```
settings/
├── pages/
│   └── settings.tsx     # Main settings page
└── README.md           # This file
```

## Settings Management

### Configuration Areas
- **User Preferences** - Personal settings and preferences
- **System Configuration** - Application-wide settings
- **Healthcare Workflows** - Customizable stage definitions
- **Notification Settings** - Email and system notifications
- **Data Management** - Import/export and backup settings

## Components

### Pages
- **`settings.tsx`**: Main settings interface with configuration options

## Features
- **User Profile Management** - Update personal information
- **System Preferences** - Configure application behavior
- **Workflow Customization** - Modify lead and contact stages
- **Notification Controls** - Manage alerts and reminders
- **Data Administration** - System maintenance and data management

## Data Sources
- `/api/settings` - System configuration settings
- `/api/users/profile` - User profile information

## Permissions
- **SDR**: Basic user preferences only
- **Health Coach**: User preferences and some workflow settings
- **Admin**: Full access to all system settings

## Related Features
- **Users**: User profile and preference management
- **Leads**: Lead pipeline configuration
- **Contacts**: Healthcare workflow customization
- **Tasks**: Task priority and assignment settings