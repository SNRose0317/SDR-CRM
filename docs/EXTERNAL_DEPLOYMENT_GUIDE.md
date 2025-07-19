# External Deployment Guide

This guide covers deploying HealthCRM to external platforms with external database providers like Supabase, AWS RDS, or other PostgreSQL services.

## Supported Platforms

### Supabase (Recommended for PostgreSQL)
**Advantages:** Built-in PostgreSQL, real-time subscriptions, auth, storage
**Best for:** Full-stack deployment with managed database

### AWS RDS + Vercel/Railway/Render
**Advantages:** High scalability, enterprise-grade
**Best for:** Production deployments requiring high availability

### Neon + Vercel
**Advantages:** Serverless PostgreSQL, generous free tier
**Best for:** Development and small production apps

### PlanetScale + Railway
**Advantages:** Global database, schema branching
**Best for:** Applications requiring global distribution

## Step-by-Step Deployment

### Option 1: Supabase + Vercel

#### 1. Set Up Supabase Database
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Go to SQL Editor and run all commands from docs/DATABASE_COMPLETE_SETUP.md
# 3. Get connection string from Settings → Database
```

#### 2. Configure Environment Variables
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
PGHOST=[supabase-host].supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=[your-password]
PGDATABASE=postgres
NODE_ENV=production
```

#### 3. Deploy to Vercel
```bash
# Clone the project
git clone [your-repo-url]
cd healthcrm

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add DATABASE_URL
# Add all other environment variables
```

### Option 2: AWS RDS + Railway

#### 1. Set Up AWS RDS PostgreSQL
```bash
# 1. Create RDS PostgreSQL instance in AWS Console
# 2. Configure security groups for port 5432
# 3. Note connection details
```

#### 2. Initialize Database
```bash
# Connect using psql
psql -h [rds-endpoint] -U [username] -d [database]

# Run all SQL from docs/DATABASE_COMPLETE_SETUP.md
\i DATABASE_COMPLETE_SETUP.sql
```

#### 3. Deploy to Railway
```bash
# 1. Connect GitHub repo to Railway
# 2. Add environment variables in Railway dashboard:
DATABASE_URL=postgresql://[user]:[pass]@[rds-endpoint]:5432/[db]
PGHOST=[rds-endpoint]
PGPORT=5432
PGUSER=[username] 
PGPASSWORD=[password]
PGDATABASE=[database]
NODE_ENV=production

# 3. Railway will auto-deploy from your repo
```

### Option 3: Neon + Vercel

#### 1. Set Up Neon Database
```bash
# 1. Create account at https://neon.tech
# 2. Create new project
# 3. Copy connection string
```

#### 2. Initialize Schema
```bash
# Using the Neon SQL Editor or psql connection
# Run all commands from docs/DATABASE_COMPLETE_SETUP.md
```

#### 3. Environment Configuration
```bash
# Neon provides a connection string like:
DATABASE_URL=postgresql://[user]:[pass]@[host]/[db]?sslmode=require

# Extract components for individual variables:
PGHOST=[neon-host]
PGPORT=5432
PGUSER=[neon-user]
PGPASSWORD=[neon-password]
PGDATABASE=[neon-database]
NODE_ENV=production
```

## Database Migration Script

Create this script to easily migrate your database to external providers:

```bash
#!/bin/bash
# migrate-database.sh

# Set your new database URL
NEW_DATABASE_URL="your-external-database-url"

echo "Migrating HealthCRM database..."

# Run the complete setup
psql $NEW_DATABASE_URL -f docs/DATABASE_COMPLETE_SETUP.sql

echo "Database migration complete!"
echo "Update your environment variables:"
echo "DATABASE_URL=$NEW_DATABASE_URL"
```

## Configuration Files for Different Providers

### For Supabase (.env.production)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
PGHOST=db.[PROJECT].supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=[PASSWORD]
PGDATABASE=postgres
NODE_ENV=production
```

### For AWS RDS (.env.production)  
```bash
DATABASE_URL=postgresql://[USERNAME]:[PASSWORD]@[RDS_ENDPOINT]:5432/[DATABASE]
PGHOST=[RDS_ENDPOINT]
PGPORT=5432
PGUSER=[USERNAME]
PGPASSWORD=[PASSWORD]
PGDATABASE=[DATABASE]
NODE_ENV=production
```

### For Neon (.env.production)
```bash
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
PGHOST=[HOST]
PGPORT=5432
PGUSER=[USER]
PGPASSWORD=[PASSWORD]
PGDATABASE=[DATABASE]
NODE_ENV=production
```

## Verification Steps

After deployment, verify your setup:

### 1. Database Connection Test
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Verify tables exist
psql $DATABASE_URL -c "\dt"

# Check data
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
```

### 2. Application Health Check
```bash
# Test API endpoints
curl https://your-app.vercel.app/api/users
curl https://your-app.vercel.app/api/leads
curl https://your-app.vercel.app/api/dashboard/stats
```

### 3. Feature Verification
- [ ] User authentication works
- [ ] Lead creation and management
- [ ] Contact conversion pipeline  
- [ ] Task assignment and completion
- [ ] Appointment scheduling
- [ ] Call logging and dialer
- [ ] Portal authentication
- [ ] HHQ workflow completion

## Performance Optimization

### Database Indexes for Production
Add these indexes for better performance:

```sql
-- Essential indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_source ON leads(lead_source);
CREATE INDEX idx_contacts_stage ON contacts(stage);
CREATE INDEX idx_contacts_coach ON contacts(health_coach_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_call_sessions_lead ON call_sessions(lead_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
```

### Connection Pooling Configuration
For production, configure connection pooling:

```javascript
// In your database connection file
import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Monitoring and Maintenance

### Health Check Endpoints
Implement these for monitoring:

```javascript
// /api/health
export async function GET() {
  try {
    await db.select().from(users).limit(1);
    return { status: 'healthy', database: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### Backup Strategy
- **Supabase:** Automatic backups included
- **AWS RDS:** Configure automated backups with retention
- **Neon:** Automatic backups in paid plans

### Monitoring Tools
- **Supabase:** Built-in dashboard
- **AWS:** CloudWatch metrics
- **Neon:** Built-in metrics dashboard
- **Application:** Consider Sentry for error tracking

## Troubleshooting Common Issues

### Connection Issues
```bash
# Test SSL connection
psql "postgresql://user:pass@host:5432/db?sslmode=require"

# Check firewall/security groups
telnet [host] 5432
```

### Migration Issues
```bash
# Check for missing tables
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"

# Verify enums exist
psql $DATABASE_URL -c "SELECT typname FROM pg_type WHERE typtype='e';"
```

### Performance Issues
```bash
# Check slow queries
psql $DATABASE_URL -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

This guide provides everything needed to successfully deploy HealthCRM to external platforms with full database functionality and optimal performance.