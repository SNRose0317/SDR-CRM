# Automation Rules Engine

This directory contains the automation rules engine for the HealthCRM system. The engine follows a three-part structure for every rule:

## Architecture

### 1. Triggers (The "If")
- **Record Creation**: New Lead, Contact, Task, or Appointment created
- **Record Updates**: Specific field changes to specific values
- **Time-Based Events**: Date/time-based triggers with delays

### 2. Conditions (The "Only If")
- Additional criteria that must be met for the automation to run
- Can combine multiple conditions with AND/OR logic
- Field value comparisons, date ranges, user roles, etc.

### 3. Actions (The "Then That")
- **Field Updates**: Change values on current or related records
- **Record Creation**: Create new records (Tasks, Appointments, etc.)
- **Task Assignment**: Assign tasks to users or roles
- **Email Automation**: Send templated emails
- **Notifications**: In-app or external notifications
- **Time Delays**: Wait periods before executing next action

## Core Components

### TriggerEngine
- Listens for database events (create, update, delete)
- Evaluates trigger conditions
- Queues actions for execution

### ConditionEvaluator
- Processes rule conditions
- Supports complex logic (AND, OR, NOT)
- Field comparison operators (equals, greater than, contains, etc.)

### ActionExecutor
- Processes queued actions
- Supports action sequencing and delays
- Error handling and retry logic

## Future Workflow Manager Requirements

The automation system is designed to support a future UI-based workflow manager with:

1. **Visual Rule Builder**: Drag-and-drop interface for creating automation rules
2. **Time Delay Configuration**: Visual time delay settings with units (minutes, hours, days)
3. **Template Management**: Email and notification template editor
4. **Rule Testing**: Test automation rules with sample data
5. **Activity Monitoring**: Dashboard showing rule execution history
6. **Performance Analytics**: Metrics on rule effectiveness and execution times

## Implementation Status

### ✅ Completed
- Basic trigger system structure
- Lead signup automation (signup → create lead)

### 🔄 In Progress
- Condition evaluation system
- Action execution framework

### 📋 Planned
- Time-based triggers
- Email automation
- Complex condition logic
- Rule management API
- Workflow manager UI

## Example Rule: Lead Conversion

```javascript
{
  name: "Lead Conversion on Booking",
  object: "Lead",
  trigger: {
    type: "record_update",
    field: "status",
    value: "Booking: Paid/ booked"
  },
  conditions: [
    {
      field: "leadScore",
      operator: "greater_than",
      value: 80
    }
  ],
  actions: [
    {
      type: "convert_lead",
      delay: 0
    },
    {
      type: "update_field",
      target: "new_contact",
      field: "stage",
      value: "Intake",
      delay: 0
    },
    {
      type: "create_task",
      assignTo: "contact_owner",
      subject: "Schedule Initial Intake Call",
      dueDate: "2_business_days",
      delay: 0
    },
    {
      type: "send_notification",
      to: "contact_owner",
      template: "new_contact_assigned",
      delay: 0
    }
  ]
}
```

This framework provides the foundation for building a comprehensive workflow automation system that can handle complex healthcare CRM processes with proper timing and sequencing.