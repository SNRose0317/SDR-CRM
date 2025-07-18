import { Router } from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";

const router = Router();

// Contact routes
router.get("/", async (req, res) => {
  try {
    const contacts = await storage.getContacts(req.query);
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getContactStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({ message: "Failed to fetch contact stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contact = await storage.getContact(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: "Failed to fetch contact" });
  }
});

router.post("/", async (req, res) => {
  try {
    const contactData = insertContactSchema.parse(req.body);
    const contact = await storage.createContact(contactData);
    res.status(201).json(contact);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
    }
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Failed to create contact" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contactData = insertContactSchema.partial().parse(req.body);
    const contact = await storage.updateContact(id, contactData);
    res.json(contact);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
    }
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteContact(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

// Permission-based contact assignment
router.post("/:id/assign", async (req, res) => {
  try {
    const entityId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await storage.assignEntity('contacts', entityId, userId);
    return res.json(result);
  } catch (error) {
    console.error('Error assigning contact:', error);
    return res.status(500).json({ message: 'Failed to assign contact' });
  }
});

// Get contacts for a specific user based on permissions
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userRole } = req.query;

    if (!userId || !userRole) {
      return res.status(400).json({ message: 'User ID and user role are required' });
    }

    const contacts = await storage.getContactsForUser(parseInt(userId), userRole as any);
    return res.json(contacts);
  } catch (error) {
    console.error('Error getting contacts for user:', error);
    return res.status(500).json({ message: 'Failed to get contacts' });
  }
});

export default router;