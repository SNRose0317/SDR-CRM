import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  OnConnectStart,
  OnConnectEnd,
  Panel,
  useReactFlow,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { WorkflowDefinition, WorkflowNode, WorkflowEdge, NodeType, NodePaletteItem } from './types';
import { NodePalette } from './NodePalette';
import { WorkflowToolbar } from './WorkflowToolbar';
import { NodeProperties } from './NodeProperties';
import { WorkflowTemplates } from './WorkflowTemplates';
import { CustomTriggerNode } from './nodes/CustomTriggerNode';
import { CustomActionNode } from './nodes/CustomActionNode';
import { CustomConditionNode } from './nodes/CustomConditionNode';
import { CustomDelayNode } from './nodes/CustomDelayNode';
import { WorkflowExecutionPanel } from './WorkflowExecutionPanel';

// Custom Node Types
const nodeTypes = {
  trigger_portal_signup: CustomTriggerNode,
  trigger_lead_created: CustomTriggerNode,
  trigger_status_changed: CustomTriggerNode,
  action_create_lead: CustomActionNode,
  action_update_status: CustomActionNode,
  action_assign_user: CustomActionNode,
  action_create_task: CustomActionNode,
  action_send_email: CustomActionNode,
  action_send_slack: CustomActionNode,
  condition_if: CustomConditionNode,
  condition_switch: CustomConditionNode,
  action_delay: CustomDelayNode,
};

// Initial workflow definition
const initialWorkflow: WorkflowDefinition = {
  id: 'new-workflow',
  name: 'New Workflow',
  description: 'Drag and drop nodes to create your automation workflow',
  version: '1.0.0',
  isActive: false,
  nodes: [],
  edges: [],
  variables: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'current-user',
};

interface WorkflowBuilderProps {
  workflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  onTest?: (workflow: WorkflowDefinition) => void;
  onDeploy?: (workflow: WorkflowDefinition) => void;
  userRole?: string;
}

const WorkflowBuilderComponent: React.FC<WorkflowBuilderProps> = ({
  workflow = initialWorkflow,
  onSave,
  onTest,
  onDeploy,
  userRole = 'sdr',
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(workflow.edges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<WorkflowEdge | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  
  const reactFlowInstance = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  
  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: WorkflowEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'default',
        data: { label: 'then' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle drag over for dropping nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to create new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: type as NodeType,
        position,
        data: {
          label: getNodeLabel(type as NodeType),
          description: getNodeDescription(type as NodeType),
          icon: getNodeIcon(type as NodeType),
          color: getNodeColor(type as NodeType),
          config: getDefaultNodeConfig(type as NodeType),
          isValid: true,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
    event.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: WorkflowEdge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle panel click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [setNodes]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [setEdges]
  );

  // Save workflow
  const handleSave = useCallback(() => {
    const updatedWorkflow: WorkflowDefinition = {
      ...workflow,
      nodes,
      edges,
      updatedAt: new Date(),
    };
    onSave?.(updatedWorkflow);
  }, [workflow, nodes, edges, onSave]);

  // Test workflow
  const handleTest = useCallback(() => {
    const updatedWorkflow: WorkflowDefinition = {
      ...workflow,
      nodes,
      edges,
      updatedAt: new Date(),
    };
    setIsExecuting(true);
    setShowExecutionPanel(true);
    onTest?.(updatedWorkflow);
    
    // Simulate test completion
    setTimeout(() => {
      setIsExecuting(false);
    }, 3000);
  }, [workflow, nodes, edges, onTest]);

  // Deploy workflow
  const handleDeploy = useCallback(() => {
    const updatedWorkflow: WorkflowDefinition = {
      ...workflow,
      nodes,
      edges,
      isActive: true,
      updatedAt: new Date(),
    };
    onDeploy?.(updatedWorkflow);
  }, [workflow, nodes, edges, onDeploy]);

  // Update node properties
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  }, [setNodes]);

  // Update edge properties
  const handleEdgeUpdate = useCallback((edgeId: string, updates: Partial<WorkflowEdge>) => {
    setEdges((eds) =>
      eds.map((edge) => (edge.id === edgeId ? { ...edge, ...updates } : edge))
    );
  }, [setEdges]);

  // Load template
  const handleLoadTemplate = useCallback((template: WorkflowDefinition) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setShowTemplates(false);
  }, [setNodes, setEdges]);

  return (
    <div className="workflow-builder h-full w-full relative bg-gray-50 dark:bg-gray-900">
      {/* Workflow Toolbar */}
      <WorkflowToolbar
        workflow={workflow}
        onSave={handleSave}
        onTest={handleTest}
        onDeploy={handleDeploy}
        onShowTemplates={() => setShowTemplates(true)}
        isExecuting={isExecuting}
        hasChanges={true}
      />

      <div className="flex h-full pt-16">
        {/* Node Palette */}
        <NodePalette 
          className="w-64 border-r border-gray-200 dark:border-gray-700" 
          userRole={userRole}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-100 dark:bg-gray-800"
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap 
              className="!bg-gray-100 dark:!bg-gray-800"
              nodeColor={(node) => getNodeColor(node.type as NodeType)}
            />
            
            {/* Status Panel */}
            <Panel position="top-right" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Nodes: {nodes.length} | Edges: {edges.length}
              </div>
              {isExecuting && (
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Testing workflow...
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <NodeProperties
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onNodeUpdate={handleNodeUpdate}
          onEdgeUpdate={handleEdgeUpdate}
          className="w-80 border-l border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <WorkflowTemplates
          onClose={() => setShowTemplates(false)}
          onSelect={handleLoadTemplate}
        />
      )}

      {/* Execution Panel */}
      {showExecutionPanel && (
        <WorkflowExecutionPanel
          isVisible={showExecutionPanel}
          onClose={() => setShowExecutionPanel(false)}
          workflow={workflow}
          isExecuting={isExecuting}
        />
      )}
    </div>
  );
};

