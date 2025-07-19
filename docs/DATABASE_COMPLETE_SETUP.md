# Complete Database Setup Guide

This guide provides everything needed to recreate the HealthCRM database on external platforms like Supabase, AWS RDS, or any PostgreSQL instance.

## Quick Setup Commands

### 1. Create All Enums First
```sql
-- User roles
CREATE TYPE user_role AS ENUM ('sdr', 'health_coach', 'admin');

-- Lifecycle stages for person tracking
CREATE TYPE lifecycle_stage AS ENUM ('lead', 'contact');

-- Lead status pipeline (5 stages)
CREATE TYPE lead_status AS ENUM (
  'New',
  'HHQ Started', 
  'HHQ Signed', 
  'Booking: Not Paid', 
  'Booking: Paid/Not Booked', 
  'Booking: Paid/Booked',
  'Converted'
);

-- HHQ workflow status
CREATE TYPE hhq_status AS ENUM (
  'Created', 
  'Submitted', 
  'Signed', 
  'Paid', 
  'Appointment Booked', 
  'Completed'
);

-- Contact healthcare journey (15 stages)
CREATE TYPE contact_stage AS ENUM (
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
);

-- Task management
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Appointment management
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Lead qualification levels
CREATE TYPE lead_readiness AS ENUM ('Cold', 'Warm', 'Hot', 'Follow Up');

-- Lead outcomes for call tracking
CREATE TYPE lead_outcome AS ENUM (
  'Contacted - Intake Scheduled',
  'Contacted - Follow-Up Scheduled', 
  'Contacted - No Follow Up Scheduled',
  'Contacted - No Longer Interested',
  'Contacted - Do Not Call',
  'Left Voicemail',
  'No Answer', 
  'Bad Number',
  'Disqualified'
);

-- Call dispositions
CREATE TYPE call_disposition AS ENUM (
  'connected', 
  'voicemail', 
  'busy', 
  'no_answer', 
  'callback', 
  'not_interested', 
  'qualified', 
  'follow_up'
);

-- Dialer status
CREATE TYPE dialer_status AS ENUM ('active', 'paused', 'completed');

-- Marketing attribution channels
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

### 2. Create Core Tables

#### Sessions Table (Required for Express Sessions)
```sql
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_expire ON sessions(expire);
```

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role user_role NOT NULL DEFAULT 'sdr',
  password_hash VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Unified Persons Table (Salesforce-style with MH-1234 IDs)
```sql
CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  person_id VARCHAR UNIQUE NOT NULL, -- MH-1234 format
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  state VARCHAR,
  lifecycle_stage lifecycle_stage NOT NULL DEFAULT 'lead',
  
  -- Lead-specific fields
  lead_status lead_status DEFAULT 'New',
  lead_outcome lead_outcome,
  source lead_source DEFAULT 'None',
  lead_score INTEGER DEFAULT 0,
  
  -- Contact-specific fields
  contact_stage contact_stage DEFAULT 'Intake',
  health_coach_id INTEGER REFERENCES users(id),
  
  -- Common fields
  owner_id INTEGER REFERENCES users(id),
  notes TEXT,
  password_hash VARCHAR,
  portal_access BOOLEAN DEFAULT false,
  last_portal_login TIMESTAMP,
  
  -- Audit fields
  original_lead_id INTEGER,
  converted_at TIMESTAMP,
  disqualified_reason VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Legacy Leads Table (For backwards compatibility)
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  state VARCHAR,
  status lead_status NOT NULL DEFAULT 'New',
  source VARCHAR,
  lead_score INTEGER DEFAULT 0,
  notes TEXT,
  owner_id INTEGER REFERENCES users(id),
  health_coach_booked_with INTEGER REFERENCES users(id),
  
  -- New lead tracking fields
  last_contacted TIMESTAMP,
  lead_outcome lead_outcome,
  number_of_calls INTEGER DEFAULT 0,
  lead_type VARCHAR,
  lead_source lead_source DEFAULT 'None',
  lead_readiness lead_readiness DEFAULT 'Cold',
  
  password_hash VARCHAR,
  portal_access BOOLEAN DEFAULT false,
  last_portal_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Legacy Contacts Table
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  stage contact_stage NOT NULL DEFAULT 'Intake',
  health_coach_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  owner_id INTEGER REFERENCES users(id),
  notes TEXT,
  password_hash VARCHAR,
  portal_access BOOLEAN DEFAULT false,
  last_portal_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'todo',
  assigned_to INTEGER REFERENCES users(id),
  due_date TIMESTAMP,
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy fields for migration
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration INTEGER, -- Duration in minutes
  status appointment_status NOT NULL DEFAULT 'scheduled',
  user_id INTEGER REFERENCES users(id),
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy fields for migration
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Activity Logs Table
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

### 3. Portal and Communication Tables

