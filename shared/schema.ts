import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["sdr", "health_coach", "admin", "patient"]);
export const lifecycleStageEnum = pgEnum("lifecycle_stage", ["lead", "contact"]);
export const leadStatusEnum = pgEnum("lead_status", ["New", "HHQ Started", "HHQ Signed", "Booking: Not Paid", "Booking: Paid/Not Booked", "Booking: Paid/Booked", "Converted"]);
export const hhqStatusEnum = pgEnum("hhq_status", ["Created", "Submitted", "Signed", "Paid", "Appointment Booked", "Completed"]);
export const contactStageEnum = pgEnum("contact_stage", [
  "Intake",
  "Initial Labs",
  "Initial Lab Review",
  "Initial Provider Exam",
  "Initial Medication Order",
  "1st Follow-up Labs",
  "First Follow-Up Lab Review",
  "First Follow-Up Provider Exam",
  "First Medication Refill",
  "Second Follow-Up Labs",
  "Second Follow-Up Lab Review",
  "Second Follow-up Provider Exam",
  "Second Medication Refill",
  "Third Medication Refill",
  "Restart Annual Process"
]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "completed", "cancelled"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "confirmed", "completed", "cancelled", "no_show"]);
export const leadReadinessEnum = pgEnum("lead_readiness", ["Cold", "Warm", "Hot", "Follow Up"]);
export const leadOutcomeEnum = pgEnum("lead_outcome", [
  "Contacted - Intake Scheduled",
  "Contacted - Follow-Up Scheduled", 
  "Contacted - No Follow Up Scheduled",
  "Contacted - No Longer Interested",
  "Contacted - Do Not Call",
  "Left Voicemail",
  "No Answer", 
  "Bad Number",
  "Disqualified"
]);
export const callDispositionEnum = pgEnum("call_disposition", ["connected", "voicemail", "busy", "no_answer", "callback", "not_interested", "qualified", "follow_up"]);
export const dialerStatusEnum = pgEnum("dialer_status", ["active", "paused", "completed"]);
export const leadSourceEnum = pgEnum("lead_source", [
  "HHQ Complete",
  "HHQ Started", 
  "Lab Purchase",
  "Marek Health Discovery Call",
  "Newsletter Discovery Call",
  "Social Media Discovery Call",
  "Newsletter",
  "None"
]);

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// RBAC Tables - defined before users table due to foreign key reference
// Roles table - replaces hardcoded role enum
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  parentRoleId: integer("parent_role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role-Permission junction table
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: integer("granted_by").references(() => users.id),
}, (table) => ({
  pk: index("role_permissions_pkey").on(table.roleId, table.permissionId),
}));

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: userRoleEnum("role").notNull().default("patient"), // TODO: Remove after full RBAC migration
  roleId: integer("role_id").references(() => roles.id), // New RBAC field
  passwordHash: varchar("password_hash"),
  profileImageUrl: varchar("profile_image_url"),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  assignedTasks: many(tasks),
  assignedContacts: many(contacts),
  activityLogs: many(activityLogs),
  portalSessions: many(portalSessions),
  assignedPersons: many(persons),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id]
  })
}));

// Define relations for RBAC tables
export const rolesRelations = relations(roles, ({ one, many }) => ({
  parentRole: one(roles, {
    fields: [roles.parentRoleId],
    references: [roles.id],
    relationName: "roleHierarchy"
  }),
  childRoles: many(roles, {
    relationName: "roleHierarchy"
  }),
  users: many(users),
  rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  }),
  grantedByUser: one(users, {
    fields: [rolePermissions.grantedBy],
    references: [users.id]
  })
}));

