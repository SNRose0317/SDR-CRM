import React, { useState } from 'react';
import { NodeType, NodeCategory } from './types';
import { cn } from '@/lib/utils';

interface NodePaletteProps {
  className?: string;
  userRole?: string;
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'triggers',
    name: 'When This Happens',
    icon: '🚀',
    color: '#10b981',
    nodes: [
      {
        type: NodeType.TRIGGER_PORTAL_SIGNUP,
        name: 'Portal User Signs Up',
        description: 'When a new user registers through the patient portal',
        icon: '🚪',
        color: '#10b981',
        defaultConfig: { triggerEvent: 'portal.signup' },
        inputs: [],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.TRIGGER_LEAD_CREATED,
        name: 'New Lead Added',
        description: 'When a new lead is added to the system',
        icon: '👤',
        color: '#10b981',
        defaultConfig: { triggerEvent: 'lead.created' },
        inputs: [],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.TRIGGER_STATUS_CHANGED,
        name: 'Lead Status Changes',
        description: 'When a lead moves to a different stage in the process',
        icon: '🔄',
        color: '#10b981',
        defaultConfig: { triggerEvent: 'status.changed' },
        inputs: [],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
    ],
  },
  {
    id: 'actions',
    name: 'Then Do This',
    icon: '⚡',
    color: '#3b82f6',
    nodes: [
      {
        type: NodeType.ACTION_CREATE_LEAD,
        name: 'Add New Lead',
        description: 'Create a new lead record in the system',
        icon: '➕',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { status: 'New' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_UPDATE_STATUS,
        name: 'Change Lead Status',
        description: 'Move lead to a different stage (New, HHQ Started, etc.)',
        icon: '📝',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { status: 'HHQ Started' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_ASSIGN_USER,
        name: 'Assign to Team Member',
        description: 'Assign lead to SDR, Health Coach, or other team member',
        icon: '👥',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { assignToRole: 'SDR' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_CREATE_TASK,
        name: 'Create Follow-up Task',
        description: 'Create a task for team member to follow up on',
        icon: '✅',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { title: 'Follow up with lead', priority: 'medium' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_SEND_EMAIL,
        name: 'Send Email Notification',
        description: 'Send email to team member or patient',
        icon: '📧',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { template: 'default' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_SEND_SLACK,
        name: 'Notify Team on Slack',
        description: 'Send notification to team Slack channel',
        icon: '💬',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { channel: 'general' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
    ],
  },
  {
    id: 'conditions',
    name: 'Only If This is True',
    icon: '🔀',
    color: '#f59e0b',
    nodes: [
      {
        type: NodeType.CONDITION_IF,
        name: 'Check If...',
        description: 'Only continue if specific condition is met',
        icon: '❓',
        color: '#f59e0b',
        defaultConfig: { conditionType: 'simple' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [
          { id: 'true', name: 'Yes', type: 'condition' as const, required: true },
          { id: 'false', name: 'No', type: 'condition' as const, required: true },
        ],
      },
      {
        type: NodeType.CONDITION_SWITCH,
        name: 'Choose Based On...',
        description: 'Different actions based on lead status or other criteria',
        icon: '🔀',
        color: '#f59e0b',
        defaultConfig: { conditionType: 'switch' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [
          { id: 'case1', name: 'Option 1', type: 'condition' as const, required: true },
          { id: 'case2', name: 'Option 2', type: 'condition' as const, required: true },
          { id: 'default', name: 'Otherwise', type: 'condition' as const, required: true },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Wait and Notes',
    icon: '🛠️',
    color: '#8b5cf6',
    nodes: [
      {
        type: NodeType.ACTION_DELAY,
        name: 'Wait Before Next Action',
        description: 'Wait specific time before continuing (minutes, hours, days)',
        icon: '⏱️',
        color: '#8b5cf6',
        defaultConfig: { delayDuration: 5, delayUnit: 'minutes' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.UTILITY_NOTE,
        name: 'Add Note',
        description: 'Add documentation or reminder note to your workflow',
        icon: '📄',
        color: '#6b7280',
        defaultConfig: { note: 'Add your note here' },
        inputs: [],
        outputs: [],
      },
    ],
  },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ className }) => {
  const [expandedCategory, setExpandedCategory] = useState<string>('triggers');

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? '' : categoryId);
  };

  return (
    <div className={cn('bg-background overflow-y-auto', className)}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Workflow Nodes
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag and drop nodes to create your workflow
        </p>
      </div>

      <div className="space-y-2 p-4">
        {nodeCategories.map((category) => (
          <div key={category.id} className="border border-border rounded-lg">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-foreground">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({category.nodes.length})
                </span>
              </div>
              <div className="text-muted-foreground">
                {expandedCategory === category.id ? '▼' : '▶'}
              </div>
            </button>

            {expandedCategory === category.id && (
              <div className="border-t border-border bg-muted/50">
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="flex items-center p-3 cursor-move hover:bg-muted border-b border-border last:border-b-0 transition-colors bg-background"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md mr-3"
                         style={{ backgroundColor: node.color + '20', color: node.color }}>
                      <span className="text-sm">{node.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {node.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {node.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>💡 <span className="font-medium">Tip:</span> Drag nodes to the canvas</div>
          <div>🔗 <span className="font-medium">Connect:</span> Link nodes with arrows</div>
          <div>⚙️ <span className="font-medium">Configure:</span> Click nodes to edit</div>
        </div>
      </div>
    </div>
  );
};