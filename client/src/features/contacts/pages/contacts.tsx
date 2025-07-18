import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import DataTable from "@/shared/components/data-display/data-table";
import ContactForm from "@/features/contacts/components/contact-form";
import EntityAssignment from "@/features/leads/components/lead-claiming";
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";

const stageColors = {
  "Intake": "bg-amber-500/20 text-amber-500",
  "Initial Labs": "bg-blue-500/20 text-blue-500",
  "Initial Lab Review": "bg-green-500/20 text-green-500",
  "Initial Provider Exam": "bg-purple-500/20 text-purple-500",
  "Initial Medication Order": "bg-red-500/20 text-red-500",
  "1st Follow-up Labs": "bg-indigo-500/20 text-indigo-500",
  "First Follow-Up Lab Review": "bg-pink-500/20 text-pink-500",
  "First Follow-Up Provider Exam": "bg-orange-500/20 text-orange-500",
  "First Medication Refill": "bg-teal-500/20 text-teal-500",
  "Second Follow-Up Labs": "bg-cyan-500/20 text-cyan-500",
  "Second Follow-Up Lab Review": "bg-lime-500/20 text-lime-500",
  "Second Follow-up Provider Exam": "bg-rose-500/20 text-rose-500",
  "Second Medication Refill": "bg-violet-500/20 text-violet-500",
  "Third Medication Refill": "bg-emerald-500/20 text-emerald-500",
  "Restart Annual Process": "bg-gray-500/20 text-gray-500"
};

export default function Contacts() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await fetch(`/api/contacts?${params}`);
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Mock current user for demo - in real app this would come from auth
  const currentUser = users?.[0]; // This would be the logged-in user

  const { data: contactStats } = useQuery({
    queryKey: ["/api/contacts/stats"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
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
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedContact(null);
    setIsFormOpen(false);
  };

  const columns = [
    {
      key: "name",
      label: "Contact Name",
      sortable: true,
      render: (_: any, row: Contact) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {row.firstName[0]}{row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.firstName} {row.lastName}</div>
            <div className="text-sm text-muted-foreground">ID: CT-{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      render: (value: string) => (
        <Badge className={stageColors[value as keyof typeof stageColors]}>
          {value}
        </Badge>
      ),
    },
    {
      key: "healthCoachId",
      label: "Health Coach",
      render: (value: number) => {
        const coach = Array.isArray(users) ? users.find((u: any) => u.id === value) : undefined;
        return coach ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>
                {coach.firstName?.[0]}{coach.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>{coach.firstName} {coach.lastName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
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
      render: (_: any, row: Contact) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              View
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
      ),
    },
  ];

  const filterComponents = (
    <>
      <Select
        value={filters.stage || ""}
        onValueChange={(value) => setFilters({ ...filters, stage: value || undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {Object.keys(stageColors).map((stage) => (
            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.healthCoachId?.toString() || ""}
        onValueChange={(value) => setFilters({ ...filters, healthCoachId: value ? parseInt(value) : undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Health Coaches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Health Coaches</SelectItem>
          {Array.isArray(users) && users.filter((user: any) => user.role === "Health Coach").map((user: any) => (
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
        <h2 className="text-2xl font-bold">Contact Management</h2>
        <div className="flex items-center gap-2">
          <EntityAssignment currentUser={currentUser} entityType="contacts" />
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
              </DialogHeader>
              <ContactForm
                contact={selectedContact}
                onSuccess={handleFormClose}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Healthcare Pipeline Stages */}
      <Card className="surface border-border">
        <CardHeader>
          <CardTitle>Healthcare Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.isArray(contactStats) && contactStats.slice(0, 5).map((stat: any) => (
              <div key={stat.stage} className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">{stat.stage}</h4>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm text-muted-foreground">Contacts</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={contacts || []}
        loading={isLoading}
        onFilter={setFilters}
        filters={filterComponents}
      />
    </div>
  );
}