// Wrapper component with ReactFlowProvider
export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderComponent {...props} />
    </ReactFlowProvider>
  );
};

// Helper functions with business-friendly labels
function getNodeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    [NodeType.TRIGGER_PORTAL_SIGNUP]: 'User (Configure in Properties)',
    [NodeType.TRIGGER_LEAD_CREATED]: 'New Lead Added',
    [NodeType.TRIGGER_STATUS_CHANGED]: 'Lead Status Changes',
    [NodeType.ACTION_CREATE_LEAD]: 'Add New Lead',
    [NodeType.ACTION_UPDATE_STATUS]: 'Change Lead Status',
    [NodeType.ACTION_ASSIGN_USER]: 'Assign to Team Member',
    [NodeType.ACTION_CREATE_TASK]: 'Create Follow-up Task',
    [NodeType.ACTION_SEND_EMAIL]: 'Send Email Notification',
    [NodeType.ACTION_SEND_SLACK]: 'Notify Team on Slack',
    [NodeType.CONDITION_IF]: 'Check If...',
    [NodeType.CONDITION_SWITCH]: 'Choose Based On...',
    [NodeType.ACTION_DELAY]: 'Wait Before Next Action',
    [NodeType.TRIGGER_SCHEDULE]: 'Schedule',
    [NodeType.TRIGGER_WEBHOOK]: 'Webhook',
    [NodeType.CONDITION_WAIT]: 'Wait',
    [NodeType.ACTION_WEBHOOK]: 'Webhook',
    [NodeType.UTILITY_NOTE]: 'Add Note',
    [NodeType.UTILITY_MERGE]: 'Merge',
    [NodeType.UTILITY_SPLIT]: 'Split',
  };
  return labels[type] || type;
}

function getNodeDescription(type: NodeType): string {
  const descriptions: Record<NodeType, string> = {
    [NodeType.TRIGGER_PORTAL_SIGNUP]: 'Select user type and configure user selection in Properties panel',
    [NodeType.TRIGGER_LEAD_CREATED]: 'When a new lead is added to the system',
    [NodeType.TRIGGER_STATUS_CHANGED]: 'When a lead moves to a different stage in the process',
    [NodeType.ACTION_CREATE_LEAD]: 'Create a new lead record in the system',
    [NodeType.ACTION_UPDATE_STATUS]: 'Move lead to a different stage (New, HHQ Started, etc.)',
    [NodeType.ACTION_ASSIGN_USER]: 'Assign lead to SDR, Health Coach, or other team member',
    [NodeType.ACTION_CREATE_TASK]: 'Create a task for team member to follow up on',
    [NodeType.ACTION_SEND_EMAIL]: 'Send email to team member or patient',
    [NodeType.ACTION_SEND_SLACK]: 'Send notification to team Slack channel',
    [NodeType.CONDITION_IF]: 'Only continue if specific condition is met',
    [NodeType.CONDITION_SWITCH]: 'Different actions based on lead status or other criteria',
    [NodeType.ACTION_DELAY]: 'Wait specific time before continuing (minutes, hours, days)',
    [NodeType.TRIGGER_SCHEDULE]: 'Scheduled trigger',
    [NodeType.TRIGGER_WEBHOOK]: 'Webhook trigger',
    [NodeType.CONDITION_WAIT]: 'Wait for condition',
    [NodeType.ACTION_WEBHOOK]: 'Call webhook',
    [NodeType.UTILITY_NOTE]: 'Add documentation or reminder note to your workflow',
    [NodeType.UTILITY_MERGE]: 'Merge flows',
    [NodeType.UTILITY_SPLIT]: 'Split flow',
  };
  return descriptions[type] || '';
}

