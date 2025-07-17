import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Plus, Settings as SettingsIcon, Mail, Phone, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const leadStatuses = [
  "HHQ Started",
  "HHQ Signed", 
  "Booking: Not Paid",
  "Booking: Paid/Not Booked",
  "Booking: Paid/Booked"
];

const contactStages = [
  "Intake",
  "Initial Labs",
  "Initial Lab Review",
  "Initial Provider Exam",
  "Initial Medication Order",
  "1st Follow-up Labs",
  "First Follow-Up Lab Review",
  "First Follow-Up Provider Exam",
  "First Medication Refill",
  "Second Follow-Up Labs",
  "Second Follow-Up Lab Review",
  "Second Follow-up Provider Exam",
  "Second Medication Refill",
  "Third Medication Refill",
  "Restart Annual Process"
];

export default function Settings() {
  const [systemSettings, setSystemSettings] = useState({
    systemName: "HealthCRM",
    emailIntegration: "Gmail",
    autoDialer: "Twilio",
    activityLogging: true,
    ownershipTransfers: true
  });

  const [eventSettings, setEventSettings] = useState({
    autoCreateTasks: true,
    sendEmailNotifications: true,
    autoAdvanceStages: true,
    createFollowUpTasks: false
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  const handleSaveEventConfig = () => {
    toast({
      title: "Success",
      description: "Event configuration saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Configuration */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Lead Status Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadStatuses.map((status) => (
                <div key={status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{status}</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Stage Configuration */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Contact Stage Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contactStages.map((stage) => (
                <div key={stage} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{stage}</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Stage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event System Configuration */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle>Event System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium mb-2">Status Change Events</h4>
                <div className="text-sm text-muted-foreground mb-4">
                  Trigger actions when lead/contact status changes
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-create tasks</span>
                    <Switch 
                      checked={eventSettings.autoCreateTasks}
                      onCheckedChange={(checked) => 
                        setEventSettings({...eventSettings, autoCreateTasks: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Send email notifications</span>
                    <Switch 
                      checked={eventSettings.sendEmailNotifications}
                      onCheckedChange={(checked) => 
                        setEventSettings({...eventSettings, sendEmailNotifications: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium mb-2">Appointment Events</h4>
                <div className="text-sm text-muted-foreground mb-4">
                  Trigger actions when appointments are scheduled/completed
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-advance stages</span>
                    <Switch 
                      checked={eventSettings.autoAdvanceStages}
                      onCheckedChange={(checked) => 
                        setEventSettings({...eventSettings, autoAdvanceStages: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Create follow-up tasks</span>
                    <Switch 
                      checked={eventSettings.createFollowUpTasks}
                      onCheckedChange={(checked) => 
                        setEventSettings({...eventSettings, createFollowUpTasks: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Button className="w-full" onClick={handleSaveEventConfig}>
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="surface border-border">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={systemSettings.systemName}
                  onChange={(e) => setSystemSettings({...systemSettings, systemName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailIntegration">Email Integration</Label>
                <Select
                  value={systemSettings.emailIntegration}
                  onValueChange={(value) => setSystemSettings({...systemSettings, emailIntegration: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gmail">Gmail</SelectItem>
                    <SelectItem value="Outlook">Outlook</SelectItem>
                    <SelectItem value="Custom SMTP">Custom SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoDialer">Auto-dialer Integration</Label>
                <Select
                  value={systemSettings.autoDialer}
                  onValueChange={(value) => setSystemSettings({...systemSettings, autoDialer: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Twilio">Twilio</SelectItem>
                    <SelectItem value="RingCentral">RingCentral</SelectItem>
                    <SelectItem value="Custom VoIP">Custom VoIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable activity logging</span>
                  <Switch 
                    checked={systemSettings.activityLogging}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, activityLogging: checked})
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable ownership transfers</span>
                  <Switch 
                    checked={systemSettings.ownershipTransfers}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, ownershipTransfers: checked})
                    }
                  />
                </div>
              </div>
              
              <Button className="w-full" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
