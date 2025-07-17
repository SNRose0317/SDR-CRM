import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import DataTable from "@/shared/components/data-display/data-table";
import UserForm from "@/shared/components/composite/forms/user-form";
import { Plus, Edit, UserX, MoreHorizontal, User as UserIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import type { FilterOptions } from "@/lib/types";

const roleColors = {
  "SDR": "bg-amber-500/20 text-amber-500",
  "Health Coach": "bg-green-500/20 text-green-500",
  "Admin": "bg-red-500/20 text-red-500"
};

export default function Users() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await fetch(`/api/users?${params}`);
      return response.json();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
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

  const handleToggleActive = (id: number, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setSelectedUser(null);
    setIsFormOpen(false);
  };

  const columns = [
    {
      key: "user",
      label: "User",
      sortable: true,
      render: (_: any, row: User) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {row.firstName?.[0] || 'U'}{row.lastName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.firstName} {row.lastName}</div>
            <div className="text-sm text-muted-foreground">ID: USR-{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value: string) => (
        <Badge className={roleColors[value as keyof typeof roleColors]}>
          {value}
        </Badge>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <Badge className={value ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
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
      key: "actions",
      label: "Actions",
      render: (_: any, row: User) => (
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
            <DropdownMenuItem 
              onClick={() => handleToggleActive(row.id, row.isActive || false)}
            >
              <UserX className="w-4 h-4 mr-2" />
              {row.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filterComponents = (
    <>
      <Select
        value={filters.role || ""}
        onValueChange={(value) => setFilters({ ...filters, role: value || undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="SDR">SDR</SelectItem>
          <SelectItem value="Health Coach">Health Coach</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.isActive?.toString() || ""}
        onValueChange={(value) => setFilters({ ...filters, isActive: value ? value === 'true' : undefined })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onSuccess={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={users || []}
        loading={isLoading}
        onFilter={setFilters}
        filters={filterComponents}
      />
    </div>
  );
}
