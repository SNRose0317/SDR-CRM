import { Router } from "express";
import { authenticateRequest, type AuthRequest } from "../middleware/auth";
import { supabaseStorage } from "../storage-supabase";
import { insertTaskSchema } from "@shared/schema";

const router = Router();

// All routes require authentication
router.use(authenticateRequest);

/**
 * Get all tasks visible to the user
 * RLS automatically filters based on user's permissions
 */
router.get("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const tasks = await supabaseStorage.getTasks(req.supabase, req.query);
    res.json(tasks);
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: error.message || "Failed to fetch tasks" });
  }
});

/**
 * Get task statistics
 * Returns counts based on what the user can see
 */
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const stats = await supabaseStorage.getTaskStats(req.supabase);
    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({ message: error.message || "Failed to fetch task stats" });
  }
});

/**
 * Get a specific task by ID
 * RLS ensures user can only see tasks they have permission to view
 */
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const task = await supabaseStorage.getTask(req.supabase, id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found or no permission to view" });
    }
    
    res.json(task);
  } catch (error: any) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: error.message || "Failed to fetch task" });
  }
});

/**
 * Create a new task
 * RLS checks if user has tasks.create permission
 */
router.post("/", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    // Validate input
    const taskData = insertTaskSchema.parse(req.body);
    
    // If no assignee specified, assign to current user
    if (!taskData.assigned_to && req.userId) {
      taskData.assigned_to = req.userId;
    }
    
    // If no created_by specified, set to current user
    if (!taskData.created_by && req.userId) {
      taskData.created_by = req.userId;
    }
    
    const task = await supabaseStorage.createTask(req.supabase, taskData);
    res.status(201).json(task);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error("Error creating task:", error);
    res.status(500).json({ message: error.message || "Failed to create task" });
  }
});

/**
 * Update a task
 * RLS checks edit permissions (own/team/all)
 */
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    const taskData = insertTaskSchema.partial().parse(req.body);
    
    const task = await supabaseStorage.updateTask(req.supabase, id, taskData);
    res.json(task);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error("Error updating task:", error);
    res.status(500).json({ message: error.message || "Failed to update task" });
  }
});

/**
 * Delete a task
 * RLS checks delete permissions
 */
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    await supabaseStorage.deleteTask(req.supabase, id);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: error.message || "Failed to delete task" });
  }
});

/**
 * Mark a task as complete
 * Updates status and completed_at timestamp
 */
router.post("/:id/complete", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const id = parseInt(req.params.id);
    
    // Update task status and completion timestamp
    const task = await supabaseStorage.updateTask(req.supabase, id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    res.json(task);
  } catch (error: any) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: error.message || "Failed to complete task" });
  }
});

/**
 * Assign a task to another user
 * RLS checks tasks.transfer permission
 */
router.post("/:id/assign", async (req: AuthRequest, res) => {
  try {
    if (!req.supabase) {
      return res.status(500).json({ message: "Supabase client not initialized" });
    }

    const taskId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Use update method with transfer permission check
    const task = await supabaseStorage.updateTask(req.supabase, taskId, {
      assigned_to: userId
    });
    
    res.json(task);
  } catch (error: any) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: error.message || 'Failed to assign task' });
  }
});

export default router;