// Workflow Builder Types
// This file defines the types for the visual workflow builder

import { Node, Edge } from 'reactflow';

// Core Workflow Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowNode extends Node {
  type: NodeType;
  data: NodeData;
}

export interface WorkflowEdge extends Edge {
  type: EdgeType;
  data?: EdgeData;
}

// Node Types
export enum NodeType {
  // Triggers (Start Points)
  TRIGGER_PORTAL_SIGNUP = 'trigger_portal_signup',
  TRIGGER_LEAD_CREATED = 'trigger_lead_created',
  TRIGGER_STATUS_CHANGED = 'trigger_status_changed',
  TRIGGER_HHQ_STATUS_CHANGED = 'trigger_hhq_status_changed',
  TRIGGER_SCHEDULE = 'trigger_schedule',
  TRIGGER_WEBHOOK = 'trigger_webhook',
  
  // Conditions (Decision Points)
  CONDITION_IF = 'condition_if',
  CONDITION_SWITCH = 'condition_switch',
  CONDITION_WAIT = 'condition_wait',
  
  // Actions (Tasks)
  ACTION_CREATE_LEAD = 'action_create_lead',
  ACTION_UPDATE_STATUS = 'action_update_status',
  ACTION_ASSIGN_USER = 'action_assign_user',
  ACTION_CREATE_TASK = 'action_create_task',
  ACTION_SEND_EMAIL = 'action_send_email',
  ACTION_SEND_SLACK = 'action_send_slack',
  ACTION_WEBHOOK = 'action_webhook',
  ACTION_DELAY = 'action_delay',
  
  // Utilities
  UTILITY_NOTE = 'utility_note',
  UTILITY_MERGE = 'utility_merge',
  UTILITY_SPLIT = 'utility_split'
}

// Edge Types
export enum EdgeType {
  DEFAULT = 'default',
  CONDITIONAL = 'conditional',
  ERROR = 'error',
  SUCCESS = 'success'
}

// Node Data Structures
export interface NodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  config: NodeConfig;
  isValid: boolean;
  errors?: string[];
}

export interface NodeConfig {
  // Trigger-specific config
  triggerEvent?: string;
  triggerConditions?: TriggerCondition[];
  
  // Condition-specific config
  conditionType?: ConditionType;
  conditionExpression?: string;
  conditionOperator?: ConditionOperator;
  conditionValue?: any;
  
  // Action-specific config
  actionType?: string;
  actionParameters?: Record<string, any>;
  
  // Delay-specific config
  delayDuration?: number;
  delayUnit?: DelayUnit;
  
  // General config
  enabled?: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export interface EdgeData {
  label?: string;
  condition?: string;
  weight?: number;
}

export interface WorkflowVariable {
  name: string;
  type: VariableType;
  defaultValue?: any;
  description?: string;
  isRequired: boolean;
}

// Enums
export enum ConditionType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
  CUSTOM = 'custom'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX_MATCH = 'regex_match'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export enum DelayUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days'
}

export enum VariableType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY = 'array',
  OBJECT = 'object'
}

// Workflow Execution Types
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  context: ExecutionContext;
  steps: ExecutionStep[];
  errors?: ExecutionError[];
}

export interface ExecutionContext {
  triggerData: Record<string, any>;
  variables: Record<string, any>;
  entityType: string;
  entityId: string;
  userId?: string;
}

export interface ExecutionStep {
  nodeId: string;
  status: StepStatus;
  startedAt: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  retryCount: number;
}

export interface ExecutionError {
  nodeId: string;
  message: string;
  stack?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// Node Categories for Palette
export interface NodeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  nodes: NodeTemplate[];
}

export interface NodeTemplate {
  type: NodeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: NodeConfig;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface NodePort {
  id: string;
  name: string;
  type: PortType;
  required: boolean;
  description?: string;
}

export enum PortType {
  TRIGGER = 'trigger',
  DATA = 'data',
  CONDITION = 'condition',
  ERROR = 'error'
}

// Workflow Builder State
export interface WorkflowBuilderState {
  workflow: WorkflowDefinition;
  selectedNodes: string[];
  selectedEdges: string[];
  clipboard: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  history: WorkflowDefinition[];
  historyIndex: number;
  isModified: boolean;
  isRunning: boolean;
  executionLogs: ExecutionStep[];
}

// UI Helper Types
export interface NodePaletteItem {
  category: string;
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface WorkflowTemplateItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  workflow: WorkflowDefinition;
}

// Integration Types
export interface StatusOption {
  value: string;
  label: string;
  color: string;
  entity: 'lead' | 'contact';
}

export interface UserOption {
  value: string;
  label: string;
  role: string;
  avatar?: string;
}

export interface SlackChannelOption {
  value: string;
  label: string;
  isPrivate: boolean;
}