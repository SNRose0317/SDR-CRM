# Models Directory

This directory contains database models, query builders, and data access objects for the healthcare CRM system.

## Purpose

Models provide a structured way to interact with the database, encapsulating complex queries and data relationships specific to healthcare workflows.

## Structure

```
models/
├── userModel.ts              # User data access and queries
├── leadModel.ts              # Lead-specific database operations
├── contactModel.ts           # Contact/patient data management
├── appointmentModel.ts       # Appointment scheduling queries
├── taskModel.ts              # Task management queries
├── activityModel.ts          # Activity logging and audit trails
├── portalModel.ts            # Portal user data access
├── ruleModel.ts              # Rule engine data operations
├── automationModel.ts        # Workflow automation queries
├── analyticsModel.ts         # Reporting and analytics queries
└── healthModel.ts            # Health-specific data operations
```

## Example Model Structure

```typescript
// leadModel.ts
import { db } from '../db';
import { leads, users, activityLogs } from '@shared/schema';
import { eq, and, or, desc, count } from 'drizzle-orm';

export class LeadModel {
  async findByStatus(status: string) {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.status, status))
      .orderBy(desc(leads.createdAt));
  }

  async findUnassignedLeads() {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.ownerId, null))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsBySDR(userId: number) {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.ownerId, userId))
      .orderBy(desc(leads.updatedAt));
  }

  async getLeadConversionStats() {
    // Complex analytics query
    return await db
      .select({
        status: leads.status,
        count: count()
      })
      .from(leads)
      .groupBy(leads.status);
  }
}
```

## Healthcare CRM Specific Models

### UserModel
- User authentication queries
- Role-based access control
- Staff assignment and availability
- Performance metrics

### LeadModel
- Lead qualification queries
- Assignment and claiming logic
- Lead nurturing workflows
- Conversion tracking

### ContactModel
- Patient data management
- Care plan associations
- Health coach assignments
- Patient journey tracking

### AppointmentModel
- Scheduling availability queries
- Appointment conflict resolution
- Reminder system integration
- Calendar synchronization

### TaskModel
- Task assignment queries
- Follow-up tracking
- Care coordination tasks
- Completion analytics

### ActivityModel
- Comprehensive audit trails
- User activity tracking
- System event logging
- Compliance reporting

### PortalModel
- Portal user authentication
- Patient data access
- Secure messaging queries
- Portal activity tracking

### RuleModel
- Rule engine data operations
- Permission evaluation queries
- Rule audit trails
- Performance optimization

### AutomationModel
- Workflow execution tracking
- Trigger event queries
- Action result logging
- Automation analytics

### AnalyticsModel
- Patient journey analytics
- Conversion rate calculations
- Provider performance metrics
- Health outcome tracking

### HealthModel
- Health questionnaire responses
- Risk assessment data
- Care plan progress
- Health outcome measurements

## Advanced Query Patterns

### Complex Joins
```typescript
async getLeadWithAssignedSDR(leadId: number) {
  return await db
    .select({
      lead: leads,
      assignedUser: users
    })
    .from(leads)
    .leftJoin(users, eq(leads.ownerId, users.id))
    .where(eq(leads.id, leadId));
}
```

### Aggregations
```typescript
async getSDRPerformance() {
  return await db
    .select({
      userId: users.id,
      userName: users.firstName,
      leadCount: count(leads.id),
      conversionRate: sql`(COUNT(CASE WHEN ${leads.status} = 'converted' THEN 1 END) * 100.0) / COUNT(${leads.id})`
    })
    .from(users)
    .leftJoin(leads, eq(users.id, leads.ownerId))
    .where(eq(users.role, 'SDR'))
    .groupBy(users.id, users.firstName);
}
```

### Time-Based Queries
```typescript
async getLeadsOlderThan(hours: number) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return await db
    .select()
    .from(leads)
    .where(sql`${leads.createdAt} < ${cutoffTime}`);
}
```

## Benefits

1. **Query Encapsulation**: Complex queries in reusable methods
2. **Performance Optimization**: Optimized queries for specific use cases
3. **Type Safety**: Full TypeScript support with Drizzle ORM
4. **Maintainability**: Database logic separated from business logic
5. **Testability**: Models can be unit tested independently

## When We Would Need This

We would create model files when:

### Current State (Why we haven't needed them yet)
- **Simple Queries**: Most database operations are basic CRUD through the storage layer
- **Storage Abstraction**: The `storage.ts` file handles most database complexity
- **Small Dataset**: Current data volume doesn't require query optimization
- **Basic Relationships**: Simple joins are handled directly in storage methods

### Future Triggers (When we would create models)
1. **Complex Analytics**: When we need sophisticated reporting queries like conversion funnels, patient journey analytics, or provider performance metrics
2. **Performance Optimization**: When query performance becomes critical due to data volume or complexity
3. **Advanced Filtering**: When we implement complex lead/contact filtering with multiple criteria, date ranges, and cross-table searches
4. **Data Relationships**: When we need complex joins across multiple tables for features like care team assignments or patient history
5. **Aggregation Queries**: When we build dashboard analytics with complex grouping and calculations
6. **Search Functionality**: When we implement full-text search across patient records or lead data

### Example: When Analytics Gets Complex
```typescript
// Currently: Simple stats in storage
async getLeadStats() {
  return await db.select({
    status: leads.status,
    count: count()
  }).from(leads).groupBy(leads.status);
}

// Would become: LeadModel when we need advanced analytics
class LeadModel {
  async getConversionFunnel(dateRange: DateRange) {
    // Complex multi-table query with CTEs, window functions
    // Performance-optimized with proper indexes
    // Reusable across multiple controllers
  }
}
```

## Best Practices

1. **Single Responsibility**: Each model handles one entity type
2. **Query Optimization**: Use indexes and efficient query patterns
3. **Error Handling**: Proper error handling for database operations
4. **Connection Management**: Efficient use of database connections
5. **Security**: Parameterized queries to prevent SQL injection