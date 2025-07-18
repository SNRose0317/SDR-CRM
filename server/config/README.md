# Config Directory

This directory contains configuration files and environment-specific settings for the healthcare CRM system.

## Purpose

Configuration files centralize application settings, environment variables, and feature flags to make the application configurable across different environments.

## Structure

```
config/
├── database.ts               # Database connection configuration
├── auth.ts                   # Authentication and security settings
├── email.ts                  # Email service configuration
├── sms.ts                    # SMS service configuration
├── redis.ts                  # Redis cache configuration
├── logging.ts                # Logging configuration
├── features.ts               # Feature flags and toggles
├── health.ts                 # Health-specific configurations
├── scheduling.ts             # Appointment scheduling settings
├── portal.ts                 # Portal configuration
├── automation.ts             # Workflow automation settings
├── notifications.ts          # Notification service settings
├── integrations.ts           # Third-party integration configs
├── security.ts               # Security and encryption settings
└── index.ts                  # Configuration exports
```

## Example Configuration Structure

```typescript
// database.ts
export const databaseConfig = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/healthcrm_dev',
    ssl: false,
    pool: {
      min: 2,
      max: 10
    }
  },
  production: {
    url: process.env.DATABASE_URL!,
    ssl: true,
    pool: {
      min: 5,
      max: 20
    }
  }
};
```

## Healthcare CRM Specific Configurations

### DatabaseConfig
- Connection strings for different environments
- Connection pooling settings
- SSL configuration
- Migration settings

### AuthConfig
- JWT secret keys
- Session timeout settings
- Password complexity requirements
- Two-factor authentication settings

### EmailConfig
- SMTP server configuration
- Email template settings
- Appointment reminder settings
- HIPAA-compliant email handling

### SMSConfig
- SMS provider configuration (Twilio, etc.)
- Message templates
- Delivery settings
- Cost management settings

### HealthConfig
- Health questionnaire settings
- Risk assessment thresholds
- Care plan templates
- Health outcome metrics

### SchedulingConfig
- Business hours configuration
- Appointment duration settings
- Buffer time settings
- Availability rules

### PortalConfig
- Portal access settings
- Session timeout configuration
- Feature availability
- Security settings

### AutomationConfig
- Workflow execution settings
- Trigger thresholds
- Action retry settings
- Performance limits

### NotificationConfig
- Notification channels
- Delivery preferences
- Template configurations
- Escalation rules

### IntegrationConfig
- Third-party API settings
- EHR integration configuration
- Calendar sync settings
- Insurance verification APIs

### SecurityConfig
- Encryption settings
- HIPAA compliance rules
- Data retention policies
- Access control settings

## Example Implementations

### Authentication Configuration
```typescript
// auth.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production'
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED === 'true',
    issuer: 'HealthCRM',
    window: 2
  }
};
```

### Health-Specific Configuration
```typescript
// health.ts
export const healthConfig = {
  questionnaire: {
    maxQuestions: 50,
    timeoutMinutes: 30,
    requiredCategories: ['demographics', 'medical_history', 'current_medications']
  },
  riskAssessment: {
    lowRiskThreshold: 30,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
    criticalRiskThreshold: 90
  },
  carePlan: {
    defaultDurationDays: 90,
    maxGoals: 10,
    milestoneCheckDays: 7
  },
  healthOutcomes: {
    trackingCategories: ['weight', 'blood_pressure', 'blood_sugar', 'exercise'],
    measurementUnits: {
      weight: 'lbs',
      bloodPressure: 'mmHg',
      bloodSugar: 'mg/dL',
      exercise: 'minutes'
    }
  }
};
```

### Scheduling Configuration
```typescript
// scheduling.ts
export const schedulingConfig = {
  businessHours: {
    start: 9, // 9 AM
    end: 17,  // 5 PM
    timezone: 'America/New_York'
  },
  appointments: {
    defaultDuration: 30, // minutes
    bufferTime: 15, // minutes between appointments
    maxAdvanceBooking: 90, // days
    reminderTimes: [24, 2, 0.5] // hours before appointment
  },
  providers: {
    sdr: {
      maxDailyAppointments: 12,
      appointmentDuration: 30
    },
    healthCoach: {
      maxDailyAppointments: 8,
      appointmentDuration: 60
    }
  },
  availability: {
    refreshInterval: 5, // minutes
    bookingWindow: 2, // hours advance booking minimum
    cancellationWindow: 4 // hours before appointment
  }
};
```

