import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface BusinessDelayNodeData {
  id: string;
  name: string;
  description: string;
  delayAmount?: number;
  delayUnit?: string;
  businessType: string;
}

interface BusinessDelayNodeProps {
  data: BusinessDelayNodeData;
  selected?: boolean;
}

export const BusinessDelayNode: React.FC<BusinessDelayNodeProps> = ({ data, selected }) => {
  const getDelayLabel = () => {
    if (data.delayAmount && data.delayUnit) {
      return `Wait ${data.delayAmount} ${data.delayUnit}`;
    }
    return 'Wait for specified time';
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
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-orange-100 text-orange-600">
          ⏱️
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

      {/* Delay Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
          Delay: {getDelayLabel()}
        </div>
      </div>

      {/* Business-friendly Label */}
      <div className="text-xs text-muted-foreground mb-2">
        This will:
      </div>
      <div className="text-sm font-medium text-foreground bg-muted/50 p-2 rounded">
        {getDelayLabel()}
      </div>

      {/* Configuration Hint */}
      <div className="mt-2 text-xs text-muted-foreground">
        Click to set delay time
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