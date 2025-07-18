# HealthCRM - Customer Relationship Management System

## Overview

HealthCRM is a full-stack web application designed for managing healthcare customer relationships. It provides a comprehensive platform for tracking leads, managing contacts, scheduling appointments, and handling tasks in a healthcare context. The application is built using modern web technologies with a React frontend and Express.js backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

### Database Schema
The application uses a comprehensive relational database schema with the following main entities:
- **Users**: SDR, Health Coach, and Admin roles
- **Leads**: Potential customers with status tracking (HHQ Started, HHQ Signed, Booking stages)
- **Contacts**: Active customers with detailed stage tracking through healthcare journey
- **Tasks**: Assignable tasks with priority levels and status tracking
- **Appointments**: Scheduled meetings with users, leads, or contacts
- **Activity Logs**: Audit trail for system activities

## Key Components

### Frontend Components
- **Layout System**: Main layout with responsive sidebar navigation and header
- **Data Tables**: Reusable table component with sorting, filtering, and pagination
- **Forms**: Dedicated form components for each entity (users, leads, contacts, tasks, appointments)
- **Stats Cards**: Dashboard statistics display components
- **UI Components**: Complete set of accessible UI components from Radix UI

### Backend Components
- **Storage Layer**: Abstracted database operations with a comprehensive interface
- **Route Handlers**: RESTful endpoints for all CRUD operations
- **Database Connection**: Neon serverless PostgreSQL connection with connection pooling
- **Middleware**: Request logging, JSON parsing, and error handling

## Data Flow

1. **Client Requests**: React components make API calls using React Query
2. **API Layer**: Express.js routes handle requests and validate data
3. **Storage Layer**: Abstracted storage interface manages database operations
4. **Database**: Drizzle ORM executes queries against PostgreSQL
5. **Response**: JSON responses flow back through the layers to update UI

The application follows a typical three-tier architecture with clear separation between presentation, business logic, and data layers.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database access layer
- **Connection Pooling**: Efficient database connection management

### UI Framework
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across the entire application
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development server and build tool

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon database connection for development
- **Environment Variables**: DATABASE_URL for database configuration

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: esbuild bundles Node.js application
- **Static Assets**: Served from dist/public directory
- **Database**: Production Neon database instance

### Architecture Decisions

1. **Database Choice**: PostgreSQL chosen for ACID compliance and complex relationship support needed for CRM functionality
2. **ORM Selection**: Drizzle ORM provides type safety while maintaining SQL-like syntax for complex queries
3. **State Management**: React Query eliminates need for global state management by handling server state efficiently
4. **UI Framework**: Radix UI + Tailwind provides accessible, customizable components without design constraints
5. **Monorepo Structure**: Shared schema between frontend and backend ensures type consistency
6. **API Design**: RESTful design with consistent JSON responses for predictable client-server communication

The application is designed to be scalable, maintainable, and provides a solid foundation for healthcare CRM functionality with room for future enhancements.

## Recent Changes

