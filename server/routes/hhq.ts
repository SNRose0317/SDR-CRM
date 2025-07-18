import { Router } from "express";
import { storage } from "../storage";
import { insertHealthQuestionnaireSchema } from "@shared/schema";

const router = Router();

// Get HHQ for a lead
router.get("/lead/:leadId", async (req, res) => {
  try {
    const leadId = parseInt(req.params.leadId);
    const hhq = await storage.getHealthQuestionnaire(leadId);
    
    if (!hhq) {
      return res.status(404).json({ error: "HHQ not found for this lead" });
    }
    
    res.json(hhq);
  } catch (error: any) {
    console.error("Error fetching HHQ:", error);
    res.status(500).json({ error: "Failed to fetch HHQ" });
  }
});

// Create HHQ
router.post("/", async (req, res) => {
  try {
    const data = insertHealthQuestionnaireSchema.parse(req.body);
    const hhq = await storage.createHealthQuestionnaire(data);
    res.status(201).json(hhq);
  } catch (error: any) {
    console.error("Error creating HHQ:", error);
    res.status(400).json({ error: error.message });
  }
});

// Sign HHQ
router.post("/:id/sign", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { signatureData } = req.body;
    const hhq = await storage.signHealthQuestionnaire(id, signatureData);
    res.json(hhq);
  } catch (error: any) {
    console.error("Error signing HHQ:", error);
    res.status(500).json({ error: "Failed to sign HHQ" });
  }
});

// Process payment
router.post("/:id/pay", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }
    
    const hhq = await storage.markAsPaid(id, amount);
    res.json(hhq);
  } catch (error: any) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Book appointment
router.post("/:id/book-appointment", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }
    
    const hhq = await storage.bookAppointment(id, appointmentId);
    res.json(hhq);
  } catch (error: any) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// Get health coaches for booking
router.get("/health-coaches", async (req, res) => {
  try {
    const healthCoaches = await storage.getUsers();
    const coaches = healthCoaches.filter(user => user.role === 'Health Coach');
    res.json(coaches);
  } catch (error: any) {
    console.error("Error fetching health coaches:", error);
    res.status(500).json({ error: "Failed to fetch health coaches" });
  }
});

// Reset HHQ and sync lead status
router.delete("/lead/:leadId/reset", async (req, res) => {
  try {
    const leadId = parseInt(req.params.leadId);
    await storage.resetHealthQuestionnaire(leadId);
    res.json({ message: "HHQ reset successfully and lead status synchronized" });
  } catch (error: any) {
    console.error("Error resetting HHQ:", error);
    res.status(500).json({ error: "Failed to reset HHQ" });
  }
});

// Complete HHQ process and sync lead status
router.post("/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const hhq = await storage.completeHealthQuestionnaire(id);
    res.json(hhq);
  } catch (error: any) {
    console.error("Error completing HHQ:", error);
    res.status(500).json({ error: "Failed to complete HHQ" });
  }
});

export default router;