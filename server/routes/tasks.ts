import { Router } from "express";
import { storage } from "../storage";
import { insertTaskSchema } from "@shared/schema";

const router = Router();

// Task routes
router.get("/", async (req, res) => {
  try {
    const tasks = await storage.getTasks(req.query);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getTaskStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching task stats:", error);
    res.status(500).json({ message: "Failed to fetch task stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

router.post("/", async (req, res) => {
  try {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const taskData = insertTaskSchema.partial().parse(req.body);
    const task = await storage.updateTask(id, taskData);
    res.json(task);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;