import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, Settings, Users, Eye, Edit, Trash2, MoreHorizontal, Shield, TestTube } from "lucide-react";
import { RuleBuilder } from "./rule-builder";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PermissionRule, RuleConfig } from "@shared/rules/schema";

export default function RuleManagement() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PermissionRule | null>(null);
  const [testUserId, setTestUserId] = useState<number>(1);
  const [testEntityType, setTestEntityType] = useState<string>('lead');
  const [testEntityId, setTestEntityId] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery<PermissionRule[]>({
    queryKey: ["/api/rules"],
    queryFn: async () => {
      const response = await fetch("/api/rules");
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: RuleConfig) => {
      await apiRequest("POST", "/api/rules", rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      setIsBuilderOpen(false);
      setSelectedRule(null);
      toast({
        title: "Success",
        description: "Rule created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, rule }: { id: number; rule: Partial<RuleConfig> }) => {
      await apiRequest("PUT", `/api/rules/${id}`, rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      setIsBuilderOpen(false);
      setSelectedRule(null);
      toast({
        title: "Success",
        description: "Rule updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      toast({
        title: "Success",
        description: "Rule deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testRuleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rules/test", {
        entityType: testEntityType,
        entityId: testEntityId,
        userId: testUserId,
      });
      return response;
    },
    onSuccess: (result) => {
      toast({
        title: "Rule Test Result",
        description: `Permissions: ${JSON.stringify(result, null, 2)}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateRule = (rule: RuleConfig) => {
    createRuleMutation.mutate(rule);
  };

  const handleUpdateRule = (rule: RuleConfig) => {
    if (selectedRule) {
      updateRuleMutation.mutate({ id: selectedRule.id, rule });
    }
  };

  const handleEdit = (rule: PermissionRule) => {
    setSelectedRule(rule);
    setIsBuilderOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      deleteRuleMutation.mutate(id);
    }
  };

  const convertToRuleConfig = (rule: PermissionRule): RuleConfig => {
    return {
      name: rule.name,
      description: rule.description || "",
      subject: { type: rule.subjectType as any },
      condition: {
        field: rule.fieldName,
        operator: rule.operator as any,
        value: rule.value,
      },
      action: {
        type: rule.actionType as any,
        target: {
          type: rule.targetType as any,
          id: rule.targetId || "",
        },
        permissions: rule.permissions as any,
      },
    };
  };

  const getRuleStatusColor = (rule: PermissionRule) => {
    return rule.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500";
  };

  const getPermissionBadges = (permissions: any) => {
    return Object.entries(permissions)
      .filter(([_, enabled]) => enabled)
      .map(([permission, _]) => (
        <Badge key={permission} variant="secondary" className="mr-1">
          {permission}
        </Badge>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permission Rules</h2>
          <p className="text-muted-foreground">
            Configure dynamic permission rules for your CRM system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => testRuleMutation.mutate()}
            disabled={testRuleMutation.isPending}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Rules
          </Button>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedRule(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? "Edit Rule" : "Create New Rule"}
                </DialogTitle>
              </DialogHeader>
              <RuleBuilder
                onSave={selectedRule ? handleUpdateRule : handleCreateRule}
                onCancel={() => {
                  setIsBuilderOpen(false);
                  setSelectedRule(null);
                }}
                existingRule={selectedRule ? convertToRuleConfig(selectedRule) : undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="text-center py-8">Loading rules...</div>
      ) : rules?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Rules Configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first permission rule to get started
            </p>
            <Button onClick={() => setIsBuilderOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules?.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge className={getRuleStatusColor(rule)}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(rule)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(rule.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Rule Summary */}
                  <div className="flex items-center gap-2 text-sm">
                    <strong>When:</strong>
                    <Badge variant="outline">{rule.subjectType}</Badge>
                    <Badge variant="outline">{rule.fieldName}</Badge>
                    <Badge variant="outline">{rule.operator}</Badge>
                    <Badge variant="outline">{JSON.stringify(rule.value)}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <strong>Then:</strong>
                    <Badge variant="outline">{rule.actionType.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{rule.targetType}</Badge>
                    {rule.targetId && <Badge variant="outline">{rule.targetId}</Badge>}
                  </div>
                  
                  {rule.actionType === 'grant_access' && (
                    <div className="flex items-center gap-2 text-sm">
                      <strong>Permissions:</strong>
                      {getPermissionBadges(rule.permissions)}
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Priority: {rule.priority}</div>
                    <div>Created: {new Date(rule.createdAt!).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}