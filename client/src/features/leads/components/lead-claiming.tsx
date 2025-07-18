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

interface LeadClaimingProps {
  currentUser: any;
}

export default function LeadClaiming({ currentUser }: LeadClaimingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableLeads, isLoading } = useQuery({
    queryKey: ["/api/leads/available", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/leads/available/${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch available leads');
      const data = await response.json();
      return data.data?.leads || [];
    },
    enabled: !!currentUser?.id && (currentUser?.role === 'SDR' || currentUser?.role === 'health_coach'),
  });

  const claimMutation = useMutation({
    mutationFn: async (leadId: number) => {
      await apiRequest("POST", `/api/leads/${leadId}/claim`, {
        userId: currentUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/available", currentUser?.id] });
      toast({
        title: "Success",
        description: "Lead claimed successfully",
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

  const getTimeSinceEntered = (poolEnteredAt: string) => {
    const now = new Date();
    const entered = new Date(poolEnteredAt);
    const hoursElapsed = (now.getTime() - entered.getTime()) / (1000 * 60 * 60);
    return Math.floor(hoursElapsed);
  };

  const getRemainingTime = (poolEnteredAt: string) => {
    const hoursElapsed = getTimeSinceEntered(poolEnteredAt);
    return Math.max(0, 24 - hoursElapsed);
  };

  const canUserClaimLead = (lead: Lead) => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'SDR') {
      return true;
    } else if (currentUser.role === 'health_coach') {
      const hoursElapsed = getTimeSinceEntered(lead.poolEnteredAt);
      return hoursElapsed >= 24;
    }
    return false;
  };

  const getPoolStatusBadge = (lead: Lead) => {
    const hoursElapsed = getTimeSinceEntered(lead.poolEnteredAt);
    
    if (lead.poolStatus === 'claimed') {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-500">Claimed</Badge>;
    }
    
    if (hoursElapsed >= 24) {
      return <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">Available to All</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">SDR Priority</Badge>;
  };

  if (!currentUser || (currentUser.role !== 'SDR' && currentUser.role !== 'health_coach')) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Lead Pool ({availableLeads?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Available Leads Pool
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Lead Claiming Rules</span>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• SDRs have 24-hour priority access to new leads</li>
              <li>• Health Coaches can claim leads after 24 hours</li>
              <li>• Once claimed, leads are assigned to that user</li>
            </ul>
          </div>

          {/* Available Leads */}
          {isLoading ? (
            <div className="text-center py-8">Loading available leads...</div>
          ) : availableLeads?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads available for claiming
            </div>
          ) : (
            <div className="space-y-3">
              {availableLeads?.map((lead: Lead) => (
                <div key={lead.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                        {getPoolStatusBadge(lead)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead.email} • {lead.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {lead.status} • Source: {lead.source || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {getTimeSinceEntered(lead.poolEnteredAt)}h ago
                      </div>
                      
                      {canUserClaimLead(lead) ? (
                        <Button
                          size="sm"
                          onClick={() => claimMutation.mutate(lead.id)}
                          disabled={claimMutation.isPending}
                          className="gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Claim Lead
                        </Button>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {currentUser.role === 'health_coach' && (
                            <span>Available in {getRemainingTime(lead.poolEnteredAt)}h</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <strong>Notes:</strong> {lead.notes}
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