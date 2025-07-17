import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BusinessTriggerNodeData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  businessType: string;
}

interface BusinessTriggerNodeProps {
  data: BusinessTriggerNodeData;
  selected?: boolean;
}

export const BusinessTriggerNode: React.FC<BusinessTriggerNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={cn(
        'bg-background border-2 rounded-lg p-4 shadow-lg min-w-[200px] max-w-[300px]',
        selected ? 'border-primary' : 'border-border',
        'hover:shadow-xl transition-shadow'
      )}
    >
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

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: data.color + '20', color: data.color }}
        >
          When: {data.category.replace('_', ' ')}
        </div>
      </div>

      {/* Business-friendly Label */}
      <div className="text-xs text-muted-foreground mb-2">
        This workflow starts when:
      </div>
      <div className="text-sm font-medium text-foreground bg-muted/50 p-2 rounded">
        {data.name}
      </div>

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