import { Router } from "express";
import { authenticateRequest, type AuthRequest } from "../middleware/auth";
import { supabaseStorage } from "../storage-supabase";
import { insertContactSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateRequest);

/**
 * Get all contacts visible to the user
 * RLS automatically filters based on user's permissions
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const contacts = await supabaseStorage.getContacts(req.supabase, req.query);
    res.json(contacts);
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: error.message || "Failed to fetch contacts" });
  }
});

/**
 * Get contact statistics
 * Returns counts based on what the user can see
 */
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const stats = await supabaseStorage.getContactStats(req.supabase);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({ message: error.message || "Failed to fetch contact stats" });
  }
});

/**
 * Get a specific contact by ID
 * RLS ensures user can only see contacts they have permission to view
 */
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const contact = await supabaseStorage.getContact(req.supabase, id);
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found or no permission to view" });
    }
    
    res.json(contact);
  } catch (error: any) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: error.message || "Failed to fetch contact" });
  }
});

/**
 * Create a new contact
 * RLS checks if user has persons.create permission
 */
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    // Validate input
    const contactData = insertContactSchema.parse(req.body);
    
    // If no owner specified, assign to current user
    if (!contactData.assigned_to && req.userId) {
      contactData.assigned_to = req.userId;
    }
    
    const contact = await supabaseStorage.createContact(req.supabase, contactData);
    res.status(201).json(contact);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
    }
    console.error("Error creating contact:", error);
    res.status(500).json({ message: error.message || "Failed to create contact" });
  }
});

/**
 * Update a contact
 * RLS checks edit permissions (own/team/all)
 */
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const contactData = insertContactSchema.partial().parse(req.body);
    
    const contact = await supabaseStorage.updateContact(req.supabase, id, contactData);
    res.json(contact);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
    }
    console.error("Error updating contact:", error);
    res.status(500).json({ message: error.message || "Failed to update contact" });
  }
});

/**
 * Delete a contact
 * RLS checks delete permissions
 */
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    await supabaseStorage.deleteContact(req.supabase, id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: error.message || "Failed to delete contact" });
  }
});

/**
 * Assign a contact to another user
 * RLS checks persons.transfer permission
 */
router.post("/:id/assign", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const contactId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Use update method with transfer permission check
    const contact = await supabaseStorage.updateContact(req.supabase, contactId, {
      assigned_to: userId
    });
    
    res.json(contact);
  } catch (error: any) {
    console.error('Error assigning contact:', error);
    res.status(500).json({ message: error.message || 'Failed to assign contact' });
  }
});

// Note: Removed the following endpoints as they're redundant with RLS:
// - /user/:userId - RLS automatically filters based on permissions
// These user-centric endpoints are replaced by data-centric queries with RLS

export default router;