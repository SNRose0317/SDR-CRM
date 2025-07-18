# Rules System - Frontend

This directory contains all client-side rule management functionality.

## Structure

```
rules/
├── components/
│   ├── condition-builder.tsx    - Visual compound condition builder
│   ├── rule-builder.tsx         - Complete rule creation interface
│   └── rule-management.tsx      - Rule listing and management
├── pages/
│   └── rules.tsx                - Main rules page
├── hooks/                       - Custom hooks (future)
└── index.ts                     - Module exports
```

## Components

### RuleBuilder
Complete rule creation and editing interface with:
- Entity type selection (leads, contacts, tasks, appointments)
- Visual condition builder with AND/OR logic
- Action configuration (grant access, assign entity, etc.)
- Permission settings (read, write, assign, delete)
- Real-time validation

### ConditionBuilder
Advanced condition builder supporting:
- Simple conditions (field, operator, value)
- Compound conditions with AND/OR logic
- Multiple conditions with grouping
- Enhanced operators (is_empty, is_not_empty, starts_with, ends_with)
- Dynamic field selection based on entity type

### RuleManagement
Comprehensive rule management interface with:
- Rule listing with filtering and sorting
- Rule activation/deactivation
- Rule testing with sample data
- Rule editing and deletion
- Audit log viewing

## Usage

```typescript
import { RuleManagement, RuleBuilder } from '@/features/rules';

// Use in your app
<RuleManagement />
```

## Navigation

Rules are accessible via the main navigation at `/rules` with a Shield icon.