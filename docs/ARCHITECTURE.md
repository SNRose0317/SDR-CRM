# Rules System Architecture

This document outlines the architecture of the rules-based permission system.

## Directory Structure

```
├── server/
│   └── rules/                    # Backend rule engine
│       ├── engine.ts             # Core rule evaluation logic
│       ├── routes.ts             # API endpoints
│       └── index.ts              # Module exports
├── client/src/features/
│   └── rules/                    # Frontend rule management
│       ├── components/           # React components
│       │   ├── condition-builder.tsx
│       │   ├── rule-builder.tsx
│       │   └── rule-management.tsx
│       ├── pages/                # Page components
│       │   └── rules.tsx
│       └── index.ts              # Module exports
├── shared/
│   └── rules/                    # Shared types and schemas
│       ├── schema.ts             # Type definitions
│       └── index.ts              # Module exports
└── docs/
    └── rules/                    # Documentation
        ├── API.md                # API documentation
        └── EXAMPLES.md           # Usage examples
```

## Key Components

### Rule Engine (server/rules/engine.ts)
- Singleton pattern for global rule management
- Caching layer for performance optimization
- Recursive evaluation of compound conditions
- Integration with database for rule persistence

### Rule Builder (client/src/features/rules/components/rule-builder.tsx)
- Visual rule creation interface
- Form validation and error handling
- Real-time rule preview
- Integration with condition builder

### Condition Builder (client/src/features/rules/components/condition-builder.tsx)
- Support for simple and compound conditions
- AND/OR logic with visual representation
- Dynamic field selection based on entity type
- Enhanced operators for comprehensive filtering

## Data Flow

1. **Rule Creation**: User creates rules through the visual builder
2. **Validation**: Client-side validation before submission
3. **Storage**: Rules stored in database with compound condition structure
4. **Evaluation**: Rule engine evaluates conditions against entities
5. **Caching**: Results cached for performance optimization
6. **Audit**: All rule changes and evaluations logged

## Benefits of This Architecture

1. **Separation of Concerns**: Clear separation between rule logic, UI, and data
2. **Maintainability**: Easy to find and modify rule-related code
3. **Scalability**: Each component can be developed independently
4. **Testability**: Clear boundaries make testing easier
5. **Reusability**: Components can be imported and used elsewhere
6. **Documentation**: Each area has focused documentation

## Future Enhancements

- Add rule versioning system
- Implement rule testing framework
- Add rule analytics and reporting
- Support for rule templates
- Integration with workflow automation