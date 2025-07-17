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