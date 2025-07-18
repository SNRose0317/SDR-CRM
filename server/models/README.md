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

## When to Use

Create models for:
- Complex database queries
- Multi-table joins
- Aggregations and analytics
- Performance-critical operations
- Reusable query patterns
- Data validation and transformation

## Best Practices

1. **Single Responsibility**: Each model handles one entity type
2. **Query Optimization**: Use indexes and efficient query patterns
3. **Error Handling**: Proper error handling for database operations
4. **Connection Management**: Efficient use of database connections
5. **Security**: Parameterized queries to prevent SQL injection