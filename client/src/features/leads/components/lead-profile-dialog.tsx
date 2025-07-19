import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  PhoneCall,
  MessageSquare,
  Target,
  TrendingUp
} from "lucide-react";
import type { Lead } from "@shared/schema";

interface CallSession {
  id: number;
  leadId: number;
  userId: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  callOutcome: string | null;
  notes: string | null;
  nextAction: string | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface LeadProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function LeadProfileDialog({ isOpen, onClose, lead }: LeadProfileDialogProps) {
  const { data: callHistory } = useQuery({
    queryKey: ["/api/call-sessions", lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const response = await fetch(`/api/call-sessions?leadId=${lead.id}`);
      if (!response.ok) throw new Error('Failed to fetch call history');
      return response.json();
    },
    enabled: !!lead?.id && isOpen,
  });

  if (!lead) return null;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getOutcomeBadgeColor = (outcome: string | null) => {
    if (!outcome) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    
    if (outcome.includes("Contacted - Intake Scheduled") || outcome.includes("Contacted - Follow-Up Scheduled")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (outcome.includes("Contacted - No Longer Interested") || outcome.includes("Contacted - Do Not Call")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    if (outcome.includes("Left Voicemail") || outcome.includes("No Answer")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    if (outcome.includes("Bad Number") || outcome.includes("Disqualified")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const statusColors = {
    "HHQ Started": "bg-amber-500/20 text-amber-500",
    "HHQ Signed": "bg-green-500/20 text-green-500",
    "Booking: Not Paid": "bg-red-500/20 text-red-500",
    "Booking: Paid/Not Booked": "bg-blue-500/20 text-blue-500",
    "Booking: Paid/Booked": "bg-green-500/20 text-green-500"
  };

  const readinessColors = {
    "Cold": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Warm": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "Hot": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "Follow Up": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {lead.firstName} {lead.lastName} - Lead Profile
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="call-history">Call History ({callHistory?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{lead.firstName} {lead.lastName}</h3>
                        <p className="text-sm text-muted-foreground">ID: LD-{lead.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{lead.state}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Status & Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Lead Status & Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                          {lead.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lead Readiness:</span>
                        <Badge className={readinessColors[lead.leadReadiness as keyof typeof readinessColors]}>
                          {lead.leadReadiness || "Cold"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Calls:</span>
                        <span className="font-mono font-semibold">{callHistory?.length || 0}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Contacted:</span>
                        <span className="text-sm">
                          {lead.lastContacted 
                            ? new Date(lead.lastContacted).toLocaleDateString()
                            : "Never"
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Created:</span>
                        <span className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Lead Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.leadType || "Not specified"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Lead Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.leadSource || "Not specified"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Lead Outcome</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.leadOutcome || "No outcome yet"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {lead.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{lead.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="call-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    Call History Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {callHistory && callHistory.length > 0 ? (
                      <div className="space-y-4">
                        {callHistory.map((call: CallSession, index: number) => (
                          <div key={call.id} className="relative">
                            {index !== callHistory.length - 1 && (
                              <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                            )}
                            
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <PhoneCall className="h-4 w-4 text-primary-foreground" />
                                </div>
                              </div>
                              
                              <Card className="flex-1">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">
                                      Call #{callHistory.length - index}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(call.startTime)}
                                    </div>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Duration:</span>
                                      <span className="ml-2">{formatDuration(call.duration)}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Caller:</span>
                                      <span className="ml-2">{call.user?.firstName} {call.user?.lastName}</span>
                                    </div>
                                  </div>

                                  {call.callOutcome && (
                                    <div>
                                      <span className="font-medium text-sm">Outcome:</span>
                                      <Badge 
                                        className={`ml-2 ${getOutcomeBadgeColor(call.callOutcome)}`}
                                        variant="secondary"
                                      >
                                        {call.callOutcome}
                                      </Badge>
                                    </div>
                                  )}

                                  {call.notes && (
                                    <div>
                                      <span className="font-medium text-sm">Notes:</span>
                                      <p className="mt-1 text-sm text-muted-foreground bg-muted p-2 rounded">
                                        {call.notes}
                                      </p>
                                    </div>
                                  )}

                                  {call.nextAction && (
                                    <div>
                                      <span className="font-medium text-sm">Next Action:</span>
                                      <p className="mt-1 text-sm">{call.nextAction}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <PhoneCall className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Call History</h3>
                        <p className="text-muted-foreground">This lead has not been called yet.</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}