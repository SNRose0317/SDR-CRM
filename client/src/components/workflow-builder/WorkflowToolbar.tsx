import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowDefinition } from './types';

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  onSave: () => void;
  onTest: () => void;
  onDeploy: () => void;
  onShowTemplates: () => void;
  isExecuting: boolean;
  hasChanges: boolean;
  className?: string;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflow,
  onSave,
  onTest,
  onDeploy,
  onShowTemplates,
  isExecuting,
  hasChanges,
  className,
}) => {
  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Workflow info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">⚡</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {workflow.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {workflow.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
              {workflow.isActive ? 'Active' : 'Draft'}
            </Badge>
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Unsaved changes
              </Badge>
            )}
            {isExecuting && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Testing...
              </Badge>
            )}
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowTemplates}
            className="flex items-center space-x-2"
          >
            <span>📚</span>
            <span>Templates</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!hasChanges}
            className="flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={isExecuting}
            className="flex items-center space-x-2"
          >
            <span>🧪</span>
            <span>{isExecuting ? 'Testing...' : 'Test'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onDeploy}
            disabled={isExecuting || hasChanges}
            className="flex items-center space-x-2"
          >
            <span>🚀</span>
            <span>Deploy</span>
          </Button>
        </div>
      </div>
    </div>
  );
};