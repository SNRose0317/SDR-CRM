// Automation Manager
// Central hub for managing automation triggers and execution

import { AutomationTrigger, AutomationEventType, AutomationContext, AutomationResult } from './types';
import { SignupTrigger } from './triggers/signupTrigger';

export class AutomationManager {
  private triggers: Map<string, AutomationTrigger> = new Map();
  private signupTrigger: SignupTrigger;

  constructor() {
    this.signupTrigger = new SignupTrigger();
    this.initializeDefaultTriggers();
  }

  // Initialize default automation triggers
  private initializeDefaultTriggers(): void {
    // Add portal signup trigger
    const defaultSignupTrigger = SignupTrigger.getDefaultTrigger();
    this.triggers.set(defaultSignupTrigger.id, defaultSignupTrigger);
    
    console.log('✅ Automation Manager initialized with default triggers');
  }

  // Execute automation for a specific event
  async executeAutomation(eventType: string, context: AutomationContext): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    
    try {
      // Find active triggers for this event type
      const activeTriggers = Array.from(this.triggers.values()).filter(
        trigger => trigger.eventType === eventType && trigger.isActive
      );

      if (activeTriggers.length === 0) {
        console.log(`No active triggers found for event: ${eventType}`);
        return results;
      }

      // Execute each trigger
      for (const trigger of activeTriggers) {
        console.log(`🔄 Executing automation trigger: ${trigger.name}`);
        
        let result: AutomationResult;
        
        // Route to appropriate trigger handler
        switch (eventType) {
          case AutomationEventType.PORTAL_SIGNUP:
            result = await this.signupTrigger.execute(context);
            break;
          
          default:
            result = {
              success: false,
              message: `No handler for event type: ${eventType}`,
              error: 'Unsupported event type'
            };
        }
        
        results.push(result);
        
        if (result.success) {
          console.log(`✅ Automation trigger completed: ${trigger.name}`);
        } else {
          console.error(`❌ Automation trigger failed: ${trigger.name}`, result.error);
        }
      }

      return results;
    } catch (error) {
      console.error('Automation execution error:', error);
      return [{
        success: false,
        message: 'Automation execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  // Get all registered triggers
  getAllTriggers(): AutomationTrigger[] {
    return Array.from(this.triggers.values());
  }

  // Get trigger by ID
  getTrigger(id: string): AutomationTrigger | undefined {
    return this.triggers.get(id);
  }

  // Add or update a trigger
  setTrigger(trigger: AutomationTrigger): void {
    this.triggers.set(trigger.id, trigger);
    console.log(`📝 Trigger updated: ${trigger.name}`);
  }

  // Remove a trigger
  removeTrigger(id: string): boolean {
    const removed = this.triggers.delete(id);
    if (removed) {
      console.log(`🗑️ Trigger removed: ${id}`);
    }
    return removed;
  }

  // Get all available templates
  getTemplates() {
    return {
      portalSignup: SignupTrigger.getTemplates(),
      // Add other trigger templates here as they're created
    };
  }

  // Helper method to trigger portal signup automation
  async triggerPortalSignup(userData: any, userId: number): Promise<AutomationResult[]> {
    const context: AutomationContext = {
      triggerEvent: AutomationEventType.PORTAL_SIGNUP,
      entityType: 'user',
      entityId: userId,
      entityData: userData,
      userId: userId,
      timestamp: new Date(),
      metadata: {}
    };

    return this.executeAutomation(AutomationEventType.PORTAL_SIGNUP, context);
  }

  // Helper method to trigger lead creation automation
  async triggerLeadCreated(leadData: any, leadId: number, userId?: number): Promise<AutomationResult[]> {
    const context: AutomationContext = {
      triggerEvent: AutomationEventType.LEAD_CREATED,
      entityType: 'lead',
      entityId: leadId,
      entityData: leadData,
      userId: userId,
      timestamp: new Date(),
      metadata: { leadId }
    };

    return this.executeAutomation(AutomationEventType.LEAD_CREATED, context);
  }

  // Get automation statistics
  getStats() {
    const triggers = Array.from(this.triggers.values());
    return {
      totalTriggers: triggers.length,
      activeTriggers: triggers.filter(t => t.isActive).length,
      inactiveTriggers: triggers.filter(t => !t.isActive).length,
      eventTypes: [...new Set(triggers.map(t => t.eventType))],
      triggersByEvent: triggers.reduce((acc, trigger) => {
        acc[trigger.eventType] = (acc[trigger.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const automationManager = new AutomationManager();