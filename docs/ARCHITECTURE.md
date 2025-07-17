# HealthCRM Directory Structure Guide

## Overview
This document explains the logical organization of the HealthCRM codebase to help developers understand where to find specific functionality and why files are organized as they are.

## Root Directory Structure

```
healthcrm/
├── client/                  # Frontend application (React + TypeScript)
├── server/                  # Backend application (Express + TypeScript)
├── shared/                  # Shared code between client and server
├── docs/                    # Documentation and design assets
├── config/                  # Configuration files
└── scripts/                 # Build and deployment scripts
```

## Frontend Architecture (`client/`)

### Current Structure:
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components (buttons, forms, etc.)
│   │   ├── forms/          # Business logic forms
│   │   ├── layout/         # Layout components (header, sidebar, etc.)
│   │   └── data-table.tsx  # Shared data table component
│   ├── pages/              # Page components (routes)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
└── public/                 # Static assets
```

### What Each Directory Contains:

#### `components/`
- **`ui/`** - Pure UI components from shadcn/ui library (buttons, inputs, dialogs, etc.)
- **`forms/`** - Business-specific forms (UserForm, LeadForm, ContactForm, etc.)
- **`layout/`** - Layout components (MainLayout, Header, Sidebar)
- **Root components** - Shared business components (DataTable, StatsCard)

#### `pages/`
- Route-level components that represent full pages
- Each file corresponds to a main feature area (Dashboard, Leads, Contacts, etc.)

#### `hooks/`
- Custom React hooks for reusable logic
- Toast notifications, mobile detection, etc.

#### `lib/`
- Utility functions and configurations
- API client setup, type definitions, helper functions

## Backend Architecture (`server/`)

### Current Structure:
```
server/
├── index.ts                # Express server entry point
├── routes.ts               # API route definitions
├── storage.ts              # Database abstraction layer
├── db.ts                   # Database connection setup
└── vite.ts                 # Development server integration
```

### What Each File Contains:

#### `index.ts`
- Express server setup and middleware configuration
- Main application bootstrap

#### `routes.ts`
- All API endpoint definitions
- Request/response handling
- Route-level validation

#### `storage.ts`
- Database abstraction interface (IStorage)
- Database operations implementation (DatabaseStorage)
- CRUD operations for all entities

#### `db.ts`
- Database connection configuration
- Drizzle ORM setup

## Shared Code (`shared/`)

### Current Structure:
```
shared/
└── schema.ts               # Database schema and types
```

### What It Contains:
- Drizzle ORM schema definitions
- TypeScript type definitions
- Zod validation schemas
- Shared enums and constants

## Configuration Files (Root Level)

### Current Structure:
```
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── drizzle.config.ts      # Database configuration
├── components.json        # shadcn/ui configuration
└── replit.md             # Project documentation
```

## Feature-Based Organization Logic

### Healthcare CRM Features:
1. **User Management** (`users.tsx`, `user-form.tsx`)
2. **Lead Management** (`leads.tsx`, `lead-form.tsx`)
3. **Contact Management** (`contacts.tsx`, `contact-form.tsx`)
4. **Task Management** (`tasks.tsx`, `task-form.tsx`)
5. **Appointment Management** (`appointments.tsx`, `appointment-form.tsx`)
6. **Dashboard & Analytics** (`dashboard.tsx`, `stats-card.tsx`)

### How Files Are Connected:
- **Page Component** → **Form Component** → **API Routes** → **Storage Layer** → **Database Schema**
- Example: `leads.tsx` → `lead-form.tsx` → `/api/leads` → `storage.getLeads()` → `leads` table

## Development Workflow

### Adding a New Feature:
1. **Schema** - Define database table in `shared/schema.ts`
2. **Storage** - Add CRUD operations in `server/storage.ts`
3. **Routes** - Add API endpoints in `server/routes.ts`
4. **Form** - Create form component in `client/src/components/forms/`
5. **Page** - Create page component in `client/src/pages/`
6. **Navigation** - Add to sidebar in `client/src/components/layout/sidebar.tsx`

### File Naming Conventions:
- **Pages**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `UserForm.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `apiClient.ts`)
- **Types**: `camelCase.ts` (e.g., `userTypes.ts`)

## Import Path Strategy

### Current Aliases:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Best Practices:
- Use absolute imports with aliases
- Group imports: external libraries, internal modules, relative imports
- Keep imports organized and consistent