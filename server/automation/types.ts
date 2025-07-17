// Automation Framework Types
// This file defines the core types for the automation trigger system

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  eventType: string;
  isActive: boolean;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface TriggerAction {
  id: string;
  type: 'create_task' | 'send_email' | 'update_status' | 'assign_user' | 'create_notification' | 'webhook' | 'create_lead' | 'update_lead';
  parameters: Record<string, any>;
  delay?: number; // in minutes
  order: number;
}

export interface AutomationContext {
  triggerEvent: string;
  entityType: 'user' | 'lead' | 'contact' | 'task' | 'appointment';
  entityId: number;
  entityData: Record<string, any>;
  userId?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Event Types for Automation Triggers
export enum AutomationEventType {
  // User Events
  USER_SIGNUP = 'user.signup',
  USER_LOGIN = 'user.login',
  USER_PROFILE_UPDATE = 'user.profile_update',
  
  // Lead Events
  LEAD_CREATED = 'lead.created',
  LEAD_STATUS_CHANGED = 'lead.status_changed',
  LEAD_ASSIGNED = 'lead.assigned',
  LEAD_CONVERTED = 'lead.converted',
  
  // Contact Events
  CONTACT_CREATED = 'contact.created',
  CONTACT_STAGE_CHANGED = 'contact.stage_changed',
  CONTACT_ASSIGNED = 'contact.assigned',
  
  // Task Events
  TASK_CREATED = 'task.created',
  TASK_COMPLETED = 'task.completed',
  TASK_OVERDUE = 'task.overdue',
  
  // Appointment Events
  APPOINTMENT_SCHEDULED = 'appointment.scheduled',
  APPOINTMENT_COMPLETED = 'appointment.completed',
  APPOINTMENT_CANCELLED = 'appointment.cancelled',
  
  // Portal Events
  PORTAL_SIGNUP = 'portal.signup',
  PORTAL_LOGIN = 'portal.login',
  PORTAL_MESSAGE_SENT = 'portal.message_sent',
}

// Action Types for Automation Actions
export enum AutomationActionType {
  CREATE_TASK = 'create_task',
  SEND_EMAIL = 'send_email', 
  UPDATE_STATUS = 'update_status',
  ASSIGN_USER = 'assign_user',
  CREATE_NOTIFICATION = 'create_notification',
  WEBHOOK = 'webhook',
  CREATE_LEAD = 'create_lead',
  UPDATE_LEAD = 'update_lead',
  CREATE_CONTACT = 'create_contact',
  UPDATE_CONTACT = 'update_contact',
  SCHEDULE_APPOINTMENT = 'schedule_appointment',
  SEND_SMS = 'send_sms',
  LOG_ACTIVITY = 'log_activity'
}

export interface AutomationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Predefined Automation Templates
export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_management' | 'contact_nurturing' | 'task_automation' | 'portal_automation';
  trigger: Omit<AutomationTrigger, 'id' | 'createdAt' | 'updatedAt'>;
  isDefault: boolean;
}