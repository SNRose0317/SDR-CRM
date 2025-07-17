import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { BusinessTriggerNode } from './nodes/BusinessTriggerNode';
import { BusinessActionNode } from './nodes/BusinessActionNode';
import { BusinessConditionNode } from './nodes/BusinessConditionNode';
import { BusinessDelayNode } from './nodes/BusinessDelayNode';

const nodeTypes = {
  businessTrigger: BusinessTriggerNode,
  businessAction: BusinessActionNode,
  businessCondition: BusinessConditionNode,
  businessDelay: BusinessDelayNode,
};

interface BusinessWorkflowCanvasProps {
  className?: string;
  onNodeSelect?: (node: Node) => void;
  onEdgeSelect?: (edge: Edge) => void;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
}

export const BusinessWorkflowCanvas: React.FC<BusinessWorkflowCanvasProps> = ({
  className,
  onNodeSelect,
  onEdgeSelect,
  onWorkflowChange,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          stroke: '#10b981',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      
      if (!reactFlowBounds || !reactFlowInstance) return;

      try {
        const dragData = event.dataTransfer.getData('application/json');
        const { item, type } = JSON.parse(dragData);

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${type}-${Date.now()}`,
          type: getNodeType(type),
          position,
          data: {
            ...item,
            businessType: type,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Error dropping node:', error);
      }
    },
    [reactFlowInstance, setNodes]
  );

  const getNodeType = (businessType: string): string => {
    switch (businessType) {
      case 'triggers':
        return 'businessTrigger';
      case 'actions':
        return 'businessAction';
      case 'conditions':
        return 'businessCondition';
      case 'delays':
        return 'businessDelay';
      default:
        return 'businessTrigger';
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodes([node]);
    setSelectedEdges([]);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdges([edge]);
    setSelectedNodes([]);
    onEdgeSelect?.(edge);
  }, [onEdgeSelect]);

  const onSelectionChange = useCallback((params: any) => {
    setSelectedNodes(params.nodes || []);
    setSelectedEdges(params.edges || []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  const deleteSelectedElements = useCallback(() => {
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map(node => node.id);
      setNodes((nds) => nds.filter(node => !nodeIds.includes(node.id)));
      setEdges((eds) => eds.filter(edge => 
        !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      ));
    }
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map(edge => edge.id);
      setEdges((eds) => eds.filter(edge => !edgeIds.includes(edge.id!)));
    }
    clearSelection();
  }, [selectedNodes, selectedEdges, setNodes, setEdges, clearSelection]);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelectedElements();
    }
    if (event.key === 'Escape') {
      clearSelection();
    }
  }, [deleteSelectedElements, clearSelection]);

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  React.useEffect(() => {
    onWorkflowChange?.(nodes, edges);
  }, [nodes, edges, onWorkflowChange]);

  return (
    <div className={cn('flex-1 h-full', className)}>
      <ReactFlowProvider>
        <div className="w-full h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onSelectionChange={onSelectionChange}
            onPaneClick={clearSelection}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Controls 
              className="bg-background border border-border"
              showInteractive={false}
            />
            <Background 
              color="#64748b" 
              gap={20} 
              size={1}
              className="opacity-20"
            />
          </ReactFlow>
        </div>

        {/* Canvas Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-20">🎯</div>
              <div className="text-lg font-medium text-muted-foreground">
                Build Your Workflow
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Drag items from the sidebar to get started</div>
                <div>Connect them with arrows to create your automation</div>
                <div>Click on items to configure their settings</div>
              </div>
            </div>
          </div>
        )}

        {/* Selection Info */}
        {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
          <div className="absolute top-4 right-4 bg-background border border-border rounded-lg p-3 shadow-lg">
            <div className="text-sm text-muted-foreground">
              {selectedNodes.length > 0 && (
                <div>Selected: {selectedNodes.length} node(s)</div>
              )}
              {selectedEdges.length > 0 && (
                <div>Selected: {selectedEdges.length} connection(s)</div>
              )}
              <div className="text-xs mt-1">Press Delete to remove</div>
            </div>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};