export interface DashboardStats {
  totalLeads: number;
  totalContacts: number;
  pendingTasks: number;
  todayAppointments: number;
}

export interface LeadStats {
  status: string;
  count: number;
}

export interface ContactStats {
  stage: string;
  count: number;
}

export interface TaskStats {
  status: string;
  count: number;
}

export interface FilterOptions {
  status?: string;
  stage?: string;
  priority?: string;
  assignedToId?: number;
  ownerId?: number;
  healthCoachId?: number;
  userId?: number;
  search?: string;
  date?: string;
  role?: string;
  isActive?: boolean;
  leadSource?: string;
}
