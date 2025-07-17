import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNode } from '../types';
import { cn } from '@/lib/utils';

export const CustomDelayNode: React.FC<NodeProps<WorkflowNode>> = ({ data, selected }) => {
  const getDurationDisplay = () => {
    const duration = data.config.delayDuration || 5;
    const unit = data.config.delayUnit || 'minutes';
    return `${duration} ${unit}`;
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 min-w-[200px]',
        selected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'border-gray-200 dark:border-gray-600'
      )}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 rounded-t-lg"
        style={{ backgroundColor: data.color + '15' }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: data.color }}
          >
            {data.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {data.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Delay
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          {data.description}
        </div>
        
        {/* Duration display */}
        <div className="text-center py-2">
          <div className="text-lg font-mono text-gray-900 dark:text-white">
            {getDurationDisplay()}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className={cn(
                'w-2 h-2 rounded-full',
                data.config.enabled !== false ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {data.config.enabled !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {!data.isValid && (
            <div className="text-xs text-red-500 dark:text-red-400">
              ⚠️ Invalid
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white dark:!border-gray-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white dark:!border-gray-800"
        style={{ backgroundColor: data.color }}
      />
    </div>
  );
};