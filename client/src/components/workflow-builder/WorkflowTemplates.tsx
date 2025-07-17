import React, { useState } from 'react';
import { WorkflowDefinition, NodeType } from './types';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WorkflowTemplatesProps {
  onClose: () => void;
  onSelect: (template: WorkflowDefinition) => void;
}

// Example workflow templates
const workflowTemplates: WorkflowDefinition[] = [
  {
    id: 'portal-signup-workflow',
    name: 'Portal Signup to Lead',
    description: 'Automatically convert portal signups to leads and assign to SDR',
    version: '1.0.0',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    variables: [],
    nodes: [
      {
        id: 'trigger-1',
        type: NodeType.TRIGGER_PORTAL_SIGNUP,
        position: { x: 100, y: 100 },
        data: {
          label: 'Portal Signup',
          description: 'Triggers when a user signs up through the portal',
          icon: '🚪',
          color: '#10b981',
          config: {
            triggerEvent: 'portal.signup',
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-1',
        type: NodeType.ACTION_UPDATE_STATUS,
        position: { x: 400, y: 100 },
        data: {
          label: 'Set Status to HHQ Started',
          description: 'Updates the lead status to HHQ Started',
          icon: '📝',
          color: '#3b82f6',
          config: {
            actionParameters: {
              status: 'HHQ Started',
              entityType: 'lead',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-2',
        type: NodeType.ACTION_ASSIGN_USER,
        position: { x: 700, y: 100 },
        data: {
          label: 'Assign to SDR',
          description: 'Assigns the lead to an SDR',
          icon: '👥',
          color: '#3b82f6',
          config: {
            actionParameters: {
              assignToRole: 'SDR',
              assignmentType: 'round_robin',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-3',
        type: NodeType.ACTION_CREATE_TASK,
        position: { x: 1000, y: 100 },
        data: {
          label: 'Create Follow-up Task',
          description: 'Creates a follow-up task for the assigned SDR',
          icon: '✅',
          color: '#3b82f6',
          config: {
            actionParameters: {
              title: 'Follow up with new lead',
              description: 'Contact the new lead within 24 hours',
              priority: 'high',
              dueDate: '1d',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-4',
        type: NodeType.ACTION_SEND_SLACK,
        position: { x: 700, y: 300 },
        data: {
          label: 'Notify Team',
          description: 'Sends a Slack notification to the team',
          icon: '💬',
          color: '#3b82f6',
          config: {
            actionParameters: {
              channel: 'leads',
              message: 'New lead assigned: {{lead.firstName}} {{lead.lastName}}',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'action-1',
        type: 'default',
        data: { label: 'then' },
      },
      {
        id: 'edge-2',
        source: 'action-1',
        target: 'action-2',
        type: 'default',
        data: { label: 'then' },
      },
      {
        id: 'edge-3',
        source: 'action-2',
        target: 'action-3',
        type: 'default',
        data: { label: 'then' },
      },
      {
        id: 'edge-4',
        source: 'action-2',
        target: 'action-4',
        type: 'default',
        data: { label: 'and' },
      },
    ],
  },
  {
    id: 'lead-nurturing-workflow',
    name: 'Lead Nurturing Sequence',
    description: 'Automated follow-up sequence for new leads',
    version: '1.0.0',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    variables: [],
    nodes: [
      {
        id: 'trigger-1',
        type: NodeType.TRIGGER_LEAD_CREATED,
        position: { x: 100, y: 100 },
        data: {
          label: 'New Lead Created',
          description: 'Triggers when a new lead is created',
          icon: '👤',
          color: '#10b981',
          config: {
            triggerEvent: 'lead.created',
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'delay-1',
        type: NodeType.ACTION_DELAY,
        position: { x: 400, y: 100 },
        data: {
          label: 'Wait 1 Hour',
          description: 'Waits 1 hour before sending first email',
          icon: '⏱️',
          color: '#8b5cf6',
          config: {
            delayDuration: 1,
            delayUnit: 'hours',
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-1',
        type: NodeType.ACTION_SEND_EMAIL,
        position: { x: 700, y: 100 },
        data: {
          label: 'Send Welcome Email',
          description: 'Sends welcome email to new lead',
          icon: '📧',
          color: '#3b82f6',
          config: {
            actionParameters: {
              template: 'welcome',
              subject: 'Welcome to HealthCRM',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'delay-1',
        type: 'default',
        data: { label: 'then' },
      },
      {
        id: 'edge-2',
        source: 'delay-1',
        target: 'action-1',
        type: 'default',
        data: { label: 'then' },
      },
    ],
  },
  {
    id: 'status-change-workflow',
    name: 'Status Change Notifications',
    description: 'Notify team when lead status changes',
    version: '1.0.0',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    variables: [],
    nodes: [
      {
        id: 'trigger-1',
        type: NodeType.TRIGGER_STATUS_CHANGED,
        position: { x: 100, y: 100 },
        data: {
          label: 'Status Changed',
          description: 'Triggers when lead or contact status changes',
          icon: '🔄',
          color: '#10b981',
          config: {
            triggerEvent: 'status.changed',
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'condition-1',
        type: NodeType.CONDITION_IF,
        position: { x: 400, y: 100 },
        data: {
          label: 'Is Important Status?',
          description: 'Checks if status change is important',
          icon: '❓',
          color: '#f59e0b',
          config: {
            conditionType: 'simple',
            conditionExpression: '{{status}} == "HHQ Signed"',
            enabled: true,
          },
          isValid: true,
        },
      },
      {
        id: 'action-1',
        type: NodeType.ACTION_SEND_SLACK,
        position: { x: 700, y: 50 },
        data: {
          label: 'Notify Sales Team',
          description: 'Sends notification to sales team',
          icon: '💬',
          color: '#3b82f6',
          config: {
            actionParameters: {
              channel: 'sales',
              message: '🎉 {{lead.firstName}} {{lead.lastName}} signed HHQ!',
            },
            enabled: true,
          },
          isValid: true,
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'condition-1',
        type: 'default',
        data: { label: 'then' },
      },
      {
        id: 'edge-2',
        source: 'condition-1',
        sourceHandle: 'true',
        target: 'action-1',
        type: 'default',
        data: { label: 'yes' },
      },
    ],
  },
];

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({ onClose, onSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowDefinition | null>(null);

  const handleSelectTemplate = (template: WorkflowDefinition) => {
    onSelect(template);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>📚</span>
            <span>Workflow Templates</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a template to get started quickly, or start from scratch.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowTemplates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700'
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {template.nodes.length} nodes
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Includes:</span>
                    <div className="flex space-x-1">
                      {template.nodes.slice(0, 3).map((node, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: node.data.color + '20',
                            color: node.data.color,
                          }}
                        >
                          {node.data.icon} {node.data.label}
                        </span>
                      ))}
                      {template.nodes.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{template.nodes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Version {template.version}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template);
                      }}
                      className="text-xs"
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => onSelect(workflowTemplates[0])}>
                  Start from Scratch
                </Button>
                {selectedTemplate && (
                  <Button onClick={() => handleSelectTemplate(selectedTemplate)}>
                    Use Selected Template
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};