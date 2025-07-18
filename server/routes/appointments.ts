import { Router } from "express";
import { storage } from "../storage";
import { insertAppointmentSchema } from "@shared/schema";

const router = Router();

// Appointment routes
router.get("/", async (req, res) => {
  try {
    const appointments = await storage.getAppointments(req.query);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getAppointmentStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({ message: "Failed to fetch appointment stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
});

router.post("/", async (req, res) => {
  try {
    const appointmentData = insertAppointmentSchema.parse(req.body);
    const appointment = await storage.createAppointment(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
    }
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointmentData = insertAppointmentSchema.partial().parse(req.body);
    const appointment = await storage.updateAppointment(id, appointmentData);
    res.json(appointment);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
    }
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Failed to update appointment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteAppointment(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

export default router;