import {
  users,
  leads,
  contacts,
  tasks,
  appointments,
  activityLogs,
  healthQuestionnaires,
  type User,
  type InsertUser,
  type Lead,
  type InsertLead,
  type Contact,
  type InsertContact,
  type Task,
  type InsertTask,
  type Appointment,
  type InsertAppointment,
  type ActivityLog,
  type InsertActivityLog,
  type HealthQuestionnaire,
  type InsertHealthQuestionnaire
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql, isNull } from "drizzle-orm";
import { canUserSeeEntity, canUserClaimEntity, DEFAULT_PERMISSIONS, type UserRole, type EntityType } from "@shared/permissions";
import { ruleEngine } from "./rules/engine";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Lead operations
  getLeads(filters?: any): Promise<Lead[]>;
  getLeadsForUser(userId: number, userRole: UserRole): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  getLeadStats(): Promise<any>;
  
  // Entity assignment operations
  assignEntity(entityType: EntityType, entityId: number, userId: number): Promise<any>;
  getAvailableEntities(userId: number, userRole: UserRole, entityType: EntityType): Promise<Lead[] | Contact[]>;
  
  // Contact operations
  getContacts(filters?: any): Promise<Contact[]>;
  getContactsForUser(userId: number, userRole: UserRole): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  getContactStats(): Promise<any>;
  
  // Task operations
  getTasks(filters?: any): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getTaskStats(): Promise<any>;
  
  // Appointment operations
  getAppointments(filters?: any): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(filters?: any): Promise<ActivityLog[]>;
  
  // Stats operations
  getDashboardStats(): Promise<any>;

  // Health History Questionnaire operations
  getHealthQuestionnaire(leadId: number): Promise<HealthQuestionnaire | undefined>;
  createHealthQuestionnaire(data: InsertHealthQuestionnaire): Promise<HealthQuestionnaire>;
  signHealthQuestionnaire(questionnaireId: number, signatureData?: string): Promise<HealthQuestionnaire>;
  markAsPaid(questionnaireId: number, amount: number): Promise<HealthQuestionnaire>;
  bookAppointment(questionnaireId: number, appointmentId: number): Promise<HealthQuestionnaire>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Lead operations
  async getLeads(filters?: any): Promise<Lead[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters?.healthCoachBookedWith) {
      conditions.push(eq(leads.healthCoachBookedWith, filters.healthCoachBookedWith));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(leads.firstName, `%${filters.search}%`),
          like(leads.lastName, `%${filters.search}%`),
          like(leads.email, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
    }
    
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0] || undefined;
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(leadData).returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: result[0].id,
      action: 'created',
      details: `Lead ${result[0].firstName} ${result[0].lastName} created`,
      userId: leadData.healthCoachBookedWith
    });
    
    return result[0];
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead> {
    const result = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: id,
      action: 'updated',
      details: `Lead updated`,
      userId: leadData.healthCoachBookedWith || null
    });
    
    return result[0];
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadStats(): Promise<any> {
    const statuses = ['HHQ Started', 'HHQ Signed', 'Booking: Not Paid', 'Booking: Paid/Not Booked', 'Booking: Paid/Booked'];
    const stats = await Promise.all(
      statuses.map(async (status) => {
        const result = await db.select({ count: count() }).from(leads).where(eq(leads.status, status as any));
        return { status, count: result[0].count };
      })
    );
    return stats;
  }

  // Contact operations
  async getContacts(filters?: any): Promise<Contact[]> {
    const conditions = [];
    
    if (filters?.stage) {
      conditions.push(eq(contacts.stage, filters.stage));
    }
    if (filters?.healthCoachId) {
      conditions.push(eq(contacts.healthCoachId, filters.healthCoachId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(contacts.firstName, `%${filters.search}%`),
          like(contacts.lastName, `%${filters.search}%`),
          like(contacts.email, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(contacts).where(and(...conditions)).orderBy(desc(contacts.createdAt));
    }
    
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0] || undefined;
  }

  async createContact(contactData: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contactData).returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'contact',
      entityId: result[0].id,
      action: 'created',
      details: `Contact ${result[0].firstName} ${result[0].lastName} created`,
      userId: contactData.healthCoachId
    });
    
    return result[0];
  }

  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact> {
    const result = await db
      .update(contacts)
      .set({ ...contactData, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'contact',
      entityId: id,
      action: 'updated',
      details: `Contact updated`,
      userId: contactData.healthCoachId || null
    });
    
    return result[0];
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getContactStats(): Promise<any> {
    const stages = [
      'Intake',
      'Initial Labs',
      'Initial Lab Review',
      'Initial Provider Exam',
      'Initial Medication Order',
      '1st Follow-up Labs',
      'First Follow-Up Lab Review',
      'First Follow-Up Provider Exam',
      'First Medication Refill',
      'Second Follow-Up Labs',
      'Second Follow-Up Lab Review',
      'Second Follow-up Provider Exam',
      'Second Medication Refill',
      'Third Medication Refill',
      'Restart Annual Process'
    ];
    
    const stats = await Promise.all(
      stages.map(async (stage) => {
        const result = await db.select({ count: count() }).from(contacts).where(eq(contacts.stage, stage as any));
        return { stage, count: result[0].count };
      })
    );
    return stats;
  }

  // Task operations
  async getTasks(filters?: any): Promise<Task[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(tasks.assignedToId, filters.assignedTo));
    }
    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(tasks.title, `%${filters.search}%`),
          like(tasks.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
    }
    
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0] || undefined;
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(taskData).returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'task',
      entityId: result[0].id,
      action: 'created',
      details: `Task "${result[0].title}" created`,
      userId: taskData.assignedToId
    });
    
    return result[0];
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task> {
    const updateData = { ...taskData, updatedAt: new Date() };
    
    // If task is being completed, set completedAt
    if (taskData.status === 'completed') {
      (updateData as any).completedAt = new Date();
    }
    
    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'task',
      entityId: id,
      action: 'updated',
      details: `Task updated`,
      userId: taskData.assignedToId || null
    });
    
    return result[0];
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTaskStats(): Promise<any> {
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const priorities = ['Low', 'Medium', 'High'];
    
    const [statusStats, priorityStats] = await Promise.all([
      Promise.all(
        statuses.map(async (status) => {
          const result = await db.select({ count: count() }).from(tasks).where(eq(tasks.status, status as any));
          return { status, count: result[0].count };
        })
      ),
      Promise.all(
        priorities.map(async (priority) => {
          const result = await db.select({ count: count() }).from(tasks).where(eq(tasks.priority, priority as any));
          return { priority, count: result[0].count };
        })
      )
    ]);
    
    return { statusStats, priorityStats };
  }

  // Appointment operations
  async getAppointments(filters?: any): Promise<Appointment[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(appointments.status, filters.status));
    }
    if (filters?.attendeeId) {
      conditions.push(eq(appointments.attendeeId, filters.attendeeId));
    }
    if (filters?.contactId) {
      conditions.push(eq(appointments.contactId, filters.contactId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(appointments).where(and(...conditions)).orderBy(desc(appointments.startTime));
    }
    
    return await db.select().from(appointments).orderBy(desc(appointments.startTime));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0] || undefined;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointmentData).returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'appointment',
      entityId: result[0].id,
      action: 'created',
      details: `Appointment "${result[0].title}" scheduled`,
      userId: appointmentData.attendeeId
    });
    
    return result[0];
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment> {
    const result = await db
      .update(appointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'appointment',
      entityId: id,
      action: 'updated',
      details: `Appointment updated`,
      userId: appointmentData.attendeeId || null
    });
    
    return result[0];
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Activity log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(logData).returning();
    return result[0];
  }

  async getActivityLogs(filters?: any): Promise<ActivityLog[]> {
    const conditions = [];
    
    if (filters?.entityType) {
      conditions.push(eq(activityLogs.entityType, filters.entityType));
    }
    if (filters?.entityId) {
      conditions.push(eq(activityLogs.entityId, filters.entityId));
    }
    if (filters?.userId) {
      conditions.push(eq(activityLogs.userId, filters.userId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(activityLogs).where(and(...conditions)).orderBy(desc(activityLogs.createdAt));
    }
    
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  // Stats operations
  async getDashboardStats(): Promise<any> {
    const [totalUsers, totalLeads, totalContacts, totalTasks, totalAppointments] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(leads),
      db.select({ count: count() }).from(contacts),
      db.select({ count: count() }).from(tasks),
      db.select({ count: count() }).from(appointments)
    ]);

    return {
      totalUsers: totalUsers[0].count,
      totalLeads: totalLeads[0].count,
      totalContacts: totalContacts[0].count,
      totalTasks: totalTasks[0].count,
      totalAppointments: totalAppointments[0].count
    };
  }

  // Permission-based lead access with rule engine
  async getLeadsForUser(userId: number, userRole: UserRole): Promise<Lead[]> {
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
    
    // Filter leads based on rule engine permissions
    const filteredLeads = [];
    for (const lead of allLeads) {
      // Check rule-based permissions first
      const rulePermissions = await ruleEngine.evaluateUserAccess('lead', lead.id, userId);
      if (rulePermissions.canRead) {
        filteredLeads.push(lead);
        continue;
      }
      
      // Fallback to default permissions
      if (canUserSeeEntity(userRole, 'lead', lead.ownerId, userId, lead.createdAt!, DEFAULT_PERMISSIONS)) {
        filteredLeads.push(lead);
      }
    }
    
    return filteredLeads;
  }

  // Permission-based contact access with rule engine
  async getContactsForUser(userId: number, userRole: UserRole): Promise<Contact[]> {
    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    
    // Filter contacts based on rule engine permissions
    const filteredContacts = [];
    for (const contact of allContacts) {
      // Check rule-based permissions first
      const rulePermissions = await ruleEngine.evaluateUserAccess('contact', contact.id, userId);
      if (rulePermissions.canRead) {
        filteredContacts.push(contact);
        continue;
      }
      
      // Fallback to default permissions
      if (canUserSeeEntity(userRole, 'contact', contact.ownerId, userId, contact.createdAt!, DEFAULT_PERMISSIONS)) {
        filteredContacts.push(contact);
      }
    }
    
    return filteredContacts;
  }

  // Entity assignment (replaces claiming)
  async assignEntity(entityType: EntityType, entityId: number, userId: number): Promise<any> {
    // Get the entity and user info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    let entity: any;
    let table: any;
    
    if (entityType === 'lead') {
      [entity] = await db.select().from(leads).where(eq(leads.id, entityId));
      table = leads;
    } else {
      [entity] = await db.select().from(contacts).where(eq(contacts.id, entityId));
      table = contacts;
    }

    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    // Check if entity is already assigned
    if (entity.ownerId !== null) {
      throw new Error(`${entityType} is already assigned to another user`);
    }

    // Check if user has permission to claim this entity
    const canClaim = canUserClaimEntity(user.role as UserRole, entityType, entity.ownerId, entity.createdAt, DEFAULT_PERMISSIONS);
    if (!canClaim.canClaim) {
      throw new Error(canClaim.reason || `Cannot assign this ${entityType}`);
    }

    // Assign the entity
    const [updatedEntity] = await db.update(table)
      .set({
        ownerId: userId,
        updatedAt: new Date()
      })
      .where(eq(table.id, entityId))
      .returning();

    // Log the activity
    await this.createActivityLog({
      entityType,
      entityId,
      userId: userId,
      action: `${entityType}_assigned`,
      details: `${entityType} assigned to ${user.firstName} ${user.lastName} (${user.role})`,
    });

    return {
      success: true,
      message: `${entityType} assigned successfully`,
      data: { [entityType]: updatedEntity }
    };
  }

  // Get available entities for assignment
  async getAvailableEntities(userId: number, userRole: UserRole, entityType: EntityType): Promise<Lead[] | Contact[]> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    let availableEntities: any[];

    if (entityType === 'lead') {
      // Get all unassigned leads
      availableEntities = await db.select().from(leads)
        .where(isNull(leads.ownerId))
        .orderBy(desc(leads.createdAt));
    } else {
      // Get all unassigned contacts
      availableEntities = await db.select().from(contacts)
        .where(isNull(contacts.ownerId))
        .orderBy(desc(contacts.createdAt));
    }

    // Filter based on permissions
    return availableEntities.filter(entity => {
      const canClaim = canUserClaimEntity(userRole, entityType, entity.ownerId, entity.createdAt, DEFAULT_PERMISSIONS);
      return canClaim.canClaim;
    });
  }

  // Health History Questionnaire operations
  async getHealthQuestionnaire(leadId: number): Promise<HealthQuestionnaire | undefined> {
    const result = await db.select()
      .from(healthQuestionnaires)
      .where(eq(healthQuestionnaires.leadId, leadId));
    return result[0] || undefined;
  }

  async createHealthQuestionnaire(data: InsertHealthQuestionnaire): Promise<HealthQuestionnaire> {
    const result = await db.insert(healthQuestionnaires).values({
      ...data,
      status: 'Submitted' // Status changes from Created to Submitted when form is filled
    }).returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: data.leadId,
      action: 'hhq_created',
      details: `Health History Questionnaire created`,
      userId: null
    });
    
    // Update lead status when HHQ is created/submitted
    await this.updateLead(data.leadId, {
      status: 'HHQ Started'
    });
    
    return result[0];
  }

  async signHealthQuestionnaire(questionnaireId: number, signatureData?: string): Promise<HealthQuestionnaire> {
    const result = await db
      .update(healthQuestionnaires)
      .set({
        isSigned: true,
        signedAt: new Date(),
        signatureData: signatureData || null,
        status: 'Signed',
        updatedAt: new Date()
      })
      .where(eq(healthQuestionnaires.id, questionnaireId))
      .returning();
    
    const hhq = result[0];
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: hhq.leadId,
      action: 'hhq_signed',
      details: `Health History Questionnaire signed`,
      userId: null
    });
    
    // Update lead status when HHQ is signed
    await this.updateLead(hhq.leadId, {
      status: 'HHQ Signed'
    });
    
    return hhq;
  }

  async markAsPaid(questionnaireId: number, amount: number): Promise<HealthQuestionnaire> {
    const result = await db
      .update(healthQuestionnaires)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentAmount: amount.toString(),
        status: 'Paid',
        updatedAt: new Date()
      })
      .where(eq(healthQuestionnaires.id, questionnaireId))
      .returning();
    
    const hhq = result[0];
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: hhq.leadId,
      action: 'hhq_paid',
      details: `Payment of $${amount} processed`,
      userId: null
    });
    
    // Update lead status when payment is made
    await this.updateLead(hhq.leadId, {
      status: 'Booking: Paid/Not Booked'
    });
    
    return hhq;
  }

  async bookAppointment(questionnaireId: number, appointmentId: number): Promise<HealthQuestionnaire> {
    const result = await db
      .update(healthQuestionnaires)
      .set({
        appointmentBooked: true,
        appointmentId: appointmentId,
        status: 'Appointment Booked',
        updatedAt: new Date()
      })
      .where(eq(healthQuestionnaires.id, questionnaireId))
      .returning();
    
    const hhq = result[0];
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: hhq.leadId,
      action: 'hhq_appointment_booked',
      details: `Appointment booked`,
      userId: null
    });
    
    // Update lead status when appointment is booked
    await this.updateLead(hhq.leadId, {
      status: 'Booking: Paid/Booked'
    });
    
    return hhq;
  }

  // Reset HHQ and sync lead status
  async resetHealthQuestionnaire(leadId: number): Promise<void> {
    // Delete the HHQ record
    await db.delete(healthQuestionnaires)
      .where(eq(healthQuestionnaires.leadId, leadId));
    
    // Reset lead status back to New
    await this.updateLead(leadId, {
      status: 'New'
    });
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: leadId,
      action: 'hhq_reset',
      details: `Health History Questionnaire reset`,
      userId: null
    });
  }

  // Complete HHQ process and sync lead status
  async completeHealthQuestionnaire(questionnaireId: number): Promise<HealthQuestionnaire> {
    const result = await db
      .update(healthQuestionnaires)
      .set({
        status: 'Completed',
        updatedAt: new Date()
      })
      .where(eq(healthQuestionnaires.id, questionnaireId))
      .returning();
    
    const hhq = result[0];
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: hhq.leadId,
      action: 'hhq_completed',
      details: `Health History Questionnaire completed`,
      userId: null
    });
    
    // Keep lead status as is when HHQ is completed (usually stays at "Booking: Paid/Booked")
    return hhq;
  }
}

export const storage = new DatabaseStorage();