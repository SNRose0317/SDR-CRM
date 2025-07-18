import { AutomationTrigger, AutomationEventType, TriggerAction } from "../types";

export class LeadClaimingTrigger implements AutomationTrigger {
  id = "lead-claiming-workflow";
  name = "Lead Claiming Workflow";
  description = "Manages the 24-hour SDR claiming window, then opens leads to Health Coaches";
  eventType = AutomationEventType.LEAD_CREATED;
  isActive = true;
  conditions = [];
  actions: TriggerAction[] = [
    {
      id: "log-lead-entry",
      type: "create_notification",
      parameters: {
        message: "New lead entered the claiming pool",
        type: "info"
      },
      order: 1
    },
    {
      id: "wait-24-hours",
      type: "update_pool_status",
      parameters: {
        poolStatus: "available_to_health_coaches",
        delay: 24 * 60 // 24 hours in minutes
      },
      delay: 24 * 60, // 24 hours in minutes
      order: 2
    }
  ];
  createdAt = new Date();
  updatedAt = new Date();

  async shouldTrigger(context: any): Promise<boolean> {
    // Only trigger for newly created leads
    return context.entityType === 'lead' && context.triggerEvent === AutomationEventType.LEAD_CREATED;
  }

  async execute(context: any): Promise<void> {
    console.log(`🚀 Lead Claiming Workflow triggered for lead ${context.entityId}`);
    
    // Schedule the 24-hour timer to open lead to Health Coaches
    setTimeout(async () => {
      console.log(`⏰ 24-hour timer expired for lead ${context.entityId}, opening to Health Coaches`);
      // This would be handled by the ActionExecutor in a real implementation
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }
}