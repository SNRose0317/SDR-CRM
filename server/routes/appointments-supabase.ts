import { Router } from "express";
import { authenticateRequest, type AuthRequest } from "../middleware/auth";
import { supabaseStorage } from "../storage-supabase";
import { insertAppointmentSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateRequest);

/**
 * Get all appointments visible to the user
 * RLS automatically filters based on user's permissions
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const appointments = await supabaseStorage.getAppointments(req.supabase, req.query);
    res.json(appointments);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: error.message || "Failed to fetch appointments" });
  }
});

/**
 * Get appointment statistics
 * Returns counts based on what the user can see
 */
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const stats = await supabaseStorage.getAppointmentStats(req.supabase);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching appointment stats:", error);
    res.status(500).json({ message: error.message || "Failed to fetch appointment stats" });
  }
});

/**
 * Get a specific appointment by ID
 * RLS ensures user can only see appointments they have permission to view
 */
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const appointment = await supabaseStorage.getAppointment(req.supabase, id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or no permission to view" });
    }
    
    res.json(appointment);
  } catch (error: any) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: error.message || "Failed to fetch appointment" });
  }
});

/**
 * Create a new appointment
 * RLS checks if user has appointments.create permission
 */
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    // Validate input
    const appointmentData = insertAppointmentSchema.parse(req.body);
    
    // If no organizer specified, set to current user
    if (!appointmentData.organizer_id && req.userId) {
      appointmentData.organizer_id = req.userId;
    }
    
    // If no created_by specified, set to current user
    if (!appointmentData.created_by && req.userId) {
      appointmentData.created_by = req.userId;
    }
    
    const appointment = await supabaseStorage.createAppointment(req.supabase, appointmentData);
    res.status(201).json(appointment);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
    }
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: error.message || "Failed to create appointment" });
  }
});

/**
 * Update an appointment
 * RLS checks edit permissions (own/team/all)
 */
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const appointmentData = insertAppointmentSchema.partial().parse(req.body);
    
    const appointment = await supabaseStorage.updateAppointment(req.supabase, id, appointmentData);
    res.json(appointment);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
    }
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: error.message || "Failed to update appointment" });
  }
});

/**
 * Delete an appointment
 * RLS checks delete permissions
 */
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    await supabaseStorage.deleteAppointment(req.supabase, id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: error.message || "Failed to delete appointment" });
  }
});

/**
 * Cancel an appointment
 * Updates status to cancelled
 */
router.post("/:id/cancel", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const { reason } = req.body;
    
    // Update appointment status
    const appointment = await supabaseStorage.updateAppointment(req.supabase, id, {
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
    
    res.json(appointment);
  } catch (error: any) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: error.message || "Failed to cancel appointment" });
  }
});

/**
 * Reschedule an appointment
 * Updates the scheduled time
 */
router.post("/:id/reschedule", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const { scheduled_at, scheduled_end_at } = req.body;
    
    if (!scheduled_at || !scheduled_end_at) {
      return res.status(400).json({ message: 'New scheduled times are required' });
    }
    
    // Update appointment times
    const appointment = await supabaseStorage.updateAppointment(req.supabase, id, {
      scheduled_at,
      scheduled_end_at,
      status: 'scheduled' // Reset to scheduled if it was completed/cancelled
    });
    
    res.json(appointment);
  } catch (error: any) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: error.message || 'Failed to reschedule appointment' });
  }
});

export default router;