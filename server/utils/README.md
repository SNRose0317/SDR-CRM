# Utils Directory

This directory contains utility functions and helper modules for the healthcare CRM system.

## Purpose

Utilities provide common functionality that can be reused across the application, including data validation, formatting, calculations, and helper functions.

## Structure

```
utils/
├── dateUtils.ts              # Date/time manipulation and formatting
├── validationUtils.ts        # Input validation and sanitization
├── formatUtils.ts            # Data formatting and transformation
├── encryptionUtils.ts        # Data encryption and security
├── emailUtils.ts             # Email formatting and templates
├── phoneUtils.ts             # Phone number validation and formatting
├── healthUtils.ts            # Health-specific calculations
├── schedulingUtils.ts        # Appointment scheduling helpers
├── permissionUtils.ts        # Permission checking utilities
├── loggingUtils.ts           # Structured logging helpers
├── cacheUtils.ts             # Caching and performance utilities
├── errorUtils.ts             # Error handling and reporting
└── testUtils.ts              # Testing utilities and helpers
```

## Example Utility Structure

```typescript
// dateUtils.ts
export class DateUtils {
  static formatAppointmentDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  static addBusinessDays(date: Date, days: number): Date {
    // Business day calculation logic
  }

  static getNextAvailableSlot(date: Date, duration: number): Date {
    // Scheduling logic
  }
}
```

## Healthcare CRM Specific Utilities

### DateUtils
- Appointment scheduling calculations
- Business hours validation
- Time zone handling
- Age calculations
- Date formatting for different contexts

### ValidationUtils
- Email validation
- Phone number validation
- Health ID validation
- Insurance number validation
- Address validation

### FormatUtils
- Phone number formatting
- Name formatting (first, last, display)
- Address formatting
- Currency formatting
- Percentage formatting

### EncryptionUtils
- HIPAA-compliant data encryption
- Password hashing
- Token generation
- Data anonymization
- Secure key management

### EmailUtils
- Email template rendering
- Appointment reminder emails
- Care plan notifications
- System alert emails
- HIPAA-compliant messaging

### PhoneUtils
- Phone number parsing and validation
- International format handling
- SMS formatting
- Phone number masking
- Carrier identification

### HealthUtils
- BMI calculations
- Age-based health recommendations
- Risk assessment scoring
- Health questionnaire processing
- Medication interaction checking

### SchedulingUtils
- Appointment conflict detection
- Availability calculation
- Buffer time management
- Recurring appointment logic
- Calendar synchronization

### PermissionUtils
- Role-based access checking
- Resource permission validation
- Data access control
- API endpoint authorization
- Field-level permissions

### LoggingUtils
- Structured logging
- Audit trail creation
- Error categorization
- Performance monitoring
- HIPAA compliance logging

### CacheUtils
- Data caching strategies
- Cache invalidation
- Performance optimization
- Memory management
- Distributed caching

### ErrorUtils
- Error categorization
- Error reporting
- User-friendly error messages
- Stack trace cleaning
- Error recovery strategies

### TestUtils
- Test data generation
- Mock object creation
- Database seeding
- API testing helpers
- Integration test utilities

## Example Implementations

### Health Calculations
```typescript
// healthUtils.ts
export class HealthUtils {
  static calculateBMI(weight: number, height: number): number {
    return weight / (height * height);
  }

  static getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
```

### Validation Helpers
```typescript
// validationUtils.ts
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateInsuranceNumber(number: string): boolean {
    // Insurance number validation logic
    return /^[A-Z]{2}\d{9}$/.test(number);
  }
}
```

### Formatting Helpers
```typescript
// formatUtils.ts
export class FormatUtils {
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatPatientName(firstName: string, lastName: string): string {
    return `${lastName}, ${firstName}`;
  }
}
```

## Benefits

1. **Code Reusability**: Common functionality in shared utilities
2. **Consistency**: Standardized formatting and validation
3. **Maintainability**: Changes to common logic in one place
4. **Testability**: Utilities can be unit tested independently
5. **Performance**: Optimized implementations for common operations

## When to Use

Create utilities for:
- Functions used in multiple places
- Data validation and formatting
- Mathematical calculations
- String manipulation
- Date/time operations
- Security and encryption
- Performance optimizations

## Best Practices

1. **Pure Functions**: Utilities should be stateless and predictable
2. **Single Responsibility**: Each utility has one clear purpose
3. **Input Validation**: Always validate utility function inputs
4. **Error Handling**: Proper error handling for edge cases
5. **Documentation**: Clear documentation for each utility function
6. **Performance**: Optimize for common use cases