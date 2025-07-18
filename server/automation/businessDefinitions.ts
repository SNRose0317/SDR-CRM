// Business-Focused Automation Definitions
// This file defines business-friendly components for the workflow builder

export interface BusinessUserType {
  id: string;
  name: string;
  description: string;
  systemEntity: 'user' | 'lead' | 'contact';
  availableStatuses: string[];
  defaultStatus: string;
  icon: string;
  color: string;
}

export interface BusinessStatus {
  id: string;
  name: string;
  category: 'lead' | 'contact' | 'task' | 'appointment';
  description: string;
  nextStatuses: string[];
  assignableRoles: string[];
  requiredActions?: string[];
  icon: string;
  color: string;
}

export interface BusinessRole {
  id: string;
  name: string;
  description: string;
  systemRole: 'sdr' | 'health_coach' | 'admin';
  responsibilities: string[];
  automationPermissions: string[];
  icon: string;
  color: string;
}

export interface BusinessAction {
  id: string;
  name: string;
  description: string;
  category: 'assignment' | 'notification' | 'task' | 'status' | 'external';
  requiredRoles: string[];
  parameters: BusinessActionParameter[];
  icon: string;
  color: string;
  executionType: 'immediate' | 'delayed' | 'scheduled';
}

export interface BusinessActionParameter {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'user_select' | 'status_select' | 'dropdown' | 'number' | 'date' | 'time';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string; }[];
}

export interface BusinessTrigger {
  id: string;
  name: string;
  description: string;
  category: 'status_change' | 'user_action' | 'time_based' | 'system_event';
  applicableUserTypes: string[];
  conditions: BusinessCondition[];
  icon: string;
  color: string;
}

export interface BusinessCondition {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list' | 'exists';
  valueType: 'static' | 'dynamic' | 'user_select';
  businessLabel: string;
}

export interface BusinessWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_management' | 'patient_journey' | 'task_automation' | 'notifications';
  targetRole: string;
  scenario: string;
  estimatedTime: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  workflow: {
    trigger: BusinessTrigger;
    actions: BusinessAction[];
    conditions: BusinessCondition[];
  };
  icon: string;
  color: string;
}

// Pre-defined business components
export const BUSINESS_USER_TYPES: BusinessUserType[] = [
  {
    id: 'portal_user',
    name: 'Portal User',
    description: 'New user signing up through patient portal',
    systemEntity: 'user',
    availableStatuses: ['new', 'verified', 'onboarding'],
    defaultStatus: 'new',
    icon: '👤',
    color: '#3b82f6'
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Potential customer in the sales pipeline',
    systemEntity: 'lead',
    availableStatuses: ['new', 'hhq_started', 'hhq_signed', 'booking_needs_scheduling', 'booking_paid_booked'],
    defaultStatus: 'new',
    icon: '🎯',
    color: '#f59e0b'
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Active customer in the healthcare journey',
    systemEntity: 'contact',
    availableStatuses: ['new', 'consultation_scheduled', 'consultation_completed', 'treatment_plan_created', 'active', 'completed'],
    defaultStatus: 'new',
    icon: '🏥',
    color: '#10b981'
  }
];

export const BUSINESS_STATUSES: BusinessStatus[] = [
  {
    id: 'new',
    name: 'New',
    category: 'lead',
    description: 'Brand new lead, needs initial contact',
    nextStatuses: ['hhq_started'],
    assignableRoles: ['sdr'],
    icon: '🆕',
    color: '#6b7280'
  },
  {
    id: 'hhq_started',
    name: 'HHQ Started',
    category: 'lead',
    description: 'Health questionnaire process has begun',
    nextStatuses: ['hhq_signed'],
    assignableRoles: ['sdr', 'health_coach'],
    requiredActions: ['assign_to_sdr', 'send_follow_up_task'],
    icon: '📋',
    color: '#3b82f6'
  },
  {
    id: 'hhq_signed',
    name: 'HHQ Signed',
    category: 'lead',
    description: 'Health questionnaire completed and signed',
    nextStatuses: ['booking_needs_scheduling'],
    assignableRoles: ['health_coach'],
    requiredActions: ['schedule_consultation'],
    icon: '✅',
    color: '#10b981'
  },
  {
    id: 'booking_needs_scheduling',
    name: 'Booking: Paid/Not Booked',
    category: 'lead',
    description: 'Ready to schedule initial consultation',
    nextStatuses: ['booking_paid_booked'],
    assignableRoles: ['health_coach'],
    icon: '📅',
    color: '#f59e0b'
  },
  {
    id: 'booking_paid_booked',
    name: 'Booking: Paid/Booked',
    category: 'lead',
    description: 'Consultation scheduled and paid for',
    nextStatuses: [],
    assignableRoles: ['health_coach'],
    icon: '💰',
    color: '#8b5cf6'
  }
];

