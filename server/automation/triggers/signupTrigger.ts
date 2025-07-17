import { storage } from "../storage";
import { TriggerEvent, AutomationRule } from "../types";
import { executeActions } from "../actions/actionExecutor";

/**
 * Signup Trigger: Automatically creates a lead when a new user signs up
 * 
 * Trigger: Portal signup completion
 * Conditions: User has valid email, phone, and state
 * Actions: Create lead record with user information
 */
export class SignupTrigger {
  private static instance: SignupTrigger;
  
  private constructor() {}
  
  static getInstance(): SignupTrigger {
    if (!SignupTrigger.instance) {
      SignupTrigger.instance = new SignupTrigger();
    }
    return SignupTrigger.instance;
  }

  /**
   * Processes a new user signup and creates a lead
   */
  async processSignup(signupData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    state: string;
    password: string;
  }): Promise<void> {
    try {
      // Create the automation rule for signup → lead conversion
      const signupRule: AutomationRule = {
        id: 'signup_to_lead',
        name: 'Convert Signup to Lead',
        object: 'User',
        trigger: {
          type: 'record_create',
          event: 'user_signup'
        },
        conditions: [
          {
            field: 'email',
            operator: 'not_empty',
            value: null
          },
          {
            field: 'phone',
            operator: 'not_empty', 
            value: null
          },
          {
            field: 'state',
            operator: 'not_empty',
            value: null
          }
        ],
        actions: [
          {
            type: 'create_lead',
            delay: 0,
            data: {
              firstName: signupData.firstName,
              lastName: signupData.lastName,
              email: signupData.email,
              phone: signupData.phone,
              state: signupData.state,
              status: 'New',
              source: 'Portal Signup',
              notes: `Lead created automatically from portal signup on ${new Date().toISOString()}`
            }
          },
          {
            type: 'create_activity_log',
            delay: 0,
            data: {
              entityType: 'lead',
              action: 'created',
              details: 'Lead created from portal signup'
            }
          }
        ]
      };

      // Execute the automation rule
      await this.executeRule(signupRule, signupData);
      
      console.log(`[SignupTrigger] Successfully processed signup for ${signupData.email}`);
      
    } catch (error) {
      console.error(`[SignupTrigger] Error processing signup for ${signupData.email}:`, error);
      throw error;
    }
  }

  /**
   * Executes the automation rule for signup conversion
   */
  private async executeRule(rule: AutomationRule, triggerData: any): Promise<void> {
    // Evaluate conditions
    const conditionsMet = await this.evaluateConditions(rule.conditions, triggerData);
    
    if (!conditionsMet) {
      console.log(`[SignupTrigger] Conditions not met for rule: ${rule.name}`);
      return;
    }

    // Execute actions in sequence
    for (const action of rule.actions) {
      await executeActions([action], triggerData);
    }
  }

  /**
   * Evaluates if all conditions are met
   */
  private async evaluateConditions(conditions: any[], data: any): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = data[condition.field];
      
      switch (condition.operator) {
        case 'not_empty':
          if (!fieldValue || fieldValue.trim() === '') {
            return false;
          }
          break;
        case 'equals':
          if (fieldValue !== condition.value) {
            return false;
          }
          break;
        case 'greater_than':
          if (Number(fieldValue) <= Number(condition.value)) {
            return false;
          }
          break;
        default:
          console.warn(`[SignupTrigger] Unknown condition operator: ${condition.operator}`);
          break;
      }
    }
    
    return true;
  }
}

export const signupTrigger = SignupTrigger.getInstance();