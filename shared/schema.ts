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
export const leadStatusEnum = pgEnum("lead_status", ["New", "HHQ Started", "HHQ Signed", "Booking: Needs Scheduling", "Booking: Paid/ booked"]);
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

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: userRoleEnum("role").notNull().default("patient"),
  passwordHash: varchar("password_hash"),
  profileImageUrl: varchar("profile_image_url"),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks),
  assignedContacts: many(contacts),
  activityLogs: many(activityLogs),
  portalSessions: many(portalSessions),
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
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  attendeeId: integer("attendee_id").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  attendee: one(users, {
    fields: [appointments.attendeeId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [appointments.contactId],
    references: [contacts.id],
  }),
}));

// Health History Questionnaire table
export const healthQuestionnaires = pgTable("health_questionnaires", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  libidoLevel: integer("libido_level").notNull(), // 1-10 scale
  overallHealth: integer("overall_health").notNull(), // 1-10 scale
  isSigned: boolean("is_signed").default(false).notNull(),
  signedAt: timestamp("signed_at"),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  appointmentBooked: boolean("appointment_booked").default(false).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healthQuestionnairesRelations = relations(healthQuestionnaires, ({ one }) => ({
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
  userId: integer("user_id").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portalSessionsRelations = relations(portalSessions, ({ one }) => ({
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
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
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