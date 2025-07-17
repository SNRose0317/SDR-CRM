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
  healthCoachBookedWith: integer("health_coach_booked_with").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  healthCoach: one(users, {
    fields: [contacts.healthCoachId],
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

// Portal sessions table for patient portal authentication
export const portalSessions = pgTable("portal_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  contactId: integer("contact_id").references(() => contacts.id),
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

export const insertPortalSessionSchema = createInsertSchema(portalSessions).omit({
  id: true,
  createdAt: true,
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