# HealthCRM Documentation Index

This directory contains comprehensive documentation for the HealthCRM healthcare customer relationship management system.

## 📚 Complete Documentation Structure

### 🏗️ **Core System Documentation**
- **[Architecture Guide](ARCHITECTURE.md)** - System architecture and design patterns
- **[API Documentation](API.md)** - Complete API reference with examples
- **[Feature Specifications](FEATURES.md)** - Business requirements and healthcare workflows
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment and maintenance

### 🔧 **Technical Documentation**
- **[Database Schema](DATABASE_SCHEMA.md)** - Complete database structure and relationships
- **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - Configuration and setup guide
- **[UI Component Best Practices](UI_COMPONENT_BEST_PRACTICES.md)** - Component architecture patterns
- **[Developer Onboarding](DEVELOPER_ONBOARDING.md)** - Complete developer setup guide

### 📁 **Structure Documentation**
- **[Directory Structure](../DIRECTORY_STRUCTURE.md)** - Project organization guide
- **[Corrected Directory Structure](CORRECTED_DIRECTORY_STRUCTURE.md)** - Feature-based organization
- **[UI Optimization Summary](UI_OPTIMIZATION_SUMMARY.md)** - Component improvements
- **[Documentation Audit](DOCUMENTATION_AUDIT.md)** - Documentation completeness review

### 🎯 **Feature-Specific Documentation**
Each feature has its own README with detailed information:
- **[Dashboard](../client/src/features/dashboard/README.md)** - Analytics and overview
- **[Leads](../client/src/features/leads/README.md)** - 5-stage lead pipeline
- **[Contacts](../client/src/features/contacts/README.md)** - 15-stage healthcare workflow
- **[Tasks](../client/src/features/tasks/README.md)** - Priority-based task management
- **[Appointments](../client/src/features/appointments/README.md)** - Healthcare scheduling
- **[Users](../client/src/features/users/README.md)** - Role-based user management
- **[Settings](../client/src/features/settings/README.md)** - System configuration

### 🔍 **Component Documentation**
- **[Shared Components](../client/src/shared/README.md)** - Reusable component library
- **[Data Display](../client/src/shared/components/data-display/README.md)** - Tables, charts, stats
- **[Feedback](../client/src/shared/components/feedback/README.md)** - Loading, error, empty states
- **[Composite](../client/src/shared/components/composite/README.md)** - Complex components

### 📖 **Quick Start Guides**

#### **For New Developers**
1. **[Developer Onboarding](DEVELOPER_ONBOARDING.md)** - Complete setup guide
2. **[Architecture Guide](ARCHITECTURE.md)** - Understand the system
3. **[Database Schema](DATABASE_SCHEMA.md)** - Database structure
4. **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - Configuration setup

#### **For System Administrators**
1. **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
2. **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - Server configuration
3. **[Database Schema](DATABASE_SCHEMA.md)** - Database management

#### **For API Developers**
1. **[API Documentation](API.md)** - Complete endpoint reference
2. **[Database Schema](DATABASE_SCHEMA.md)** - Data structure
3. **[Feature Specifications](FEATURES.md)** - Business logic

#### **For Frontend Developers**
1. **[UI Component Best Practices](UI_COMPONENT_BEST_PRACTICES.md)** - Component patterns
2. **[Feature Documentation](../client/src/features/)** - Feature-specific guides
3. **[Developer Onboarding](DEVELOPER_ONBOARDING.md)** - Development setup

## 🎯 **Healthcare Domain Knowledge**

### **Lead Management Pipeline (5 Stages)**
1. **HHQ Started** - Health questionnaire initiated
2. **HHQ Signed** - Health questionnaire completed
3. **Booking: Not Paid** - Appointment booking started
4. **Booking: Paid/Not Booked** - Payment completed
5. **Booking: Paid/Booked** - Ready for conversion

### **Contact Healthcare Journey (15 Stages)**
1. Intake → 2. Initial Labs → 3. Initial Lab Review → 4. Initial Provider Exam → 5. Initial Medication Order → 6. 1st Follow-up Labs → 7. First Follow-Up Lab Review → 8. First Follow-Up Provider Exam → 9. First Medication Refill → 10. Second Follow-Up Labs → 11. Second Follow-Up Lab Review → 12. Second Follow-up Provider Exam → 13. Second Medication Refill → 14. Third Medication Refill → 15. Restart Annual Process

### **User Roles & Permissions**
- **SDR**: Lead management, initial patient contact
- **Health Coach**: Patient care, healthcare workflow management
- **Admin**: Full system access, user management

## 🏆 **Documentation Quality Standards**

### **✅ Complete Documentation Coverage**
- All features have dedicated README files
- All major components have JSDoc comments
- Database schema fully documented
- API endpoints comprehensively documented
- Environment variables documented
- Development workflows documented

### **📋 Documentation Maintenance**
- Documentation updated with code changes
- Current state reflects recent improvements
- All links and references verified
- Examples and code snippets tested

## 🔗 **External Resources**

### **Technology Stack**
- **[React Documentation](https://react.dev/)** - Frontend framework
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Type safety
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database operations
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library

### **Healthcare Standards**
- **HIPAA Compliance** - Patient data protection
- **HL7 Standards** - Healthcare data exchange
- **Healthcare Workflows** - Industry best practices

This comprehensive documentation suite ensures that all aspects of the HealthCRM system are thoroughly documented, from initial setup to advanced development and deployment scenarios.