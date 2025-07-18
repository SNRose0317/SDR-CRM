import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Create call session
router.post("/call-sessions", async (req, res) => {
  try {
    const callSessionSchema = z.object({
      leadId: z.number(),
      userId: z.number(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      duration: z.number().optional(),
      disposition: z.string().optional(),
      notes: z.string().optional(),
      outcome: z.string().optional(),
      nextAction: z.string().optional()
    });

    const sessionData = callSessionSchema.parse(req.body);
    
    // Convert string dates to Date objects
    const processedData = {
      ...sessionData,
      startTime: sessionData.startTime ? new Date(sessionData.startTime) : undefined,
      endTime: sessionData.endTime ? new Date(sessionData.endTime) : undefined,
    };

    const callSession = await storage.createCallSession(processedData);
    res.json(callSession);
  } catch (error) {
    console.error("Error creating call session:", error);
    res.status(500).json({ error: "Failed to create call session" });
  }
});

// Get call sessions
router.get("/call-sessions", async (req, res) => {
  try {
    const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    const sessions = await storage.getCallSessions(leadId, userId);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching call sessions:", error);
    res.status(500).json({ error: "Failed to fetch call sessions" });
  }
});

// Create dialer queue
router.post("/dialer-queue", async (req, res) => {
  try {
    const queueSchema = z.object({
      userId: z.number(),
      name: z.string(),
      leadIds: z.array(z.number()),
      autoDialerEnabled: z.boolean().default(false),
      autoDialerDelay: z.number().default(10)
    });

    const queueData = queueSchema.parse(req.body);
    const queue = await storage.createDialerQueue(queueData);
    res.json(queue);
  } catch (error) {
    console.error("Error creating dialer queue:", error);
    res.status(500).json({ error: "Failed to create dialer queue" });
  }
});

// Get user's active dialer queue
router.get("/dialer-queue/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const queue = await storage.getDialerQueue(userId);
    res.json(queue);
  } catch (error) {
    console.error("Error fetching dialer queue:", error);
    res.status(500).json({ error: "Failed to fetch dialer queue" });
  }
});

// Update dialer queue
router.put("/dialer-queue/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const queue = await storage.updateDialerQueue(id, updateData);
    res.json(queue);
  } catch (error) {
    console.error("Error updating dialer queue:", error);
    res.status(500).json({ error: "Failed to update dialer queue" });
  }
});

// Delete dialer queue
router.delete("/dialer-queue/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteDialerQueue(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting dialer queue:", error);
    res.status(500).json({ error: "Failed to delete dialer queue" });
  }
});

export default router;