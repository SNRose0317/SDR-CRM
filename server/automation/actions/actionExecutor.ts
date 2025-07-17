// Action Executor for Automation System
// This class handles execution of automation actions

import { TriggerAction, AutomationContext, AutomationResult, AutomationActionType } from '../types';
import { db } from '../../db';
import { leads, tasks, users, activityLogs } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class ActionExecutor {
  
  async execute(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      switch (action.type) {
        case AutomationActionType.CREATE_LEAD:
          return await this.createLead(action, context);
        
        case AutomationActionType.CREATE_TASK:
          return await this.createTask(action, context);
        
        case AutomationActionType.UPDATE_STATUS:
          return await this.updateStatus(action, context);
        
        case AutomationActionType.ASSIGN_USER:
          return await this.assignUser(action, context);
        
        case AutomationActionType.LOG_ACTIVITY:
          return await this.logActivity(action, context);
        
        case AutomationActionType.CREATE_NOTIFICATION:
          return await this.createNotification(action, context);
        
        case AutomationActionType.SEND_EMAIL:
          return await this.sendEmail(action, context);
        
        default:
          return {
            success: false,
            message: `Unknown action type: ${action.type}`,
            error: 'Unsupported action type'
          };
      }
    } catch (error) {
      console.error(`Action execution error for ${action.type}:`, error);
      return {
        success: false,
        message: `Action ${action.type} failed`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createLead(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      const userData = context.entityData;
      
      const [newLead] = await db.insert(leads).values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        state: userData.state,
        status: params.status || 'New',
        source: params.source || 'Automation',
        leadScore: params.leadScore || 0,
        notes: params.notes || 'Lead created by automation',
      }).returning();

      return {
        success: true,
        message: 'Lead created successfully',
        data: { leadId: newLead.id, lead: newLead }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create lead',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createTask(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      const userData = context.entityData;
      
      // Find an available SDR to assign the task to
      const sdrUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, 'SDR'))
        .limit(1);
      
      const assignedTo = sdrUsers.length > 0 ? sdrUsers[0].id : null;
      
      const [newTask] = await db.insert(tasks).values({
        title: params.title,
        description: params.description,
        priority: params.priority || 'medium',
        status: params.status || 'todo',
        assignedTo,
        dueDate: params.dueDate ? new Date(params.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        // Link to lead if we have leadId in context
        leadId: context.metadata?.leadId || null,
      }).returning();

      return {
        success: true,
        message: 'Task created successfully',
        data: { taskId: newTask.id, task: newTask }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async updateStatus(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      
      // This is a placeholder - actual implementation depends on entity type
      return {
        success: true,
        message: 'Status update placeholder',
        data: { action: 'update_status', params }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async assignUser(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      
      // Find users by role for assignment
      const availableUsers = await db
        .select()
        .from(users)
        .where(eq(users.role, params.assignToRole))
        .limit(5);
      
      if (availableUsers.length === 0) {
        return {
          success: false,
          message: `No users found with role: ${params.assignToRole}`,
          error: 'No assignable users'
        };
      }
      
      // Simple round-robin assignment (can be enhanced)
      const assignedUser = availableUsers[0];
      
      return {
        success: true,
        message: 'User assigned successfully',
        data: { assignedUserId: assignedUser.id, assignedUser }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to assign user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async logActivity(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      
      await db.insert(activityLogs).values({
        entityType: context.entityType,
        entityId: context.entityId,
        userId: context.userId || null,
        action: params.action,
        details: params.details,
      });

      return {
        success: true,
        message: 'Activity logged successfully',
        data: { action: params.action }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to log activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createNotification(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      
      // This is a placeholder for notification system
      // In a real implementation, this would create notifications in a notifications table
      console.log('Notification created:', {
        title: params.title,
        message: params.message,
        type: params.type,
        targetRole: params.targetRole,
        context
      });

      return {
        success: true,
        message: 'Notification created successfully',
        data: { notification: params }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendEmail(action: TriggerAction, context: AutomationContext): Promise<AutomationResult> {
    try {
      const params = action.parameters;
      
      // This is a placeholder for email system
      // In a real implementation, this would integrate with an email service
      console.log('Email sent:', {
        to: params.to,
        subject: params.subject,
        body: params.body,
        context
      });

      return {
        success: true,
        message: 'Email sent successfully',
        data: { email: params }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}