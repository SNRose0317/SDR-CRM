# Types Directory

This directory contains TypeScript type definitions, interfaces, and enums specific to the healthcare CRM system.

## Purpose

Types provide type safety, better IDE support, and documentation for complex data structures used throughout the application.

## Structure

```
types/
├── user.ts                   # User-related types and interfaces
├── lead.ts                   # Lead management types
├── contact.ts                # Contact/patient types
├── appointment.ts            # Appointment scheduling types
├── task.ts                   # Task management types
├── health.ts                 # Health-specific types
├── automation.ts             # Workflow automation types
├── portal.ts                 # Portal user types
├── rule.ts                   # Rule engine types
├── notification.ts           # Notification system types
├── analytics.ts              # Analytics and reporting types
├── api.ts                    # API request/response types
├── common.ts                 # Common utility types
└── index.ts                  # Type exports
```

## Example Type Definitions

```typescript
// user.ts
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions: UserPermissions;
}

export type UserRole = 'admin' | 'SDR' | 'health_coach' | 'manager' | 'patient';

export interface UserPermissions {
  canViewAllLeads: boolean;
  canAssignLeads: boolean;
  canEditContacts: boolean;
  canScheduleAppointments: boolean;
  canAccessPortal: boolean;
}

export interface UserFilters {
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  lastLoginAfter?: Date;
}
```

## Healthcare CRM Specific Types

### User Types
- Role-based user interfaces
- Permission structures
- Authentication types
- Staff assignment types

### Lead Types
- Lead qualification stages
- Lead scoring interfaces
- Assignment tracking types
- Conversion analytics

### Contact Types
- Patient information interfaces
- Care plan structures
- Health coach assignments
- Patient journey tracking

### Appointment Types
- Scheduling interfaces
- Availability types
- Reminder configurations
- Calendar integration types

### Task Types
- Task assignment interfaces
- Follow-up tracking types
- Care coordination tasks
- Completion analytics

### Health Types
- Health questionnaire structures
- Risk assessment types
- Care plan interfaces
- Health outcome tracking

### Automation Types
- Workflow definition interfaces
- Trigger configuration types
- Action execution types
- Rule engine structures

### Portal Types
- Portal user interfaces
- Patient access types
- Secure messaging structures
- Portal activity tracking

### Rule Types
- Rule condition interfaces
- Permission evaluation types
- Rule execution results
- Audit trail structures

### Notification Types
- Multi-channel messaging types
- Template configuration interfaces
- Delivery tracking types
- Notification preferences

### Analytics Types
- Reporting interfaces
- Metric calculation types
- Dashboard data structures
- Performance tracking

## Example Type Implementations

### Lead Management Types
```typescript
// lead.ts
export interface Lead {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: LeadStatus;
  source: LeadSource;
  ownerId?: number;
  qualificationScore?: number;
  healthQuestionnaire?: HealthQuestionnaire;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = 
  | 'new'
  | 'hhq_started'
  | 'hhq_signed'
  | 'booking_requested'
  | 'booking_scheduled'
  | 'booking_completed'
  | 'converted'
  | 'lost';

export type LeadSource = 
  | 'website'
  | 'referral'
  | 'advertisement'
  | 'social_media'
  | 'portal_signup';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  ownerId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  qualificationScoreMin?: number;
  qualificationScoreMax?: number;
}

export interface LeadAssignment {
  leadId: number;
  userId: number;
  assignedAt: Date;
  assignedBy: number;
  notes?: string;
}
```

### Health-Specific Types
```typescript
// health.ts
export interface HealthQuestionnaire {
  id: number;
  patientId: number;
  responses: QuestionnaireResponse[];
  completedAt?: Date;
  riskScore: number;
  recommendations: string[];
}

export interface QuestionnaireResponse {
  questionId: string;
  questionText: string;
  answer: string | number | boolean;
  category: HealthCategory;
}

export type HealthCategory = 
  | 'demographics'
  | 'medical_history'
  | 'current_medications'
  | 'lifestyle'
  | 'symptoms'
  | 'goals';

export interface CarePlan {
  id: number;
  patientId: number;
  healthCoachId: number;
  goals: CareGoal[];
  milestones: CareMilestone[];
  createdAt: Date;
  updatedAt: Date;
  status: CarePlanStatus;
}

export type CarePlanStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface CareGoal {
  id: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  dueDate?: Date;
  status: GoalStatus;
}

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'missed';
```

### API Types
```typescript
// api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  requiresAuth: boolean;
  permissions?: string[];
}
```

### Common Utility Types
```typescript
// common.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type WithId<T> = T & { id: number };

export type WithTimestamps<T> = T & Timestamps;

export type EntityWithMeta<T> = WithId<WithTimestamps<T>>;

export type FilterOptions<T> = {
  [K in keyof T]?: T[K] | T[K][] | { min?: T[K]; max?: T[K] };
};

export type SortOrder = 'asc' | 'desc';

export type SortOptions<T> = {
  field: keyof T;
  order: SortOrder;
};
```

## Benefits

1. **Type Safety**: Compile-time error checking
2. **IDE Support**: Better autocomplete and refactoring
3. **Documentation**: Types serve as living documentation
4. **Maintainability**: Changes to types propagate through the codebase
5. **Consistency**: Standardized data structures across the application

## When to Use

Create types for:
- Complex data structures
- API request/response interfaces
- Configuration objects
- Filter and query parameters
- Business domain objects
- Third-party integrations

## Best Practices

1. **Descriptive Names**: Use clear, descriptive type names
2. **Composition**: Build complex types from simpler ones
3. **Utility Types**: Use TypeScript utility types for common patterns
4. **Enums vs Unions**: Use string literal unions for most cases
5. **Generic Types**: Use generics for reusable type patterns
6. **Documentation**: Add JSDoc comments for complex types