import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { 
  Phone, 
  PhoneCall, 
  SkipForward, 
  Pause, 
  Play, 
  X,
  Clock,
  User,
  Mail,
  MapPin,
  MessageSquare,
  Calendar,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  state?: string;
  lastContacted?: string;
  numberOfCalls: number;
  leadReadiness: string;
  leadType?: string;
  leadSource?: string;
  leadOutcome?: string;
  notes?: string;
  createdAt: string;
}

interface PhoneDialerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  currentUser?: any;
}

const readinessColors = {
  "Cold": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Warm": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
  "Hot": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Follow Up": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
};

export function PhoneDialerDialog({ 
  isOpen, 
  onClose, 
  leads: initialLeads, 
  currentUser 
}: PhoneDialerDialogProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads || []);
  
  // Update leads when initialLeads prop changes
  useEffect(() => {
    if (initialLeads) {
      setLeads(initialLeads);
      setCurrentIndex(0); // Reset to first lead when new leads are loaded
    }
  }, [initialLeads]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoDialerEnabled, setAutoDialerEnabled] = useState(false);
  const [autoDialerDelay, setAutoDialerDelay] = useState(10);
  const [isDialing, setIsDialing] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const currentLead = leads && leads.length > 0 ? leads[currentIndex] : null;
  const remainingLeads = leads && leads.length > 0 ? leads.slice(currentIndex + 1) : [];

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDialing && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDialing, callStartTime]);

  // Auto-dialer logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoDialerEnabled && !isDialing && callDisposition && currentIndex < leads.length - 1) {
      timeout = setTimeout(() => {
        handleNextLead();
      }, autoDialerDelay * 1000);
    }
    return () => clearTimeout(timeout);
  }, [autoDialerEnabled, isDialing, callDisposition, currentIndex, autoDialerDelay, leads.length]);

  const handleStartCall = async () => {
    if (!currentLead) return;
    
    setIsDialing(true);
    setCallStartTime(new Date());
    setCallDuration(0);
    setCallNotes("");
    setCallOutcome("");

    try {
      // Track the call in database
      await apiRequest(`/api/leads/${currentLead.id}/call`, {
        method: "PUT"
      });
      
      // Update local lead data
      setLeads(prev => prev.map(lead => 
        lead.id === currentLead.id 
          ? { ...lead, numberOfCalls: lead.numberOfCalls + 1, lastContacted: new Date().toISOString() }
          : lead
      ));

      toast({
        title: "Call Started",
        description: `Calling ${currentLead.firstName} ${currentLead.lastName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start call tracking",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = async () => {
    if (!currentLead || !isDialing) return;

    setIsDialing(false);
    const endTime = new Date();
    const duration = callStartTime ? Math.floor((endTime.getTime() - callStartTime.getTime()) / 1000) : 0;

    try {
      // Save call session to database
      await apiRequest("/api/call-sessions", {
        method: "POST",
        body: JSON.stringify({
          leadId: currentLead.id,
          userId: currentUser?.id,
          startTime: callStartTime?.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          callOutcome: callOutcome,
          notes: callNotes
        })
      });

      // Update lead outcome if one was selected
      if (callOutcome) {
        await apiRequest(`/api/leads/${currentLead.id}`, {
          method: "PUT",
          body: JSON.stringify({
            leadOutcome: callOutcome
          })
        });
        
        // Update local lead data with the outcome
        setLeads(prev => prev.map(lead => 
          lead.id === currentLead.id 
            ? { ...lead, leadOutcome: callOutcome }
            : lead
        ));
      }

      toast({
        title: "Call Completed",
        description: `Call duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to save call session",
        variant: "destructive",
      });
    }
  };

  const handleNextLead = () => {
    if (currentIndex < leads.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsDialing(false);
      setCallNotes("");
      setCallOutcome("");
      setCallDuration(0);
      setCallStartTime(null);
    }
  };

  const handleSkipLead = () => {
    handleNextLead();
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastContacted = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (!currentLead) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phone Dialer - Session Complete</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Phone className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">All leads contacted</h3>
            <p className="text-muted-foreground mb-4">You have completed calling all leads in your queue.</p>
            <Button onClick={onClose}>Close Dialer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Dialer - {currentIndex + 1} of {leads.length}
            </DialogTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-dialer">Auto Dialer</Label>
                <Switch
                  id="auto-dialer"
                  checked={autoDialerEnabled}
                  onCheckedChange={setAutoDialerEnabled}
                />
              </div>
              {autoDialerEnabled && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="delay">Delay (s):</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={autoDialerDelay}
                    onChange={(e) => setAutoDialerDelay(Number(e.target.value))}
                    className="w-16"
                    min="5"
                    max="60"
                  />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 p-6 h-[calc(90vh-120px)]">
          {/* Active Lead Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {currentLead.firstName} {currentLead.lastName}
                  <Badge className={readinessColors[currentLead.leadReadiness as keyof typeof readinessColors]}>
                    {currentLead.leadReadiness}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{currentLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{currentLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{currentLead.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{currentLead.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Last: {formatLastContacted(currentLead.lastContacted)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <span>Calls: {currentLead.numberOfCalls}</span>
                  </div>
                </div>

                {currentLead.leadType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Lead Type</Label>
                    <p className="text-sm">{currentLead.leadType}</p>
                  </div>
                )}

                {currentLead.leadSource && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Lead Source</Label>
                    <p className="text-sm">{currentLead.leadSource}</p>
                  </div>
                )}

                {currentLead.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <p className="text-sm bg-muted p-2 rounded">{currentLead.notes}</p>
                  </div>
                )}

                <Separator />

                {/* Call Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isDialing ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                          <span className="font-medium">Call Active</span>
                          <span className="text-sm">({formatCallDuration(callDuration)})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Ready to call</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isDialing ? (
                      <Button onClick={handleStartCall} className="flex-1">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Start Call
                      </Button>
                    ) : (
                      <Button onClick={handleEndCall} variant="destructive" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        End Call
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleSkipLead}>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                  </div>

                  {/* Call Outcome */}
                  <div className="space-y-2">
                    <Label>Call Outcome</Label>
                    <Select value={callOutcome} onValueChange={setCallOutcome}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contacted - Intake Scheduled">Contacted - Intake Scheduled</SelectItem>
                        <SelectItem value="Contacted - Follow-Up Scheduled">Contacted - Follow-Up Scheduled</SelectItem>
                        <SelectItem value="Contacted - No Follow Up Scheduled">Contacted - No Follow Up Scheduled</SelectItem>
                        <SelectItem value="Contacted - No Longer Interested">Contacted - No Longer Interested</SelectItem>
                        <SelectItem value="Contacted - Do Not Call">Contacted - Do Not Call</SelectItem>
                        <SelectItem value="Left Voicemail">Left Voicemail</SelectItem>
                        <SelectItem value="No Answer">No Answer</SelectItem>
                        <SelectItem value="Bad Number">Bad Number</SelectItem>
                        <SelectItem value="Disqualified">Disqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Call Notes */}
                  <div className="space-y-2">
                    <Label>Call Notes</Label>
                    <Textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Enter call notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Queue List */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Call Queue ({remainingLeads.length} remaining)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 p-4">
                    {remainingLeads.map((lead, index) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {currentIndex + index + 2}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.phone} • {lead.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            size="sm" 
                            className={readinessColors[lead.leadReadiness as keyof typeof readinessColors]}
                          >
                            {lead.leadReadiness}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {lead.numberOfCalls} calls
                          </div>
                        </div>
                      </div>
                    ))}
                    {remainingLeads.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <PhoneCall className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>This is the last lead in queue</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}