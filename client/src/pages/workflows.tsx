import React, { useState } from 'react';
import { WorkflowBuilder } from '@/components/workflow-builder/WorkflowBuilder';
import { WorkflowDefinition } from '@/components/workflow-builder/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const WorkflowsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'list'>('builder');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinition | undefined>();
  const [userRole, setUserRole] = useState<string>('sdr');
  const { toast } = useToast();

  const roleOptions = [
    { value: 'sdr', label: 'SDR Manager', description: 'Manage lead assignments and follow-ups' },
    { value: 'health_coach', label: 'Health Coach Manager', description: 'Manage patient journey and care' },
    { value: 'admin', label: 'System Admin', description: 'Full system automation control' }
  ];

  // Business-friendly workflow templates
  const existingWorkflows: WorkflowDefinition[] = [
    {
      id: 'portal-signup-workflow',
      name: 'Portal Signup → Lead Assignment',
      description: 'When someone signs up through portal, create lead and assign to next available SDR',
      version: '1.0.0',
      isActive: true,
      nodes: [],
      edges: [],
      variables: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'admin',
    },
    {
      id: 'lead-nurturing-workflow',
      name: 'New Lead → Follow-up Tasks',
      description: 'When new lead is created, automatically create follow-up tasks and notify team',
      version: '1.0.0',
      isActive: false,
      nodes: [],
      edges: [],
      variables: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin',
    },
    {
      id: 'status-change-workflow',
      name: 'Status Change → Team Notification',
      description: 'When lead status changes to HHQ Signed, notify health coach and create booking task',
      version: '1.0.0',
      isActive: true,
      nodes: [],
      edges: [],
      variables: [],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'admin',
    },
  ];

  const handleSaveWorkflow = (workflow: WorkflowDefinition) => {
    // In a real app, this would save to the backend
    toast({
      title: "Workflow Saved",
      description: `${workflow.name} has been saved successfully.`,
    });
  };

  const handleTestWorkflow = (workflow: WorkflowDefinition) => {
    // In a real app, this would trigger a test execution
    toast({
      title: "Testing Workflow",
      description: `Testing ${workflow.name} with sample data...`,
    });
  };

  const handleDeployWorkflow = (workflow: WorkflowDefinition) => {
    // In a real app, this would deploy the workflow
    toast({
      title: "Workflow Deployed",
      description: `${workflow.name} is now active and will process new events.`,
    });
  };

  const handleEditWorkflow = (workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
    setActiveTab('builder');
  };

  const handleCreateNew = () => {
    setCurrentWorkflow(undefined);
    setActiveTab('builder');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'builder' | 'list')}>
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Business Workflow Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create automated workflows using business-friendly language and concepts
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Your Role:</span>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TabsList>
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="list">Workflows</TabsTrigger>
              </TabsList>
              
              {activeTab === 'list' && (
                <Button onClick={handleCreateNew}>
                  Create New Workflow
                </Button>
              )}
            </div>
          </div>
        </div>

        <TabsContent value="builder" className="flex-1 m-0">
          <WorkflowBuilder
            workflow={currentWorkflow}
            onSave={handleSaveWorkflow}
            onTest={handleTestWorkflow}
            onDeploy={handleDeployWorkflow}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="list" className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Workflows
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and monitor your automation workflows
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {existingWorkflows.filter(w => w.isActive).length} Active
                </Badge>
                <Badge variant="secondary">
                  {existingWorkflows.filter(w => !w.isActive).length} Draft
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {existingWorkflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? "Active" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {workflow.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Version {workflow.version}</span>
                        <span>
                          Updated {workflow.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          Edit
                        </Button>
                        
                        {workflow.isActive ? (
                          <Button variant="outline" size="sm">
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm">
                            Activate
                          </Button>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          View Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {existingWorkflows.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No workflows yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first workflow to automate your CRM processes
                </p>
                <Button onClick={handleCreateNew}>
                  Create Your First Workflow
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowsPage;