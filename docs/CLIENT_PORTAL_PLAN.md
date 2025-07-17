# Client Portal Development Plan

## Overview
This document outlines the comprehensive plan for building a client portal that allows patients to access their records, perform actions, and interact with the healthcare system while maintaining a single source of truth with the existing HealthCRM system.

## Architecture Strategy

### Single Application Approach (Recommended)
Rather than a monorepo, we'll extend the existing HealthCRM application with a client-facing portal. This approach provides:
- **Shared Database**: Single source of truth for all data
- **Unified API**: Same backend serves both internal and client needs
- **Consistent Business Logic**: Healthcare workflows remain centralized
- **Simplified Deployment**: Single application deployment
- **Integrated Authentication**: Shared user management system

### Portal Integration Points

#### 1. **Authentication System**
- Extend existing user roles to include "Patient" role
- Patient authentication via secure login/registration
- Session management integrated with existing auth system
- Password reset and account management

#### 2. **Data Access Layer**
- Shared database with role-based access controls
- API endpoints filtered by user permissions
- Patient data isolation and security
- HIPAA-compliant data access patterns

#### 3. **Event-Driven Architecture**
- SNS/Event system for status changes and notifications
- Automatic task creation for health coach actions
- Real-time updates between portal and CRM
- Trigger-based workflow automation

## Technical Implementation Plan

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Database Schema Extensions
```sql
-- Extend users table for patient accounts
ALTER TABLE users ADD COLUMN patient_id INTEGER REFERENCES contacts(id);
ALTER TABLE users ADD COLUMN portal_access BOOLEAN DEFAULT false;

-- Patient portal sessions
CREATE TABLE patient_sessions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  session_token VARCHAR NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patient portal activities
CREATE TABLE patient_activities (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  activity_type VARCHAR NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Portal Routes Structure
```
client/src/
├── features/
│   ├── portal/                    # New portal feature
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── password-reset.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── patient-dashboard.tsx
│   │   │   │   ├── health-timeline.tsx
│   │   │   │   └── upcoming-appointments.tsx
│   │   │   ├── records/
│   │   │   │   ├── medical-records.tsx
│   │   │   │   ├── lab-results.tsx
│   │   │   │   └── prescription-history.tsx
│   │   │   ├── appointments/
│   │   │   │   ├── book-appointment.tsx
│   │   │   │   ├── reschedule-appointment.tsx
│   │   │   │   └── appointment-history.tsx
│   │   │   ├── communication/
│   │   │   │   ├── messages.tsx
│   │   │   │   ├── notifications.tsx
│   │   │   │   └── health-coach-chat.tsx
│   │   │   └── profile/
│   │   │       ├── personal-info.tsx
│   │   │       ├── insurance-info.tsx
│   │   │       └── emergency-contacts.tsx
│   │   ├── pages/
│   │   │   ├── portal-dashboard.tsx
│   │   │   ├── portal-records.tsx
│   │   │   ├── portal-appointments.tsx
│   │   │   ├── portal-messages.tsx
│   │   │   └── portal-profile.tsx
│   │   ├── hooks/
│   │   │   ├── usePatientAuth.ts
│   │   │   ├── usePatientData.ts
│   │   │   └── usePortalNotifications.ts
│   │   └── README.md
```

#### 1.3 API Endpoints for Portal
```typescript
// New portal-specific API routes
GET    /api/portal/auth/login
POST   /api/portal/auth/register
POST   /api/portal/auth/logout
GET    /api/portal/patient/profile
PUT    /api/portal/patient/profile
GET    /api/portal/patient/records
GET    /api/portal/patient/appointments
POST   /api/portal/patient/appointments/book
PUT    /api/portal/patient/appointments/:id/reschedule
GET    /api/portal/patient/messages
POST   /api/portal/patient/messages
GET    /api/portal/patient/notifications
```

### Phase 2: Core Portal Features (Week 3-4)

#### 2.1 Patient Dashboard
- **Health Timeline**: Visual representation of patient's healthcare journey
- **Current Stage**: Clear display of current contact stage
- **Upcoming Appointments**: Next scheduled appointments
- **Recent Activity**: Lab results, prescriptions, messages
- **Quick Actions**: Book appointment, send message, view records

#### 2.2 Medical Records Access
- **Lab Results**: Secure access to laboratory test results
- **Prescription History**: Current and past medications
- **Provider Notes**: Relevant clinical notes (filtered for patient view)
- **Healthcare Timeline**: Chronological view of care progression
- **Document Upload**: Ability to upload relevant documents

#### 2.3 Appointment Management
- **Book Appointments**: Schedule new appointments with available slots
- **Reschedule/Cancel**: Modify existing appointments
- **Appointment History**: Past appointment records
- **Preparation Instructions**: Pre-appointment instructions
- **Video Call Integration**: Direct links to telemedicine sessions

### Phase 3: Communication & Notifications (Week 5-6)

#### 3.1 Health Coach Communication
- **Secure Messaging**: HIPAA-compliant messaging system
- **Notification System**: Real-time alerts for important updates
- **Care Plan Updates**: Notifications about care plan changes
- **Appointment Reminders**: Automated reminder system

#### 3.2 Event-Driven Triggers
```typescript
// Event system for portal actions
interface PortalEvent {
  type: 'APPOINTMENT_BOOKED' | 'MESSAGE_SENT' | 'DOCUMENT_UPLOADED' | 'PROFILE_UPDATED';
  patientId: number;
  data: any;
  timestamp: Date;
}

