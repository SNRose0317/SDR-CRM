import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/shared/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Timer, Users, Clock, UserCheck } from "lucide-react";
import type { Lead } from "@shared/schema";

interface EntityAssignmentProps {
  currentUser: any;
  entityType: 'leads' | 'contacts';
}

export default function EntityAssignment({ currentUser, entityType }: EntityAssignmentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableEntities, isLoading } = useQuery({
    queryKey: [`/api/${entityType}/available`, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/${entityType}/available/${currentUser.id}?userRole=${currentUser.role}`);
      if (!response.ok) throw new Error(`Failed to fetch available ${entityType}`);
      const data = await response.json();
      return data.data?.[entityType] || [];
    },
    enabled: !!currentUser?.id && (currentUser?.role === 'SDR' || currentUser?.role === 'health_coach'),
  });

  const assignMutation = useMutation({
    mutationFn: async (entityId: number) => {
      await apiRequest("POST", `/api/${entityType}/${entityId}/assign`, {
        userId: currentUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/available`, currentUser?.id] });
      toast({
        title: "Success",
        description: `${entityType.slice(0, -1)} assigned successfully`,
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

  const getTimeSinceCreated = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return Math.floor(hoursElapsed);
  };

  const getRemainingTime = (createdAt: string) => {
    const hoursElapsed = getTimeSinceCreated(createdAt);
    return Math.max(0, 24 - hoursElapsed);
  };

  const canUserAssignEntity = (entity: any) => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'SDR') {
      return true;
    } else if (currentUser.role === 'health_coach') {
      const hoursElapsed = getTimeSinceCreated(entity.createdAt);
      return hoursElapsed >= 24;
    }
    return false;
  };

  const getAssignmentStatusBadge = (entity: any) => {
    const hoursElapsed = getTimeSinceCreated(entity.createdAt);
    
    if (entity.ownerId) {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-500">Assigned</Badge>;
    }
    
    if (hoursElapsed >= 24) {
      return <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">Available to All</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">SDR Priority</Badge>;
  };

  if (!currentUser || (currentUser.role !== 'SDR' && currentUser.role !== 'health_coach')) {
    return null;
  }

  const entityLabel = entityType === 'leads' ? 'Lead' : 'Contact';
  const entityLabelPlural = entityType === 'leads' ? 'Leads' : 'Contacts';

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          {entityLabelPlural} Pool ({availableEntities?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Available {entityLabelPlural} Pool
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Assignment Rules</span>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• SDRs have 24-hour priority access to unassigned {entityType}</li>
              <li>• Health Coaches can assign {entityType} after 24 hours</li>
              <li>• Once assigned, {entityType} are owned by that user</li>
            </ul>
          </div>

          {/* Available Entities */}
          {isLoading ? (
            <div className="text-center py-8">Loading available {entityType}...</div>
          ) : availableEntities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {entityType} available for assignment
            </div>
          ) : (
            <div className="space-y-3">
              {availableEntities?.map((entity: any) => (
                <div key={entity.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entity.firstName} {entity.lastName}</span>
                        {getAssignmentStatusBadge(entity)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entity.email} • {entity.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entityType === 'leads' ? (
                          <>Status: {entity.status} • Source: {entity.source || 'Unknown'}</>
                        ) : (
                          <>Stage: {entity.stage} • Health Coach: {entity.healthCoachId ? 'Assigned' : 'Unassigned'}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {getTimeSinceCreated(entity.createdAt)}h ago
                      </div>
                      
                      {canUserAssignEntity(entity) ? (
                        <Button
                          size="sm"
                          onClick={() => assignMutation.mutate(entity.id)}
                          disabled={assignMutation.isPending}
                          className="gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Assign {entityLabel}
                        </Button>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {currentUser.role === 'health_coach' && (
                            <span>Available in {getRemainingTime(entity.createdAt)}h</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {entity.notes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <strong>Notes:</strong> {entity.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}