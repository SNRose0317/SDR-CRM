import {
  users,
  leads,
  contacts,
  tasks,
  appointments,
  activityLogs,
  healthQuestionnaires,
  persons,
  callSessions,
  dialerQueues,
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
  type InsertHealthQuestionnaire,
  type Person,
  type InsertPerson,
  generatePersonId
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
  getMyLeads(userId: number, userRole: UserRole): Promise<Lead[]>;
  getOpenLeads(userId: number, userRole: UserRole): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  getLeadStats(): Promise<any>;
  trackPhoneCall(id: number): Promise<Lead>;
  
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
  
  // Lead to Contact conversion
  convertLeadToContact(leadId: number, healthCoachId: number): Promise<Contact>;
  
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

  // Person operations (unified lead/contact system)
  getPersons(filters?: any): Promise<Person[]>;
  getPerson(personId: string): Promise<Person | undefined>;
  getPersonById(id: number): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(personId: string, person: Partial<InsertPerson>): Promise<Person>;
  deletePerson(personId: string): Promise<void>;
  convertPersonToContact(personId: string, healthCoachId: number): Promise<Person>;
  getPersonByEmail(email: string): Promise<Person | undefined>;
  getLeadPersons(filters?: any): Promise<Person[]>;
  getContactPersons(filters?: any): Promise<Person[]>;
  getPersonAppointments(personId: string): Promise<Appointment[]>;
  getPersonTasks(personId: string): Promise<Task[]>;
  getPersonHealthQuestionnaire(personId: string): Promise<HealthQuestionnaire | undefined>;

  // Call session operations (for phone dialer)
  createCallSession(session: any): Promise<any>;
  getCallSessions(leadId?: number, userId?: number): Promise<any[]>;
  
  // Dialer queue operations
  createDialerQueue(queue: any): Promise<any>;
  getDialerQueue(userId: number): Promise<any | undefined>;
  updateDialerQueue(id: number, queue: any): Promise<any>;
  deleteDialerQueue(id: number): Promise<void>;
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
    if (filters?.leadSource) {
      conditions.push(eq(leads.leadSource, filters.leadSource));
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

  async trackPhoneCall(id: number): Promise<Lead> {
    // Get current lead to increment call count
    const currentLead = await this.getLead(id);
    if (!currentLead) {
      throw new Error('Lead not found');
    }

    const newCallCount = (currentLead.numberOfCalls || 0) + 1;
    
    const result = await db
      .update(leads)
      .set({ 
        numberOfCalls: newCallCount,
        lastContacted: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(leads.id, id))
      .returning();
    
    // Log activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: id,
      action: 'called',
      details: `Phone call logged. Total calls: ${newCallCount}`,
      userId: null
    });
    
    return result[0];
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
    if (filters?.userId) {
      conditions.push(eq(appointments.userId, filters.userId));
    }
    if (filters?.leadId) {
      conditions.push(eq(appointments.leadId, filters.leadId));
    }
    if (filters?.contactId) {
      conditions.push(eq(appointments.contactId, filters.contactId));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(appointments).where(and(...conditions)).orderBy(desc(appointments.scheduledAt));
    }
    
    return await db.select().from(appointments).orderBy(desc(appointments.scheduledAt));
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
      userId: appointmentData.userId
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
      userId: appointmentData.userId || null
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

  // Get "My Leads" - leads assigned to the current user
  async getMyLeads(userId: number, userRole: UserRole): Promise<Lead[]> {
    const allLeads = await db.select().from(leads).where(eq(leads.ownerId, userId)).orderBy(desc(leads.createdAt));
    
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

  // Get "Open Leads" - unassigned leads with health coach 24-hour filtering
  async getOpenLeads(userId: number, userRole: UserRole): Promise<Lead[]> {
    const allUnassignedLeads = await db.select().from(leads).where(isNull(leads.ownerId)).orderBy(desc(leads.createdAt));
    
    // Filter leads based on rule engine permissions and health coach 24-hour rule
    const filteredLeads = [];
    for (const lead of allUnassignedLeads) {
      // Check rule-based permissions first
      const rulePermissions = await ruleEngine.evaluateUserAccess('lead', lead.id, userId);
      if (rulePermissions.canRead) {
        filteredLeads.push(lead);
        continue;
      }
      
      // Fallback to default permissions - this is where the health coach 24-hour rule is applied
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
    
    // Get the appointment to find the health coach
    const appointment = await this.getAppointment(appointmentId);
    if (!appointment || !appointment.userId) {
      throw new Error('Appointment or health coach not found');
    }

    // Use person-based conversion if person_id exists, otherwise fallback to old system
    if (hhq.personId) {
      // NEW SYSTEM: Salesforce-style conversion using person_id
      const person = await this.getPerson(hhq.personId);
      if (person && person.lifecycleStage === 'lead') {
        // Convert person from lead to contact
        const convertedPerson = await this.convertPersonToContact(hhq.personId, appointment.userId);
        
        // Update person lead status to indicate conversion completion
        await this.updatePerson(hhq.personId, {
          leadStatus: 'Booking: Paid/Booked'
        });
        
        // Log the conversion
        await this.createActivityLog({
          entityType: 'person',
          entityId: person.id,
          action: 'converted_to_contact',
          details: `Person ${hhq.personId} converted from lead to contact after HHQ completion`,
          userId: appointment.userId
        });
      }
    } else if (hhq.leadId) {
      // OLD SYSTEM: Fallback for legacy data
      await this.updateLead(hhq.leadId, {
        status: 'Booking: Paid/Booked'
      });
      
      const contact = await this.convertLeadToContact(hhq.leadId, appointment.userId);
      
      await this.createActivityLog({
        entityType: 'contact',
        entityId: contact.id,
        action: 'converted_from_lead',
        details: `Lead LD-${hhq.leadId} converted to contact after HHQ completion`,
        userId: appointment.userId
      });
    }
    
    return hhq;
  }

  // Reset HHQ and sync lead status
  async resetHealthQuestionnaire(leadId: number): Promise<void> {
    // Get the HHQ record to check if it has person_id
    const hhq = await db.select().from(healthQuestionnaires)
      .where(eq(healthQuestionnaires.leadId, leadId));
    
    if (hhq.length > 0 && hhq[0].personId) {
      // NEW SYSTEM: Reset person-based HHQ
      await db.delete(healthQuestionnaires)
        .where(eq(healthQuestionnaires.personId, hhq[0].personId));
      
      // Reset person lead status back to New
      await this.updatePerson(hhq[0].personId, {
        leadStatus: 'New'
      });
      
      // Log activity
      const person = await this.getPerson(hhq[0].personId);
      if (person) {
        await this.createActivityLog({
          entityType: 'person',
          entityId: person.id,
          action: 'hhq_reset',
          details: `Health History Questionnaire reset for ${hhq[0].personId}`,
          userId: null
        });
      }
    } else {
      // OLD SYSTEM: Fallback for legacy data
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
    
    // Log activity using person_id if available, fallback to lead_id
    if (hhq.personId) {
      const person = await this.getPerson(hhq.personId);
      if (person) {
        await this.createActivityLog({
          entityType: 'person',
          entityId: person.id,
          action: 'hhq_completed',
          details: `Health History Questionnaire completed for ${hhq.personId}`,
          userId: null
        });
      }
    } else if (hhq.leadId) {
      await this.createActivityLog({
        entityType: 'lead',
        entityId: hhq.leadId,
        action: 'hhq_completed',
        details: `Health History Questionnaire completed`,
        userId: null
      });
    }
    
    return hhq;
  }

  // Convert lead to contact when HHQ reaches "Booking: Paid/Booked"
  async convertLeadToContact(leadId: number, healthCoachId: number): Promise<Contact> {
    // Get the lead data
    const lead = await this.getLead(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Create contact from lead data
    const contact = await this.createContact({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      stage: 'Intake', // First contact status
      healthCoachId: healthCoachId,
      leadId: leadId,
      ownerId: healthCoachId, // Health coach becomes the owner
      notes: lead.notes,
      passwordHash: lead.passwordHash,
      portalAccess: lead.portalAccess,
      lastPortalLogin: lead.lastPortalLogin,
    });

    // Update all appointments to reference the new contact instead of lead
    await db
      .update(appointments)
      .set({
        contactId: contact.id,
        leadId: null,
        updatedAt: new Date()
      })
      .where(eq(appointments.leadId, leadId));

    // Update all tasks to reference the new contact instead of lead
    await db
      .update(tasks)
      .set({
        contactId: contact.id,
        leadId: null,
        updatedAt: new Date()
      })
      .where(eq(tasks.leadId, leadId));

    // Log the conversion activity
    await this.createActivityLog({
      entityType: 'contact',
      entityId: contact.id,
      action: 'lead_converted',
      details: `Lead LD-${leadId} converted to contact by Health Coach ${healthCoachId}`,
      userId: healthCoachId
    });

    // Log activity on the lead side as well
    await this.createActivityLog({
      entityType: 'lead',
      entityId: leadId,
      action: 'converted_to_contact',
      details: `Lead converted to contact CT-${contact.id}`,
      userId: healthCoachId
    });

    // Mark lead as converted (soft delete approach)
    await db
      .update(leads)
      .set({
        status: 'Converted',
        updatedAt: new Date()
      })
      .where(eq(leads.id, leadId));

    return contact;
  }

  // Person operations (unified lead/contact system)
  async getPersons(filters?: any): Promise<Person[]> {
    const conditions = [];
    
    if (filters?.lifecycleStage) {
      conditions.push(eq(persons.lifecycleStage, filters.lifecycleStage));
    }
    if (filters?.leadStatus) {
      conditions.push(eq(persons.leadStatus, filters.leadStatus));
    }
    if (filters?.contactStage) {
      conditions.push(eq(persons.contactStage, filters.contactStage));
    }
    if (filters?.ownerId) {
      conditions.push(eq(persons.ownerId, filters.ownerId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(persons.firstName, `%${filters.search}%`),
          like(persons.lastName, `%${filters.search}%`),
          like(persons.email, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(persons).where(and(...conditions)).orderBy(desc(persons.createdAt));
    }
    
    return await db.select().from(persons).orderBy(desc(persons.createdAt));
  }

  async getPerson(personId: string): Promise<Person | undefined> {
    const result = await db.select().from(persons).where(eq(persons.personId, personId));
    return result[0] || undefined;
  }

  async getPersonById(id: number): Promise<Person | undefined> {
    const result = await db.select().from(persons).where(eq(persons.id, id));
    return result[0] || undefined;
  }

  async createPerson(personData: InsertPerson): Promise<Person> {
    // Generate MH-1234 format person ID
    const tempResult = await db.insert(persons).values({
      ...personData,
      personId: 'TEMP' // Temporary value, will be updated
    }).returning();
    
    const person = tempResult[0];
    const mhId = generatePersonId(person.id);
    
    // Update with proper MH-1234 format
    const [updatedPerson] = await db
      .update(persons)
      .set({ personId: mhId })
      .where(eq(persons.id, person.id))
      .returning();
    
    return updatedPerson;
  }

  async updatePerson(personId: string, personData: Partial<InsertPerson>): Promise<Person> {
    const result = await db
      .update(persons)
      .set({ ...personData, updatedAt: new Date() })
      .where(eq(persons.personId, personId))
      .returning();
    return result[0];
  }

  async deletePerson(personId: string): Promise<void> {
    await db.delete(persons).where(eq(persons.personId, personId));
  }

  async convertPersonToContact(personId: string, healthCoachId: number): Promise<Person> {
    const person = await this.getPerson(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    if (person.lifecycleStage === 'contact') {
      throw new Error('Person is already a contact');
    }

    // Convert to contact
    const updatedPerson = await this.updatePerson(personId, {
      lifecycleStage: 'contact',
      contactStage: 'Intake',
      healthCoachId: healthCoachId,
      ownerId: healthCoachId,
      convertedAt: new Date()
    });

    // Log the conversion activity
    await this.createActivityLog({
      entityType: 'person',
      entityId: person.id,
      action: 'converted_to_contact',
      details: `Person ${personId} converted from lead to contact`,
      userId: healthCoachId
    });

    return updatedPerson;
  }

  async getPersonByEmail(email: string): Promise<Person | undefined> {
    const result = await db.select().from(persons).where(eq(persons.email, email));
    return result[0] || undefined;
  }

  async getLeadPersons(filters?: any): Promise<Person[]> {
    return await this.getPersons({ ...filters, lifecycleStage: 'lead' });
  }

  async getContactPersons(filters?: any): Promise<Person[]> {
    return await this.getPersons({ ...filters, lifecycleStage: 'contact' });
  }

  async getPersonAppointments(personId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.personId, personId))
      .orderBy(desc(appointments.scheduledAt));
  }

  async getPersonTasks(personId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.personId, personId))
      .orderBy(desc(tasks.createdAt));
  }

  async getPersonHealthQuestionnaire(personId: string): Promise<HealthQuestionnaire | undefined> {
    const result = await db.select().from(healthQuestionnaires)
      .where(eq(healthQuestionnaires.personId, personId));
    return result[0] || undefined;
  }

  // Call session operations (for phone dialer)
  async createCallSession(sessionData: any): Promise<any> {
    const result = await db.insert(callSessions).values(sessionData).returning();
    return result[0];
  }

  async getCallSessions(leadId?: number, userId?: number): Promise<any[]> {
    const conditions = [];
    
    if (leadId) {
      conditions.push(eq(callSessions.leadId, leadId));
    }
    if (userId) {
      conditions.push(eq(callSessions.userId, userId));
    }
    
    const query = db
      .select({
        id: callSessions.id,
        leadId: callSessions.leadId,
        userId: callSessions.userId,
        startTime: callSessions.startTime,
        endTime: callSessions.endTime,
        duration: callSessions.duration,
        callOutcome: callSessions.callOutcome,
        notes: callSessions.notes,
        nextAction: callSessions.nextAction,
        createdAt: callSessions.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(callSessions)
      .leftJoin(users, eq(callSessions.userId, users.id))
      .orderBy(desc(callSessions.startTime));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }
  
  // Dialer queue operations
  async createDialerQueue(queueData: any): Promise<any> {
    const result = await db.insert(dialerQueues).values(queueData).returning();
    return result[0];
  }

  async getDialerQueue(userId: number): Promise<any | undefined> {
    const result = await db.select().from(dialerQueues)
      .where(and(eq(dialerQueues.userId, userId), eq(dialerQueues.status, 'active')))
      .orderBy(desc(dialerQueues.createdAt));
    return result[0] || undefined;
  }

  async updateDialerQueue(id: number, queueData: any): Promise<any> {
    const result = await db
      .update(dialerQueues)
      .set({ ...queueData, updatedAt: new Date() })
      .where(eq(dialerQueues.id, id))
      .returning();
    return result[0];
  }

  async deleteDialerQueue(id: number): Promise<void> {
    await db.delete(dialerQueues).where(eq(dialerQueues.id, id));
  }
}

export const storage = new DatabaseStorage();