import React from 'react';
import { WorkflowDefinition, ExecutionStep, ExecutionStatus, StepStatus } from './types';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WorkflowExecutionPanelProps {
  isVisible: boolean;
  onClose: () => void;
  workflow: WorkflowDefinition;
  isExecuting: boolean;
}

// Mock execution steps for demonstration
const mockExecutionSteps: ExecutionStep[] = [
  {
    nodeId: 'trigger-1',
    status: StepStatus.COMPLETED,
    startedAt: new Date(Date.now() - 3000),
    completedAt: new Date(Date.now() - 2500),
    input: { event: 'portal.signup', userId: '123' },
    output: { leadId: '456', status: 'created' },
    retryCount: 0,
  },
  {
    nodeId: 'action-1',
    status: StepStatus.COMPLETED,
    startedAt: new Date(Date.now() - 2500),
    completedAt: new Date(Date.now() - 2000),
    input: { leadId: '456' },
    output: { leadId: '456', status: 'HHQ Started' },
    retryCount: 0,
  },
  {
    nodeId: 'action-2',
    status: StepStatus.RUNNING,
    startedAt: new Date(Date.now() - 2000),
    input: { leadId: '456' },
    retryCount: 0,
  },
  {
    nodeId: 'action-3',
    status: StepStatus.PENDING,
    startedAt: new Date(Date.now() - 1000),
    input: { leadId: '456' },
    retryCount: 0,
  },
];

export const WorkflowExecutionPanel: React.FC<WorkflowExecutionPanelProps> = ({
  isVisible,
  onClose,
  workflow,
  isExecuting,
}) => {
  const [executionSteps, setExecutionSteps] = React.useState<ExecutionStep[]>(mockExecutionSteps);
  const [executionStatus, setExecutionStatus] = React.useState<ExecutionStatus>(
    isExecuting ? ExecutionStatus.RUNNING : ExecutionStatus.COMPLETED
  );

  const getStepStatusColor = (status: StepStatus) => {
    switch (status) {
      case StepStatus.COMPLETED:
        return 'bg-green-500';
      case StepStatus.RUNNING:
        return 'bg-blue-500';
      case StepStatus.FAILED:
        return 'bg-red-500';
      case StepStatus.PENDING:
        return 'bg-gray-400';
      case StepStatus.SKIPPED:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case StepStatus.COMPLETED:
        return '✅';
      case StepStatus.RUNNING:
        return '🔄';
      case StepStatus.FAILED:
        return '❌';
      case StepStatus.PENDING:
        return '⏳';
      case StepStatus.SKIPPED:
        return '⏭️';
      default:
        return '❓';
    }
  };

  const getExecutionProgress = () => {
    const totalSteps = executionSteps.length;
    const completedSteps = executionSteps.filter(step => step.status === StepStatus.COMPLETED).length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  const formatDuration = (start: Date, end?: Date) => {
    const duration = (end ? end.getTime() : Date.now()) - start.getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getNodeName = (nodeId: string) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    return node ? node.data.label : nodeId;
  };

  const getNodeIcon = (nodeId: string) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    return node ? node.data.icon : '⚙️';
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🧪</span>
            <span>Workflow Execution</span>
            <Badge variant={executionStatus === ExecutionStatus.RUNNING ? "default" : "secondary"}>
              {executionStatus}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Execution Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {workflow.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {executionSteps.filter(s => s.status === StepStatus.COMPLETED).length} / {executionSteps.length} steps
              </div>
            </div>
            
            <Progress value={getExecutionProgress()} className="mb-2" />
            
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {workflow.description}
            </div>
          </div>

          {/* Execution Steps */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Execution Steps</h4>
            
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {executionSteps.map((step, index) => (
                  <div
                    key={step.nodeId}
                    className={cn(
                      'flex items-start space-x-3 p-3 rounded-lg border',
                      step.status === StepStatus.RUNNING 
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    )}
                  >
                    {/* Step indicator */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 min-w-[20px]">
                        {index + 1}
                      </div>
                      <div 
                        className={cn(
                          'w-3 h-3 rounded-full',
                          getStepStatusColor(step.status)
                        )}
                      />
                      <div className="text-lg">
                        {getStepStatusIcon(step.status)}
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getNodeIcon(step.nodeId)}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getNodeName(step.nodeId)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {step.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.status === StepStatus.RUNNING && (
                          <span>Running for {formatDuration(step.startedAt)}</span>
                        )}
                        {step.status === StepStatus.COMPLETED && step.completedAt && (
                          <span>Completed in {formatDuration(step.startedAt, step.completedAt)}</span>
                        )}
                        {step.status === StepStatus.FAILED && step.error && (
                          <span className="text-red-500">Error: {step.error}</span>
                        )}
                        {step.status === StepStatus.PENDING && (
                          <span>Waiting to execute</span>
                        )}
                      </div>

                      {/* Input/Output data */}
                      {(step.input || step.output) && (
                        <div className="mt-2 space-y-1">
                          {step.input && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                              <code className="ml-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                {JSON.stringify(step.input, null, 0)}
                              </code>
                            </div>
                          )}
                          {step.output && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Output:</span>
                              <code className="ml-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                {JSON.stringify(step.output, null, 0)}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {executionStatus === ExecutionStatus.RUNNING ? (
                <span>Execution in progress...</span>
              ) : (
                <span>Execution completed</span>
              )}
            </div>
            
            <div className="space-x-2">
              {executionStatus === ExecutionStatus.RUNNING && (
                <Button variant="outline" size="sm">
                  Stop Execution
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              {executionStatus === ExecutionStatus.COMPLETED && (
                <Button size="sm">
                  Run Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};