// Unified person table with persistent MH-1234 format
export const persons = pgTable("persons", {
  id: serial("id").primaryKey(),
  personId: varchar("person_id").unique().notNull(), // MH-1234 format
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  state: varchar("state"),
  lifecycleStage: lifecycleStageEnum("lifecycle_stage").notNull().default("lead"),
  
  // Lead-specific fields
  leadStatus: leadStatusEnum("lead_status").default("New"),
  leadOutcome: leadOutcomeEnum("lead_outcome"),
  source: leadSourceEnum("source").default("None"),
  leadScore: integer("lead_score").default(0),
  
  // Contact-specific fields
  contactStage: contactStageEnum("contact_stage").default("Intake"),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  
  // Common fields
  ownerId: integer("owner_id").references(() => users.id),
  notes: text("notes"),
  passwordHash: varchar("password_hash"),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  
  // Audit fields
  originalLeadId: integer("original_lead_id"), // For migration reference
  convertedAt: timestamp("converted_at"),
  disqualifiedReason: varchar("disqualified_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const personsRelations = relations(persons, ({ one, many }) => ({
  owner: one(users, {
    fields: [persons.ownerId],
    references: [users.id],
  }),
  healthCoach: one(users, {
    fields: [persons.healthCoachId],
    references: [users.id],
  }),
  tasks: many(tasks),
  appointments: many(appointments),
  activityLogs: many(activityLogs),
  portalSessions: many(portalSessions),
  healthQuestionnaires: many(healthQuestionnaires),
}));

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  state: varchar("state"),
  status: leadStatusEnum("status").notNull().default("New"),
  source: varchar("source"),
  leadScore: integer("lead_score").default(0),
  notes: text("notes"),
  ownerId: integer("owner_id").references(() => users.id),
  healthCoachBookedWith: integer("health_coach_booked_with").references(() => users.id),
  
  // New lead tracking fields
  lastContacted: timestamp("last_contacted"),
  leadOutcome: leadOutcomeEnum("lead_outcome"),
  numberOfCalls: integer("number_of_calls").default(0),
  leadType: varchar("lead_type"),
  leadSource: leadSourceEnum("lead_source").default("None"),
  leadReadiness: leadReadinessEnum("lead_readiness").default("Cold"),
  
  passwordHash: varchar("password_hash"),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  owner: one(users, {
    fields: [leads.ownerId],
    references: [users.id],
  }),
  healthCoach: one(users, {
    fields: [leads.healthCoachBookedWith],
    references: [users.id],
  }),
  contacts: many(contacts),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  stage: contactStageEnum("stage").notNull().default("Intake"),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  ownerId: integer("owner_id").references(() => users.id),
  notes: text("notes"),
  passwordHash: varchar("password_hash"),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  healthCoach: one(users, {
    fields: [contacts.healthCoachId],
    references: [users.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [contacts.leadId],
    references: [leads.id],
  }),
  tasks: many(tasks),
  appointments: many(appointments),
  activityLogs: many(activityLogs),
  portalSessions: many(portalSessions),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  status: taskStatusEnum("status").notNull().default("todo"),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: timestamp("due_date"),
  personId: varchar("person_id").references(() => persons.personId),
  // Legacy fields for migration
  leadId: integer("lead_id").references(() => leads.id),
  contactId: integer("contact_id").references(() => contacts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  person: one(persons, {
    fields: [tasks.personId],
    references: [persons.personId],
  }),
  lead: one(leads, {
    fields: [tasks.leadId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
}));

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration"), // Duration in minutes
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  userId: integer("user_id").references(() => users.id),
  personId: varchar("person_id").references(() => persons.personId),
  // Legacy fields for migration
  leadId: integer("lead_id").references(() => leads.id),
  contactId: integer("contact_id").references(() => contacts.id),
  meetingLink: varchar("meeting_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  person: one(persons, {
    fields: [appointments.personId],
    references: [persons.personId],
  }),
  lead: one(leads, {
    fields: [appointments.leadId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [appointments.contactId],
    references: [contacts.id],
  }),
}));

// Health History Questionnaire table
export const healthQuestionnaires = pgTable("health_questionnaires", {
  id: serial("id").primaryKey(),
  personId: varchar("person_id").references(() => persons.personId),
  // Legacy field for migration
  leadId: integer("lead_id").references(() => leads.id),
  status: hhqStatusEnum("status").notNull().default("Created"),
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  libidoLevel: integer("libido_level").notNull(), // 1-10 scale
  overallHealth: integer("overall_health").notNull(), // 1-10 scale
  isSigned: boolean("is_signed").default(false).notNull(),
  signedAt: timestamp("signed_at"),
  signatureData: text("signature_data"), // Store signature/name data
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  appointmentBooked: boolean("appointment_booked").default(false).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healthQuestionnairesRelations = relations(healthQuestionnaires, ({ one }) => ({
  person: one(persons, {
    fields: [healthQuestionnaires.personId],
    references: [persons.personId],
  }),
  lead: one(leads, {
    fields: [healthQuestionnaires.leadId],
    references: [leads.id],
  }),
  appointment: one(appointments, {
    fields: [healthQuestionnaires.appointmentId],
    references: [appointments.id],
  }),
}));

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(),
  entityId: integer("entity_id"),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [activityLogs.entityId],
    references: [leads.id],
  }),
  contact: one(contacts, {
    fields: [activityLogs.entityId],
    references: [contacts.id],
  }),
}));

