import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BusinessActionNodeData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  businessType: string;
  executionType: 'immediate' | 'delayed' | 'scheduled';
  parameters?: any[];
}

interface BusinessActionNodeProps {
  data: BusinessActionNodeData;
  selected?: boolean;
}

export const BusinessActionNode: React.FC<BusinessActionNodeProps> = ({ data, selected }) => {
  const getExecutionLabel = (type: string) => {
    switch (type) {
      case 'immediate':
        return 'Happens immediately';
      case 'delayed':
        return 'Can be delayed';
      case 'scheduled':
        return 'Can be scheduled';
      default:
        return 'Configurable timing';
    }
  };

  return (
    <div
      className={cn(
        'bg-background border-2 rounded-lg p-4 shadow-lg min-w-[200px] max-w-[300px]',
        selected ? 'border-primary' : 'border-border',
        'hover:shadow-xl transition-shadow'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ left: -6 }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: data.color + '20', color: data.color }}
        >
          {data.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {data.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.description}
          </div>
        </div>
      </div>

      {/* Category and Execution Type */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: data.color + '20', color: data.color }}
        >
          Action: {data.category}
        </div>
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          {getExecutionLabel(data.executionType)}
        </div>
      </div>

      {/* Business-friendly Label */}
      <div className="text-xs text-muted-foreground mb-2">
        This action will:
      </div>
      <div className="text-sm font-medium text-foreground bg-muted/50 p-2 rounded">
        {data.name}
      </div>

      {/* Configuration Hint */}
      {data.parameters && data.parameters.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Click to configure {data.parameters.length} setting(s)
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
        style={{ right: -6 }}
      />
    </div>
  );
};