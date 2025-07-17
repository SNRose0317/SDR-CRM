import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import DataTable from "@/shared/components/data-display/data-table";
import LeadForm from "@/shared/components/composite/forms/lead-form";
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await fetch(`/api/leads?${params}`);
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedLead(null);
    setIsFormOpen(false);
  };

  const columns = [
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
            <div className="font-medium">{row.firstName} {row.lastName}</div>
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
      label: "Owner",
      render: (value: number) => {
        const owner = Array.isArray(users) ? users.find((u: any) => u.id === value) : undefined;
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
      render: (_: any, row: Lead) => (
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

      <DataTable
        columns={columns}
        data={leads || []}
        loading={isLoading}
        onFilter={setFilters}
        filters={filterComponents}
      />
    </div>
  );
}
