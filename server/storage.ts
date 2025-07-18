import {
  users,
  leads,
  contacts,
  tasks,
  appointments,
  activityLogs,
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
  type InsertActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Lead operations
  getLeads(filters?: any): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  getLeadStats(): Promise<any>;
  
  // Lead claiming operations
  claimLead(leadId: number, userId: number): Promise<any>;
  getAvailableLeads(userId: number): Promise<Lead[]>;
  
  // Contact operations
  getContacts(filters?: any): Promise<Contact[]>;
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
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
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
      userId: taskData.assignedTo
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
      userId: taskData.assignedTo || null
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

  // Lead claiming operations
  async claimLead(leadId: number, userId: number): Promise<any> {
    // Get the lead and user info
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if lead is already claimed
    if (lead.poolStatus === 'claimed') {
      throw new Error('Lead is already claimed');
    }

    // Check if user has permission to claim this lead
    const canClaim = await this.canUserClaimLead(user.role, lead.poolEnteredAt);
    if (!canClaim.allowed) {
      throw new Error(canClaim.reason || 'Cannot claim this lead');
    }

    // Claim the lead
    const [updatedLead] = await db.update(leads)
      .set({
        ownerId: userId,
        poolStatus: 'claimed',
        claimedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(leads.id, leadId))
      .returning();

    // Log the activity
    await this.createActivityLog({
      entityType: 'lead',
      entityId: leadId,
      userId: userId,
      action: 'lead_claimed',
      details: `Lead claimed by ${user.firstName} ${user.lastName} (${user.role})`,
    });

    return {
      success: true,
      message: 'Lead claimed successfully',
      data: { lead: updatedLead }
    };
  }

  async getAvailableLeads(userId: number): Promise<Lead[]> {
    // Get user info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error('User not found');
    }

    let availableLeads: Lead[];

    if (user.role === 'SDR') {
      // SDRs can see all open leads
      availableLeads = await db.select().from(leads)
        .where(eq(leads.poolStatus, 'open'))
        .orderBy(desc(leads.poolEnteredAt));
    } else if (user.role === 'health_coach') {
      // Health Coaches can see leads that are:
      // 1. Open and older than 24 hours
      // 2. Available to health coaches
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      availableLeads = await db.select().from(leads)
        .where(
          or(
            and(
              eq(leads.poolStatus, 'open'),
              sql`${leads.poolEnteredAt} < ${twentyFourHoursAgo}`
            ),
            eq(leads.poolStatus, 'available_to_health_coaches')
          )
        )
        .orderBy(desc(leads.poolEnteredAt));
    } else {
      throw new Error('User role not authorized to claim leads');
    }

    return availableLeads;
  }

  // Helper function to check if a user can claim a lead
  private async canUserClaimLead(userRole: string, leadEnteredAt: Date | null): Promise<{allowed: boolean, reason?: string}> {
    if (!leadEnteredAt) {
      return { allowed: false, reason: 'Lead has no entry date' };
    }

    const now = new Date();
    const hoursElapsed = (now.getTime() - leadEnteredAt.getTime()) / (1000 * 60 * 60);

    if (userRole === 'SDR') {
      // SDRs can claim leads anytime
      return { allowed: true };
    } else if (userRole === 'health_coach') {
      // Health Coaches can only claim leads after 24 hours
      if (hoursElapsed >= 24) {
        return { allowed: true };
      } else {
        return { 
          allowed: false, 
          reason: `Lead is still in SDR claiming period. ${Math.ceil(24 - hoursElapsed)} hours remaining.` 
        };
      }
    } else {
      return { allowed: false, reason: 'User role not authorized to claim leads' };
    }
  }
}

export const storage = new DatabaseStorage();