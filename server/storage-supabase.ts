import { type UserSupabaseClient } from './lib/supabase-server';
import { 
  type Lead, 
  type InsertLead,
  type Contact,
  type InsertContact,
  type Task,
  type InsertTask,
  type Appointment,
  type InsertAppointment,
  type Person,
  type InsertPerson,
  type User
} from '@shared/schema';

/**
 * Supabase-based storage implementation
 * All methods use the user's Supabase client which automatically
 * applies RLS policies based on the user's permissions in their JWT
 */
export class SupabaseStorage {
  /**
   * Get all leads visible to the user
   * RLS automatically filters based on permissions:
   * - persons.view_own: Only owned leads
   * - persons.view_team: Team's leads
   * - persons.view_all: All leads
   */
  async getLeads(client: UserSupabaseClient, filters?: any) {
    let query = client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply optional filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }
    
    return data as Lead[];
  }

  /**
   * Get a single lead by ID
   * RLS ensures user can only see leads they have permission to view
   */
  async getLead(client: UserSupabaseClient, id: number) {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - either doesn't exist or no permission
        return null;
      }
      console.error('Error fetching lead:', error);
      throw new Error('Failed to fetch lead');
    }
    
    return data as Lead;
  }

  /**
   * Create a new lead
   * RLS checks if user has persons.create permission
   */
  async createLead(client: UserSupabaseClient, lead: InsertLead) {
    const { data, error } = await client
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to create leads');
      }
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
    
    return data as Lead;
  }

  /**
   * Update a lead
   * RLS checks edit permissions (own/team/all)
   */
  async updateLead(client: UserSupabaseClient, id: number, updates: Partial<InsertLead>) {
    const { data, error } = await client
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to edit this lead');
      }
      if (error.code === 'PGRST116') {
        throw new Error('Lead not found or no permission to edit');
      }
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
    
    return data as Lead;
  }

  /**
   * Delete a lead
   * RLS checks delete permissions
   */
  async deleteLead(client: UserSupabaseClient, id: number) {
    const { error } = await client
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to delete this lead');
      }
      console.error('Error deleting lead:', error);
      throw new Error('Failed to delete lead');
    }
  }

  /**
   * Claim an unassigned lead
   * RLS checks persons.claim permission
   */
  async claimLead(client: UserSupabaseClient, leadId: number, userId: string) {
    const { data, error } = await client
      .from('leads')
      .update({ assigned_to: userId, claimed_at: new Date().toISOString() })
      .eq('id', leadId)
      .is('assigned_to', null) // Only claim unassigned leads
      .select()
      .single();
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to claim leads');
      }
      if (error.code === 'PGRST116') {
        throw new Error('Lead not found, already claimed, or no permission');
      }
      console.error('Error claiming lead:', error);
      throw new Error('Failed to claim lead');
    }
    
    return data as Lead;
  }

  /**
   * Get lead statistics
   * Returns counts based on what the user can see
   */
  async getLeadStats(client: UserSupabaseClient) {
    // Get total count of visible leads
    const { count: totalCount, error: totalError } = await client
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error getting lead count:', totalError);
      throw new Error('Failed to get lead statistics');
    }

    // Get counts by status
    const { data: statusCounts, error: statusError } = await client
      .from('leads')
      .select('status')
      .order('status');
    
    if (statusError) {
      console.error('Error getting status counts:', statusError);
      throw new Error('Failed to get lead statistics');
    }

    // Group by status
    const statusGroups = statusCounts.reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalCount || 0,
      byStatus: statusGroups,
      // Add more stats as needed
    };
  }

  // Similar implementations for other entities...

  /**
   * Get tasks visible to the user
   */
  async getTasks(client: UserSupabaseClient, filters?: any) {
    let query = client
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
    
    return data as Task[];
  }

  /**
   * Create a new task
   */
  async createTask(client: UserSupabaseClient, task: InsertTask) {
    const { data, error } = await client
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to create tasks');
      }
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
    
    return data as Task;
  }

  /**
   * Get appointments visible to the user
   */
  async getAppointments(client: UserSupabaseClient, filters?: any) {
    let query = client
      .from('appointments')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (filters?.date) {
      query = query.gte('scheduled_at', filters.date)
                   .lt('scheduled_at', filters.datePlusOne);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
    
    return data as Appointment[];
  }

  /**
   * Get user information
   * Note: This might need special handling depending on your user table structure
   */
  async getUser(client: UserSupabaseClient, id: string) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
    
    return data as User;
  }

  /**
   * Get users (for admin/manager views)
   * RLS will filter based on users.view permission
   */
  async getUsers(client: UserSupabaseClient) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
    
    return data as User[];
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage();