import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { insertLeadSchema, type Lead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertLeadSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  ownerId: z.coerce.number().optional(),
  notes: z.string().optional(),
  leadType: z.string().optional(),
  leadSource: z.string().optional(),
  leadOutcome: z.string().optional(),
  leadReadiness: z.enum(["Cold", "Warm", "Hot", "Follow Up"]).optional(),
});

interface LeadFormProps {
  lead?: Lead | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LeadForm({ lead, onSuccess, onCancel }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: lead?.firstName || "",
      lastName: lead?.lastName || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      status: lead?.status || "HHQ Started",
      ownerId: lead?.ownerId || undefined,
      notes: lead?.notes || "",
      leadType: lead?.leadType || "",
      leadSource: lead?.leadSource || "",
      leadOutcome: lead?.leadOutcome || "",
      leadReadiness: lead?.leadReadiness || "Cold",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const url = lead ? `/api/leads/${lead.id}` : "/api/leads";
      const method = lead ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: `Lead ${lead ? "updated" : "created"} successfully`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HHQ Started">HHQ Started</SelectItem>
                    <SelectItem value="HHQ Signed">HHQ Signed</SelectItem>
                    <SelectItem value="Booking: Not Paid">Booking: Not Paid</SelectItem>
                    <SelectItem value="Booking: Paid/Not Booked">Booking: Paid/Not Booked</SelectItem>
                    <SelectItem value="Booking: Paid/Booked">Booking: Paid/Booked</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {Array.isArray(users) && users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leadType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Inbound, Outbound, Referral" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HHQ Complete">HHQ Complete</SelectItem>
                    <SelectItem value="HHQ Started">HHQ Started</SelectItem>
                    <SelectItem value="Lab Purchase">Lab Purchase</SelectItem>
                    <SelectItem value="Marek Health Discovery Call">Marek Health Discovery Call</SelectItem>
                    <SelectItem value="Newsletter Discovery Call">Newsletter Discovery Call</SelectItem>
                    <SelectItem value="Social Media Discovery Call">Social Media Discovery Call</SelectItem>
                    <SelectItem value="Newsletter">Newsletter</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leadReadiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Readiness</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select readiness level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Warm">Warm</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Follow Up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadOutcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Outcome</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Qualified, Not Interested, Follow Up" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : (lead ? "Update" : "Create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
