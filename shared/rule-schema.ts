// Rule-based permission system schema
import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Rule types enum
export const ruleTypeEnum = pgTable("rule_types", {
  value: varchar("value").primaryKey(),
});

// Field types for rule evaluation
export const fieldTypeEnum = pgTable("field_types", {
  value: varchar("value").primaryKey(),
});

// Operator types for conditions
export const operatorTypeEnum = pgTable("operator_types", {
  value: varchar("value").primaryKey(),
});

// Action types for rule outcomes
export const actionTypeEnum = pgTable("action_types", {
  value: varchar("value").primaryKey(),
});

// Main rules table
export const permissionRules = pgTable("permission_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // Higher number = higher priority
  
  // Rule subject (what entity type this rule applies to)
  subjectType: varchar("subject_type").notNull(), // 'lead', 'contact', 'task', etc.
  
  // Rule condition
  fieldName: varchar("field_name").notNull(), // 'createdAt', 'updatedAt', 'status', etc.
  operator: varchar("operator").notNull(), // '>', '<', '=', '!=', 'contains', etc.
  value: jsonb("value").notNull(), // The comparison value (can be string, number, date, etc.)
  
  // Rule action
  actionType: varchar("action_type").notNull(), // 'grant_access', 'assign_entity', 'trigger_workflow', etc.
  
  // Target (who the action applies to)
  targetType: varchar("target_type").notNull(), // 'user', 'role', 'team', etc.
  targetId: varchar("target_id"), // Specific user ID, role name, etc.
  
  // Permission details
  permissions: jsonb("permissions").notNull(), // { read: true, write: false, assign: true }
  
  // Metadata
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rule evaluation cache for performance
export const ruleEvaluations = pgTable("rule_evaluations", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => permissionRules.id),
  entityType: varchar("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  
  // Evaluation result
  matches: boolean("matches").notNull(),
  permissions: jsonb("permissions").notNull(),
  
  // Cache metadata
  evaluatedAt: timestamp("evaluated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Rule audit log
export const ruleAuditLog = pgTable("rule_audit_log", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => permissionRules.id),
  entityType: varchar("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  
  action: varchar("action").notNull(), // 'access_granted', 'access_denied', 'entity_assigned', etc.
  details: jsonb("details"),
  
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const permissionRulesRelations = relations(permissionRules, ({ one, many }) => ({
  creator: one(users, {
    fields: [permissionRules.createdBy],
    references: [users.id],
  }),
  evaluations: many(ruleEvaluations),
  auditLogs: many(ruleAuditLog),
}));

export const ruleEvaluationsRelations = relations(ruleEvaluations, ({ one }) => ({
  rule: one(permissionRules, {
    fields: [ruleEvaluations.ruleId],
    references: [permissionRules.id],
  }),
  user: one(users, {
    fields: [ruleEvaluations.userId],
    references: [users.id],
  }),
}));

export const ruleAuditLogRelations = relations(ruleAuditLog, ({ one }) => ({
  rule: one(permissionRules, {
    fields: [ruleAuditLog.ruleId],
    references: [permissionRules.id],
  }),
  user: one(users, {
    fields: [ruleAuditLog.userId],
    references: [users.id],
  }),
}));

// TypeScript types
export type PermissionRule = typeof permissionRules.$inferSelect;
export type InsertPermissionRule = typeof permissionRules.$inferInsert;
export type RuleEvaluation = typeof ruleEvaluations.$inferSelect;
export type RuleAuditLog = typeof ruleAuditLog.$inferSelect;

// Rule configuration types
export interface RuleConfig {
  name: string;
  description?: string;
  subject: {
    type: 'lead' | 'contact' | 'task' | 'appointment';
  };
  condition: {
    field: string;
    operator: '>' | '<' | '=' | '!=' | 'contains' | 'in' | 'between';
    value: any;
  };
  action: {
    type: 'grant_access' | 'assign_entity' | 'trigger_workflow' | 'send_notification';
    target: {
      type: 'user' | 'role' | 'team';
      id?: string;
    };
    permissions: {
      read?: boolean;
      write?: boolean;
      assign?: boolean;
      delete?: boolean;
    };
  };
}

// Available fields for each entity type
export const ENTITY_FIELDS = {
  lead: [
    { name: 'createdAt', type: 'datetime', label: 'Created Date' },
    { name: 'updatedAt', type: 'datetime', label: 'Updated Date' },
    { name: 'status', type: 'enum', label: 'Status' },
    { name: 'leadScore', type: 'number', label: 'Lead Score' },
    { name: 'source', type: 'string', label: 'Source' },
    { name: 'ownerId', type: 'reference', label: 'Owner' },
  ],
  contact: [
    { name: 'createdAt', type: 'datetime', label: 'Created Date' },
    { name: 'updatedAt', type: 'datetime', label: 'Updated Date' },
    { name: 'stage', type: 'enum', label: 'Stage' },
    { name: 'ownerId', type: 'reference', label: 'Owner' },
    { name: 'healthCoachId', type: 'reference', label: 'Health Coach' },
  ],
  task: [
    { name: 'createdAt', type: 'datetime', label: 'Created Date' },
    { name: 'dueDate', type: 'datetime', label: 'Due Date' },
    { name: 'status', type: 'enum', label: 'Status' },
    { name: 'priority', type: 'enum', label: 'Priority' },
    { name: 'assignedTo', type: 'reference', label: 'Assigned To' },
  ],
  appointment: [
    { name: 'createdAt', type: 'datetime', label: 'Created Date' },
    { name: 'startTime', type: 'datetime', label: 'Start Time' },
    { name: 'status', type: 'enum', label: 'Status' },
    { name: 'attendeeId', type: 'reference', label: 'Attendee' },
  ],
};

// Available operators for each field type
export const FIELD_OPERATORS = {
  datetime: [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'between', label: 'Between' },
  ],
  number: [
    { value: '>', label: 'Greater than' },
    { value: '<', label: 'Less than' },
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'between', label: 'Between' },
  ],
  string: [
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In list' },
  ],
  enum: [
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'in', label: 'In list' },
  ],
  reference: [
    { value: '=', label: 'Equal to' },
    { value: '!=', label: 'Not equal to' },
    { value: 'in', label: 'In list' },
  ],
};

// Available action types
export const ACTION_TYPES = [
  {
    value: 'grant_access',
    label: 'Grant Access',
    description: 'Grant read/write permissions to specified users or roles',
  },
  {
    value: 'assign_entity',
    label: 'Assign Entity',
    description: 'Automatically assign the entity to specified users or roles',
  },
  {
    value: 'trigger_workflow',
    label: 'Trigger Workflow',
    description: 'Execute a workflow automation when condition is met',
  },
  {
    value: 'send_notification',
    label: 'Send Notification',
    description: 'Send notification to specified users or roles',
  },
];

// Available target types
export const TARGET_TYPES = [
  {
    value: 'user',
    label: 'Specific User',
    description: 'Apply action to a specific user',
  },
  {
    value: 'role',
    label: 'User Role',
    description: 'Apply action to all users with a specific role',
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Apply action to all users in a team',
  },
];