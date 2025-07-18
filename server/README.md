# Server Directory Structure

This directory contains the backend Express.js application.

## Current Structure:

```
server/
├── controllers/        # Route handlers and business logic
├── middleware/         # Express middleware (auth, validation)
├── services/          # Business logic services
├── models/            # Database models and queries
├── routes/            # Organized route definitions
│   ├── dashboard.ts   # Dashboard and analytics routes
│   ├── users.ts       # User management routes
│   ├── leads.ts       # Lead management routes
│   ├── contacts.ts    # Contact management routes
│   ├── tasks.ts       # Task management routes
│   ├── appointments.ts # Appointment management routes
│   ├── portal.ts      # Portal user routes
│   └── index.ts       # Route exports
├── rules/             # Rule engine system
│   ├── engine.ts      # Rule evaluation logic
│   └── routes.ts      # Rule management API
├── automation/        # Workflow automation system
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── config/            # Configuration files
├── index.ts           # Server entry point
├── routes.ts          # Main route registration
├── storage.ts         # Database abstraction layer
├── db.ts              # Database connection setup
└── vite.ts            # Development server integration
```

## Benefits of This Structure:

1. **Clear Separation of Concerns**: Each route file handles a specific domain
2. **Easy Maintenance**: Routes are organized by feature, not mixed together
3. **Scalability**: Easy to add new features without cluttering main files
4. **Developer Experience**: Easy to find and modify specific functionality
5. **Consistent Structure**: All routes follow the same pattern and structure
6. **Proper Middleware Organization**: Authentication and validation logic separated
7. **Reusable Components**: Services and utilities can be shared across routes

## Current File Responsibilities:

### `index.ts`
- Express server setup
- Middleware configuration
- Server startup

### `routes.ts`
- API endpoint definitions
- Request/response handling
- Route-level validation

### `storage.ts`
- Database abstraction interface
- CRUD operations
- Data access layer

### `db.ts`
- Database connection
- Drizzle ORM configuration

### `vite.ts`
- Development server integration
- Hot reload support