export const BUSINESS_ROLES: BusinessRole[] = [
  {
    id: 'sdr',
    name: 'SDR (Sales Development Rep)',
    description: 'Responsible for lead qualification and initial contact',
    systemRole: 'sdr',
    responsibilities: ['Lead qualification', 'Initial contact', 'HHQ process management'],
    automationPermissions: ['assign_leads', 'create_tasks', 'send_notifications'],
    icon: '📞',
    color: '#3b82f6'
  },
  {
    id: 'health_coach',
    name: 'Health Coach',
    description: 'Provides healthcare guidance and manages patient journey',
    systemRole: 'health_coach',
    responsibilities: ['Patient consultation', 'Treatment planning', 'Ongoing support'],
    automationPermissions: ['schedule_appointments', 'manage_patient_journey', 'send_notifications'],
    icon: '🏥',
    color: '#10b981'
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'System administrator with full access',
    systemRole: 'admin',
    responsibilities: ['System management', 'User management', 'Workflow management'],
    automationPermissions: ['all'],
    icon: '⚙️',
    color: '#6b7280'
  }
];

export const BUSINESS_ACTIONS: BusinessAction[] = [
  {
    id: 'assign_to_sdr',
    name: 'Assign to SDR',
    description: 'Assign lead to next available SDR',
    category: 'assignment',
    requiredRoles: ['admin', 'sdr'],
    parameters: [
      {
        id: 'assignment_method',
        name: 'Assignment Method',
        description: 'How to select the SDR',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'next_available', label: 'Next Available' },
          { value: 'round_robin', label: 'Round Robin' },
          { value: 'specific_user', label: 'Specific User' }
        ]
      }
    ],
    icon: '👥',
    color: '#3b82f6',
    executionType: 'immediate'
  },
  {
    id: 'send_slack_notification',
    name: 'Send Slack Notification',
    description: 'Send notification to Slack channel',
    category: 'notification',
    requiredRoles: ['admin'],
    parameters: [
      {
        id: 'message',
        name: 'Message',
        description: 'Notification message',
        type: 'text',
        required: true,
        defaultValue: 'New lead assigned: {{lead.name}} - {{lead.email}}'
      },
      {
        id: 'channel',
        name: 'Channel',
        description: 'Slack channel to send to',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'general', label: 'General' },
          { value: 'leads', label: 'Leads' },
          { value: 'health-coaches', label: 'Health Coaches' }
        ]
      }
    ],
    icon: '💬',
    color: '#f59e0b',
    executionType: 'immediate'
  },
  {
    id: 'create_follow_up_task',
    name: 'Create Follow-up Task',
    description: 'Create a task for follow-up',
    category: 'task',
    requiredRoles: ['admin', 'sdr', 'health_coach'],
    parameters: [
      {
        id: 'task_title',
        name: 'Task Title',
        description: 'Title for the task',
        type: 'text',
        required: true,
        defaultValue: 'Follow up with {{lead.name}}'
      },
      {
        id: 'due_date',
        name: 'Due Date',
        description: 'When the task is due',
        type: 'date',
        required: true
      },
      {
        id: 'priority',
        name: 'Priority',
        description: 'Task priority level',
        type: 'dropdown',
        required: true,
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ]
      }
    ],
    icon: '✅',
    color: '#10b981',
    executionType: 'immediate'
  },
  {
    id: 'update_status',
    name: 'Update Status',
    description: 'Change the status of a lead or contact',
    category: 'status',
    requiredRoles: ['admin', 'sdr', 'health_coach'],
    parameters: [
      {
        id: 'new_status',
        name: 'New Status',
        description: 'Status to change to',
        type: 'status_select',
        required: true
      }
    ],
    icon: '🔄',
    color: '#8b5cf6',
    executionType: 'immediate'
  }
];

