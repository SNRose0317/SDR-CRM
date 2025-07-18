// Portal Signup Automation Trigger
// This trigger handles automation when users sign up through the portal

import { AutomationTrigger, AutomationEventType, AutomationActionType, AutomationContext, AutomationResult } from '../types';
import { ActionExecutor } from '../actions/actionExecutor';
import { db } from '../../db';
import { leads, tasks, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class SignupTrigger {
  private actionExecutor: ActionExecutor;

  constructor() {
    this.actionExecutor = new ActionExecutor();
  }

  // Default automation trigger for portal signup
  static getDefaultTrigger(): AutomationTrigger {
    return {
      id: 'portal-signup-default',
      name: 'Portal Signup - Create Lead',
      description: 'Automatically creates a lead when a new user signs up through the portal',
      eventType: AutomationEventType.PORTAL_SIGNUP,
      isActive: true,
      conditions: [
        {
          id: 'signup-condition-1',
          field: 'role',
          operator: 'equals',
          value: 'Lead'
        }
      ],
      actions: [

        {
          id: 'signup-action-2',
          type: AutomationActionType.CREATE_TASK,
          parameters: {
            title: 'Follow up with new portal signup',
            description: 'Contact new lead from portal signup within 24 hours',
            priority: 'high',
            status: 'todo',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          },
          order: 1
        },
        {
          id: 'signup-action-3',
          type: AutomationActionType.LOG_ACTIVITY,
          parameters: {
            action: 'portal_signup_automation',
            details: 'Portal signup automation triggered - lead and task created'
          },
          order: 2
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Execute the signup automation
  async execute(context: AutomationContext): Promise<AutomationResult> {
    try {
      const trigger = SignupTrigger.getDefaultTrigger();
      
      // Check if conditions are met
      if (!this.evaluateConditions(trigger.conditions, context)) {
        return {
          success: false,
          message: 'Signup trigger conditions not met',
          error: 'Conditions not satisfied'
        };
      }

      // Execute actions in order
      const results = [];
      for (const action of trigger.actions) {
        const result = await this.actionExecutor.execute(action, context);
        results.push(result);
        
        if (!result.success) {
          console.error(`Action ${action.id} failed:`, result.error);
          // Continue with other actions even if one fails
        }
      }

      return {
        success: true,
        message: 'Signup automation completed successfully',
        data: { actionResults: results }
      };

    } catch (error) {
      console.error('Signup trigger execution error:', error);
      return {
        success: false,
        message: 'Signup automation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Evaluate trigger conditions
  private evaluateConditions(conditions: any[], context: AutomationContext): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    for (const condition of conditions) {
      const fieldValue = context.entityData[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'not_equals':
          if (fieldValue === condition.value) return false;
          break;
        case 'contains':
          if (!fieldValue || !fieldValue.includes(condition.value)) return false;
          break;
        case 'exists':
          if (!fieldValue) return false;
          break;
        case 'not_exists':
          if (fieldValue) return false;
          break;
        default:
          return false;
      }
    }
    
    return true;
  }

  // Get predefined templates for signup automation
  static getTemplates() {
    return [
      {
        id: 'portal-signup-basic',
        name: 'Basic Portal Signup',
        description: 'Creates lead and follow-up task for new portal signups',
        category: 'portal_automation' as const,
        trigger: SignupTrigger.getDefaultTrigger(),
        isDefault: true
      },
      {
        id: 'portal-signup-advanced',
        name: 'Advanced Portal Signup',
        description: 'Creates lead, assigns to SDR, creates welcome task, and sends notification',
        category: 'portal_automation' as const,
        trigger: {
          ...SignupTrigger.getDefaultTrigger(),
          name: 'Advanced Portal Signup Automation',
          actions: [
            ...SignupTrigger.getDefaultTrigger().actions,
            {
              id: 'signup-action-4',
              type: AutomationActionType.ASSIGN_USER,
              parameters: {
                assignToRole: 'SDR',
                assignmentType: 'round_robin'
              },
              order: 4
            },
            {
              id: 'signup-action-5',
              type: AutomationActionType.CREATE_NOTIFICATION,
              parameters: {
                title: 'New Portal Signup',
                message: 'New user has signed up through the portal',
                type: 'info',
                targetRole: 'SDR'
              },
              order: 5
            }
          ]
        },
        isDefault: false
      }
    ];
  }
}