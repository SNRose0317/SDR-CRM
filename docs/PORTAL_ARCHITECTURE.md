# Client Portal Architecture

## System Architecture Overview

The client portal will be integrated into the existing HealthCRM application using a **unified architecture** approach rather than a monorepo. This design maintains a single source of truth while providing distinct user experiences for staff and patients.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     HealthCRM Application                      │
├─────────────────────────────────────────────────────────────────┤
│                     Frontend (React/TypeScript)                │
├─────────────────┬───────────────────────┬─────────────────────┤
│  Staff Portal   │    Shared Components  │   Patient Portal    │
│                 │                       │                     │
│  ┌─────────────┐│  ┌─────────────────┐ │┌─────────────────┐  │
│  │ Dashboard   ││  │ UI Components   │ ││ Patient Dash    │  │
│  │ Leads       ││  │ Data Table      │ ││ Records         │  │
│  │ Contacts    ││  │ Forms           │ ││ Appointments    │  │
│  │ Tasks       ││  │ Layout          │ ││ Messages        │  │
│  │ Appointments││  │ Feedback        │ ││ Profile         │  │
│  │ Users       ││  │ Charts          │ ││ Notifications   │  │
│  │ Settings    ││  └─────────────────┘ ││                 │  │
│  └─────────────┘│                      │└─────────────────┘  │
└─────────────────┴───────────────────────┴─────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Backend                          │
├─────────────────────────────────────────────────────────────────┤
│                    API Layer                                   │
├─────────────────┬───────────────────────┬─────────────────────┤
│  Staff APIs     │    Shared Services    │   Patient APIs      │
│                 │                       │                     │
│  ┌─────────────┐│  ┌─────────────────┐ │┌─────────────────┐  │
│  │ /api/users  ││  │ Authentication  │ ││ /api/portal/    │  │
│  │ /api/leads  ││  │ Authorization   │ ││ auth            │  │
│  │ /api/contacts│  │ Event System    │ ││ patient         │  │
│  │ /api/tasks  ││  │ Notification    │ ││ records         │  │
│  │ /api/appts  ││  │ Data Access     │ ││ appointments    │  │
│  │ /api/stats  ││  │ Validation      │ ││ messages        │  │
│  └─────────────┘│  └─────────────────┘ │└─────────────────┘  │
└─────────────────┴───────────────────────┴─────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                    Database Storage                            │
├─────────────────┬───────────────────────┬─────────────────────┤
│  Staff Data     │    Shared Tables      │   Patient Data      │
│                 │                       │                     │
│  ┌─────────────┐│  ┌─────────────────┐ │┌─────────────────┐  │
│  │ activity_   ││  │ users           │ ││ patient_        │  │
│  │ logs        ││  │ contacts        │ ││ sessions        │  │
│  │ admin_      ││  │ leads           │ ││ patient_        │  │
│  │ settings    ││  │ tasks           │ ││ activities      │  │
│  └─────────────┘│  │ appointments    │ │└─────────────────┘  │
│                 │  │ notifications   │ │                     │
│                 │  └─────────────────┘ │                     │
└─────────────────┴───────────────────────┴─────────────────────┘
```

## Key Architectural Decisions

### 1. Single Application Architecture
**Why not monorepo?**
- **Shared Database**: Single source of truth for all data
- **Unified Deployment**: Simpler CI/CD pipeline
- **Code Reuse**: Maximum component and utility sharing
- **Consistent API**: Single backend serves both interfaces
- **Easier Maintenance**: One codebase to maintain

### 2. Role-Based Access Control
```typescript
interface User {
  id: number;
  role: 'Admin' | 'Health Coach' | 'SDR' | 'Patient';
  permissions: Permission[];
}

interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}
```

### 3. Event-Driven Architecture
```typescript
interface SystemEvent {
  type: EventType;
  source: 'staff' | 'patient';
  entityType: 'contact' | 'appointment' | 'task';
  entityId: number;
  userId: number;
  data: any;
  timestamp: Date;
}

// Event handlers
const eventHandlers = {
  'APPOINTMENT_BOOKED': [
    notifyHealthCoach,
    createConfirmationTask,
    sendPatientConfirmation
  ],
  'LAB_RESULTS_AVAILABLE': [
    notifyPatient,
    createReviewTask,
    updateContactStage
  ],
  'PRESCRIPTION_REFILL_REQUESTED': [
    notifyHealthCoach,
    createRefillTask,
    updateMedicationStatus
  ]
};
```

## Implementation Strategy

### Phase 1: Authentication & Authorization

#### 1.1 Extend User System
```typescript
// Enhanced user schema
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role", {
    enum: ['Admin', 'Health Coach', 'SDR', 'Patient']
  }),
  contactId: integer("contact_id").references(() => contacts.id), // For patients
  portalAccess: boolean("portal_access").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### 1.2 Portal Authentication Flow
