# Rules System - Shared Types

This directory contains all shared types, schemas, and configurations for the rules system.

## Files

- `schema.ts` - Complete rule schema definitions, database models, and TypeScript types
- `index.ts` - Module exports

## Key Types

### RuleCondition
```typescript
// Simple condition
type SimpleCondition = {
  field: string;
  operator: '>' | '<' | '=' | '!=' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'between' | 'is_empty' | 'is_not_empty';
  value: any;
};

// Compound condition with AND/OR logic
type CompoundCondition = {
  logic: 'AND' | 'OR';
  conditions: (SimpleCondition | CompoundCondition)[];
};

type RuleCondition = SimpleCondition | CompoundCondition;
```

### RuleConfig
```typescript
interface RuleConfig {
  name: string;
  description?: string;
  subject: { type: 'lead' | 'contact' | 'task' | 'appointment' };
  condition: RuleCondition;
  action: {
    type: 'grant_access' | 'assign_entity' | 'trigger_workflow' | 'send_notification';
    target: { type: 'user' | 'role' | 'team'; id?: string };
    permissions: { read?: boolean; write?: boolean; assign?: boolean; delete?: boolean };
  };
}
```

## Configuration

### Entity Fields
Defines available fields for each entity type with proper types for validation.

### Operators
Comprehensive set of operators for different field types:
- **Comparison**: `>`, `<`, `=`, `!=`
- **Text**: `contains`, `starts_with`, `ends_with`
- **Collection**: `in`, `between`
- **Existence**: `is_empty`, `is_not_empty`

### Actions & Targets
Predefined action types and target types for consistent rule behavior.

## Database Schema

The rules system uses three main tables:
- `permission_rules` - Rule definitions with compound conditions
- `rule_evaluations` - Cached evaluation results
- `rule_audit_log` - Audit trail of rule changes and evaluations