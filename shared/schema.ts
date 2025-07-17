import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["SDR", "Health Coach", "Admin", "Patient"]);
export const leadStatusEnum = pgEnum("lead_status", [
  "HHQ Started",
  "HHQ Signed",
  "Booking: Not Paid",
  "Booking: Paid/Not Booked",
  "Booking: Paid/Booked"
]);
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
export const taskStatusEnum = pgEnum("task_status", ["Pending", "In Progress", "Completed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["Low", "Medium", "High"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"]);
export const patientActivityTypeEnum = pgEnum("patient_activity_type", [
  "LOGIN",
  "PROFILE_UPDATE",
  "APPOINTMENT_BOOKED",
  "APPOINTMENT_CANCELLED",
  "MESSAGE_SENT",
  "RECORD_ACCESSED",
  "DOCUMENT_UPLOADED"
]);
export const patientNotificationTypeEnum = pgEnum("patient_notification_type", [
  "APPOINTMENT_REMINDER",
  "LAB_RESULTS_AVAILABLE",
  "PRESCRIPTION_READY",
  "MESSAGE_RECEIVED",
  "STAGE_UPDATED",
  "GENERAL_ANNOUNCEMENT"
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  contactId: integer("contact_id").references(() => contacts.id),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  status: leadStatusEnum("status").notNull().default("HHQ Started"),
  ownerId: integer("owner_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  stage: contactStageEnum("stage").notNull().default("Intake"),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").notNull().default("Medium"),
  status: taskStatusEnum("status").notNull().default("Pending"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  contactId: integer("contact_id").references(() => contacts.id),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(30), // in minutes
  status: appointmentStatusEnum("status").notNull().default("Scheduled"),
  userId: integer("user_id").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  contactId: integer("contact_id").references(() => contacts.id),
  meetingLink: varchar("meeting_link", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Activity Log table for tracking events
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'lead', 'contact', 'task', 'appointment'
  entityId: integer("entity_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Portal-specific tables
export const patientSessions = pgTable("patient_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

export const patientActivities = pgTable("patient_activities", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  activityType: patientActivityTypeEnum("activity_type").notNull(),
  activityDescription: text("activity_description"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow()
});

export const patientMessages = pgTable("patient_messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  sentByPatient: boolean("sent_by_patient").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const patientNotifications = pgTable("patient_notifications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  type: patientNotificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedLeads: many(leads),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  contacts: many(contacts),
  appointments: many(appointments),
  activityLogs: many(activityLogs)
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  owner: one(users, { fields: [leads.ownerId], references: [users.id] }),
  contact: one(contacts, { fields: [leads.id], references: [contacts.leadId] }),
  tasks: many(tasks),
  appointments: many(appointments)
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  healthCoach: one(users, { fields: [contacts.healthCoachId], references: [users.id] }),
  lead: one(leads, { fields: [contacts.leadId], references: [leads.id] }),
  tasks: many(tasks),
  appointments: many(appointments)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, { fields: [tasks.assignedToId], references: [users.id], relationName: "assignedTasks" }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id], relationName: "createdTasks" }),
  lead: one(leads, { fields: [tasks.leadId], references: [leads.id] }),
  contact: one(contacts, { fields: [tasks.contactId], references: [contacts.id] })
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  lead: one(leads, { fields: [appointments.leadId], references: [leads.id] }),
  contact: one(contacts, { fields: [appointments.contactId], references: [contacts.id] })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] })
}));

export const patientSessionsRelations = relations(patientSessions, ({ one }) => ({
  patient: one(contacts, { fields: [patientSessions.patientId], references: [contacts.id] })
}));

export const patientActivitiesRelations = relations(patientActivities, ({ one }) => ({
  patient: one(contacts, { fields: [patientActivities.patientId], references: [contacts.id] })
}));

export const patientMessagesRelations = relations(patientMessages, ({ one }) => ({
  patient: one(contacts, { fields: [patientMessages.patientId], references: [contacts.id] }),
  healthCoach: one(users, { fields: [patientMessages.healthCoachId], references: [users.id] })
}));

export const patientNotificationsRelations = relations(patientNotifications, ({ one }) => ({
  patient: one(contacts, { fields: [patientNotifications.patientId], references: [contacts.id] })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true }).extend({
  dueDate: z.string().optional().transform((str) => str ? new Date(str) : undefined)
});
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  scheduledAt: z.string().transform((str) => new Date(str))
});
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// Portal insert schemas
export const insertPatientSessionSchema = createInsertSchema(patientSessions).omit({ id: true, createdAt: true });
export const insertPatientActivitySchema = createInsertSchema(patientActivities).omit({ id: true, createdAt: true });
export const insertPatientMessageSchema = createInsertSchema(patientMessages).omit({ id: true, createdAt: true });
export const insertPatientNotificationSchema = createInsertSchema(patientNotifications).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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

// Portal types
export type PatientSession = typeof patientSessions.$inferSelect;
export type InsertPatientSession = z.infer<typeof insertPatientSessionSchema>;
export type PatientActivity = typeof patientActivities.$inferSelect;
export type InsertPatientActivity = z.infer<typeof insertPatientActivitySchema>;
export type PatientMessage = typeof patientMessages.$inferSelect;
export type InsertPatientMessage = z.infer<typeof insertPatientMessageSchema>;
export type PatientNotification = typeof patientNotifications.$inferSelect;
export type InsertPatientNotification = z.infer<typeof insertPatientNotificationSchema>;
