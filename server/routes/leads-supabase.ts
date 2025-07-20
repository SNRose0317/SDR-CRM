import { Router } from "express";
import { authenticateRequest, type AuthRequest } from "../middleware/auth";
import { supabaseStorage } from "../storage-supabase";
import { insertLeadSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateRequest);

/**
 * Get all leads visible to the user
 * RLS automatically filters based on user's permissions
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const leads = await supabaseStorage.getLeads(req.supabase, req.query);
    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: error.message || "Failed to fetch leads" });
  }
});

/**
 * Get lead statistics
 * Returns counts based on what the user can see
 */
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const stats = await supabaseStorage.getLeadStats(req.supabase);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ message: error.message || "Failed to fetch lead stats" });
  }
});

/**
 * Get a specific lead by ID
 * RLS ensures user can only see leads they have permission to view
 */
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const lead = await supabaseStorage.getLead(req.supabase, id);
    
    if (!lead) {
      return res.status(404).json({ message: "Lead not found or no permission to view" });
    }
    
    res.json(lead);
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: error.message || "Failed to fetch lead" });
  }
});

/**
 * Create a new lead
 * RLS checks if user has persons.create permission
 */
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    // Validate input
    const leadData = insertLeadSchema.parse(req.body);
    
    // If no owner specified, assign to current user
    if (!leadData.assigned_to && req.userId) {
      leadData.assigned_to = req.userId;
    }
    
    const lead = await supabaseStorage.createLead(req.supabase, leadData);
    res.status(201).json(lead);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
    }
    console.error("Error creating lead:", error);
    res.status(500).json({ message: error.message || "Failed to create lead" });
  }
});

/**
 * Update a lead
 * RLS checks edit permissions (own/team/all)
 */
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const leadData = insertLeadSchema.partial().parse(req.body);
    
    const lead = await supabaseStorage.updateLead(req.supabase, id, leadData);
    res.json(lead);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
    }
    console.error("Error updating lead:", error);
    res.status(500).json({ message: error.message || "Failed to update lead" });
  }
});

/**
 * Delete a lead
 * RLS checks delete permissions
 */
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    await supabaseStorage.deleteLead(req.supabase, id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: error.message || "Failed to delete lead" });
  }
});

/**
 * Claim an unassigned lead
 * RLS checks persons.claim permission
 */
router.post("/:id/claim", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase || !req.userId) {
      return res.status(500).json({ message: "Authentication required" });
    }

    const leadId = parseInt(req.params.id);
    const lead = await supabaseStorage.claimLead(req.supabase, leadId, req.userId);
    res.json(lead);
  } catch (error: any) {
    console.error("Error claiming lead:", error);
    res.status(500).json({ message: error.message || "Failed to claim lead" });
  }
});

/**
 * Assign a lead to another user
 * RLS checks persons.transfer permission
 */
router.post("/:id/assign", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const leadId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Use update method with transfer permission check
    const lead = await supabaseStorage.updateLead(req.supabase, leadId, {
      assigned_to: userId
    });
    
    res.json(lead);
  } catch (error: any) {
    console.error('Error assigning lead:', error);
    res.status(500).json({ message: error.message || 'Failed to assign lead' });
  }
});

/**
 * Track phone call for a lead
 * Updates call count and last contacted timestamp
 */
router.put("/:id/call", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    
    // First get the current lead to check permissions and get current call count
    const currentLead = await supabaseStorage.getLead(req.supabase, id);
    if (!currentLead) {
      return res.status(404).json({ message: "Lead not found or no permission" });
    }
    
    // Update with incremented call count and new timestamp
    const lead = await supabaseStorage.updateLead(req.supabase, id, {
      phone_call_count: (currentLead.phone_call_count || 0) + 1,
      last_contacted_at: new Date().toISOString()
    });
    
    res.json(lead);
  } catch (error: any) {
    console.error("Error tracking phone call:", error);
    res.status(500).json({ message: error.message || "Failed to track phone call" });
  }
});

// Note: Removed the following endpoints as they're redundant with RLS:
// - /user/:userId - RLS automatically filters based on permissions
// - /my-leads/:userId - Just use / with RLS
// - /open-leads/:userId - Use /?assigned_to=null with RLS

export default router;