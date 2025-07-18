import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, X, Filter, Layers } from "lucide-react";
import { ENTITY_FIELDS, FIELD_OPERATORS } from "@shared/rule-schema";
import type { SimpleCondition, CompoundCondition, RuleCondition } from "@shared/rule-schema";

interface ConditionBuilderProps {
  entityType: string;
  condition: RuleCondition;
  onChange: (condition: RuleCondition) => void;
  onError: (error: string | null) => void;
}

export function ConditionBuilder({ entityType, condition, onChange, onError }: ConditionBuilderProps) {
  const [isCompound, setIsCompound] = useState(
    condition && 'logic' in condition && condition.logic
  );

  const availableFields = ENTITY_FIELDS[entityType as keyof typeof ENTITY_FIELDS] || [];

  const handleSimpleConditionChange = (updatedCondition: SimpleCondition) => {
    onChange(updatedCondition);
    validateCondition(updatedCondition);
  };

  const handleCompoundConditionChange = (updatedCondition: CompoundCondition) => {
    onChange(updatedCondition);
    validateCompoundCondition(updatedCondition);
  };

  const validateCondition = (cond: SimpleCondition) => {
    if (!cond.field || !cond.operator) {
      onError("Field and operator are required");
      return;
    }
    
    const needsValue = !['is_empty', 'is_not_empty'].includes(cond.operator);
    if (needsValue && !cond.value) {
      onError("Value is required for this operator");
      return;
    }
    
    onError(null);
  };

  const validateCompoundCondition = (cond: CompoundCondition) => {
    if (!cond.conditions || cond.conditions.length === 0) {
      onError("At least one condition is required");
      return;
    }
    
    onError(null);
  };

  const convertToCompound = () => {
    const simpleCondition = condition as SimpleCondition;
    const compoundCondition: CompoundCondition = {
      logic: 'AND',
      conditions: [simpleCondition]
    };
    setIsCompound(true);
    onChange(compoundCondition);
  };

  const convertToSimple = () => {
    const compoundCondition = condition as CompoundCondition;
    const firstCondition = compoundCondition.conditions[0] as SimpleCondition;
    setIsCompound(false);
    onChange(firstCondition);
  };

  if (isCompound) {
    return (
      <CompoundConditionBuilder
        entityType={entityType}
        condition={condition as CompoundCondition}
        onChange={handleCompoundConditionChange}
        onConvertToSimple={convertToSimple}
      />
    );
  }

  return (
    <SimpleConditionBuilder
      entityType={entityType}
      condition={condition as SimpleCondition}
      onChange={handleSimpleConditionChange}
      onConvertToCompound={convertToCompound}
    />
  );
}

interface SimpleConditionBuilderProps {
  entityType: string;
  condition: SimpleCondition;
  onChange: (condition: SimpleCondition) => void;
  onConvertToCompound: () => void;
}

function SimpleConditionBuilder({ entityType, condition, onChange, onConvertToCompound }: SimpleConditionBuilderProps) {
  const availableFields = ENTITY_FIELDS[entityType as keyof typeof ENTITY_FIELDS] || [];
  const selectedField = availableFields.find(f => f.name === condition.field);
  const availableOperators = selectedField ? FIELD_OPERATORS[selectedField.type] || [] : [];
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Single Condition
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onConvertToCompound}>
            <Plus className="w-4 h-4 mr-2" />
            Add More Conditions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Field Selection */}
          <div className="space-y-2">
            <Label>Field</Label>
            <Select
              value={condition.field || ""}
              onValueChange={(value) => onChange({
                ...condition,
                field: value,
                operator: '>',
                value: ''
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operator Selection */}
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select
              value={condition.operator || ">"}
              onValueChange={(value) => onChange({
                ...condition,
                operator: value as any,
                value: ['is_empty', 'is_not_empty'].includes(value) ? '' : condition.value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map((operator) => (
                  <SelectItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value Input */}
          {needsValue && (
            <div className="space-y-2">
              <Label>Value</Label>
              {selectedField?.type === 'datetime' ? (
                <Select
                  value={condition.value || ""}
                  onValueChange={(value) => onChange({
                    ...condition,
                    value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour ago">1 hour ago</SelectItem>
                    <SelectItem value="2 hours ago">2 hours ago</SelectItem>
                    <SelectItem value="4 hours ago">4 hours ago</SelectItem>
                    <SelectItem value="8 hours ago">8 hours ago</SelectItem>
                    <SelectItem value="12 hours ago">12 hours ago</SelectItem>
                    <SelectItem value="24 hours ago">24 hours ago</SelectItem>
                    <SelectItem value="48 hours ago">48 hours ago</SelectItem>
                    <SelectItem value="1 week ago">1 week ago</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={condition.value || ""}
                  onChange={(e) => onChange({
                    ...condition,
                    value: e.target.value
                  })}
                  placeholder="Enter value"
                />
              )}
            </div>
          )}
        </div>

        {/* Condition Preview */}
        <div className="flex items-center gap-2 text-sm">
          <strong>Condition:</strong>
          <Badge variant="outline">{selectedField?.label || 'Select field'}</Badge>
          <Badge variant="outline">{availableOperators.find(op => op.value === condition.operator)?.label || 'Select operator'}</Badge>
          {needsValue && condition.value && (
            <Badge variant="outline">{condition.value}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CompoundConditionBuilderProps {
  entityType: string;
  condition: CompoundCondition;
  onChange: (condition: CompoundCondition) => void;
  onConvertToSimple: () => void;
}

function CompoundConditionBuilder({ entityType, condition, onChange, onConvertToSimple }: CompoundConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: SimpleCondition = {
      field: '',
      operator: '>',
      value: ''
    };
    
    onChange({
      ...condition,
      conditions: [...condition.conditions, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    if (condition.conditions.length === 1) {
      onConvertToSimple();
      return;
    }
    
    const newConditions = condition.conditions.filter((_, i) => i !== index);
    onChange({
      ...condition,
      conditions: newConditions
    });
  };

  const updateCondition = (index: number, updatedCondition: SimpleCondition) => {
    const newConditions = [...condition.conditions];
    newConditions[index] = updatedCondition;
    onChange({
      ...condition,
      conditions: newConditions
    });
  };

  const addConditionGroup = () => {
    const newGroup: CompoundCondition = {
      logic: 'AND',
      conditions: [{
        field: '',
        operator: '>',
        value: ''
      }]
    };
    
    onChange({
      ...condition,
      conditions: [...condition.conditions, newGroup]
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Multiple Conditions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={condition.logic}
              onValueChange={(value) => onChange({
                ...condition,
                logic: value as 'AND' | 'OR'
              })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onConvertToSimple}>
              Simplify
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {condition.logic === 'AND' ? 
            'All conditions must be true' : 
            'At least one condition must be true'
          }
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {condition.conditions.map((subCondition, index) => (
          <div key={index} className="space-y-2">
            {index > 0 && (
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="px-3 py-1">
                  {condition.logic}
                </Badge>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {('field' in subCondition) ? (
                  <SimpleConditionBuilder
                    entityType={entityType}
                    condition={subCondition as SimpleCondition}
                    onChange={(updated) => updateCondition(index, updated)}
                    onConvertToCompound={() => {}} // Nested compound conditions not supported yet
                  />
                ) : (
                  <div className="p-4 border rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Nested condition groups not yet supported
                    </p>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="w-4 h-4 mr-2" />
            Add Condition
          </Button>
          
          <Button variant="outline" size="sm" onClick={addConditionGroup} disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Group (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}