- Database architecture completed with PostgreSQL setup and schema successfully deployed
- Development environment stabilized with proper port configuration and database connectivity
- Major TypeScript error resolution: Fixed 42+ compilation errors across 10 files
- Database enum issues resolved: Fixed invalid contact_stage values and corrected getContactStats method
- SelectItem component issues fixed: Replaced empty string values with "all" to prevent runtime errors
- Type safety improvements: Added proper array type checking and parameter typing for render functions
- **Date validation fix (July 17, 2025)**: Fixed critical schema validation issue where task and appointment forms were failing due to date string to Date object conversion errors. Modified insertTaskSchema and insertAppointmentSchema to properly handle string dates with transform functions.
- **Comprehensive error checking completed**: All TypeScript compilation errors resolved, build process successful, all API endpoints tested and working correctly with proper CRUD operations for users, leads, contacts, tasks, and appointments.
- **Directory structure optimization (July 17, 2025)**: Completely reorganized codebase for optimal developer understanding with feature-based architecture, comprehensive documentation, and clear separation of concerns. Created docs/ directory with API documentation, architecture guides, and deployment instructions.
- **UI Component best practices implementation (July 17, 2025)**: Implemented optimal UI component architecture with feature-based organization, standardized component categories (UI primitives, composite, layout, data-display, feedback), consistent import patterns, and professional component library structure. Created reusable LoadingSpinner, ErrorMessage, and EmptyState components with proper TypeScript interfaces and accessibility compliance.
- **Complete feature-based file organization (July 17, 2025)**: Moved ALL page files to their respective feature directories (dashboard, leads, contacts, tasks, appointments, users, settings) and ALL form components to their feature-specific locations. Updated all import paths, removed empty directories, and achieved true feature-based architecture where every file is in its optimal location.
- **Comprehensive documentation suite implementation (July 17, 2025)**: Created complete documentation coverage with feature-specific README files, developer onboarding guide, database schema documentation, environment variables guide, JSDoc comments for key components, and updated all documentation to reflect current project state. Documentation now follows best practices with clear structure and comprehensive coverage.
- **Client portal architecture plan (July 17, 2025)**: Designed comprehensive client portal integration plan using unified application approach rather than monorepo. Created detailed architecture documentation, implementation guide, and event-driven system design for patient access to records, appointment booking, secure messaging, and automated staff notifications. Plan includes role-based access control, HIPAA compliance, and seamless integration with existing CRM workflows.
- **Patient portal implementation complete (July 17, 2025)**: Successfully implemented working patient portal with database schema extensions, secure authentication system, API endpoints for patient data access, and dedicated portal UI components. Portal features patient-specific dashboard, appointment management, secure messaging with health coaches, and healthcare journey tracking. Fixed routing issues to ensure proper portal navigation and separated patient portal UI from staff CRM interface.
- **Comprehensive automation framework implementation (July 17, 2025)**: Built complete automation trigger system with portal signup workflow. Created organized automation architecture in server/automation/ with AutomationManager, SignupTrigger, ActionExecutor, and comprehensive type definitions. Portal signup now automatically creates leads, assigns follow-up tasks to SDRs, and logs activities. Framework supports multiple event types (USER_SIGNUP, LEAD_CREATED, etc.) and action types (CREATE_TASK, SEND_EMAIL, etc.) with template system for future workflow automation manager UI. System includes error handling, condition evaluation, and extensible architecture for custom automations.
- **Visual workflow automation builder complete (July 17, 2025)**: Implemented comprehensive drag-and-drop workflow builder using React Flow similar to Lucid Chart. Created complete component architecture with WorkflowBuilder, NodePalette, WorkflowToolbar, NodeProperties, and custom node types (trigger, action, condition, delay nodes). Features include workflow templates, execution panel, real-time testing, and visual workflow designer. System supports complex workflow creation with triggers (portal signup, lead created, status changed), actions (update status, assign users, create tasks, send Slack notifications), conditions (if/then logic), and time delays. Integrated seamlessly with existing CRM navigation and automation system. Visual builder allows non-technical users to create automated workflows through intuitive drag-and-drop interface.
- **Business-focused workflow builder enhancement (July 17, 2025)**: Created comprehensive business-friendly workflow automation system with role-based design for maximum manager intuitiveness. Implemented business definitions framework with pre-defined user types (Portal User, Lead, Contact), business statuses (New, HHQ Started, HHQ Signed, Booking stages), system roles (SDR, Health Coach, Admin), and business actions (assign to team, send notifications, create tasks). Built specialized UI components: BusinessNodePalette with role-based filtering, BusinessWorkflowCanvas with business-friendly node types, and custom business nodes (BusinessTriggerNode, BusinessActionNode, BusinessConditionNode, BusinessDelayNode). System uses business terminology throughout, provides role-based workflow templates, and includes pre-built scenarios like "Portal Signup → Lead Creation → SDR Assignment". Enhanced automation framework with business-friendly definitions that map directly to existing CRM entities and workflows. Designed for non-technical managers to create sophisticated automation workflows using familiar business concepts rather than technical abstractions.
- **WHO-WHAT-WHEN workflow structure implementation (July 18, 2025)**: Completely restructured workflow builder to follow intuitive WHO-WHAT-WHEN logic instead of individual scenario lists. Simplified NodePalette to four logical categories: WHO (single User card), WHAT (state changes like CREATED, STATUS_CHANGED), THEN (responses like Assign, Create Task), and utilities. Implemented comprehensive two-level user selection system with UserConfiguration component that maps to system user groups (Portal User/Patient, Lead, Contact, SDR, Health Coach, Admin) and displays individual users from database based on selected type. Users can select specific individuals or leave empty to apply to all users of that type. System queries actual user data from users, leads, and contacts tables based on role filtering. This creates a more logical and scalable workflow creation process following business-friendly WHO does WHAT and WHEN structure.
- **Complete portal architecture redesign for leads/contacts (July 18, 2025)**: Eliminated all mock data contamination and completely restructured portal system to support both leads and contacts as external users. Renamed all patient_* tables to portal_* tables with dual external user support (lead_id and contact_id columns). Rewrote portal authentication system to handle both leads and contacts instead of fake "patient" entities. Updated database schema with portalMessages, portalNotifications, and portalSessions tables supporting both external user types. Fixed portal authentication to query actual leads and contacts tables instead of mock patient data. Updated all portal routes and API endpoints to use new authentication system. Portal now correctly serves both leads (potential customers) and contacts (active customers) with proper database relationships and no mock data contamination.
- **Permission-based CRM architecture implementation (July 18, 2025)**: Completely redesigned lead claiming system to use CRM-standard permission-based approach instead of pool status fields. Removed poolStatus, poolEnteredAt, and claimedAt columns from leads table. Created comprehensive permissions system in shared/permissions.ts with global permission settings for role-based access control. Implemented permission functions that determine what users can see based on assignment status (owner_id), user role, and entity creation time. Added owner_id column to both leads and contacts tables for unified assignment tracking. Created new API endpoints for entity assignment (/api/leads/:id/assign, /api/contacts/:id/assign) and permission-based entity listing (/api/leads/user/:userId, /api/contacts/user/:userId). Updated storage layer with permission-based filtering methods (getLeadsForUser, getContactsForUser, assignEntity, getAvailableEntities). Redesigned frontend EntityAssignment component to work with both leads and contacts using permission-based rules: SDRs can see all unassigned entities, Health Coaches can see unassigned entities after 24 hours, users can see only their own assigned entities. This creates a proper CRM where assignment is based on ownership rather than artificial pool states, with flexible global permissions that can be configured for different organizational needs.
- **Rule-based permission system implementation (July 18, 2025)**: Built comprehensive configurable rule-based permission system to replace hardcoded permission logic. Created complete database schema with permission_rules, rule_evaluations, and rule_audit_log tables. Implemented RuleEngine class with sophisticated rule evaluation logic supporting field-based conditions (createdAt, status, owner, etc.), operators (>, <, =, contains, etc.), and dynamic value parsing including relative time expressions ("24 hours ago"). Built visual rule builder interface with WHO-WHAT-WHEN structure allowing business users to configure access rules through intuitive drag-and-drop interface. Rules support multiple entity types (leads, contacts, tasks, appointments), target types (user, role, team), and action types (grant_access, assign_entity, trigger_workflow). Integrated rule engine with existing storage layer to evaluate permissions dynamically, falling back to default hardcoded rules when no matching rules exist. Added comprehensive rule management UI with rule creation, editing, testing, and audit logging. System supports complex business scenarios like "When Lead created > 24 hours, grant Health Coach read access" through visual interface rather than code changes. Architecture is fully extensible for additional entity types, conditions, and actions.
- **Compound conditions and enhanced operators (July 18, 2025)**: Enhanced rule system with compound conditions supporting AND/OR logic and expanded operator set including "is_empty", "is_not_empty", "starts_with", "ends_with". Updated database schema to support complex condition trees with nested logic. Built visual condition builder component for creating multiple conditions with logical operators. Enhanced rule engine with recursive evaluation of condition groups. Fixed validation schemas to support all new operators. Created sample rules demonstrating complex business logic: "When Lead created > 24 hours OR owner is empty", "When Lead created > 48 hours AND priority is high". System now supports sophisticated permission rules where either all conditions must be met (AND) or any condition can be met (OR). Provides business users with powerful tools for creating complex access control rules without code changes.
- **Complete file organization restructure (July 18, 2025)**: Reorganized all rule and workflow files into logical, developer-friendly directory structure. Moved server-side rule files to `server/rules/` directory (engine.ts, routes.ts), client-side rule components to `client/src/features/rules/` directory (rule-builder, condition-builder, rule-management), and shared schemas to `shared/rules/` directory. Created comprehensive documentation with README files for each directory explaining architecture, usage, and file structure. Added index.ts files for clean module exports. Updated all import paths throughout the application. This creates a much cleaner codebase where developers can easily find rule-related functionality without searching through mixed workflow and rule files. Each feature area (rules vs workflows) now has its own dedicated space with proper documentation.
- **Complete server directory organization (July 18, 2025)**: Implemented recommended server directory structure from README with complete separation of concerns. Moved portalAuth.ts to middleware/, portalRoutes.ts to routes/portal.ts, and broke down monolithic routes.ts into organized domain-specific files: dashboard.ts, users.ts, leads.ts, contacts.ts, tasks.ts, appointments.ts. Created routes/index.ts for clean module exports and updated main routes.ts to use organized structure. Added comprehensive documentation for routes/ and middleware/ directories explaining patterns, usage, and benefits. Fixed all import paths and created proper directory structure following established patterns. This eliminates the "sloppy" organization issue and creates a maintainable, scalable server architecture where developers can easily find and modify specific functionality.
- **Comprehensive empty directory documentation (July 18, 2025)**: Created detailed README files for all empty server directories (controllers/, services/, models/, utils/, types/, config/) with healthcare CRM-specific examples, code patterns, and implementation guidelines. Each README includes practical "When We Would Need This" sections explaining specific triggers and scenarios that would require creating files in each directory. Documentation covers current state (why files haven't been needed yet), future triggers (when complexity would require the architecture), and practical examples of how simple current implementations would evolve into complex organized structures. This provides clear guidance for when to move from current simple implementations to more sophisticated architectural patterns.
- **Health History Questionnaire (HHQ) implementation complete (July 18, 2025)**: Successfully implemented comprehensive HHQ feature for lead onboarding. Created health_questionnaires table in database with decimal fields for 1-10 scale health questions (energy level, libido level, overall health) and binary state tracking (is_signed, is_paid, appointment_booked). Built complete React component flow with HHQForm, SignatureStep, PaymentStep, and AppointmentBooking components providing multi-step wizard interface. Added API endpoints at /api/hhq for CRUD operations, signature recording, payment simulation, and appointment booking. Integrated HHQ into leads management with "Start HHQ" action button in leads table. Flow includes real data storage, health coach selection for appointments, and proper validation throughout. System tracks HHQ progress and completion status for each lead through the healthcare qualification pipeline.