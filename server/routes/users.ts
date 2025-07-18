import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

const router = Router();

// User routes
router.get("/", async (req, res) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid user data", errors: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userData = insertUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(id, userData);
    res.json(user);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: "Invalid user data", errors: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default router;