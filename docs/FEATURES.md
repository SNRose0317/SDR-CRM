# HealthCRM Features Specification

## Overview
HealthCRM is designed to manage the complete healthcare patient journey from lead generation to ongoing care management.

## Core Features

### 1. Lead Management System
**Purpose**: Manage potential patients through the initial engagement process

**Workflow**: 5-Stage Pipeline
1. **HHQ Started** - Health questionnaire initiated
2. **HHQ Signed** - Health questionnaire completed and signed
3. **Booking: Not Paid** - Appointment booking started but payment pending
4. **Booking: Paid/Not Booked** - Payment completed but appointment slot not selected
5. **Booking: Paid/Booked** - Fully booked and ready for conversion to contact

**Key Features**:
- Lead capture and qualification
- Progress tracking through stages
- Assignment to SDR representatives
- Conversion tracking to contacts
- Communication history
- Marketing channel attribution tracking
- Lead source filtering and analytics
- Call logging with detailed session tracking
- Lead profile access from multiple touchpoints

### 2. Contact Management System
**Purpose**: Manage active patients through their healthcare journey

**Workflow**: 15-Stage Healthcare Process
1. **Intake** - Initial patient onboarding
2. **Initial Labs** - First laboratory tests ordered
3. **Initial Lab Review** - Review of initial lab results
4. **Initial Provider Exam** - First provider consultation
5. **Initial Medication Order** - First prescription issued
6. **1st Follow-up Labs** - Follow-up laboratory tests
7. **First Follow-Up Lab Review** - Review of follow-up results
8. **First Follow-Up Provider Exam** - Follow-up consultation
9. **First Medication Refill** - First prescription renewal
10. **Second Follow-Up Labs** - Second round of follow-up labs
11. **Second Follow-Up Lab Review** - Second lab review
12. **Second Follow-up Provider Exam** - Second follow-up consultation
13. **Second Medication Refill** - Second prescription renewal
14. **Third Medication Refill** - Third prescription renewal
15. **Restart Annual Process** - Annual cycle restart

**Key Features**:
- Patient lifecycle management
- Health coach assignment
- Medical history tracking
- Prescription management
- Appointment scheduling integration

### 3. Task Management System
**Purpose**: Manage action items and follow-ups across the organization

**Task Types**:
- Lead follow-ups
- Contact care tasks
- Administrative tasks
- Appointment reminders

**Priority Levels**:
- **Urgent** - Immediate attention required
- **High** - Important, complete within 24 hours
- **Medium** - Standard priority, complete within 3 days
- **Low** - Low priority, complete within 1 week

**Status Tracking**:
- **Pending** - Task created but not started
- **In Progress** - Task being worked on
- **Completed** - Task finished
- **Cancelled** - Task no longer needed

### 4. Appointment Scheduling
**Purpose**: Manage healthcare appointments and consultations

**Appointment Types**:
- Initial consultations
- Follow-up visits
- Lab review appointments
- Provider examinations

**Status Management**:
- **Scheduled** - Appointment confirmed
- **Completed** - Appointment finished
- **Cancelled** - Appointment cancelled
- **No Show** - Patient didn't attend

### 5. User Management
**Purpose**: Manage system users and role-based access

**User Roles**:
- **SDR (Sales Development Representative)**: Manages leads and initial contact
- **Health Coach**: Manages patient care and follow-ups
- **Admin**: Full system access and user management

**Permissions**:
- SDRs: Full access to leads, read-only access to contacts
- Health Coaches: Full access to contacts and tasks, read-only access to leads
- Admins: Full access to all features and user management

### 6. Analytics Dashboard
**Purpose**: Provide insights into system performance and healthcare metrics

**Key Metrics**:
- Lead conversion rates by stage
- Lead source attribution and ROI tracking
- Call activity and engagement metrics
- Pipeline velocity by marketing channel

### 7. Marketing Attribution System
**Purpose**: Track lead sources and measure marketing channel effectiveness

**Supported Marketing Channels**:
- **HHQ Complete** - Leads from completed health questionnaires
- **HHQ Started** - Leads from initiated questionnaires  
- **Lab Purchase** - Leads from laboratory test purchases
- **Marek Health Discovery Call** - Leads from discovery call campaigns
- **Newsletter Discovery Call** - Leads from newsletter-driven calls
- **Social Media Discovery Call** - Leads from social media campaigns
- **Newsletter** - Direct newsletter subscribers
- **None** - Unknown or untracked sources

**Key Features**:
- Lead source dropdown in creation forms
- Marketing channel filtering in leads table
- ROI tracking by channel
- Attribution reporting for campaign optimization

### 8. Call Management System
**Purpose**: Track all communication activities with leads and contacts

**Features**:
- Detailed call session logging
- Call outcome tracking (Connected, Voicemail, No Answer, etc.)
- Call duration and notes recording
- Multi-lead phone dialer
- Call history timeline in lead profiles
- Automatic call count calculation

**Access Points**:
- Clickable lead names for instant profile access
- Dedicated "View Profile" button in phone dialer
- Actions menu "View Profile" option
- Complete call history with team member tracking
- Contact progression through healthcare journey
- Task completion rates
- Appointment scheduling efficiency
- User productivity metrics

**Reporting Features**:
- Real-time statistics
- Stage-based progression tracking
- Performance dashboards
- Activity logging and audit trail

## Future Enhancements

### Phase 2 Features
- **Email Integration**: Automated email campaigns and communications
- **SMS Notifications**: Appointment reminders and follow-ups
- **Document Management**: Medical records and form storage
- **Billing Integration**: Insurance and payment processing
- **Telemedicine**: Video consultation integration

### Phase 3 Features
- **AI-Powered Insights**: Predictive analytics for patient outcomes
- **Mobile Application**: iOS and Android apps for providers
- **API Integrations**: EHR systems and third-party healthcare tools
- **Advanced Reporting**: Custom reports and analytics
- **Workflow Automation**: Automated task creation and stage progression

## Technical Requirements

### Performance
- Support for 1000+ concurrent users
- Sub-second response times for all operations
- 99.9% uptime SLA

### Security
- HIPAA compliance for patient data
- Role-based access control
- Data encryption at rest and in transit
- Audit logging for all patient interactions

### Scalability
- Horizontal scaling capability
- Database optimization for healthcare workflows
- Efficient data archiving and retention policies

## Success Metrics

### Lead Management
- Lead to contact conversion rate > 25%
- Average time in pipeline < 14 days
- SDR productivity > 50 leads per day

### Contact Management
- Contact retention rate > 90%
- Average progression through stages < 6 months
- Health coach efficiency > 100 contacts per coach

### Task Management
- Task completion rate > 95%
- Average task resolution time < 2 days
- Overdue task rate < 5%

### Appointment Management
- Appointment show rate > 85%
- Average scheduling time < 5 minutes
- Cancellation rate < 10%