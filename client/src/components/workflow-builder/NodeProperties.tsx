import React, { useState } from 'react';
import { WorkflowNode, WorkflowEdge, NodeType } from './types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

interface NodePropertiesProps {
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onEdgeUpdate: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  className?: string;
}

export const NodeProperties: React.FC<NodePropertiesProps> = ({
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  className,
}) => {
  const [localNodeData, setLocalNodeData] = useState<WorkflowNode | null>(selectedNode);
  const [localEdgeData, setLocalEdgeData] = useState<WorkflowEdge | null>(selectedEdge);

  // Update local state when selection changes
  React.useEffect(() => {
    setLocalNodeData(selectedNode);
  }, [selectedNode]);

  React.useEffect(() => {
    setLocalEdgeData(selectedEdge);
  }, [selectedEdge]);

  const handleNodePropertyChange = (path: string, value: any) => {
    if (!localNodeData) return;

    const keys = path.split('.');
    const updated = { ...localNodeData };
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalNodeData(updated);
    onNodeUpdate(localNodeData.id, updated);
  };

  const handleEdgePropertyChange = (path: string, value: any) => {
    if (!localEdgeData) return;

    const keys = path.split('.');
    const updated = { ...localEdgeData };
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalEdgeData(updated);
    onEdgeUpdate(localEdgeData.id, updated);
  };

  const renderNodeProperties = () => {
    if (!localNodeData) return null;

    return (
      <div className="space-y-6">
        {/* Basic Properties */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{localNodeData.data.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {localNodeData.data.label}
            </h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={localNodeData.data.label}
                onChange={(e) => handleNodePropertyChange('data.label', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localNodeData.data.description || ''}
                onChange={(e) => handleNodePropertyChange('data.description', e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Type-specific Properties */}
        {renderTypeSpecificProperties()}
      </div>
    );
  };

  const renderTypeSpecificProperties = () => {
    if (!localNodeData) return null;

    const { type, data } = localNodeData;

    switch (type) {
      case NodeType.TRIGGER_PORTAL_SIGNUP:
        return <UserConfiguration data={data} onUpdate={handleNodePropertyChange} />;

      case NodeType.ACTION_UPDATE_STATUS:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Status Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Entity Type</Label>
                <Select
                  value={data.config.actionParameters?.entityType || 'lead'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.entityType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select
                  value={data.config.actionParameters?.status || 'HHQ Started'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="HHQ Started">HHQ Started</SelectItem>
                    <SelectItem value="HHQ Signed">HHQ Signed</SelectItem>
                    <SelectItem value="Booking: Needs Scheduling">Booking: Needs Scheduling</SelectItem>
                    <SelectItem value="Booking: Paid/ booked">Booking: Paid/ booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case NodeType.ACTION_ASSIGN_USER:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Assignment Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Assign To Role</Label>
                <Select
                  value={data.config.actionParameters?.assignToRole || 'SDR'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.assignToRole', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SDR">SDR</SelectItem>
                    <SelectItem value="Health Coach">Health Coach</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Assignment Type</Label>
                <Select
                  value={data.config.actionParameters?.assignmentType || 'round_robin'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.assignmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case NodeType.ACTION_CREATE_TASK:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Task Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Task Title</Label>
                <Input
                  value={data.config.actionParameters?.title || ''}
                  onChange={(e) => handleNodePropertyChange('data.config.actionParameters.title', e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label>Task Description</Label>
                <Textarea
                  value={data.config.actionParameters?.description || ''}
                  onChange={(e) => handleNodePropertyChange('data.config.actionParameters.description', e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Priority</Label>
                <Select
                  value={data.config.actionParameters?.priority || 'medium'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Due Date</Label>
                <Select
                  value={data.config.actionParameters?.dueDate || '1d'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.dueDate', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select due date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="3d">3 Days</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case NodeType.ACTION_SEND_SLACK:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Slack Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Channel</Label>
                <Select
                  value={data.config.actionParameters?.channel || 'general'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.actionParameters.channel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="notifications">Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Message</Label>
                <Textarea
                  value={data.config.actionParameters?.message || ''}
                  onChange={(e) => handleNodePropertyChange('data.config.actionParameters.message', e.target.value)}
                  placeholder="Enter slack message"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case NodeType.ACTION_DELAY:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Delay Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Duration</Label>
                <Input
                  type="number"
                  value={data.config.delayDuration || 5}
                  onChange={(e) => handleNodePropertyChange('data.config.delayDuration', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              
              <div>
                <Label>Unit</Label>
                <Select
                  value={data.config.delayUnit || 'minutes'}
                  onValueChange={(value) => handleNodePropertyChange('data.config.delayUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case NodeType.CONDITION_IF:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Condition Configuration</h4>
            <div className="space-y-3">
              <div>
                <Label>Condition Expression</Label>
                <Input
                  value={data.config.conditionExpression || ''}
                  onChange={(e) => handleNodePropertyChange('data.config.conditionExpression', e.target.value)}
                  placeholder="e.g., {{lead.status}} == 'New'"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderEdgeProperties = () => {
    if (!localEdgeData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔗</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Connection Properties
          </h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="edgeLabel">Label</Label>
            <Input
              id="edgeLabel"
              value={localEdgeData.data?.label || ''}
              onChange={(e) => handleEdgePropertyChange('data.label', e.target.value)}
              className="mt-1"
              placeholder="Connection label"
            />
          </div>
          
          <div>
            <Label htmlFor="edgeCondition">Condition</Label>
            <Input
              id="edgeCondition"
              value={localEdgeData.data?.condition || ''}
              onChange={(e) => handleEdgePropertyChange('data.condition', e.target.value)}
              className="mt-1"
              placeholder="e.g., status == 'approved'"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 p-6', className)}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium mb-2">No Selection</h3>
          <p className="text-sm">
            Select a node or connection to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 overflow-y-auto', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Properties
          </h2>
          
          {selectedNode && (
            <Badge variant="outline" className="text-xs">
              {selectedNode.type}
            </Badge>
          )}
        </div>
        
        {selectedNode && renderNodeProperties()}
        {selectedEdge && renderEdgeProperties()}
      </div>
    </div>
  );
};

// User Configuration Component for WHO selection
interface UserConfigurationProps {
  data: any;
  onUpdate: (path: string, value: any) => void;
}

const UserConfiguration: React.FC<UserConfigurationProps> = ({ data, onUpdate }) => {
  const [selectedUserType, setSelectedUserType] = useState<string>(
    data.config?.userType || 'portal_user'
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    data.config?.specificUsers || []
  );

  // User type options mapping to system entities
  const userTypeOptions = [
    { value: 'portal_user', label: 'Portal User', description: 'Patients who sign up through patient portal' },
    { value: 'lead', label: 'Lead', description: 'Potential customers in sales pipeline' },
    { value: 'contact', label: 'Contact', description: 'Active customers receiving healthcare services' },
    { value: 'sdr', label: 'SDR', description: 'Sales Development Representatives' },
    { value: 'health_coach', label: 'Health Coach', description: 'Healthcare professionals managing patients' },
    { value: 'admin', label: 'Admin', description: 'System administrators with full access' },
  ];

  // Fetch users based on selected type
  const { data: availableUsers, isLoading } = useQuery({
    queryKey: [`/api/users`, selectedUserType],
    queryFn: async () => {
      if (selectedUserType === 'portal_user') {
        // Portal users are patients
        const response = await fetch('/api/users?role=patient');
        return response.json();
      } else if (selectedUserType === 'lead') {
        // Leads from leads table
        const response = await fetch('/api/leads');
        return response.json();
      } else if (selectedUserType === 'contact') {
        // Contacts from contacts table
        const response = await fetch('/api/contacts');
        return response.json();
      } else {
        // System users (SDR, Health Coach, Admin)
        const response = await fetch(`/api/users?role=${selectedUserType}`);
        return response.json();
      }
    },
    enabled: !!selectedUserType,
  });

  const handleUserTypeChange = (value: string) => {
    setSelectedUserType(value);
    setSelectedUsers([]); // Reset user selection when type changes
    onUpdate('data.config.userType', value);
    onUpdate('data.config.specificUsers', []);
  };

  const handleUserSelection = (userId: string) => {
    const updatedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    
    setSelectedUsers(updatedUsers);
    onUpdate('data.config.specificUsers', updatedUsers);
  };

  const getUserDisplayName = (user: any) => {
    if (selectedUserType === 'lead' || selectedUserType === 'contact') {
      return `${user.firstName} ${user.lastName} (${user.email})`;
    }
    return `${user.firstName} ${user.lastName} (${user.role})`;
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">User Configuration</h4>
      
      {/* User Type Selection */}
      <div className="space-y-3">
        <div>
          <Label>User Type</Label>
          <Select value={selectedUserType} onValueChange={handleUserTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              {userTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Individual User Selection */}
        {selectedUserType && (
          <div>
            <Label>Select Individual Users (Optional)</Label>
            <div className="mt-2 space-y-2">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading users...</div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableUsers?.map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id.toString())}
                        onChange={() => handleUserSelection(user.id.toString())}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {getUserDisplayName(user)}
                      </label>
                    </div>
                  ))}
                  {availableUsers?.length === 0 && (
                    <div className="text-sm text-gray-500">No users found for this type</div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Leave empty to apply to all users of this type
            </div>
          </div>
        )}

        {/* Selected Users Display */}
        {selectedUsers.length > 0 && (
          <div>
            <Label>Selected Users</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = availableUsers?.find((u: any) => u.id.toString() === userId);
                return user ? (
                  <Badge key={userId} variant="secondary">
                    {getUserDisplayName(user)}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};