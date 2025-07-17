import React, { useState } from 'react';
import { cn } from '@/lib/utils';
// Mock business definitions for demonstration
const BUSINESS_TRIGGERS = [
  {
    id: 'portal_signup',
    name: 'Portal User Signs Up',
    description: 'When a new user registers through the patient portal',
    category: 'user_action',
    icon: '🚪',
    color: '#3b82f6'
  },
  {
    id: 'status_changed',
    name: 'Status Changed',
    description: 'When a lead or contact status changes',
    category: 'status_change',
    icon: '🔄',
    color: '#10b981'
  }
];

const BUSINESS_ACTIONS = [
  {
    id: 'assign_to_sdr',
    name: 'Assign to SDR',
    description: 'Assign lead to next available SDR',
    category: 'assignment',
    requiredRoles: ['admin', 'sdr'],
    icon: '👥',
    color: '#3b82f6'
  },
  {
    id: 'send_slack_notification',
    name: 'Send Slack Notification',
    description: 'Send notification to Slack channel',
    category: 'notification',
    requiredRoles: ['admin'],
    icon: '💬',
    color: '#f59e0b'
  },
  {
    id: 'create_follow_up_task',
    name: 'Create Follow-up Task',
    description: 'Create a task for follow-up',
    category: 'task',
    requiredRoles: ['admin', 'sdr', 'health_coach'],
    icon: '✅',
    color: '#10b981'
  }
];

const BUSINESS_WORKFLOW_TEMPLATES = [
  {
    id: 'portal_signup_to_lead',
    name: 'Portal Signup → Lead Creation',
    description: 'Convert portal signups to leads with SDR assignment',
    category: 'lead_management',
    targetRole: 'sdr',
    scenario: 'When someone signs up through the portal, create a lead and assign to SDR',
    estimatedTime: '2 minutes',
    complexity: 'simple',
    icon: '🎯',
    color: '#3b82f6'
  }
];

const BUSINESS_ROLES = [
  {
    id: 'sdr',
    name: 'SDR (Sales Development Rep)',
    description: 'Responsible for lead qualification and initial contact',
    icon: '📞',
    color: '#3b82f6'
  },
  {
    id: 'health_coach',
    name: 'Health Coach',
    description: 'Provides healthcare guidance and manages patient journey',
    icon: '🏥',
    color: '#10b981'
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'System administrator with full access',
    icon: '⚙️',
    color: '#6b7280'
  }
];

interface BusinessTrigger {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface BusinessAction {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredRoles: string[];
  icon: string;
  color: string;
}

interface BusinessWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  targetRole: string;
  scenario: string;
  estimatedTime: string;
  complexity: string;
  icon: string;
  color: string;
}

interface BusinessNodePaletteProps {
  className?: string;
  userRole?: string;
  onDragStart?: (event: React.DragEvent, item: any, type: string) => void;
}

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  items: (BusinessTrigger | BusinessAction | BusinessWorkflowTemplate)[];
}

export const BusinessNodePalette: React.FC<BusinessNodePaletteProps> = ({ 
  className, 
  userRole = 'admin',
  onDragStart 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('triggers');
  
  // Filter items based on user role
  const getFilteredActions = () => {
    return BUSINESS_ACTIONS.filter(action => 
      action.requiredRoles.includes(userRole) || action.requiredRoles.includes('admin')
    );
  };

  const getFilteredTemplates = () => {
    return BUSINESS_WORKFLOW_TEMPLATES.filter(template => 
      template.targetRole === userRole || userRole === 'admin'
    );
  };

  const businessCategories: BusinessCategory[] = [
    {
      id: 'triggers',
      name: 'When This Happens',
      description: 'Events that start your workflow',
      icon: '🚀',
      color: '#3b82f6',
      items: BUSINESS_TRIGGERS
    },
    {
      id: 'actions',
      name: 'Do This',
      description: 'Actions to perform',
      icon: '⚡',
      color: '#10b981',
      items: getFilteredActions()
    },
    {
      id: 'templates',
      name: 'Quick Start',
      description: 'Pre-built workflows for common scenarios',
      icon: '📋',
      color: '#f59e0b',
      items: getFilteredTemplates()
    }
  ];

  const handleDragStart = (event: React.DragEvent, item: any, type: string) => {
    if (onDragStart) {
      onDragStart(event, item, type);
    } else {
      event.dataTransfer.setData('application/json', JSON.stringify({ item, type }));
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const currentRole = BUSINESS_ROLES.find(role => role.id === userRole);

  return (
    <div className={cn('bg-background border-r border-border flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Workflow Builder</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Build automated workflows for your team
        </p>
        {currentRole && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg">{currentRole.icon}</span>
            <span className="text-sm font-medium text-foreground">{currentRole.name}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-border">
        {businessCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors',
              activeCategory === category.id
                ? 'text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-1">
              <span className="text-xs">{category.icon}</span>
              <span>{category.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Category Content */}
      <div className="flex-1 overflow-y-auto">
        {businessCategories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'h-full',
              activeCategory === category.id ? 'block' : 'hidden'
            )}
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>

            <div className="p-4 space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item, category.id)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted cursor-move transition-colors"
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: item.color + '20', color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                    {category.id === 'templates' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {(item as BusinessWorkflowTemplate).complexity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(item as BusinessWorkflowTemplate).estimatedTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>Drag items to the canvas to build workflows</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔗</span>
            <span>Connect items to create automation flows</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <span>Click items to configure settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};