export const BUSINESS_TRIGGERS: BusinessTrigger[] = [
  {
    id: 'portal_signup',
    name: 'Portal User Signs Up',
    description: 'When a new user registers through the patient portal',
    category: 'user_action',
    applicableUserTypes: ['portal_user'],
    conditions: [
      {
        id: 'user_role',
        name: 'User Role',
        description: 'The role of the user',
        field: 'role',
        operator: 'equals',
        valueType: 'static',
        businessLabel: 'User role is Patient'
      }
    ],
    icon: '🚪',
    color: '#3b82f6'
  },
  {
    id: 'status_changed',
    name: 'Status Changed',
    description: 'When a lead or contact status changes',
    category: 'status_change',
    applicableUserTypes: ['lead', 'contact'],
    conditions: [
      {
        id: 'from_status',
        name: 'From Status',
        description: 'Previous status',
        field: 'previous_status',
        operator: 'equals',
        valueType: 'user_select',
        businessLabel: 'From status'
      },
      {
        id: 'to_status',
        name: 'To Status',
        description: 'New status',
        field: 'status',
        operator: 'equals',
        valueType: 'user_select',
        businessLabel: 'To status'
      }
    ],
    icon: '🔄',
    color: '#10b981'
  },
  {
    id: 'time_delay',
    name: 'Time Delay',
    description: 'After a specified amount of time',
    category: 'time_based',
    applicableUserTypes: ['lead', 'contact'],
    conditions: [
      {
        id: 'delay_amount',
        name: 'Delay Amount',
        description: 'Amount of time to wait',
        field: 'delay',
        operator: 'equals',
        valueType: 'user_select',
        businessLabel: 'Wait for'
      }
    ],
    icon: '⏱️',
    color: '#f59e0b'
  }
];

export const BUSINESS_WORKFLOW_TEMPLATES: BusinessWorkflowTemplate[] = [
  {
    id: 'portal_signup_to_lead',
    name: 'Portal Signup → Lead Creation',
    description: 'Convert portal signups to leads with SDR assignment',
    category: 'lead_management',
    targetRole: 'sdr',
    scenario: 'When someone signs up through the portal, create a lead and assign to SDR',
    estimatedTime: '2 minutes',
    complexity: 'simple',
    workflow: {
      trigger: BUSINESS_TRIGGERS[0], // portal_signup
      actions: [
        BUSINESS_ACTIONS[0], // assign_to_sdr
        BUSINESS_ACTIONS[1], // send_slack_notification
        BUSINESS_ACTIONS[2]  // create_follow_up_task
      ],
      conditions: []
    },
    icon: '🎯',
    color: '#3b82f6'
  },
  {
    id: 'hhq_started_workflow',
    name: 'HHQ Started → Follow-up',
    description: 'When HHQ is started, create follow-up tasks and notifications',
    category: 'lead_management',
    targetRole: 'sdr',
    scenario: 'When a lead reaches HHQ Started status, ensure proper follow-up',
    estimatedTime: '1 minute',
    complexity: 'simple',
    workflow: {
      trigger: BUSINESS_TRIGGERS[1], // status_changed
      actions: [
        BUSINESS_ACTIONS[1], // send_slack_notification
        BUSINESS_ACTIONS[2]  // create_follow_up_task
      ],
      conditions: []
    },
    icon: '📋',
    color: '#10b981'
  }
];