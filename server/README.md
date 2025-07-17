# Server Directory Structure

This directory contains the backend Express.js application.

## Current Structure:

```
server/
├── index.ts            # Express server entry point
├── routes.ts           # API route definitions
├── storage.ts          # Database abstraction layer
├── db.ts              # Database connection setup
└── vite.ts            # Development server integration
```

## Improved Structure (Recommended):

```
server/
├── controllers/        # Route handlers and business logic
├── middleware/         # Express middleware
├── services/          # Business logic services
├── models/            # Database models and queries
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── config/            # Configuration files
├── index.ts           # Server entry point
└── routes.ts          # Route definitions
```

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