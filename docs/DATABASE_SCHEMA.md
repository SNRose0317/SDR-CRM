# Database Schema Documentation

## Overview
HealthCRM uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a comprehensive healthcare CRM workflow with lead management, patient care tracking, and task management.

## Schema Structure

### Core Tables

#### `users`
User management with role-based access control.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('SDR', 'Health Coach', 'Admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relationships:**
- One-to-many with `leads` (as owner)
- One-to-many with `contacts` (as health coach)
- One-to-many with `tasks` (as assigned user and creator)
- One-to-many with `appointments` (as participant)

#### `leads`
Lead management through 5-stage healthcare pipeline.

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'HHQ Started' CHECK (status IN (
    'HHQ Started',
    'HHQ Signed',
    'Booking: Not Paid',
    'Booking: Paid/Not Booked',
    'Booking: Paid/Booked'
  )),
  lead_source lead_source DEFAULT 'None',
  lead_readiness VARCHAR DEFAULT 'Cold' CHECK (lead_readiness IN ('Cold', 'Warm', 'Hot', 'Follow Up')),
  lead_outcome VARCHAR,
  lead_type VARCHAR,
  number_of_calls INTEGER DEFAULT 0,
  last_contacted TIMESTAMP,
  owner_id INTEGER REFERENCES users(id),
  health_coach_booked_with INTEGER REFERENCES users(id),
  notes TEXT,
  password_hash VARCHAR,
  portal_access BOOLEAN DEFAULT false,
  last_portal_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead source enum for marketing attribution
CREATE TYPE lead_source AS ENUM (
  'HHQ Complete',
  'HHQ Started', 
  'Lab Purchase',
  'Marek Health Discovery Call',
  'Newsletter Discovery Call',
  'Social Media Discovery Call',
  'Newsletter',
  'None'
);
```

**Lead Pipeline Stages:**
1. **HHQ Started** - Health questionnaire initiated
2. **HHQ Signed** - Health questionnaire completed
3. **Booking: Not Paid** - Appointment booking started
4. **Booking: Paid/Not Booked** - Payment completed
5. **Booking: Paid/Booked** - Fully booked, ready for conversion

#### `contacts`
Active patient management through 15-stage healthcare workflow.

```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  stage VARCHAR NOT NULL DEFAULT 'Intake' CHECK (stage IN (
    'Intake',
    'Initial Labs',
    'Initial Lab Review',
    'Initial Provider Exam',
    'Initial Medication Order',
    '1st Follow-up Labs',
    'First Follow-Up Lab Review',
    'First Follow-Up Provider Exam',
    'First Medication Refill',
    'Second Follow-Up Labs',
    'Second Follow-Up Lab Review',
    'Second Follow-up Provider Exam',
    'Second Medication Refill',
    'Third Medication Refill',
    'Restart Annual Process'
  )),
  health_coach_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Healthcare Journey Stages:**
1. **Intake** - Initial patient onboarding
2. **Initial Labs** - First laboratory tests
3. **Initial Lab Review** - Lab results review
4. **Initial Provider Exam** - First provider consultation
5. **Initial Medication Order** - First prescription
6. **1st Follow-up Labs** - Follow-up laboratory tests
7. **First Follow-Up Lab Review** - Follow-up lab review
8. **First Follow-Up Provider Exam** - Follow-up consultation
9. **First Medication Refill** - First prescription refill
10. **Second Follow-Up Labs** - Second follow-up labs
11. **Second Follow-Up Lab Review** - Second lab review
12. **Second Follow-up Provider Exam** - Second follow-up exam
13. **Second Medication Refill** - Second prescription refill
14. **Third Medication Refill** - Third prescription refill
15. **Restart Annual Process** - Annual cycle restart

#### `tasks`
Task management with priority and status tracking.

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  priority VARCHAR NOT NULL DEFAULT 'Medium' CHECK (priority IN (
    'Low', 'Medium', 'High', 'Urgent'
  )),
  status VARCHAR NOT NULL DEFAULT 'Pending' CHECK (status IN (
    'Pending', 'In Progress', 'Completed', 'Cancelled'
  )),
  assigned_to_id INTEGER REFERENCES users(id),
  created_by_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Priority Levels:**
- **Low** - Complete within 1 week
- **Medium** - Complete within 3 days
- **High** - Complete within 24 hours
- **Urgent** - Immediate attention required

#### `appointments`
Appointment scheduling and management.

```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  status VARCHAR NOT NULL DEFAULT 'Scheduled' CHECK (status IN (
    'Scheduled', 'Completed', 'Cancelled', 'No Show'
  )),
  user_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  meeting_link VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `activity_logs`
Audit trail for system activities.

```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR NOT NULL,
  entity_id INTEGER NOT NULL,
  action VARCHAR NOT NULL,
  details TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Relationships

### One-to-Many Relationships

#### `users` → `leads`
- One user (SDR) can own many leads
- Foreign key: `leads.owner_id`

#### `users` → `contacts`
- One user (Health Coach) can manage many contacts
- Foreign key: `contacts.health_coach_id`

#### `users` → `tasks` (assigned)
- One user can be assigned many tasks
- Foreign key: `tasks.assigned_to_id`

#### `users` → `tasks` (created)
- One user can create many tasks
- Foreign key: `tasks.created_by_id`

#### `leads` → `contacts`
- One lead can convert to one contact
- Foreign key: `contacts.lead_id`

#### `leads` → `tasks`
- One lead can have many related tasks
- Foreign key: `tasks.lead_id`

#### `contacts` → `tasks`
- One contact can have many related tasks
- Foreign key: `tasks.contact_id`

#### `appointments` → `users`
- One appointment can have one user participant
- Foreign key: `appointments.user_id`

#### `appointments` → `leads`
- One appointment can be related to one lead
- Foreign key: `appointments.lead_id`

#### `appointments` → `contacts`
- One appointment can be related to one contact
- Foreign key: `appointments.contact_id`

## Indexes

### Primary Indexes
- All tables have auto-incrementing primary keys
- Email fields have unique constraints where appropriate

### Recommended Indexes for Performance
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Lead management
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_email ON leads(email);

-- Contact management
CREATE INDEX idx_contacts_stage ON contacts(stage);
CREATE INDEX idx_contacts_health_coach ON contacts(health_coach_id);
CREATE INDEX idx_contacts_lead ON contacts(lead_id);

-- Task management
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Appointment scheduling
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_user ON appointments(user_id);

-- Activity logging
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

## Data Validation

### Enum Constraints
- User roles are constrained to: `SDR`, `Health Coach`, `Admin`
- Lead statuses follow 5-stage pipeline
- Contact stages follow 15-stage healthcare workflow
- Task priorities: `Low`, `Medium`, `High`, `Urgent`
- Task statuses: `Pending`, `In Progress`, `Completed`, `Cancelled`
- Appointment statuses: `Scheduled`, `Completed`, `Cancelled`, `No Show`

### Required Fields
- All names and emails are required
- Lead and contact stages have defaults
- Task priorities have defaults
- Appointment duration defaults to 30 minutes

## Migration Strategy

### Schema Changes
1. **Modify** `shared/schema.ts` with new structure
2. **Run** `npm run db:push` to apply changes
3. **Update** storage layer methods
4. **Test** API endpoints with new schema

### Data Migration
- Use Drizzle migrations for structural changes
- Create migration scripts for data transformations
- Test migrations on development environment first

## Performance Considerations

### Query Optimization
- Use indexes on frequently queried columns
- Avoid N+1 queries with proper joins
- Use pagination for large result sets
- Cache frequently accessed data

### Scaling Considerations
- Consider read replicas for reporting
- Archive old activity logs periodically
- Monitor query performance and optimize slow queries
- Use connection pooling for database connections

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Test backup restoration regularly
- Store backups in secure, redundant locations

### Recovery Procedures
- Document recovery procedures
- Test recovery processes regularly
- Maintain backup retention policies
- Monitor backup success and failures

This schema provides a solid foundation for the HealthCRM application while maintaining data integrity and supporting the complex healthcare workflows required by the business.