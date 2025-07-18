# Controllers Directory

This directory contains route handlers and business logic controllers for the healthcare CRM system.

## Purpose

Controllers separate business logic from route definitions, making the code more maintainable and testable. They handle request processing, validation, and response formatting.

## Structure

```
controllers/
├── dashboardController.ts    # Dashboard analytics and stats
├── userController.ts         # User management operations
├── leadController.ts         # Lead lifecycle management
├── contactController.ts      # Contact management and care coordination
├── taskController.ts         # Task assignment and tracking
├── appointmentController.ts  # Appointment scheduling and management
├── portalController.ts       # Portal user interactions
├── ruleController.ts         # Rule engine operations
├── automationController.ts   # Workflow automation controls
└── reportController.ts       # Analytics and reporting
```

## Example Controller Structure

```typescript
// leadController.ts
import { Request, Response } from 'express';
import { storage } from '../storage';
import { ruleEngine } from '../rules/engine';

export class LeadController {
  async getLeads(req: Request, res: Response) {
    // Business logic for fetching leads
    // Permission checking
    // Data transformation
    // Response formatting
  }

  async createLead(req: Request, res: Response) {
    // Validation
    // Business rules
    // Database operations
    // Automation triggers
  }

  async assignLead(req: Request, res: Response) {
    // Permission validation
    // Assignment logic
    // Notification triggers
    // Activity logging
  }
}
```

## Healthcare CRM Specific Controllers

### LeadController
- Lead qualification and scoring
- SDR assignment and claiming
- Lead nurturing workflows
- Conversion tracking

### ContactController  
- Patient journey management
- Health coach assignments
- Care plan coordination
- Progress tracking

### TaskController
- Follow-up task management
- Care coordination tasks
- Appointment reminders
- Documentation requirements

### AppointmentController
- Scheduling logic
- Availability management
- Reminder systems
- Cancellation handling

### PortalController
- Patient portal access
- Health information sharing
- Appointment booking
- Secure messaging

## Benefits

1. **Separation of Concerns**: Business logic separate from routing
2. **Testability**: Controllers can be unit tested independently
3. **Reusability**: Controller methods can be shared across routes
4. **Maintainability**: Changes to business logic don't affect routing
5. **Scalability**: Easy to add new features and endpoints

## When to Use

Move logic to controllers when:
- Route handlers become complex (>20 lines)
- Business logic needs to be shared across routes
- Complex validation or data transformation is required
- Integration with multiple services is needed
- Automated testing is required