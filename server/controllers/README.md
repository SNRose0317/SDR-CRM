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

## When We Would Need This

We would create controller files when:

### Current Triggers (Why we haven't needed them yet)
- **Simple CRUD Operations**: Our current routes in `server/routes/` are handling basic create, read, update, delete operations that don't require complex business logic
- **Storage Layer Abstraction**: The `storage.ts` file currently handles most business logic through its comprehensive interface
- **Small Route Handlers**: Most route handlers are under 20 lines and don't need extraction

### Future Triggers (When we would create controllers)
1. **Complex Lead Scoring**: When we implement sophisticated lead qualification algorithms that require multiple data sources and calculations
2. **Multi-Step Workflows**: When appointment scheduling becomes complex with availability checking, conflict resolution, and automated notifications
3. **Health Assessment Processing**: When we need to process health questionnaires with complex scoring, risk calculations, and care plan generation
4. **Integration Complexity**: When we integrate with external EHR systems, insurance APIs, or calendar services
5. **Advanced Permission Logic**: When the rule engine needs complex business logic coordination beyond simple database queries

### Example: When Lead Management Gets Complex
```typescript
// Currently: Simple route handler
router.post("/", async (req, res) => {
  const leadData = insertLeadSchema.parse(req.body);
  const lead = await storage.createLead(leadData);
  res.status(201).json(lead);
});

// Would become: Controller when we add lead scoring
router.post("/", leadController.createLead);
// Where leadController.createLead handles:
// - Lead qualification scoring
// - Automated assignment logic
// - Integration with marketing systems
// - Automated follow-up creation
```