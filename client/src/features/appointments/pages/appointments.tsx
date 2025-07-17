import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import DataTable from "@/shared/components/data-display/data-table";
import AppointmentForm from "@/features/appointments/components/appointment-form";
import { Plus, Edit, Trash2, Calendar, MoreHorizontal, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";

const statusColors = {
  Scheduled: "bg-blue-500/20 text-blue-500",
  Confirmed: "bg-green-500/20 text-green-500",
  Completed: "bg-gray-500/20 text-gray-500",
  Cancelled: "bg-red-500/20 text-red-500",
  "No Show": "bg-orange-500/20 text-orange-500"
};

export default function Appointments() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await fetch(`/api/appointments?${params}`);
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/appointments?date=${today}`);
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment status updated",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
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

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedAppointment(null);
    setIsFormOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Appointment",
      sortable: true,
      render: (_: any, row: Appointment) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-muted-foreground">{row.description}</div>
        </div>
      ),
    },
    {
      key: "scheduledAt",
      label: "Date & Time",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      key: "userId",
      label: "Provider",
      render: (value: number) => {
        const provider = Array.isArray(users) ? users.find((u: any) => u.id === value) : undefined;
        return provider ? (
          <div className="text-sm">
            <div>{provider.firstName} {provider.lastName}</div>
            <div className="text-muted-foreground">{provider.role}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      key: "patient",
      label: "Patient",
      render: (_: any, row: Appointment) => {
        if (row.leadId) {
          const lead = Array.isArray(leads) ? leads.find((l: any) => l.id === row.leadId) : undefined;
          return lead ? (
            <div className="text-sm">
              <div>{lead.firstName} {lead.lastName}</div>
              <div className="text-muted-foreground">Lead: LD-{lead.id}</div>
            </div>
          ) : null;
        }
        if (row.contactId) {
          const contact = Array.isArray(contacts) ? contacts.find((c: any) => c.id === row.contactId) : undefined;
          return contact ? (
            <div className="text-sm">
              <div>{contact.firstName} {contact.lastName}</div>
              <div className="text-muted-foreground">Contact: CT-{contact.id}</div>
            </div>
          ) : null;
        }
        return <span className="text-muted-foreground">No patient</span>;
      },
    },
    {
      key: "duration",
      label: "Duration",
      render: (value: number) => `${value} min`,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Appointment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.status === "Scheduled" && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(row.id, "Confirmed")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </DropdownMenuItem>
            )}
            {row.status !== "Completed" && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(row.id, "Completed")}>
                <Clock className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(row.id, "Cancelled")}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
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
          <SelectItem value="Scheduled">Scheduled</SelectItem>
          <SelectItem value="Confirmed">Confirmed</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
          <SelectItem value="No Show">No Show</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.userId?.toString() || ""}
        onValueChange={(value) => setFilters({ ...filters, userId: value ? parseInt(value) : undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Providers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
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
        <h2 className="text-2xl font-bold">Appointment Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAppointment ? "Edit Appointment" : "Schedule New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Appointments */}
      <Card className="surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Today's Appointments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments && todayAppointments.length > 0 ? (
              todayAppointments.map((appointment: any) => (
                <div key={appointment.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{appointment.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(appointment.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {appointment.description}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                      {appointment.status}
                    </Badge>
                    {appointment.meetingLink && (
                      <Button size="sm" variant="outline">
                        Join Call
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            )}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={appointments || []}
        loading={isLoading}
        onFilter={setFilters}
        filters={filterComponents}
      />
    </div>
  );
}
