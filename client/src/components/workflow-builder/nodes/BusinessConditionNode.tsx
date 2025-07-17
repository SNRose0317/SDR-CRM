import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BusinessConditionNodeData {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: string;
  businessLabel: string;
  businessType: string;
}

interface BusinessConditionNodeProps {
  data: BusinessConditionNodeData;
  selected?: boolean;
}

export const BusinessConditionNode: React.FC<BusinessConditionNodeProps> = ({ data, selected }) => {
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
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-purple-100 text-purple-600">
          🔍
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

      {/* Condition Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
          If: {data.businessLabel}
        </div>
      </div>

      {/* Business-friendly Label */}
      <div className="text-xs text-muted-foreground mb-2">
        Continue only if:
      </div>
      <div className="text-sm font-medium text-foreground bg-muted/50 p-2 rounded">
        {data.businessLabel}
      </div>

      {/* Configuration Hint */}
      <div className="mt-2 text-xs text-muted-foreground">
        Click to configure condition
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-background"
        style={{ right: -6, top: '60%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-background"
        style={{ right: -6, top: '80%' }}
      />
      
      {/* Handle Labels */}
      <div className="absolute right-4 top-[55%] text-xs text-green-600 font-medium">
        Yes
      </div>
      <div className="absolute right-4 top-[75%] text-xs text-red-600 font-medium">
        No
      </div>
    </div>
  );
};