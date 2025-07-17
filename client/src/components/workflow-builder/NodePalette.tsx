import React, { useState } from 'react';
import { NodeType, NodeCategory } from './types';
import { cn } from '@/lib/utils';

interface NodePaletteProps {
  className?: string;
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'triggers',
    name: 'Triggers',
    icon: '🚀',
    color: '#10b981',
    nodes: [
      {
        type: NodeType.TRIGGER_PORTAL_SIGNUP,
        name: 'Portal Signup',
        description: 'Triggers when a user signs up through the portal',
        icon: '🚪',
        color: '#10b981',
        defaultConfig: { triggerEvent: 'portal.signup' },
        inputs: [],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.TRIGGER_LEAD_CREATED,
        name: 'Lead Created',
        description: 'Triggers when a new lead is created',
        icon: '👤',
        color: '#10b981',
        defaultConfig: { triggerEvent: 'lead.created' },
        inputs: [],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.TRIGGER_STATUS_CHANGED,
        name: 'Status Changed',
        description: 'Triggers when lead/contact status changes',
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
    name: 'Actions',
    icon: '⚡',
    color: '#3b82f6',
    nodes: [
      {
        type: NodeType.ACTION_CREATE_LEAD,
        name: 'Create Lead',
        description: 'Creates a new lead in the system',
        icon: '➕',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { status: 'New' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_UPDATE_STATUS,
        name: 'Update Status',
        description: 'Updates the status of a lead or contact',
        icon: '📝',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { status: 'HHQ Started' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_ASSIGN_USER,
        name: 'Assign User',
        description: 'Assigns a lead/contact to a user',
        icon: '👥',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { assignToRole: 'SDR' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_CREATE_TASK,
        name: 'Create Task',
        description: 'Creates a new task',
        icon: '✅',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { title: 'New Task', priority: 'medium' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_SEND_EMAIL,
        name: 'Send Email',
        description: 'Sends an email notification',
        icon: '📧',
        color: '#3b82f6',
        defaultConfig: { actionParameters: { template: 'default' } },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.ACTION_SEND_SLACK,
        name: 'Send Slack',
        description: 'Sends a Slack notification',
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
    name: 'Conditions',
    icon: '🔀',
    color: '#f59e0b',
    nodes: [
      {
        type: NodeType.CONDITION_IF,
        name: 'If Condition',
        description: 'Conditional logic branching',
        icon: '❓',
        color: '#f59e0b',
        defaultConfig: { conditionType: 'simple' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [
          { id: 'true', name: 'True', type: 'condition' as const, required: true },
          { id: 'false', name: 'False', type: 'condition' as const, required: true },
        ],
      },
      {
        type: NodeType.CONDITION_SWITCH,
        name: 'Switch',
        description: 'Multi-branch conditional logic',
        icon: '🔀',
        color: '#f59e0b',
        defaultConfig: { conditionType: 'switch' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [
          { id: 'case1', name: 'Case 1', type: 'condition' as const, required: true },
          { id: 'case2', name: 'Case 2', type: 'condition' as const, required: true },
          { id: 'default', name: 'Default', type: 'condition' as const, required: true },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '🛠️',
    color: '#8b5cf6',
    nodes: [
      {
        type: NodeType.ACTION_DELAY,
        name: 'Delay',
        description: 'Adds a time delay',
        icon: '⏱️',
        color: '#8b5cf6',
        defaultConfig: { delayDuration: 5, delayUnit: 'minutes' },
        inputs: [{ id: 'input', name: 'Input', type: 'data' as const, required: true }],
        outputs: [{ id: 'output', name: 'Output', type: 'data' as const, required: true }],
      },
      {
        type: NodeType.UTILITY_NOTE,
        name: 'Note',
        description: 'Add documentation note',
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
    <div className={cn('bg-white dark:bg-gray-800 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workflow Nodes
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Drag and drop nodes to create your workflow
        </p>
      </div>

      <div className="space-y-2 p-4">
        {nodeCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({category.nodes.length})
                </span>
              </div>
              <div className="text-gray-400 dark:text-gray-500">
                {expandedCategory === category.id ? '▼' : '▶'}
              </div>
            </button>

            {expandedCategory === category.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="flex items-center p-3 cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md mr-3"
                         style={{ backgroundColor: node.color + '20', color: node.color }}>
                      <span className="text-sm">{node.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {node.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>💡 <span className="font-medium">Tip:</span> Drag nodes to the canvas</div>
          <div>🔗 <span className="font-medium">Connect:</span> Link nodes with arrows</div>
          <div>⚙️ <span className="font-medium">Configure:</span> Click nodes to edit</div>
        </div>
      </div>
    </div>
  );
};