// Portal sessions table for external user (leads/contacts) authentication
export const portalSessions = pgTable("portal_sessions", {
  id: serial("id").primaryKey(),
  personId: varchar("person_id").references(() => persons.personId),
  // Legacy fields for migration
  userId: integer("user_id").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portalSessionsRelations = relations(portalSessions, ({ one }) => ({
  person: one(persons, {
    fields: [portalSessions.personId],
    references: [persons.personId],
  }),
  user: one(users, {
    fields: [portalSessions.userId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [portalSessions.contactId],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields: [portalSessions.leadId],
    references: [leads.id],
  }),
}));

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dueDate: z.string().transform((val) => new Date(val)).optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledAt: z.string().transform((val) => new Date(val)),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Portal messages table for secure communication between leads/contacts and staff
export const portalMessages = pgTable("portal_messages", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  sentByPatient: boolean("sent_by_patient").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portalMessagesRelations = relations(portalMessages, ({ one }) => ({
  contact: one(contacts, {
    fields: [portalMessages.contactId],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields: [portalMessages.leadId],
    references: [leads.id],
  }),
  healthCoach: one(users, {
    fields: [portalMessages.healthCoachId],
    references: [users.id],
  }),
}));

// Portal notifications table for leads/contacts
export const portalNotifications = pgTable("portal_notifications", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: varchar("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portalNotificationsRelations = relations(portalNotifications, ({ one }) => ({
  contact: one(contacts, {
    fields: [portalNotifications.contactId],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields: [portalNotifications.leadId],
    references: [leads.id],
  }),
}));

export const insertPortalSessionSchema = createInsertSchema(portalSessions).omit({
  id: true,
  createdAt: true,
});

// Call Sessions table for tracking individual phone calls
export const callSessions = pgTable("call_sessions", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // caller
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // Duration in seconds
  callOutcome: leadOutcomeEnum("call_outcome"), // Using lead outcome enum
  notes: text("notes"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callSessionsRelations = relations(callSessions, ({ one }) => ({
  lead: one(leads, {
    fields: [callSessions.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [callSessions.userId],
    references: [users.id],
  }),
}));

// Dialer Queue table for managing multi-lead calling sessions
export const dialerQueues = pgTable("dialer_queues", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  leadIds: jsonb("lead_ids").notNull(), // array of lead IDs
  currentIndex: integer("current_index").default(0),
  autoDialerEnabled: boolean("auto_dialer_enabled").default(false),
  autoDialerDelay: integer("auto_dialer_delay").default(10), // seconds between calls
  status: dialerStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dialerQueuesRelations = relations(dialerQueues, ({ one }) => ({
  user: one(users, {
    fields: [dialerQueues.userId],
    references: [users.id],
  }),
}));

// Permission Rules tables
export const permissionRules = pgTable("permission_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1),
  
  // Rule subject (what entity type this rule applies to)
  subjectType: varchar("subject_type").notNull(), // 'lead', 'contact', 'task', etc.
  
  // Rule condition (now supports compound conditions)
  conditions: jsonb("conditions").notNull(), // Stores the full condition tree with AND/OR logic
  
  // Rule action
  actionType: varchar("action_type").notNull(), // 'grant_access', 'assign_entity', etc.
  
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

export const ruleAuditLog = pgTable("rule_audit_log", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => permissionRules.id),
  entityType: varchar("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  
  action: varchar("action").notNull(),
  details: jsonb("details"),
  
  timestamp: timestamp("timestamp").defaultNow(),
});

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

export const insertPortalMessageSchema = createInsertSchema(portalMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPortalNotificationSchema = createInsertSchema(portalNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertCallSessionSchema = createInsertSchema(callSessions).omit({
  id: true,
  createdAt: true,
});

export const insertDialerQueueSchema = createInsertSchema(dialerQueues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthQuestionnaireSchema = createInsertSchema(healthQuestionnaires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  signedAt: true,
  paidAt: true,
  appointmentId: true,
}).extend({
  energyLevel: z.number().min(1).max(10),
  libidoLevel: z.number().min(1).max(10),
  overallHealth: z.number().min(1).max(10),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type PortalSession = typeof portalSessions.$inferSelect;
export type InsertPortalSession = z.infer<typeof insertPortalSessionSchema>;
export type PortalMessage = typeof portalMessages.$inferSelect;
export type InsertPortalMessage = z.infer<typeof insertPortalMessageSchema>;
export type PortalNotification = typeof portalNotifications.$inferSelect;
export type InsertPortalNotification = z.infer<typeof insertPortalNotificationSchema>;
export type PermissionRule = typeof permissionRules.$inferSelect;
export type InsertPermissionRule = typeof permissionRules.$inferInsert;
export type RuleEvaluation = typeof ruleEvaluations.$inferSelect;
export type RuleAuditLog = typeof ruleAuditLog.$inferSelect;
export type HealthQuestionnaire = typeof healthQuestionnaires.$inferSelect;

// Add person insert schema
export const insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// RBAC schemas
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  grantedAt: true,
});

// RBAC types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// Person types
export type Person = typeof persons.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

// Utility function to generate MH-1234 format person ID
export function generatePersonId(numericId: number): string {
  return `MH-${numericId.toString().padStart(4, '0')}`;
}

// Function to extract numeric ID from MH-1234 format
export function extractPersonIdNumber(personId: string): number {
  const match = personId.match(/^MH-(\d+)$/);
  if (!match) throw new Error(`Invalid person ID format: ${personId}`);
  return parseInt(match[1], 10);
}
export type InsertHealthQuestionnaire = z.infer<typeof insertHealthQuestionnaireSchema>;

// Signup schema for portal registration
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  state: z.string().min(1, "State is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupData = z.infer<typeof signupSchema>;