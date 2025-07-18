import { Router } from "express";
import { storage } from "../storage";
import { insertLeadSchema } from "@shared/schema";

const router = Router();

// Lead routes
router.get("/", async (req, res) => {
  try {
    const leads = await storage.getLeads(req.query);
    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getLeadStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ message: "Failed to fetch lead stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await storage.getLead(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Failed to fetch lead" });
  }
});

router.post("/", async (req, res) => {
  try {
    const leadData = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(leadData);
    res.status(201).json(lead);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
    }
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Failed to create lead" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const leadData = insertLeadSchema.partial().parse(req.body);
    const lead = await storage.updateLead(id, leadData);
    res.json(lead);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
    }
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Failed to update lead" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteLead(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Failed to delete lead" });
  }
});

// Permission-based lead assignment
router.post("/:id/assign", async (req, res) => {
  try {
    const entityId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await storage.assignEntity('leads', entityId, userId);
    return res.json(result);
  } catch (error) {
    console.error('Error assigning lead:', error);
    return res.status(500).json({ message: 'Failed to assign lead' });
  }
});

// Get leads for a specific user based on permissions
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userRole } = req.query;

    if (!userId || !userRole) {
      return res.status(400).json({ message: 'User ID and user role are required' });
    }

    const leads = await storage.getLeadsForUser(parseInt(userId), userRole as any);
    return res.json(leads);
  } catch (error) {
    console.error('Error getting leads for user:', error);
    return res.status(500).json({ message: 'Failed to get leads' });
  }
});

export default router;