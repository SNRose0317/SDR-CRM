# Developer Onboarding Guide

## Welcome to HealthCRM Development

This guide will help you get started with developing on the HealthCRM healthcare customer relationship management system.

## Prerequisites

### Required Knowledge
- **TypeScript** - All code is written in TypeScript
- **React 18** - Frontend framework with hooks and modern patterns
- **Node.js** - Backend runtime environment
- **PostgreSQL** - Database knowledge for schema understanding
- **Git** - Version control and collaboration

### Development Tools
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **VS Code** - Recommended IDE with TypeScript support
- **Git** - Version control

## Quick Start

### 1. Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd healthcrm

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, push database schema
npm run db:push
```

### 2. Application Structure
```
healthcrm/
├── client/src/
│   ├── features/           # Feature-based organization
│   │   ├── dashboard/      # Dashboard and analytics
│   │   ├── leads/          # Lead management (5-stage pipeline)
│   │   ├── contacts/       # Contact management (15-stage healthcare)
│   │   ├── tasks/          # Task management with priorities
│   │   ├── appointments/   # Appointment scheduling
│   │   ├── users/          # User management (SDR, Health Coach, Admin)
│   │   └── settings/       # System configuration
│   └── shared/             # Shared components and utilities
├── server/                 # Express.js backend
├── shared/                 # Shared types and schema
└── docs/                   # Documentation
```

### 3. Development Workflow

#### Adding a New Feature
1. **Create feature directory**: `client/src/features/new-feature/`
2. **Add database schema**: Update `shared/schema.ts`
3. **Create storage methods**: Add to `server/storage.ts`
4. **Add API routes**: Update `server/routes.ts`
5. **Build components**: Create in `features/new-feature/components/`
6. **Create pages**: Add to `features/new-feature/pages/`
7. **Update routing**: Add route in `client/src/App.tsx`

#### Modifying Existing Features
1. **Locate feature**: Find in `client/src/features/{feature-name}/`
2. **Update components**: Modify components in feature directory
3. **Update API**: Modify routes in `server/routes.ts`
4. **Update schema**: Modify `shared/schema.ts` if needed
5. **Run database push**: `npm run db:push`

## Code Standards

### TypeScript Guidelines
- **Strict mode enabled** - No `any` types allowed
- **Proper interfaces** - Define interfaces for all props and data
- **Type imports** - Use `import type` for type-only imports
- **Zod validation** - Use Zod schemas for runtime validation

### React Patterns
- **Functional components** - Use function components with hooks
- **Custom hooks** - Extract reusable logic into custom hooks
- **React Query** - Use for all API calls and state management
- **Form handling** - Use React Hook Form with Zod validation

### File Organization
- **Feature-based structure** - Group related files by business domain
- **Shared components** - Reusable components in `shared/components/`
- **Consistent naming** - Use kebab-case for files, PascalCase for components
- **Index files** - Create index.ts files for clean imports

## Database Development

### Schema Changes
1. **Modify schema**: Update `shared/schema.ts`
2. **Push changes**: Run `npm run db:push`
3. **Update storage**: Add new methods to `server/storage.ts`
4. **Update API**: Add new routes in `server/routes.ts`

### Database Best Practices
- **Use Drizzle ORM** - Never write raw SQL
- **Type safety** - Use generated types from schema
- **Relationships** - Define proper foreign key relationships
- **Validation** - Use Zod schemas for data validation

## API Development

### Adding New Endpoints
1. **Define route**: Add to `server/routes.ts`
2. **Add validation**: Use Zod schemas for request validation
3. **Use storage layer**: Call methods from `server/storage.ts`
4. **Error handling**: Return consistent error responses
5. **Test endpoint**: Use curl or Postman to test

### API Patterns
- **RESTful design** - Use standard HTTP methods
- **Consistent responses** - Return JSON with consistent structure
- **Error handling** - Use standard HTTP status codes
- **Validation** - Validate all inputs with Zod

## Frontend Development

### Component Development
- **Single responsibility** - Each component has one clear purpose
- **Proper typing** - Type all props and state
- **Accessibility** - Use ARIA labels and semantic HTML
- **Responsive design** - Works on all screen sizes

### State Management
- **React Query** - For server state management
- **Local state** - Use useState for component state
- **Context** - For app-wide state (sparingly)
- **No global state** - Avoid Redux or similar

## Testing

### Component Testing
- **Unit tests** - Test individual components
- **Integration tests** - Test feature workflows
- **E2E tests** - Test complete user journeys
- **Accessibility tests** - Verify ARIA compliance

### API Testing
- **Route testing** - Test each API endpoint
- **Validation testing** - Test input validation
- **Error handling** - Test error scenarios
- **Performance testing** - Test with large datasets

## Healthcare Domain Knowledge

### Lead Management (5 Stages)
1. **HHQ Started** - Health questionnaire initiated
2. **HHQ Signed** - Health questionnaire completed
3. **Booking: Not Paid** - Booking started, payment pending
4. **Booking: Paid/Not Booked** - Paid but not scheduled
5. **Booking: Paid/Booked** - Ready for conversion

### Contact Management (15 Stages)
Healthcare patient journey from intake to annual restart:
1. Intake → 2. Initial Labs → 3. Initial Lab Review → 4. Initial Provider Exam → 5. Initial Medication Order → 6. 1st Follow-up Labs → 7. First Follow-Up Lab Review → 8. First Follow-Up Provider Exam → 9. First Medication Refill → 10. Second Follow-Up Labs → 11. Second Follow-Up Lab Review → 12. Second Follow-up Provider Exam → 13. Second Medication Refill → 14. Third Medication Refill → 15. Restart Annual Process

### User Roles
- **SDR**: Lead management, initial patient contact
- **Health Coach**: Patient care, healthcare workflow management
- **Admin**: Full system access, user management

## Common Tasks

### Adding a New Lead Status
1. Update `leadStatus` enum in `shared/schema.ts`
2. Run `npm run db:push`
3. Update frontend components to handle new status
4. Update API validation schemas

### Adding a New Contact Stage
1. Update `contactStage` enum in `shared/schema.ts`
2. Run `npm run db:push`
3. Update frontend components for new stage
4. Update healthcare workflow logic

### Creating a New Component
1. Create component in appropriate feature directory
2. Add proper TypeScript interfaces
3. Include JSDoc comments
4. Add to feature index.ts file
5. Update feature README if needed

## Debugging

### Common Issues
- **Import errors**: Check file paths and ensure files exist
- **Type errors**: Verify TypeScript interfaces match usage
- **Database errors**: Check schema and run `npm run db:push`
- **API errors**: Verify route paths and validation schemas

### Debugging Tools
- **Browser DevTools** - For frontend debugging
- **VS Code Debugger** - For backend debugging
- **React Query DevTools** - For API state debugging
- **Database inspection** - Use database tools to inspect data

## Resources

### Documentation
- **Project README** - Overview and setup instructions
- **Architecture Guide** - System design and patterns
- **API Documentation** - Complete API reference
- **Feature Specifications** - Business requirements

### External Resources
- **React Documentation** - https://react.dev/
- **TypeScript Handbook** - https://www.typescriptlang.org/docs/
- **Drizzle ORM** - https://orm.drizzle.team/
- **React Query** - https://tanstack.com/query/

## Getting Help

### Before Asking for Help
1. Check this documentation
2. Review feature README files
3. Search existing code for similar patterns
4. Check the project's issue tracker

### When to Ask for Help
- Unclear business requirements
- Complex technical decisions
- Performance optimization needs
- Healthcare domain questions

Welcome to the team! This guide should help you get started with HealthCRM development. Remember to follow the established patterns and maintain the high code quality standards we've set.