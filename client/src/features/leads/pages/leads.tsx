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

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Mock current user for demo - in real app this would come from auth
  const currentUser = users?.find(u => u.role === 'Admin') || users?.[0]; // Select admin user for testing

  // Get My Leads (assigned to current user)
  const { data: myLeads, isLoading: isMyLeadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads/my-leads", currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(`/api/leads/my-leads/${currentUser!.id}?userRole=${currentUser!.role}`);
      if (!response.ok) {
        throw new Error('Failed to fetch my leads');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Get Open Leads (unassigned leads with health coach 24-hour filtering)
  const { data: openLeads, isLoading: isOpenLeadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads/open-leads", currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const response = await fetch(`/api/leads/open-leads/${currentUser!.id}?userRole=${currentUser!.role}`);
      if (!response.ok) {
        throw new Error('Failed to fetch open leads');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Get the current leads based on active tab
  const leads = activeTab === "my-leads" ? myLeads : openLeads;
  const isLoading = activeTab === "my-leads" ? isMyLeadsLoading : isOpenLeadsLoading;

  // Get call counts for current leads
  const { data: callCounts } = useQuery({
    queryKey: ["/api/call-sessions/counts", leads?.map(l => l.id)],
    queryFn: async () => {
      if (!leads || leads.length === 0) return {};
      const counts: Record<number, number> = {};
      
      // Fetch call counts for each lead
      await Promise.all(leads.map(async (lead) => {
        const response = await fetch(`/api/call-sessions?leadId=${lead.id}`);
        if (response.ok) {
          const sessions = await response.json();
          counts[lead.id] = sessions.length;
        } else {
          counts[lead.id] = 0;
        }
      }));
      
      return counts;
    },
    enabled: !!leads && leads.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      // Invalidate both tab queries
      queryClient.invalidateQueries({ queryKey: ["/api/leads/my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/open-leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
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

  const claimLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      if (!currentUser) throw new Error("No current user");
      await apiRequest("PUT", `/api/leads/${leadId}`, {
        ownerId: currentUser.id
      });
    },
    onSuccess: () => {
      // Invalidate both tab queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["/api/leads/my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/open-leads"] });
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

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleClaimLead = (leadId: number) => {
    claimLeadMutation.mutate(leadId);
  };

  const handlePhoneClick = (lead: Lead) => {
    setSelectedLeads([lead]);
    setIsDialerOpen(true);
  };

  const handleViewProfile = (lead: Lead) => {
    setProfileLead(lead);
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileLead(null);
    setIsProfileOpen(false);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedLead(null);
    setIsFormOpen(false);
    // Invalidate both tab queries
    queryClient.invalidateQueries({ queryKey: ["/api/leads/my-leads"] });
    queryClient.invalidateQueries({ queryKey: ["/api/leads/open-leads"] });
  };

  const handleStartHHQ = (lead: Lead) => {
    setHhqLead(lead);
    setIsHHQOpen(true);
  };

  const handleHHQClose = () => {
    setHhqLead(null);
    setIsHHQOpen(false);
    // Invalidate both tab queries
    queryClient.invalidateQueries({ queryKey: ["/api/leads/my-leads"] });
    queryClient.invalidateQueries({ queryKey: ["/api/leads/open-leads"] });
  };

  // Multi-select helper functions
  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelectedIds = new Set(selectedLeadIds);
    if (checked) {
      newSelectedIds.add(leadId);
    } else {
      newSelectedIds.delete(leadId);
    }
    setSelectedLeadIds(newSelectedIds);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && leads) {
      const allIds = new Set(leads.map(lead => lead.id));
      setSelectedLeadIds(allIds);
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleAddSelectedToDialer = () => {
    if (selectedLeadIds.size === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to add to the dialer.",
        variant: "destructive",
      });
      return;
    }

    const currentLeads = activeTab === "my-leads" ? myLeads : openLeads;
    const selectedLeadsForDialer = currentLeads?.filter(lead => selectedLeadIds.has(lead.id)) || [];
    
    setSelectedLeads(selectedLeadsForDialer);
    setIsDialerOpen(true);
    setSelectedLeadIds(new Set()); // Clear selection after adding to dialer
  };

  const columns = [
    {
      key: "select",
      label: (
        <Checkbox
          checked={leads?.length > 0 && selectedLeadIds.size === leads?.length}
          onCheckedChange={handleSelectAll}
          aria-label="Select all leads"
        />
      ),
      render: (_: any, row: Lead) => (
        <Checkbox
          checked={selectedLeadIds.has(row.id)}
          onCheckedChange={(checked) => handleSelectLead(row.id, checked as boolean)}
          aria-label={`Select lead ${row.firstName} ${row.lastName}`}
        />
      ),
    },
    {
      key: "name",
      label: "Lead Name",
      sortable: true,
      render: (_: any, row: Lead) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {row.firstName[0]}{row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <button
              onClick={() => handleViewProfile(row)}
              className="font-medium text-left hover:text-primary cursor-pointer transition-colors"
            >
              {row.firstName} {row.lastName}
            </button>
            <div className="text-sm text-muted-foreground">ID: LD-{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge className={statusColors[value as keyof typeof statusColors]}>
          {value}
        </Badge>
      ),
    },
    {
      key: "ownerId",
      label: "Lead Sales Person",
      render: (value: number) => {
        const safeUsers = users || [];
        const owner = Array.isArray(safeUsers) ? safeUsers.find((u: any) => u.id === value) : undefined;
        return owner ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>
                {owner.firstName?.[0]}{owner.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>{owner.firstName} {owner.lastName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      key: "lastContacted",
      label: "Last Contacted",
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : (
        <span className="text-muted-foreground">Never</span>
      ),
    },
    {
      key: "numberOfCalls",
      label: "# of Calls",
      sortable: true,
      render: (_: any, row: Lead) => {
        const count = callCounts?.[row.id] ?? 0;
        return (
          <div className="text-center">
            <span className="font-mono">{count}</span>
          </div>
        );
      },
    },
    {
      key: "leadReadiness",
      label: "Lead Readiness",
      sortable: true,
      render: (value: string) => {
        const readinessColors = {
          "Cold": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          "Warm": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          "Hot": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          "Follow Up": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        };
        return (
          <Badge className={readinessColors[value as keyof typeof readinessColors] || "bg-gray-100 text-gray-800"}>
            {value || "Cold"}
          </Badge>
        );
      },
    },
    {
      key: "leadType",
      label: "Lead Type",
      sortable: true,
      render: (value: string) => value || <span className="text-muted-foreground">-</span>,
    },
    {
      key: "leadSource",
      label: "Lead Source",
      sortable: true,
      render: (value: string) => value || <span className="text-muted-foreground">-</span>,
    },
    {
      key: "leadOutcome",
      label: "Lead Outcome",
      sortable: true,
      render: (value: string) => value || <span className="text-muted-foreground">-</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: string, row: Lead) => value ? (
        <button 
          onClick={() => handlePhoneClick(row)}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
          title="Click to open dialer"
        >
          <Phone className="h-3 w-3" />
          {value}
        </button>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Lead) => (
        <div className="flex items-center space-x-2">
          {/* Show Claim Lead button for unassigned leads in Open Leads tab */}
          {activeTab === "open-leads" && !row.ownerId && (
            <Button 
              onClick={() => handleClaimLead(row.id)}
              size="sm"
              variant="outline"
              disabled={claimLeadMutation.isPending}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Claim Lead
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedLeads([row]);
                setIsDialerOpen(true);
              }}>
                <PhoneCall className="w-4 h-4 mr-2" />
                Call Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStartHHQ(row)}>
                <FileText className="w-4 h-4 mr-2" />
                Start HHQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewProfile(row)}>
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(row.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filterComponents = (
    <>
      <Select
        value={filters.status || ""}
        onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="HHQ Started">HHQ Started</SelectItem>
          <SelectItem value="HHQ Signed">HHQ Signed</SelectItem>
          <SelectItem value="Booking: Not Paid">Booking: Not Paid</SelectItem>
          <SelectItem value="Booking: Paid/Not Booked">Booking: Paid/Not Booked</SelectItem>
          <SelectItem value="Booking: Paid/Booked">Booking: Paid/Booked</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.ownerId?.toString() || ""}
        onValueChange={(value) => setFilters({ ...filters, ownerId: value ? parseInt(value) : undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Owners" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Owners</SelectItem>
          {Array.isArray(users) && users.map((user: any) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.firstName} {user.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Management</h2>
        <div className="flex items-center gap-2">
          {selectedLeadIds.size > 0 && (
            <Button
              onClick={handleAddSelectedToDialer}
              variant="default"
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Add {selectedLeadIds.size} to Dialer
            </Button>
          )}
          <Button
            onClick={() => {
              const currentLeads = activeTab === "my-leads" ? myLeads : openLeads;
              if (currentLeads && currentLeads.length > 0) {
                setSelectedLeads(currentLeads);
                setIsDialerOpen(true);
              } else {
                toast({
                  title: "No leads available",
                  description: "There are no leads to dial in this tab.",
                  variant: "destructive",
                });
              }
            }}
            variant="outline"
            disabled={!leads || leads.length === 0}
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Bulk Dialer (All)
          </Button>
          <EntityAssignment currentUser={currentUser} entityType="leads" />
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedLead ? "Edit Lead" : "Add New Lead"}
              </DialogTitle>
            </DialogHeader>
            <LeadForm
              lead={selectedLead}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value as "my-leads" | "open-leads");
          // Clear selection when switching tabs
          setSelectedLeadIds(new Set());
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-leads">My Leads</TabsTrigger>
          <TabsTrigger value="open-leads">Open Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="my-leads" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Leads assigned to you ({myLeads?.length || 0})
            </p>
          </div>
          <DataTable
            columns={columns}
            data={myLeads || []}
            loading={isMyLeadsLoading}
            onFilter={setFilters}
            filters={filterComponents}
          />
        </TabsContent>

        <TabsContent value="open-leads" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Unassigned leads available for claiming ({openLeads?.length || 0})
              {currentUser?.role === 'health_coach' && (
                <span className="ml-2 text-amber-600">
                  • Health coaches can only see leads older than 24 hours
                </span>
              )}
            </p>
          </div>
          <DataTable
            columns={columns}
            data={openLeads || []}
            loading={isOpenLeadsLoading}
            onFilter={setFilters}
            filters={filterComponents}
          />
        </TabsContent>
      </Tabs>

      {/* HHQ Dialog */}
      <Dialog open={isHHQOpen} onOpenChange={setIsHHQOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Health History Questionnaire</DialogTitle>
          </DialogHeader>
          {hhqLead && (
            <HHQForm
              lead={hhqLead}
              onComplete={handleHHQClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Phone Dialer Dialog */}
      <PhoneDialerDialog
        isOpen={isDialerOpen}
        onClose={() => setIsDialerOpen(false)}
        leads={selectedLeads}
        currentUser={currentUser}
        onViewProfile={handleViewProfile}
      />

      {/* Lead Profile Dialog */}
      <LeadProfileDialog
        isOpen={isProfileOpen}
        onClose={handleProfileClose}
        lead={profileLead}
      />
    </div>
  );
}
