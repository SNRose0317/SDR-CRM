# Environment Variables Guide

## Overview
HealthCRM uses environment variables for configuration in development and production environments. This guide covers all environment variables used by the application.

## Required Environment Variables

### Database Configuration
These variables are automatically provided by Replit when using the PostgreSQL database service.

#### `DATABASE_URL`
- **Description**: Complete PostgreSQL connection string
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://user:pass@localhost:5432/healthcrm`
- **Required**: Yes
- **Provided by**: Replit Database Service

#### `PGHOST`
- **Description**: PostgreSQL database host
- **Format**: Hostname or IP address
- **Example**: `localhost` or `db.replit.com`
- **Required**: Yes (automatically set)
- **Provided by**: Replit Database Service

#### `PGPORT`
- **Description**: PostgreSQL database port
- **Format**: Port number
- **Example**: `5432`
- **Required**: Yes (automatically set)
- **Provided by**: Replit Database Service

#### `PGUSER`
- **Description**: PostgreSQL database username
- **Format**: Username string
- **Example**: `healthcrm_user`
- **Required**: Yes (automatically set)
- **Provided by**: Replit Database Service

#### `PGPASSWORD`
- **Description**: PostgreSQL database password
- **Format**: Password string
- **Example**: `secure_password_123`
- **Required**: Yes (automatically set)
- **Provided by**: Replit Database Service

#### `PGDATABASE`
- **Description**: PostgreSQL database name
- **Format**: Database name string
- **Example**: `healthcrm`
- **Required**: Yes (automatically set)
- **Provided by**: Replit Database Service

### Application Configuration

#### `NODE_ENV`
- **Description**: Application environment mode
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Required**: No (has default)
- **Set by**: Application startup script

#### `PORT`
- **Description**: Port number for the Express server
- **Format**: Port number
- **Default**: `5000`
- **Required**: No (has default)
- **Set by**: Application or hosting environment

### Replit-Specific Variables

#### `REPLIT_DOMAINS`
- **Description**: Comma-separated list of allowed domains for the application
- **Format**: Domain list
- **Example**: `app-name.replit.app,custom-domain.com`
- **Required**: Yes (in production)
- **Provided by**: Replit hosting environment

#### `REPL_ID`
- **Description**: Unique identifier for the Replit application
- **Format**: Replit ID string
- **Example**: `healthcrm-app-123`
- **Required**: Yes (in production)
- **Provided by**: Replit hosting environment

## Development Environment

### Local Development Setup
When running locally, you may need to set these variables manually:

```bash
# .env file (for local development only)
DATABASE_URL=postgresql://localhost:5432/healthcrm_dev
NODE_ENV=development
PORT=5000
```

### Development Variables
These variables are useful during development but not required:

#### `DEBUG`
- **Description**: Enable debug logging
- **Values**: `true`, `false`
- **Default**: `false`
- **Example**: `DEBUG=true npm run dev`

#### `VERBOSE`
- **Description**: Enable verbose logging
- **Values**: `true`, `false`
- **Default**: `false`
- **Example**: `VERBOSE=true npm run dev`

## Production Environment

### Required for Production
In production, these variables must be properly configured:

```bash
# Production environment variables
DATABASE_URL=postgresql://prod-host:5432/healthcrm_prod
NODE_ENV=production
PORT=5000
REPLIT_DOMAINS=your-app.replit.app
REPL_ID=your-repl-id
```

### Security Considerations
- Never commit environment variables to version control
- Use secure, randomly generated passwords
- Regularly rotate database credentials
- Restrict database access to necessary IPs only

## Environment Variable Validation

### Required Variable Checking
The application validates required environment variables on startup:

```typescript
// Environment variable validation
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

if (!process.env.REPL_ID && process.env.NODE_ENV === 'production') {
  throw new Error("REPL_ID is required in production");
}
```

### Default Values
Some variables have default values if not set:

```typescript
// Default values
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

## Configuration Management

### Environment-Specific Configuration
Different environments may require different configurations:

```typescript
// Configuration based on environment
const config = {
  development: {
    dbConnectionLimit: 5,
    logLevel: 'debug'
  },
  production: {
    dbConnectionLimit: 20,
    logLevel: 'info'
  }
};
```

### Feature Flags
Use environment variables for feature flags:

```typescript
// Feature flags via environment variables
const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS === 'true';
const ENABLE_NOTIFICATIONS = process.env.ENABLE_NOTIFICATIONS === 'true';
```

## Database Connection

### Connection String Format
The `DATABASE_URL` follows PostgreSQL connection string format:

```
postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
```

### Connection Pool Configuration
Database connection pooling is configured automatically:

```typescript
// Connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
npm run db:test
```

#### Missing Environment Variables
```bash
# List all environment variables
printenv | grep -E "(DATABASE|PG|NODE|PORT|REPLIT)"

# Check specific variable
echo $DATABASE_URL
```

#### Permission Issues
```bash
# Check database permissions
psql $DATABASE_URL -c "SELECT current_user, current_database();"
```

### Debugging Environment Variables
```typescript
// Debug environment variables (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
    REPLIT_DOMAINS: process.env.REPLIT_DOMAINS ? 'Set' : 'Not Set'
  });
}
```

## Best Practices

### Security
- Never log sensitive environment variables
- Use environment variables for all configuration
- Validate environment variables on startup
- Use strong, unique passwords for database access

### Development
- Use `.env.example` file to document required variables
- Set reasonable defaults for development
- Document all environment variables used
- Test with different environment configurations

### Production
- Use secure methods to set environment variables
- Monitor environment variable changes
- Have backup procedures for configuration
- Document production-specific requirements

## Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PGHOST` | Yes | - | Database host |
| `PGPORT` | Yes | - | Database port |
| `PGUSER` | Yes | - | Database username |
| `PGPASSWORD` | Yes | - | Database password |
| `PGDATABASE` | Yes | - | Database name |
| `NODE_ENV` | No | `development` | Application environment |
| `PORT` | No | `5000` | Server port |
| `REPLIT_DOMAINS` | Production | - | Allowed domains |
| `REPL_ID` | Production | - | Replit application ID |

This guide should help you understand and configure all environment variables needed for the HealthCRM application in different environments.