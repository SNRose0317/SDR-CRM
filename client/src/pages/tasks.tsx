import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DataTable from "@/components/data-table";
import TaskForm from "@/components/forms/task-form";
import { Plus, Edit, Trash2, Check, MoreHorizontal, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";

const priorityColors = {
  Low: "bg-green-500/20 text-green-500",
  Medium: "bg-amber-500/20 text-amber-500",
  High: "bg-red-500/20 text-red-500"
};

const statusColors = {
  Pending: "bg-amber-500/20 text-amber-500",
  "In Progress": "bg-blue-500/20 text-blue-500",
  Completed: "bg-green-500/20 text-green-500"
};

export default function Tasks() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await fetch(`/api/tasks?${params}`);
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

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/tasks/${id}`, { status: "Completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task completed successfully",
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
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
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

  const handleComplete = (id: number) => {
    completeMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedTask(null);
    setIsFormOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Task",
      sortable: true,
      render: (_, row: Task) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-muted-foreground">{row.description}</div>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => (
        <Badge className={priorityColors[value as keyof typeof priorityColors]}>
          {value}
        </Badge>
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
      key: "assignedToId",
      label: "Assigned To",
      render: (value: number) => {
        const assignee = users?.find((u: any) => u.id === value);
        return assignee ? (
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>
                {assignee.firstName?.[0]}{assignee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>{assignee.firstName} {assignee.lastName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      key: "relatedContact",
      label: "Related Contact",
      render: (_, row: Task) => {
        if (row.leadId) {
          const lead = leads?.find((l: any) => l.id === row.leadId);
          return lead ? (
            <div className="text-sm">
              <div>{lead.firstName} {lead.lastName}</div>
              <div className="text-muted-foreground">Lead: LD-{lead.id}</div>
            </div>
          ) : null;
        }
        if (row.contactId) {
          const contact = contacts?.find((c: any) => c.id === row.contactId);
          return contact ? (
            <div className="text-sm">
              <div>{contact.firstName} {contact.lastName}</div>
              <div className="text-muted-foreground">Contact: CT-{contact.id}</div>
            </div>
          ) : null;
        }
        return <span className="text-muted-foreground">No relation</span>;
      },
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (value: string) => {
        if (!value) return <span className="text-muted-foreground">No due date</span>;
        
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <div className="text-sm">
            <div>{dueDate.toLocaleDateString()}</div>
            <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-green-400'}`}>
              {isOverdue ? 'Overdue' : 'On Time'}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row: Task) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.status !== "Completed" && (
              <DropdownMenuItem onClick={() => handleComplete(row.id)}>
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
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
        value={filters.priority || ""}
        onValueChange={(value) => setFilters({ ...filters, priority: value || undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Priorities</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status || ""}
        onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.assignedToId?.toString() || ""}
        onValueChange={(value) => setFilters({ ...filters, assignedToId: value ? parseInt(value) : undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Assignees</SelectItem>
          {users?.map((user: any) => (
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
        <h2 className="text-2xl font-bold">Task Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              task={selectedTask}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={tasks || []}
        loading={isLoading}
        onFilter={setFilters}
        filters={filterComponents}
      />
    </div>
  );
}
