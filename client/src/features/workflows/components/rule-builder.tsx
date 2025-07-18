import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, Settings, Users, Calendar, Clock, Shield, Eye, Edit, Trash2 } from "lucide-react";
import { ENTITY_FIELDS, FIELD_OPERATORS, ACTION_TYPES, TARGET_TYPES } from "@shared/rule-schema";
import type { RuleConfig, SimpleCondition } from "@shared/rule-schema";
import { ConditionBuilder } from "./condition-builder";

interface RuleBuilderProps {
  onSave: (rule: RuleConfig) => void;
  onCancel: () => void;
  existingRule?: RuleConfig;
}

export function RuleBuilder({ onSave, onCancel, existingRule }: RuleBuilderProps) {
  const [rule, setRule] = useState<RuleConfig>(existingRule || {
    name: "",
    description: "",
    subject: { type: "lead" },
    condition: {
      field: "",
      operator: ">",
      value: "",
    } as SimpleCondition,
    action: {
      type: "grant_access",
      target: { type: "role", id: "" },
      permissions: { read: true, write: false, assign: false, delete: false },
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRule = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!rule.name.trim()) {
      newErrors.name = "Rule name is required";
    }
    
    // Basic validation - detailed condition validation is handled by ConditionBuilder
    if ('field' in rule.condition && !rule.condition.field) {
      newErrors.condition = "At least one condition is required";
    }
    
    if (!rule.action.target.id) {
      newErrors.target = "Target is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateRule()) {
      onSave(rule);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rule Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Rule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={rule.name}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="e.g., Health Coach Lead Access After 24h"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={rule.description || ""}
                onChange={(e) => setRule({ ...rule, description: e.target.value })}
                placeholder="Brief description of what this rule does"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            WHO - Subject Type
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What type of entity does this rule apply to?
          </p>
        </CardHeader>
        <CardContent>
          <Select
            value={rule.subject.type}
            onValueChange={(value) => setRule({
              ...rule,
              subject: { type: value as any },
              condition: { ...rule.condition, field: "", value: "" }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Lead
                </div>
              </SelectItem>
              <SelectItem value="contact">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contact
                </div>
              </SelectItem>
              <SelectItem value="task">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Task
                </div>
              </SelectItem>
              <SelectItem value="appointment">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Appointment
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Condition Configuration */}
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          WHAT - Condition
        </Label>
        <p className="text-sm text-muted-foreground">
          When should this rule apply?
        </p>
        <ConditionBuilder
          entityType={rule.subject.type}
          condition={rule.condition}
          onChange={(condition) => setRule({ ...rule, condition })}
          onError={(error) => {
            const newErrors = { ...errors };
            if (error) {
              newErrors.condition = error;
            } else {
              delete newErrors.condition;
            }
            setErrors(newErrors);
          }}
        />
        {errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
      </div>

      {/* Action Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            THEN - Action
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What should happen when the condition is met?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Type */}
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select
              value={rule.action.type}
              onValueChange={(value) => setRule({
                ...rule,
                action: { ...rule.action, type: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Type</Label>
              <Select
                value={rule.action.target.type}
                onValueChange={(value) => setRule({
                  ...rule,
                  action: {
                    ...rule.action,
                    target: { type: value as any, id: "" }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      <div>
                        <div className="font-medium">{target.label}</div>
                        <div className="text-sm text-muted-foreground">{target.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              {rule.action.target.type === 'role' ? (
                <Select
                  value={rule.action.target.id}
                  onValueChange={(value) => setRule({
                    ...rule,
                    action: {
                      ...rule.action,
                      target: { ...rule.action.target, id: value }
                    }
                  })}
                >
                  <SelectTrigger className={errors.target ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SDR">SDR</SelectItem>
                    <SelectItem value="health_coach">Health Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={rule.action.target.id || ""}
                  onChange={(e) => setRule({
                    ...rule,
                    action: {
                      ...rule.action,
                      target: { ...rule.action.target, id: e.target.value }
                    }
                  })}
                  placeholder="Enter target ID"
                  className={errors.target ? "border-red-500" : ""}
                />
              )}
              {errors.target && <p className="text-sm text-red-500">{errors.target}</p>}
            </div>
          </div>

          {/* Permissions */}
          {rule.action.type === 'grant_access' && (
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="read"
                    checked={rule.action.permissions.read}
                    onCheckedChange={(checked) => setRule({
                      ...rule,
                      action: {
                        ...rule.action,
                        permissions: { ...rule.action.permissions, read: checked }
                      }
                    })}
                  />
                  <Label htmlFor="read" className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Read
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="write"
                    checked={rule.action.permissions.write}
                    onCheckedChange={(checked) => setRule({
                      ...rule,
                      action: {
                        ...rule.action,
                        permissions: { ...rule.action.permissions, write: checked }
                      }
                    })}
                  />
                  <Label htmlFor="write" className="flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Write
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="assign"
                    checked={rule.action.permissions.assign}
                    onCheckedChange={(checked) => setRule({
                      ...rule,
                      action: {
                        ...rule.action,
                        permissions: { ...rule.action.permissions, assign: checked }
                      }
                    })}
                  />
                  <Label htmlFor="assign" className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Assign
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delete"
                    checked={rule.action.permissions.delete}
                    onCheckedChange={(checked) => setRule({
                      ...rule,
                      action: {
                        ...rule.action,
                        permissions: { ...rule.action.permissions, delete: checked }
                      }
                    })}
                  />
                  <Label htmlFor="delete" className="flex items-center gap-1">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>When</strong> a <Badge variant="outline">{rule.subject.type}</Badge> 
              {rule.condition && (
                <>
                  {' '}meets condition
                </>
              )}
              <br />
              <strong>Then</strong> <Badge variant="outline">{rule.action.type.replace('_', ' ')}</Badge>
              {' '}to <Badge variant="outline">{rule.action.target.type}</Badge>
              {rule.action.target.id && (
                <> <Badge variant="outline">{rule.action.target.id}</Badge></>
              )}
              {rule.action.type === 'grant_access' && (
                <>
                  {' '}with permissions: {' '}
                  {Object.entries(rule.action.permissions)
                    .filter(([_, enabled]) => enabled)
                    .map(([permission, _]) => (
                      <Badge key={permission} variant="secondary" className="mr-1">
                        {permission}
                      </Badge>
                    ))}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Rule
        </Button>
      </div>
    </div>
  );
}