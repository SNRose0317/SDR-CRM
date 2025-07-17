# Automation Framework

This directory contains the automation framework for the HealthCRM system. The framework provides a comprehensive system for creating, managing, and executing automated workflows triggered by various events in the system.

## Architecture

### Core Components

1. **AutomationManager** (`automationManager.ts`)
   - Central hub for managing all automation triggers
   - Handles trigger registration, execution, and lifecycle management
   - Provides singleton instance for application-wide access

2. **Trigger Types** (`types.ts`)
   - Defines all interfaces and types for the automation system
   - Includes event types, action types, and result structures
   - Provides type safety across the entire framework

3. **Trigger Handlers** (`triggers/`)
   - Individual classes for handling specific trigger types
   - Currently includes `SignupTrigger` for portal signup automation
   - Each trigger can have multiple templates and configurations

4. **Action Executor** (`actions/actionExecutor.ts`)
   - Handles execution of automation actions
   - Supports various action types: create tasks, send emails, log activities, etc.
   - Provides error handling and result reporting

## Current Implementation

### Portal Signup Automation

When a user signs up through the portal:

1. **Trigger**: `AutomationEventType.PORTAL_SIGNUP`
2. **Conditions**: User role equals 'Patient'
3. **Actions**:
   - Create a lead with status 'New' and source 'Portal Signup'
   - Create a follow-up task assigned to available SDR
   - Log activity for audit trail

### Supported Event Types

- `USER_SIGNUP` - User registration events
- `LEAD_CREATED` - New lead creation
- `LEAD_STATUS_CHANGED` - Lead status updates
- `CONTACT_CREATED` - New contact creation
- `TASK_CREATED` - New task creation
- `APPOINTMENT_SCHEDULED` - Appointment scheduling
- `PORTAL_SIGNUP` - Portal user registration

### Supported Action Types

- `CREATE_LEAD` - Create new leads
- `CREATE_TASK` - Create tasks with assignments
- `UPDATE_STATUS` - Update entity status
- `ASSIGN_USER` - Assign entities to users
- `LOG_ACTIVITY` - Log system activities
- `CREATE_NOTIFICATION` - Create system notifications
- `SEND_EMAIL` - Send automated emails
- `SEND_SMS` - Send SMS messages
- `WEBHOOK` - Trigger external webhooks

## Usage Examples

### Triggering Portal Signup Automation

```typescript
import { automationManager } from './automation/automationManager';

// Trigger automation when user signs up
const results = await automationManager.triggerPortalSignup({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  state: 'CA',
  role: 'Patient'
}, userId);

// Check results
results.forEach(result => {
  if (result.success) {
    console.log('Automation succeeded:', result.message);
  } else {
    console.error('Automation failed:', result.error);
  }
});
```

### Creating Custom Triggers

```typescript
import { AutomationTrigger, AutomationEventType, AutomationActionType } from './types';

const customTrigger: AutomationTrigger = {
  id: 'custom-trigger-1',
  name: 'Custom Lead Follow-up',
  description: 'Send follow-up email 24 hours after lead creation',
  eventType: AutomationEventType.LEAD_CREATED,
  isActive: true,
  conditions: [
    {
      id: 'condition-1',
      field: 'source',
      operator: 'equals',
      value: 'Website'
    }
  ],
  actions: [
    {
      id: 'action-1',
      type: AutomationActionType.SEND_EMAIL,
      parameters: {
        template: 'lead-follow-up',
        delay: 1440 // 24 hours in minutes
      },
      order: 1
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

automationManager.setTrigger(customTrigger);
```

## Templates

The framework includes predefined templates for common automation scenarios:

- **Basic Portal Signup**: Creates lead + follow-up task
- **Advanced Portal Signup**: Creates lead + task + assigns SDR + notifications

Access templates via:
```typescript
const templates = automationManager.getTemplates();
```

## Future Enhancements

### Planned Features

1. **Workflow Builder UI**
   - Visual drag-and-drop interface for creating automations
   - Template library with pre-built workflows
   - Real-time testing and debugging tools

2. **Advanced Conditions**
   - Complex condition logic with AND/OR operators
   - Time-based conditions (business hours, weekends)
   - Data-driven conditions (lead score thresholds)

3. **Enhanced Actions**
   - Integration with external services (CRM, email providers)
   - Conditional branching within workflows
   - Multi-step approval processes

4. **Monitoring & Analytics**
   - Automation performance metrics
   - Success/failure tracking
   - A/B testing capabilities

### Extension Points

1. **Custom Triggers**: Add new trigger types by extending the framework
2. **Custom Actions**: Implement new action types in the ActionExecutor
3. **External Integrations**: Connect with third-party services
4. **AI Integration**: Add intelligent automation with ML-based decisions

## Configuration

### Environment Variables

- `AUTOMATION_ENABLED`: Enable/disable automation system (default: true)
- `AUTOMATION_DEBUG`: Enable debug logging (default: false)
- `AUTOMATION_MAX_RETRIES`: Maximum retry attempts for failed actions (default: 3)

### Database Requirements

The automation system requires these database tables:
- `users` - For user assignments and role-based actions
- `leads` - For lead creation and management
- `tasks` - For task creation and assignment
- `activity_logs` - For audit trail and activity logging

## Best Practices

1. **Error Handling**: Always handle automation failures gracefully
2. **Performance**: Use appropriate delays and batch processing for large operations
3. **Testing**: Test automation workflows thoroughly before deployment
4. **Monitoring**: Monitor automation success rates and performance metrics
5. **Security**: Validate all automation inputs and outputs

## Troubleshooting

### Common Issues

1. **Automation Not Triggering**: Check if trigger is active and conditions are met
2. **Action Failures**: Verify database permissions and data integrity
3. **Performance Issues**: Monitor automation execution times and optimize conditions
4. **Debug Logging**: Enable `AUTOMATION_DEBUG` for detailed execution logs

### Debug Commands

```typescript
// Get automation statistics
const stats = automationManager.getStats();

// Get all triggers
const triggers = automationManager.getAllTriggers();

// Get specific trigger
const trigger = automationManager.getTrigger('trigger-id');
```