```typescript
// Portal-specific authentication
export const portalAuth = {
  login: async (email: string, password: string) => {
    // Validate credentials
    // Check portal access
    // Create session
    // Return patient-specific data
  },
  
  authorize: (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check user role
      // Validate portal access
      // Filter data by patient permissions
    };
  }
};
```

### Phase 2: Portal-Specific Features

#### 2.1 Patient Dashboard
```typescript
// Patient dashboard data aggregation
interface PatientDashboard {
  currentStage: ContactStage;
  nextAppointment: Appointment | null;
  recentActivity: PatientActivity[];
  notifications: Notification[];
  healthMetrics: HealthMetric[];
}

const getPatientDashboard = async (patientId: number): Promise<PatientDashboard> => {
  // Aggregate patient-specific data
  // Apply privacy filters
  // Return dashboard data
};
```

#### 2.2 Record Access Control
```typescript
// Patient record access filtering
const getPatientRecords = async (patientId: number, recordType: string) => {
  const allowedRecords = {
    'lab_results': ['completed', 'reviewed'],
    'prescriptions': ['active', 'completed'],
    'appointments': ['completed', 'scheduled'],
    'provider_notes': ['patient_facing']
  };
  
  // Filter records based on patient permissions
  // Apply privacy controls
  // Return filtered data
};
```

### Phase 3: Event System Integration

#### 3.1 Portal Event Triggers
```typescript
// Portal-specific event handlers
const portalEventHandlers = {
  'PATIENT_APPOINTMENT_BOOKED': async (event: SystemEvent) => {
    // Notify assigned health coach
    await createTask({
      title: `Review appointment booking - ${event.data.patientName}`,
      assignedTo: event.data.healthCoachId,
      priority: 'Medium',
      dueDate: event.data.appointmentDate
    });
    
    // Send confirmation email to patient
    await sendEmail({
      to: event.data.patientEmail,
      template: 'appointment_confirmation',
      data: event.data
    });
  },
  
  'PATIENT_MESSAGE_SENT': async (event: SystemEvent) => {
    // Create response task for health coach
    await createTask({
      title: `Respond to patient message - ${event.data.subject}`,
      assignedTo: event.data.healthCoachId,
      priority: 'High',
      contactId: event.data.patientId
    });
    
    // Send notification to health coach
    await sendNotification({
      userId: event.data.healthCoachId,
      type: 'NEW_PATIENT_MESSAGE',
      data: event.data
    });
  }
};
```

#### 3.2 Status Change Automation
```typescript
// Automated status changes based on portal activity
const statusChangeHandlers = {
  'APPOINTMENT_COMPLETED': async (patientId: number) => {
    // Progress patient through healthcare stages
    const patient = await getContact(patientId);
    const nextStage = getNextStage(patient.stage);
    
    if (nextStage) {
      await updateContactStage(patientId, nextStage);
      await createStageTransitionTasks(patientId, nextStage);
    }
  },
  
  'LAB_RESULTS_ACKNOWLEDGED': async (patientId: number) => {
    // Update patient stage if appropriate
    // Create follow-up tasks
    // Schedule next appointment if needed
  }
};
```

## Data Flow Architecture

### 1. Patient Action Flow
```
Patient Portal Action
        ↓
   API Validation
        ↓
   Permission Check
        ↓
   Database Update
        ↓
   Event Trigger
        ↓
   Background Tasks
        ↓
   Staff Notifications
```

### 2. Staff-to-Patient Communication
```
Staff Action (CRM)
        ↓
   System Event
        ↓
   Patient Notification
        ↓
   Portal Update
        ↓
   Patient Dashboard
```

## Security Architecture

### 1. Authentication Layers
- **Session Management**: Secure session handling with timeout
- **Role-Based Access**: Different permissions for staff and patients
- **Data Filtering**: Automatic filtering based on user role
- **Audit Logging**: Complete activity tracking

### 2. Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Access Controls**: Granular permissions for patient data
- **Privacy Filters**: Automatic filtering of sensitive information
- **Compliance**: HIPAA-compliant data handling

## Performance Considerations

### 1. Database Optimization
- **Indexes**: Optimized for patient-specific queries
- **Caching**: Redis for frequently accessed patient data
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Minimize N+1 queries

### 2. Frontend Performance
- **Code Splitting**: Separate bundles for staff and patient portals
- **Lazy Loading**: Load portal features on demand
- **Caching**: Aggressive caching of patient data
- **Mobile Optimization**: Responsive design for patient devices

## Deployment Strategy

### 1. Single Application Deployment
- **Unified Build**: Single build process for both portals
- **Environment Configuration**: Different configs for staff and patient interfaces
- **Feature Flags**: Control portal feature rollout
- **Monitoring**: Unified logging and monitoring

### 2. Rollout Plan
1. **Phase 1**: Internal testing with staff accounts
2. **Phase 2**: Beta testing with select patients
3. **Phase 3**: Gradual rollout to all patients
4. **Phase 4**: Full feature activation

This architecture provides a robust, scalable, and maintainable solution for the client portal while leveraging the existing HealthCRM infrastructure and maintaining a single source of truth.