// Trigger actions
const handlePortalEvent = (event: PortalEvent) => {
  switch (event.type) {
    case 'APPOINTMENT_BOOKED':
      // Notify health coach
      // Create confirmation task
      // Send confirmation email
      break;
    case 'MESSAGE_SENT':
      // Notify health coach
      // Create response task
      // Update patient activity log
      break;
    // ... more triggers
  }
};
```

### Phase 4: Advanced Features (Week 7-8)

#### 4.1 Self-Service Actions
- **Prescription Refill Requests**: Request medication refills
- **Lab Result Notifications**: Opt-in for lab result alerts
- **Care Plan Acknowledgments**: Confirm understanding of care plans
- **Symptom Tracking**: Log symptoms and side effects
- **Medication Adherence**: Track medication compliance

#### 4.2 Integration with CRM Workflows
- **Status Change Triggers**: Portal actions trigger CRM status updates
- **Task Generation**: Patient actions create tasks for health coaches
- **Workflow Automation**: Automated progression through care stages
- **Data Synchronization**: Real-time sync between portal and CRM

## Security & Compliance

### HIPAA Compliance
- **Data Encryption**: All patient data encrypted at rest and in transit
- **Access Controls**: Role-based access with audit logging
- **Session Management**: Secure session handling with timeout
- **Audit Trail**: Complete activity logging for compliance

### Security Measures
- **Authentication**: Multi-factor authentication option
- **Authorization**: Granular permissions for patient data
- **API Security**: Rate limiting and input validation
- **Data Validation**: Comprehensive input sanitization

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Extend database schema for patient portal
- [ ] Create portal authentication system
- [ ] Set up portal routing structure
- [ ] Implement basic patient dashboard

### Phase 2: Core Features (Weeks 3-4)
- [ ] Medical records access system
- [ ] Appointment booking functionality
- [ ] Patient profile management
- [ ] Basic messaging system

### Phase 3: Communication (Weeks 5-6)
- [ ] Health coach communication platform
- [ ] Notification system implementation
- [ ] Event-driven trigger system
- [ ] Email integration

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Self-service actions
- [ ] Workflow automation
- [ ] Analytics and reporting
- [ ] Mobile responsiveness optimization

## Technical Considerations

### Database Design
- **Shared Tables**: Contacts table serves as patient records
- **Portal-Specific Tables**: Patient sessions, activities, messages
- **Audit Tables**: Track all portal interactions for compliance
- **Performance**: Indexes for patient-specific queries

### API Design
- **Separate Namespace**: `/api/portal/` for patient-facing endpoints
- **Permission Filtering**: Data filtered by patient access rights
- **Rate Limiting**: Protect against abuse
- **Caching**: Optimize performance for patient data

### Frontend Architecture
- **Shared Components**: Reuse existing UI components
- **Portal-Specific Styling**: Different branding for patient-facing interface
- **Responsive Design**: Mobile-first approach for patient accessibility
- **Performance**: Optimized for patient devices and connections

## Integration Points

### CRM System Integration
- **Shared Database**: Single source of truth
- **Unified API**: Common backend services
- **Role-Based Access**: Different views for staff and patients
- **Event Synchronization**: Real-time updates between systems

### Notification System
- **Email Integration**: Automated email notifications
- **SMS Alerts**: Optional SMS notifications
- **In-App Notifications**: Real-time portal notifications
- **Push Notifications**: Mobile app notifications (future)

## Success Metrics

### Patient Engagement
- Portal adoption rate
- Feature usage statistics
- Patient satisfaction scores
- Support ticket reduction

### Operational Efficiency
- Reduced phone calls for appointments
- Automated workflow completion
- Health coach productivity improvement
- Data accuracy improvement

## Future Enhancements

### Mobile Application
- Native mobile app development
- Push notification support
- Offline functionality
- Biometric authentication

### Advanced Features
- Telemedicine integration
- Wearable device integration
- AI-powered health insights
- Family member access

## Implementation Timeline

**Total Estimated Time**: 8 weeks
**Team Size**: 2-3 developers
**Key Milestones**:
- Week 2: Portal foundation complete
- Week 4: Core features functional
- Week 6: Communication system live
- Week 8: Full portal launch ready

This plan provides a comprehensive roadmap for building a client portal that integrates seamlessly with your existing HealthCRM system while maintaining security, compliance, and operational efficiency.