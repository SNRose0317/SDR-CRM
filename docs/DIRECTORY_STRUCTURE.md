# Project Directory Structure

This document outlines the complete project organization and explains the structure of each directory.

## Root Structure

```
├── attached_assets/           # User-uploaded assets and images
├── client/                    # React frontend application
├── config/                    # Configuration files
├── docs/                      # Project documentation
├── scripts/                   # Build and deployment scripts
├── server/                    # Express.js backend application
├── shared/                    # Shared types and schemas
├── components.json            # shadcn/ui component configuration
├── drizzle.config.ts         # Database ORM configuration
├── package.json              # Dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── replit.md                 # Project context and preferences
```

## Client Structure

```
client/
├── src/
│   ├── features/             # Feature-based components
│   │   ├── dashboard/        # Dashboard components and pages
│   │   ├── leads/           # Lead management components
│   │   ├── contacts/        # Contact management components
│   │   ├── tasks/           # Task management components
│   │   ├── appointments/    # Appointment management components
│   │   ├── users/           # User management components
│   │   ├── settings/        # Settings components
│   │   └── rules/           # Rule management components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── shared/              # Shared components
│   │   ├── components/      # UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── data-display/ # Data display components
│   │   │   └── feedback/   # Feedback components
│   │   └── pages/          # Shared page components
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.tsx            # Application entry point
└── index.html              # HTML template
```

## Server Structure

```
server/
├── automation/              # Workflow automation system
├── controllers/             # Route handlers and business logic
├── middleware/              # Express middleware
│   ├── portalAuth.ts       # Portal authentication middleware
│   └── README.md           # Middleware documentation
├── routes/                  # Organized route definitions
│   ├── appointments.ts     # Appointment routes
│   ├── contacts.ts         # Contact routes
│   ├── dashboard.ts        # Dashboard routes
│   ├── leads.ts            # Lead routes
│   ├── portal.ts           # Portal routes
│   ├── tasks.ts            # Task routes
│   ├── users.ts            # User routes
│   ├── index.ts            # Route exports
│   └── README.md           # Route documentation
├── rules/                   # Rule engine system
│   ├── engine.ts           # Rule evaluation logic
│   ├── routes.ts           # Rule management API
│   └── README.md           # Rule system documentation
├── services/               # Business logic services
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── config/                 # Configuration files
├── db.ts                   # Database connection
├── index.ts                # Server entry point
├── routes.ts               # Main route registration
├── storage.ts              # Database abstraction layer
├── vite.ts                 # Development server integration
└── README.md               # Server documentation
```

## Shared Structure

```
shared/
├── rules/                   # Rule system types and schemas
│   ├── schema.ts           # Rule type definitions
│   ├── index.ts            # Rule exports
│   └── README.md           # Rule documentation
├── schema.ts               # Database schema and types
└── permissions.ts          # Permission definitions
```

## Documentation Structure

```
docs/
├── ARCHITECTURE.md         # System architecture overview
├── DIRECTORY_STRUCTURE.md  # This file
├── API.md                  # API documentation
├── DEPLOYMENT.md           # Deployment instructions
└── DEVELOPMENT.md          # Development setup guide
```

## Key Benefits

1. **Feature-Based Organization**: Related functionality grouped together
2. **Clear Separation**: Frontend, backend, and shared code separated
3. **Scalable Structure**: Easy to add new features and components
4. **Comprehensive Documentation**: Each directory has README explaining its purpose
5. **Consistent Patterns**: All areas follow similar organizational patterns
6. **Developer-Friendly**: Easy to find and modify specific functionality

## Navigation

- **Frontend Features**: `client/src/features/[feature]/`
- **Backend Routes**: `server/routes/[domain].ts`
- **Shared Types**: `shared/[domain]/`
- **Documentation**: `docs/[topic].md`
- **Rule System**: `server/rules/`, `client/src/features/rules/`, `shared/rules/`

This structure ensures maintainability, scalability, and developer productivity while following modern best practices for full-stack applications.