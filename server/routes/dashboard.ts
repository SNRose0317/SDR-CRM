import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Dashboard routes
router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

router.get("/activity-logs", async (req, res) => {
  try {
    const logs = await storage.getActivityLogs();
    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

export default router;