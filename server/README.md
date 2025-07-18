# Server Directory Overview

This directory contains the complete backend Express.js application for the healthcare CRM system.

## Current Structure

```
server/
├── automation/        # Workflow automation system
├── controllers/       # Route handlers and business logic (README provided)
├── middleware/        # Express middleware (authentication, validation)
├── models/           # Database models and queries (README provided)
├── routes/           # Organized route definitions by domain
├── rules/            # Rule engine system for permissions
├── services/         # Business logic services (README provided)
├── types/            # TypeScript type definitions (README provided)
├── utils/            # Utility functions and helpers (README provided)
├── config/           # Configuration files and settings (README provided)
├── index.ts          # Server entry point
├── routes.ts         # Main route registration
├── storage.ts        # Database abstraction layer
├── db.ts             # Database connection setup
├── vite.ts           # Development server integration
└── README.md         # This overview file
```

## Directory Purposes

### 🎯 **controllers/** - Business Logic Handlers
Route handlers and business logic controllers that process requests and coordinate between services.
- **When to use**: Complex business logic, multi-step operations, request coordination
- **Examples**: Lead qualification, appointment scheduling, care plan creation

### 🛡️ **middleware/** - Request Processing
Express middleware for authentication, validation, and request preprocessing.
- **When to use**: Cross-cutting concerns, authentication, request validation
- **Examples**: Portal authentication, permission checking, input validation

### 🗄️ **models/** - Data Access Layer
Database models and complex query operations using Drizzle ORM.
- **When to use**: Complex queries, data relationships, performance optimization
- **Examples**: Lead analytics, appointment availability, patient journey tracking

### 🛤️ **routes/** - API Endpoints
Organized route definitions by domain (users, leads, contacts, etc.).
- **When to use**: API endpoint definitions, simple CRUD operations
- **Examples**: REST endpoints for each entity type

### 📋 **rules/** - Permission Engine
Rule-based permission system for dynamic access control.
- **When to use**: Complex permission logic, dynamic access rules
- **Examples**: Role-based access, time-based permissions, entity ownership

### 🔧 **services/** - Business Services
Complex business logic and external integrations.
- **When to use**: Business calculations, external APIs, complex workflows
- **Examples**: Lead scoring, appointment notifications, health assessments

### 🏷️ **types/** - Type Definitions
TypeScript interfaces and type definitions for the application.
- **When to use**: Complex data structures, API contracts, type safety
- **Examples**: User interfaces, health data types, API response types

### 🛠️ **utils/** - Helper Functions
Utility functions and helpers used throughout the application.
- **When to use**: Common functionality, data formatting, calculations
- **Examples**: Date formatting, validation, encryption, health calculations

### ⚙️ **config/** - Application Configuration
Configuration files and environment-specific settings.
- **When to use**: Environment settings, feature flags, third-party configurations
- **Examples**: Database settings, authentication config, scheduling rules

## Architecture Flow

```
Request → routes/ → controllers/ → services/ → models/ → Database
    ↓         ↓           ↓           ↓
middleware/  utils/     config/    types/
```

## Key Files

### Core Application Files
- **`index.ts`** - Express server setup and startup
- **`routes.ts`** - Main route registration and organization
- **`storage.ts`** - Database abstraction layer with comprehensive interface
- **`db.ts`** - Database connection and Drizzle ORM setup
- **`vite.ts`** - Development server integration

### Feature Systems
- **`automation/`** - Complete workflow automation system
- **`rules/`** - Rule-based permission system with visual builder

## Development Guidelines

### When to Create New Files

1. **Controllers**: When route handlers exceed 20 lines or need complex business logic
2. **Services**: When business logic needs to be shared or involves external integrations
3. **Models**: When you need complex queries or data relationships
4. **Utils**: When functions are used in multiple places
5. **Types**: When you have complex data structures or API contracts

### Code Organization Principles

1. **Separation of Concerns**: Each directory has a specific responsibility
2. **Domain-Driven**: Files organized by business domain (users, leads, contacts)
3. **Layer Architecture**: Clear separation between routes, business logic, and data access
4. **Dependency Direction**: Higher layers depend on lower layers, not vice versa

## Healthcare CRM Specific Features

### Patient Data Management
- HIPAA-compliant data handling
- Secure patient portal access
- Health questionnaire processing
- Care plan coordination

### Lead Management
- Lead qualification and scoring
- Automated assignment to SDRs
- Permission-based visibility
- Conversion tracking

### Appointment Scheduling
- Intelligent scheduling algorithms
- Automated reminders
- Calendar integration
- Availability management

### Workflow Automation
- Visual workflow builder
- Rule-based automation
- Trigger and action system
- Business process automation

### Analytics and Reporting
- Patient journey analytics
- Provider performance metrics
- Conversion rate tracking
- Health outcome analysis

## Best Practices

1. **Type Safety**: Use TypeScript throughout for better reliability
2. **Error Handling**: Consistent error handling patterns
3. **Logging**: Comprehensive logging for debugging and compliance
4. **Testing**: Unit tests for services and utilities
5. **Documentation**: Clear README files for each directory
6. **Security**: HIPAA compliance and data protection
7. **Performance**: Optimized queries and caching strategies

## Getting Started

1. **Review Directory READMEs**: Each directory has detailed documentation
2. **Follow Patterns**: Use existing patterns for consistency
3. **Start Small**: Begin with simple implementations and grow complexity
4. **Test Thoroughly**: Especially important for healthcare applications
5. **Document Changes**: Keep documentation updated as you develop

This structure provides a solid foundation for a scalable, maintainable healthcare CRM system with clear separation of concerns and comprehensive documentation.