#### Portal Sessions
```sql
CREATE TABLE portal_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR UNIQUE NOT NULL,
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy fields
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Portal Messages
```sql
CREATE TABLE portal_messages (
  id SERIAL PRIMARY KEY,
  subject VARCHAR NOT NULL,
  content TEXT NOT NULL,
  from_user_id INTEGER REFERENCES users(id),
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy fields
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Portal Notifications
```sql
CREATE TABLE portal_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy fields  
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Call Management System

#### Call Sessions Table
```sql
CREATE TABLE call_sessions (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  contact_id INTEGER REFERENCES contacts(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  
  -- Call details
  phone_number VARCHAR,
  disposition call_disposition NOT NULL,
  duration INTEGER DEFAULT 0, -- seconds
  notes TEXT,
  outcome lead_outcome,
  
  -- Timestamps
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Dialer Queues Table
```sql
CREATE TABLE dialer_queues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name VARCHAR NOT NULL,
  lead_ids JSONB NOT NULL, -- array of lead IDs
  current_index INTEGER DEFAULT 0,
  auto_dialer_enabled BOOLEAN DEFAULT false,
  auto_dialer_delay INTEGER DEFAULT 10, -- seconds between calls
  status dialer_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Health History Questionnaire (HHQ) System

#### Health Questionnaires Table
```sql
CREATE TABLE health_questionnaires (
  id SERIAL PRIMARY KEY,
  person_id VARCHAR REFERENCES persons(person_id),
  -- Legacy field
  lead_id INTEGER REFERENCES leads(id),
  
  -- Health questions (1-10 scale)
  energy_level DECIMAL(3,1),
  libido_level DECIMAL(3,1), 
  overall_health DECIMAL(3,1),
  
  -- Workflow tracking
  is_signed BOOLEAN DEFAULT false,
  signature_data TEXT,
  is_paid BOOLEAN DEFAULT false,
  appointment_booked BOOLEAN DEFAULT false,
  appointment_id INTEGER REFERENCES appointments(id),
  
  -- Status tracking
  status hhq_status DEFAULT 'Created',
  
  -- Timestamps
  signed_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Permission and Rule System Tables

#### Permission Rules Table
```sql
CREATE TABLE permission_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  
  -- Rule subject (what entity type this rule applies to)
  subject_type VARCHAR NOT NULL, -- 'lead', 'contact', 'task', etc.
  
  -- Rule condition (supports compound conditions with AND/OR logic)
  conditions JSONB NOT NULL,
  
  -- Rule action
  action_type VARCHAR NOT NULL, -- 'grant_access', 'assign_entity', etc.
  
  -- Target (who the action applies to)
  target_type VARCHAR NOT NULL, -- 'user', 'role', 'team', etc.
  target_id VARCHAR, -- Specific user ID, role name, etc.
  
  -- Permission details
  permissions JSONB NOT NULL, -- { read: true, write: false, assign: true }
  
  -- Metadata
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Rule Evaluations Table (For caching)
```sql
CREATE TABLE rule_evaluations (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES permission_rules(id),
  entity_type VARCHAR NOT NULL,
  entity_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  
  -- Evaluation result
  matches BOOLEAN NOT NULL,
  permissions JSONB NOT NULL,
  
  -- Cache metadata
  evaluated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

#### Rule Audit Log Table
```sql
CREATE TABLE rule_audit_log (
  id SERIAL PRIMARY KEY,
  rule_id INTEGER REFERENCES permission_rules(id),
  entity_type VARCHAR NOT NULL,
  entity_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id),
  
  action VARCHAR NOT NULL,
  details JSONB,
  
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
PGHOST=host
PGPORT=port
PGUSER=username
PGPASSWORD=password  
PGDATABASE=database_name
NODE_ENV=production
```

### For Supabase Setup
1. Create new project in Supabase
2. Go to Settings → Database → Connection String
3. Copy the connection string to `DATABASE_URL`
4. Run all the SQL commands above in the SQL editor

### For AWS RDS Setup
1. Create PostgreSQL RDS instance
2. Set up security groups for port 5432
3. Use connection details for environment variables
4. Connect using psql and run the SQL commands

## Complete Data Relationships Overview

### Entity Relationship Diagram (Visual)
```
Users (System Staff)
├── leads.owner_id → users.id
├── contacts.health_coach_id → users.id
├── tasks.assigned_to → users.id
├── appointments.user_id → users.id
├── call_sessions.user_id → users.id
├── activity_logs.user_id → users.id
└── dialer_queues.user_id → users.id

Persons (Unified External Users)
├── appointments.person_id → persons.person_id
├── tasks.person_id → persons.person_id
├── health_questionnaires.person_id → persons.person_id
└── portal_sessions.person_id → persons.person_id

Leads (Potential Customers)
├── contacts.lead_id → leads.id (conversion)
├── tasks.lead_id → leads.id (legacy)
├── appointments.lead_id → leads.id (legacy)
├── call_sessions.lead_id → leads.id
├── health_questionnaires.lead_id → leads.id (legacy)
├── portal_sessions.lead_id → leads.id (legacy)
└── portal_messages.lead_id → leads.id

Contacts (Active Customers)
├── tasks.contact_id → contacts.id (legacy)
├── appointments.contact_id → contacts.id (legacy)
├── portal_sessions.contact_id → contacts.id (legacy)
└── portal_messages.contact_id → contacts.id

Health Questionnaires
└── appointments.id ← health_questionnaires.appointment_id

Permission Rules
├── rule_evaluations.rule_id → permission_rules.id
└── rule_audit_log.rule_id → permission_rules.id
```

### Detailed Relationship Mappings

#### 1. User Management Relationships
```sql
-- All entities that reference users
users.id ← leads.owner_id
users.id ← leads.health_coach_booked_with  
users.id ← contacts.health_coach_id
users.id ← contacts.owner_id
users.id ← tasks.assigned_to
users.id ← appointments.user_id
users.id ← call_sessions.user_id
users.id ← activity_logs.user_id
users.id ← dialer_queues.user_id
users.id ← portal_messages.health_coach_id
users.id ← permission_rules.created_by
```

#### 2. Lead-to-Contact Conversion Flow
```sql
-- Lead conversion creates contact with reference
leads.id → contacts.lead_id

-- All child records can reference either
tasks.lead_id OR tasks.contact_id
appointments.lead_id OR appointments.contact_id
portal_sessions.lead_id OR portal_sessions.contact_id
portal_messages.lead_id OR portal_messages.contact_id
```

#### 3. Modern Unified Person Architecture
```sql
-- New person-centric relationships (MH-1234 format)
persons.person_id ← tasks.person_id
persons.person_id ← appointments.person_id  
persons.person_id ← health_questionnaires.person_id
persons.person_id ← portal_sessions.person_id
```

#### 4. Communication & Portal Relationships
```sql
-- Portal authentication
portal_sessions.lead_id → leads.id
portal_sessions.contact_id → contacts.id
portal_sessions.person_id → persons.person_id

-- Messaging system
portal_messages.lead_id → leads.id
portal_messages.contact_id → contacts.id
portal_messages.health_coach_id → users.id

-- Notifications
portal_notifications.lead_id → leads.id
portal_notifications.contact_id → contacts.id
```

#### 5. Healthcare Workflow Relationships
```sql
-- HHQ completion creates appointment
health_questionnaires.appointment_id → appointments.id

-- Call tracking
call_sessions.lead_id → leads.id
call_sessions.contact_id → contacts.id
call_sessions.user_id → users.id

-- Activity logging
activity_logs.entity_id → (leads.id OR contacts.id OR other entities)
activity_logs.user_id → users.id
```

#### 6. Permission & Rule System
```sql
-- Rule engine relationships
permission_rules.created_by → users.id
rule_evaluations.rule_id → permission_rules.id
rule_evaluations.user_id → users.id
rule_audit_log.rule_id → permission_rules.id
rule_audit_log.user_id → users.id
```

### Referential Integrity Constraints

All foreign key relationships maintain referential integrity:
- **ON DELETE RESTRICT** - Prevents deletion if related records exist
- **ON DELETE CASCADE** - Not used to prevent accidental data loss
- **ON DELETE SET NULL** - Used for optional relationships like owner_id

### Migration Strategy Notes

The database supports both legacy (separate leads/contacts) and modern (unified persons) architectures:

1. **Legacy Mode**: Uses lead_id and contact_id fields
2. **Modern Mode**: Uses person_id with MH-1234 format
3. **Transition Period**: Both systems work simultaneously
4. **Full Migration**: Eventually migrate all references to person_id

## Sample Data for Testing

### Create Test Users
```sql
INSERT INTO users (email, first_name, last_name, role, password_hash) VALUES
('admin@healthcrm.com', 'Admin', 'User', 'admin', '$2b$10$dummy_hash'),
('sdr@healthcrm.com', 'Sales', 'Rep', 'sdr', '$2b$10$dummy_hash'),
('coach@healthcrm.com', 'Health', 'Coach', 'health_coach', '$2b$10$dummy_hash');
```

### Create Test Leads
```sql
INSERT INTO leads (first_name, last_name, email, phone, status, lead_source, owner_id) VALUES
('John', 'Doe', 'john@example.com', '555-1234', 'HHQ Started', 'Newsletter', 2),
('Jane', 'Smith', 'jane@example.com', '555-5678', 'HHQ Signed', 'Lab Purchase', 2);
```

This complete setup guide provides everything needed to recreate the HealthCRM database on any PostgreSQL platform with full relationship integrity and all current features.