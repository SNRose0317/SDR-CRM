import React, { useState } from 'react';
import { BusinessNodePalette } from '@/components/workflow-builder/BusinessNodePalette';
import { BusinessWorkflowCanvas } from '@/components/workflow-builder/BusinessWorkflowCanvas';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
// Mock business workflow templates for demonstration
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
    icon: '📋',
    color: '#10b981'
  },
  {
    id: 'patient_journey_automation',
    name: 'Patient Journey Automation',
    description: 'Automate patient care transitions and notifications',
    category: 'patient_journey',
    targetRole: 'health_coach',
    scenario: 'When patient status changes, notify care team and schedule follow-ups',
    estimatedTime: '3 minutes',
    complexity: 'intermediate',
    icon: '🏥',
    color: '#8b5cf6'
  }
];

export default function BusinessWorkflowsPage() {
  const [userRole, setUserRole] = useState<string>('sdr');
  const [activeView, setActiveView] = useState<'builder' | 'templates'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const roleOptions = [
    { value: 'sdr', label: 'SDR Manager', icon: '📞', description: 'Manage lead assignments and follow-ups' },
    { value: 'health_coach', label: 'Health Coach Manager', icon: '🏥', description: 'Manage patient journey and care' },
    { value: 'admin', label: 'Admin', icon: '⚙️', description: 'Full system automation control' }
  ];

  const currentRole = roleOptions.find(role => role.value === userRole);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setActiveView('builder');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business Workflow Builder</h1>
            <p className="text-muted-foreground">
              Create automated workflows using business-friendly language and concepts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your Role:</span>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <span>{role.icon}</span>
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === 'templates' ? 'default' : 'outline'}
                onClick={() => setActiveView('templates')}
              >
                Templates
              </Button>
              <Button
                variant={activeView === 'builder' ? 'default' : 'outline'}
                onClick={() => setActiveView('builder')}
              >
                Builder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Info Banner */}
      <div className="flex-shrink-0 bg-muted/50 border-b border-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentRole?.icon}</span>
            <span className="font-medium">{currentRole?.label}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentRole?.description}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'builder' ? (
          <>
            {/* Business Node Palette */}
            <div className="w-80 flex-shrink-0">
              <BusinessNodePalette userRole={userRole} />
            </div>
            
            {/* Workflow Canvas */}
            <div className="flex-1 flex flex-col">
              {selectedTemplate && (
                <div className="flex-shrink-0 bg-muted/50 border-b border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: selectedTemplate.color + '20', color: selectedTemplate.color }}
                      >
                        {selectedTemplate.icon}
                      </div>
                      <div>
                        <span className="font-medium">{selectedTemplate.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {selectedTemplate.description}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Clear Template
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                <BusinessWorkflowCanvas />
              </div>
            </div>
          </>
        ) : (
          /* Templates View */
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Workflow Templates for {currentRole?.label}
                </h2>
                <p className="text-muted-foreground">
                  Choose from pre-built workflows designed for your role. These templates use business-friendly language and concepts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BUSINESS_WORKFLOW_TEMPLATES
                  .filter(template => template.targetRole === userRole || userRole === 'admin')
                  .map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                              style={{ backgroundColor: template.color + '20', color: template.color }}
                            >
                              {template.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">{template.complexity}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <div className="font-medium mb-1">Business Scenario:</div>
                            <div className="text-muted-foreground">{template.scenario}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-medium">Setup time:</span>
                              <span className="text-muted-foreground ml-1">{template.estimatedTime}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Category:</span>
                              <span className="text-muted-foreground ml-1">{template.category.replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <Button 
                              className="w-full"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              Use This Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Example Workflow Explanation */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Example: Portal Signup to Lead Creation</CardTitle>
                  <CardDescription>
                    Here's how a typical business workflow works in plain language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <div className="font-medium">When: Portal User Signs Up</div>
                        <div className="text-sm text-muted-foreground">
                          Someone registers through your patient portal
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <div className="font-medium">Then: Create Lead with HHQ Started Status</div>
                        <div className="text-sm text-muted-foreground">
                          System automatically creates a lead and sets status to "HHQ Started"
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <div className="font-medium">And: Assign to Next Available SDR</div>
                        <div className="text-sm text-muted-foreground">
                          Lead gets assigned to the next available SDR using round-robin
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <div className="font-medium">And: Send Slack Notification</div>
                        <div className="text-sm text-muted-foreground">
                          Team gets notified in Slack about the new lead assignment
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Workflow Option */}
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-muted">
                      ⚡
                    </div>
                    <div>
                      <CardTitle>Build Custom Workflow</CardTitle>
                      <CardDescription>
                        Create your own workflow from scratch using business-friendly drag-and-drop
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      The workflow builder uses business language like "When this happens" and "Do this" 
                      instead of technical terms. Perfect for managers who want to create automation 
                      without technical complexity.
                    </div>
                    <Button onClick={() => setActiveView('builder')}>
                      Start Building Custom Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}