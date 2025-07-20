import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Checkbox } from "@/shared/components/ui/checkbox";
import DataTable from "@/shared/components/data-display/data-table";
import LeadForm from "@/features/leads/components/lead-form";
import { PhoneDialerDialog } from "@/features/leads/components/phone-dialer-dialog";
import { LeadProfileDialog } from "@/features/leads/components/lead-profile-dialog";
import { Plus, Edit, Trash2, Eye, MoreHorizontal, FileText, UserPlus, Phone, PhoneCall } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { Lead } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";
import EntityAssignment from "@/features/leads/components/lead-claiming";
import { HHQForm } from "@/features/hhq/components";

const statusColors = {
  "HHQ Started": "bg-amber-500/20 text-amber-500",
  "HHQ Signed": "bg-green-500/20 text-green-500",
  "Booking: Not Paid": "bg-red-500/20 text-red-500",
  "Booking: Paid/Not Booked": "bg-blue-500/20 text-blue-500",
  "Booking: Paid/Booked": "bg-green-500/20 text-green-500"
};

export default function Leads() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHHQOpen, setIsHHQOpen] = useState(false);
  const [hhqLead, setHhqLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"my-leads" | "open-leads">("my-leads");
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileLead, setProfileLead] = useState<Lead | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, claims, hasPermission } = useAuth();

  // Get role-specific labels
  const getEntityLabel = () => {
    switch (claims.userRole) {
      case 'sdr':
        return { singular: 'Lead', plural: 'Leads' };
      case 'health_coach':
        return { singular: 'Patient', plural: 'Patients' };
      default:
        return { singular: 'Person', plural: 'Persons' };
    }
  };

  const labels = getEntityLabel();

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  // With RBAC, we don't need user-specific endpoints
  // RLS automatically filters based on permissions
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads", filters],
    queryFn: () => apiRequest("/api/leads", { params: filters })
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/leads/stats"],
    queryFn: () => apiRequest("/api/leads/stats")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: `${labels.singular} deleted successfully`,
      });
    },
  });

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleDelete = (lead: Lead) => {
    if (confirm(`Are you sure you want to delete this ${labels.singular.toLowerCase()}?`)) {
      deleteMutation.mutate(lead.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedLead(null);
    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
  };

  const handleHHQClick = (lead: Lead) => {
    setHhqLead(lead);
    setIsHHQOpen(true);
  };

  const handlePhoneCall = (lead: Lead) => {
    setSelectedLeads([lead]);
    setIsDialerOpen(true);
  };

  const handleViewProfile = (lead: Lead) => {
    setProfileLead(lead);
    setIsProfileOpen(true);
  };

  const columns = [
    {
      key: "select",
      label: "",
      render: (lead: Lead) => (
        <Checkbox
          checked={selectedLeadIds.has(lead.id)}
          onCheckedChange={(checked) => {
            const newSet = new Set(selectedLeadIds);
            if (checked) {
              newSet.add(lead.id);
            } else {
              newSet.delete(lead.id);
            }
            setSelectedLeadIds(newSet);
            setSelectedLeads(leads?.filter((l: Lead) => newSet.has(l.id)) || []);
          }}
        />
      )
    },
    {
      key: "name",
      label: "Name",
      render: (lead: Lead) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {lead.firstName[0]}{lead.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{lead.firstName} {lead.lastName}</span>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Phone",
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <span>{lead.phone || 'N/A'}</span>
          {lead.phoneCallCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <PhoneCall className="w-3 h-3 mr-1" />
              {lead.phoneCallCount}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (lead: Lead) => (
        <Badge className={statusColors[lead.status as keyof typeof statusColors] || "bg-gray-500/20 text-gray-500"}>
          {lead.status}
        </Badge>
      )
    },
    {
      key: "leadSource",
      label: "Source",
      render: (lead: Lead) => lead.leadSource || 'N/A'
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (lead: Lead) => {
        const assignedUser = users?.find((u: any) => u.id === lead.assignedTo);
        return assignedUser ? assignedUser.name : 'Unassigned';
      }
    },
    {
      key: "actions",
      label: "",
      render: (lead: Lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewProfile(lead)}>
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <PermissionGate permissions={["persons.edit_own", "persons.edit_team", "persons.edit_all"]}>
              <DropdownMenuItem onClick={() => handleEdit(lead)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </PermissionGate>
            {claims.userRole === 'sdr' && (
              <>
                <DropdownMenuItem onClick={() => handleHHQClick(lead)}>
                  <FileText className="w-4 h-4 mr-2" />
                  HHQ Form
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePhoneCall(lead)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </DropdownMenuItem>
              </>
            )}
            <PermissionGate permissions={["persons.delete_own", "persons.delete_all"]}>
              <DropdownMenuItem onClick={() => handleDelete(lead)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{labels.plural}</h1>
          <p className="text-muted-foreground">
            Manage your {labels.plural.toLowerCase()} and track progress
          </p>
        </div>
        <div className="flex gap-2">
          {selectedLeadIds.size > 0 && claims.userRole === 'sdr' && (
            <Button 
              variant="outline" 
              onClick={() => setIsDialerOpen(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Selected ({selectedLeadIds.size})
            </Button>
          )}
          <PermissionGate permissions="persons.create">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedLead(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New {labels.singular}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedLead ? `Edit ${labels.singular}` : `Create New ${labels.singular}`}
                  </DialogTitle>
                </DialogHeader>
                <LeadForm
                  lead={selectedLead}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Role-specific stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="surface rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total {labels.plural}</div>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </div>
          {claims.userRole === 'sdr' && (
            <>
              <div className="surface rounded-lg p-4">
                <div className="text-sm text-muted-foreground">My {labels.plural}</div>
                <div className="text-2xl font-bold">{stats.myLeads || 0}</div>
              </div>
              <div className="surface rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Open {labels.plural}</div>
                <div className="text-2xl font-bold">{stats.openLeads || 0}</div>
              </div>
              <div className="surface rounded-lg p-4">
                <div className="text-sm text-muted-foreground">HHQ Signed</div>
                <div className="text-2xl font-bold">{stats.hhqSigned || 0}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SDR-specific tabs */}
      {claims.userRole === 'sdr' ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="my-leads">My {labels.plural}</TabsTrigger>
            <TabsTrigger value="open-leads">Open {labels.plural}</TabsTrigger>
          </TabsList>
          <TabsContent value="my-leads">
            <DataTable
              data={leads?.filter((l: Lead) => l.assignedTo === user?.id) || []}
              columns={columns}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="open-leads">
            <EntityAssignment entityType="leads" />
          </TabsContent>
        </Tabs>
      ) : (
        <DataTable
          data={leads || []}
          columns={columns}
          isLoading={isLoading}
        />
      )}

      {/* HHQ Form Dialog - SDR only */}
      {hhqLead && claims.userRole === 'sdr' && (
        <HHQForm
          isOpen={isHHQOpen}
          onClose={() => {
            setIsHHQOpen(false);
            setHhqLead(null);
          }}
          leadId={hhqLead.id}
        />
      )}

      {/* Phone Dialer - SDR only */}
      {claims.userRole === 'sdr' && (
        <PhoneDialerDialog
          isOpen={isDialerOpen}
          onClose={() => {
            setIsDialerOpen(false);
            setSelectedLeads([]);
            setSelectedLeadIds(new Set());
          }}
          leads={selectedLeads}
        />
      )}

      {/* Lead Profile Dialog */}
      {profileLead && (
        <LeadProfileDialog
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setProfileLead(null);
          }}
          leadId={profileLead.id}
        />
      )}
    </div>
  );
}