### Feature Flags Configuration
```typescript
// features.ts
export const featureFlags = {
  portal: {
    enabled: process.env.PORTAL_ENABLED === 'true',
    messaging: process.env.PORTAL_MESSAGING === 'true',
    appointmentBooking: process.env.PORTAL_BOOKING === 'true',
    healthTracking: process.env.PORTAL_HEALTH_TRACKING === 'true'
  },
  automation: {
    enabled: process.env.AUTOMATION_ENABLED === 'true',
    leadAssignment: process.env.AUTO_LEAD_ASSIGNMENT === 'true',
    appointmentReminders: process.env.AUTO_REMINDERS === 'true',
    careplanUpdates: process.env.AUTO_CAREPLAN_UPDATES === 'true'
  },
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    realTimeTracking: process.env.REALTIME_ANALYTICS === 'true',
    performanceMetrics: process.env.PERFORMANCE_METRICS === 'true'
  },
  integrations: {
    ehrIntegration: process.env.EHR_INTEGRATION === 'true',
    calendarSync: process.env.CALENDAR_SYNC === 'true',
    insuranceVerification: process.env.INSURANCE_VERIFICATION === 'true'
  }
};
```

### Environment-Specific Settings
```typescript
// index.ts
const environment = process.env.NODE_ENV || 'development';

export const config = {
  environment,
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
  isTest: environment === 'test',
  
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  database: databaseConfig[environment],
  auth: authConfig,
  email: emailConfig,
  sms: smsConfig,
  health: healthConfig,
  scheduling: schedulingConfig,
  features: featureFlags,
  
  // Environment-specific overrides
  ...(environment === 'development' && developmentOverrides),
  ...(environment === 'production' && productionOverrides),
  ...(environment === 'test' && testOverrides)
};
```

## Benefits

1. **Environment Management**: Different settings for dev, staging, production
2. **Feature Toggles**: Enable/disable features without code changes
3. **Security**: Sensitive data in environment variables
4. **Maintainability**: Centralized configuration management
5. **Flexibility**: Easy to adjust settings without code changes

## When We Would Need This

We would create configuration files when:

### Current State (Why we haven't needed them yet)
- **Simple Environment**: Currently using basic environment variables (DATABASE_URL, etc.)
- **No Feature Flags**: All features are enabled by default
- **No External Services**: Haven't integrated with email, SMS, calendar, or other external APIs
- **Basic Settings**: Simple hardcoded values work for current functionality

### Future Triggers (When we would create configs)
1. **External Service Integration**: When we integrate with SendGrid (email), Twilio (SMS), Google Calendar, or EHR systems
2. **Environment Complexity**: When we need different settings for development, staging, and production
3. **Feature Flags**: When we want to enable/disable features like portal access, automation, or specific workflows
4. **Business Rules**: When we implement configurable business hours, appointment durations, reminder schedules
5. **Performance Tuning**: When we need to configure database connection pools, caching, or rate limiting
6. **Security Requirements**: When we implement HIPAA compliance settings, encryption configurations, or access control rules

### Example: When Integration Gets Complex
```typescript
// Currently: Simple environment variables
const databaseUrl = process.env.DATABASE_URL;

// Would become: Complex configuration when we add services
const config = {
  email: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    templates: {
      welcome: 'welcome_template_id',
      appointment_reminder: 'reminder_template_id'
    }
  },
  sms: {
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  },
  scheduling: {
    businessHours: { start: 9, end: 17 },
    appointmentDuration: 30,
    reminderTimes: [24, 2, 0.5]
  }
};
```

## Best Practices

1. **Environment Variables**: Use environment variables for sensitive data
2. **Default Values**: Provide sensible defaults for all configurations
3. **Validation**: Validate configuration values at startup
4. **Documentation**: Document all configuration options
5. **Type Safety**: Use TypeScript interfaces for configuration objects
6. **Secrets Management**: Never commit secrets to version control

## Security Considerations

- Store sensitive data in environment variables
- Use different secrets for different environments
- Rotate secrets regularly
- Implement proper access controls
- Audit configuration changes
- Use encryption for sensitive configuration data