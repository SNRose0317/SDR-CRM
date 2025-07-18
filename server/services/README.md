# Services Directory

This directory contains business logic services for the healthcare CRM system. Services encapsulate complex business operations and integrations.

## Purpose

Services handle complex business logic, external API integrations, and cross-cutting concerns that don't belong in controllers or storage layers.

## Structure

```
services/
├── leadService.ts            # Lead qualification and scoring
├── contactService.ts         # Patient care coordination
├── appointmentService.ts     # Scheduling and calendar management
├── notificationService.ts    # Email, SMS, and push notifications
├── automationService.ts      # Workflow automation engine
├── analyticsService.ts       # Data analysis and reporting
├── healthService.ts          # Health-specific business logic
├── reminderService.ts        # Appointment and task reminders
├── communicationService.ts   # Multi-channel messaging
└── integrationService.ts     # External system integrations
```

## Example Service Structure

```typescript
// leadService.ts
import { storage } from '../storage';
import { notificationService } from './notificationService';
import { automationService } from './automationService';

export class LeadService {
  async qualifyLead(leadData: any) {
    // Lead scoring algorithm
    // Health assessment evaluation
    // Qualification criteria checking
    // Return qualification score and recommendations
  }

  async assignToSDR(leadId: number, userId: number) {
    // Assignment logic
    // Workload balancing
    // Notification triggers
    // Activity logging
  }

  async convertToContact(leadId: number) {
    // Lead to contact conversion
    // Data migration
    // Workflow triggering
    // Care plan initialization
  }
}
```

## Healthcare CRM Specific Services

### LeadService
- Lead qualification and scoring based on health questionnaire
- Automated lead assignment to SDRs
- Lead nurturing campaigns
- Conversion tracking and analytics

### ContactService
- Patient care coordination
- Health coach assignment
- Care plan management
- Progress tracking and reporting

### AppointmentService
- Intelligent scheduling based on provider availability
- Automated reminder systems
- Cancellation and rescheduling logic
- Integration with calendar systems

### NotificationService
- Multi-channel communication (email, SMS, push)
- Automated appointment reminders
- Care plan notifications
- System alerts and updates

### HealthService
- Health questionnaire processing
- Risk assessment calculations
- Care plan recommendations
- Health outcome tracking

### AutomationService
- Workflow execution engine
- Rule-based automation
- Trigger management
- Action execution

### AnalyticsService
- Patient journey analytics
- Conversion rate tracking
- Provider performance metrics
- Health outcome analysis

### ReminderService
- Appointment reminder scheduling
- Medication reminders
- Follow-up task notifications
- Care plan milestones

### CommunicationService
- Secure messaging between patients and providers
- Automated communication workflows
- Message threading and history
- HIPAA-compliant messaging

### IntegrationService
- EHR system integration
- Calendar system synchronization
- Third-party health app connections
- Insurance verification APIs

## Benefits

1. **Business Logic Encapsulation**: Complex operations in dedicated services
2. **Reusability**: Services can be used across multiple controllers
3. **Testability**: Services can be unit tested independently
4. **Maintainability**: Changes to business logic centralized
5. **Scalability**: Easy to add new business features

## When We Would Need This

We would create service files when:

### Current State (Why we haven't needed them yet)
- **Simple Business Logic**: Current operations are straightforward CRUD with basic validation
- **No External Integrations**: We're not yet integrating with EHR systems, email services, or calendar APIs
- **Basic Automation**: The automation system handles simple triggers but doesn't need complex business calculations
- **Storage Layer Sufficiency**: The `storage.ts` interface handles most data operations

### Future Triggers (When we would create services)
1. **Lead Scoring Algorithm**: When we implement sophisticated lead qualification based on health questionnaire responses, demographics, and behavioral data
2. **Email/SMS Notifications**: When we integrate with SendGrid, Twilio, or similar services for automated communications
3. **Calendar Integration**: When we sync with Google Calendar, Outlook, or other scheduling systems
4. **Health Data Processing**: When we need to calculate BMI, risk scores, care plan recommendations
5. **Insurance Verification**: When we integrate with insurance APIs to verify coverage and benefits
6. **Automated Reminders**: When we implement complex reminder logic with multiple channels and escalation

### Example: When Notification Gets Complex
```typescript
// Currently: Simple in-app notifications
await db.insert(activityLogs).values({
  entityType: 'lead',
  action: 'created',
  details: 'Lead created'
});

// Would become: NotificationService when we add multi-channel
await notificationService.sendWelcomeSequence({
  leadId: lead.id,
  channels: ['email', 'sms'],
  schedule: 'immediate',
  template: 'health_welcome'
});
```

## Service Dependencies

Services should depend on:
- Storage layer for data access
- Other services for business logic
- External APIs for integrations
- Configuration for settings

Services should NOT depend on:
- Controllers or routes
- Request/response objects
- HTTP-specific logic