function getNodeIcon(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    [NodeType.TRIGGER_PORTAL_SIGNUP]: '🚪',
    [NodeType.TRIGGER_LEAD_CREATED]: '👤',
    [NodeType.TRIGGER_STATUS_CHANGED]: '🔄',
    [NodeType.ACTION_CREATE_LEAD]: '➕',
    [NodeType.ACTION_UPDATE_STATUS]: '📝',
    [NodeType.ACTION_ASSIGN_USER]: '👥',
    [NodeType.ACTION_CREATE_TASK]: '✅',
    [NodeType.ACTION_SEND_EMAIL]: '📧',
    [NodeType.ACTION_SEND_SLACK]: '💬',
    [NodeType.CONDITION_IF]: '❓',
    [NodeType.CONDITION_SWITCH]: '🔀',
    [NodeType.ACTION_DELAY]: '⏱️',
    [NodeType.TRIGGER_SCHEDULE]: '📅',
    [NodeType.TRIGGER_WEBHOOK]: '🔗',
    [NodeType.CONDITION_WAIT]: '⏸️',
    [NodeType.ACTION_WEBHOOK]: '🌐',
    [NodeType.UTILITY_NOTE]: '📄',
    [NodeType.UTILITY_MERGE]: '🔗',
    [NodeType.UTILITY_SPLIT]: '🔀',
  };
  return icons[type] || '⚙️';
}

function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    [NodeType.TRIGGER_PORTAL_SIGNUP]: '#10b981',
    [NodeType.TRIGGER_LEAD_CREATED]: '#10b981',
    [NodeType.TRIGGER_STATUS_CHANGED]: '#10b981',
    [NodeType.ACTION_CREATE_LEAD]: '#3b82f6',
    [NodeType.ACTION_UPDATE_STATUS]: '#3b82f6',
    [NodeType.ACTION_ASSIGN_USER]: '#3b82f6',
    [NodeType.ACTION_CREATE_TASK]: '#3b82f6',
    [NodeType.ACTION_SEND_EMAIL]: '#3b82f6',
    [NodeType.ACTION_SEND_SLACK]: '#3b82f6',
    [NodeType.CONDITION_IF]: '#f59e0b',
    [NodeType.CONDITION_SWITCH]: '#f59e0b',
    [NodeType.ACTION_DELAY]: '#8b5cf6',
    [NodeType.TRIGGER_SCHEDULE]: '#10b981',
    [NodeType.TRIGGER_WEBHOOK]: '#10b981',
    [NodeType.CONDITION_WAIT]: '#f59e0b',
    [NodeType.ACTION_WEBHOOK]: '#3b82f6',
    [NodeType.UTILITY_NOTE]: '#6b7280',
    [NodeType.UTILITY_MERGE]: '#6b7280',
    [NodeType.UTILITY_SPLIT]: '#6b7280',
  };
  return colors[type] || '#6b7280';
}

function getDefaultNodeConfig(type: NodeType): any {
  const configs: Record<NodeType, any> = {
    [NodeType.TRIGGER_PORTAL_SIGNUP]: {
      userCategory: 'internal',
      userType: 'sdr',
      specificUsers: [],
      enabled: true,
    },
    [NodeType.ACTION_UPDATE_STATUS]: {
      actionParameters: {
        status: 'HHQ Started',
        entityType: 'lead',
      },
    },
    [NodeType.ACTION_ASSIGN_USER]: {
      actionParameters: {
        assignToRole: 'SDR',
        assignmentType: 'round_robin',
      },
    },
    [NodeType.ACTION_CREATE_TASK]: {
      actionParameters: {
        title: 'Follow up with new lead',
        priority: 'high',
        dueDate: '1d',
      },
    },
    [NodeType.ACTION_SEND_SLACK]: {
      actionParameters: {
        channel: 'general',
        message: 'New lead assigned',
      },
    },
  };
  return configs[type] || { enabled: true };
}

export default WorkflowBuilder;