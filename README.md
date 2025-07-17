# HealthCRM - Healthcare Customer Relationship Management System

A comprehensive CRM system designed specifically for healthcare organizations to manage leads, contacts, tasks, and appointments through a structured patient journey workflow.

## 🏗️ Architecture Overview

HealthCRM follows a clean, feature-based architecture with clear separation of concerns:

```
healthcrm/
├── client/                 # React frontend application
│   └── src/
│       ├── features/       # Feature-based organization
│       │   ├── dashboard/  # Dashboard and analytics
│       │   ├── users/      # User management
│       │   ├── leads/      # Lead management
│       │   ├── contacts/   # Contact management
│       │   ├── tasks/      # Task management
│       │   └── appointments/ # Appointment scheduling
│       └── shared/         # Shared components and utilities
│           ├── components/ # Reusable UI components
│           ├── hooks/      # Custom React hooks
│           ├── lib/        # Utilities and configurations
│           └── types/      # TypeScript definitions
├── server/                 # Express.js backend
│   ├── controllers/        # Route handlers (planned)
│   ├── middleware/         # Express middleware (planned)
│   ├── services/           # Business logic (planned)
│   ├── models/             # Database models (planned)
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   └── routes.ts          # API routes
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema and types
├── docs/                   # Documentation
│   ├── assets/            # Design assets and screenshots
│   └── ARCHITECTURE.md    # Detailed architecture guide
└── config/                 # Configuration files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (provided by Replit)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Push database schema: `npm run db:push`

### Key Features
- **Lead Management**: 5-stage pipeline (HHQ Started → HHQ Signed → Booking stages → Conversion)
- **Contact Management**: 15-stage healthcare workflow (Intake → Annual Process)
- **Task Management**: Priority-based task assignment with due dates
- **Appointment Scheduling**: Calendar-based appointment management
- **User Management**: Role-based access (SDR, Health Coach, Admin)
- **Analytics Dashboard**: Real-time statistics and insights

## 📁 Directory Structure Logic

### Why This Organization?

#### 1. **Feature-Based Architecture**
- Each healthcare workflow (leads, contacts, tasks, appointments) has its own directory
- Related components are grouped together
- Easy to locate and modify feature-specific code
- Clear boundaries between different business domains

#### 2. **Shared vs Feature-Specific**
- **Shared**: Components used by multiple features (UI library, data tables, layouts)
- **Feature-Specific**: Components that belong to one business area (lead forms, contact workflows)

#### 3. **Clear Separation of Concerns**
- **Frontend** (`client/`): React components, hooks, and UI logic
- **Backend** (`server/`): API routes, business logic, and data access
- **Shared** (`shared/`): Database schema and types used by both
- **Docs** (`docs/`): Documentation and design assets
- **Config** (`config/`): Configuration files and setup

## 🔧 Development Workflow

### Adding a New Feature
1. **Schema**: Define database table in `shared/schema.ts`
2. **Storage**: Add CRUD operations in `server/storage.ts`
3. **Routes**: Add API endpoints in `server/routes.ts`
4. **Components**: Create feature directory in `client/src/features/`
5. **Pages**: Add page component and routing

### File Organization Rules
- **Pages**: Main route components go in `features/{feature}/pages/`
- **Components**: Feature-specific components go in `features/{feature}/components/`
- **Shared UI**: Reusable components go in `shared/components/`
- **Business Logic**: Custom hooks go in `shared/hooks/`
- **Utilities**: Helper functions go in `shared/lib/`

## 🎯 Healthcare-Specific Workflows

### Lead Pipeline (5 Stages)
1. **HHQ Started** - Initial health questionnaire begun
2. **HHQ Signed** - Health questionnaire completed
3. **Booking: Not Paid** - Appointment booking initiated
4. **Booking: Paid/Not Booked** - Payment completed, appointment pending
5. **Booking: Paid/Booked** - Fully booked, ready for conversion

### Contact Journey (15 Stages)
1. **Intake** - Initial patient intake
2. **Initial Labs** - First laboratory tests
3. **Initial Lab Review** - Lab results review
4. **Initial Provider Exam** - First provider examination
5. **Initial Medication Order** - First medication prescription
6. **1st Follow-up Labs** - Follow-up laboratory tests
7. **First Follow-Up Lab Review** - Review of follow-up labs
8. **First Follow-Up Provider Exam** - Follow-up examination
9. **First Medication Refill** - First prescription refill
10. **Second Follow-Up Labs** - Second round of labs
11. **Second Follow-Up Lab Review** - Second lab review
12. **Second Follow-up Provider Exam** - Second follow-up exam
13. **Second Medication Refill** - Second prescription refill
14. **Third Medication Refill** - Third prescription refill
15. **Restart Annual Process** - Annual cycle restart

## 📊 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for state management
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Zod** for validation

### Development Tools
- **Vite** for build tooling
- **ESLint** for code quality
- **TypeScript** for type safety
- **Hot reload** for development

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Detailed system architecture
- **[API Documentation](docs/API.md)** - API endpoints and usage
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy the system
- **[Feature Specifications](docs/FEATURES.md)** - Business requirements

## 🔒 Security & Best Practices

- Type-safe database operations with Drizzle ORM
- Input validation with Zod schemas
- Secure API endpoints with proper error handling
- Role-based access control
- SQL injection prevention through parameterized queries

## 🚀 Deployment

The application is configured for deployment on Replit with:
- Automatic dependency management
- PostgreSQL database provisioning
- Environment variable configuration
- Hot reload in development
- Production build optimization

## 🤝 Contributing

1. Follow the established directory structure
2. Use TypeScript for all new files
3. Follow the naming conventions
4. Add appropriate documentation
5. Test thoroughly before deployment

## 📝 License

This project is part of the HealthCRM system and follows the established architecture patterns.