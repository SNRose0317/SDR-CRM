# Rules System - Backend

This directory contains all server-side rule engine functionality for the dynamic permission system.

## Files

- `engine.ts` - Core rule evaluation engine with caching and compound condition support
- `routes.ts` - API endpoints for rule management (CRUD operations)
- `index.ts` - Main exports for the rules system

## Features

- **Dynamic Rule Evaluation**: Evaluates complex permission rules against entities
- **Compound Conditions**: Supports AND/OR logic with nested conditions
- **Caching**: Intelligent caching for performance optimization
- **Audit Logging**: Comprehensive logging of rule evaluations and changes
- **Extensible**: Easy to add new entity types, operators, and actions

## Usage

```typescript
import { ruleEngine } from './rules/engine';

// Evaluate permissions for a user on an entity
const permissions = await ruleEngine.evaluatePermissions('lead', 1, 123);

// Create a new rule
const rule = await ruleEngine.createRule(ruleConfig, userId);
```

## API Endpoints

- `GET /api/rules` - Get all rules
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `POST /api/rules/:id/test` - Test rule evaluation