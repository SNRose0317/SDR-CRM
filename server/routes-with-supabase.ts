import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import {
  dashboardRoutes,
  userRoutes,
  leadRoutes,
  contactRoutes,
  taskRoutes,
  appointmentRoutes,
  portalRoutes,
  ruleRoutes,
  hhqRoutes,
  dialerRoutes
} from "./routes/index";

// Import Supabase versions
import leadRoutesSupabase from "./routes/leads-supabase";
import contactRoutesSupabase from "./routes/contacts-supabase";
import taskRoutesSupabase from "./routes/tasks-supabase";
import appointmentRoutesSupabase from "./routes/appointments-supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  const useSupabaseAuth = process.env.USE_SUPABASE_AUTH === 'true';

  // Log which auth mode we're using
  console.log(`🔐 Auth Mode: ${useSupabaseAuth ? 'Supabase (RBAC)' : 'Legacy'}`);

  // Register dashboard routes (no auth changes needed)
  app.use("/api/dashboard", dashboardRoutes);
  
  // Register user routes (no changes for now)
  app.use("/api/users", userRoutes);
  
  // Conditionally register routes based on auth mode
  if (useSupabaseAuth) {
    // Use Supabase versions with RLS
    app.use("/api/leads", leadRoutesSupabase);
    app.use("/api/contacts", contactRoutesSupabase);
    app.use("/api/tasks", taskRoutesSupabase);
    app.use("/api/appointments", appointmentRoutesSupabase);
  } else {
    // Use legacy routes
    app.use("/api/leads", leadRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/appointments", appointmentRoutes);
  }

  // These routes don't need immediate changes
  app.use("/api/portal", portalRoutes);
  app.use("/api/rules", ruleRoutes);
  app.use("/api/hhq", hhqRoutes);
  app.use("/api", dialerRoutes);

  // Activity logs endpoint (dashboard-related)
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Note: These generic endpoints will be deprecated when using Supabase
  // as RLS handles permission-based filtering automatically
  if (!useSupabaseAuth) {
    // Generic entity assignment endpoint
    app.post("/api/:entityType/:id/assign", async (req, res) => {
      try {
        const { entityType, id } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
        }
        
        if (entityType !== 'leads' && entityType !== 'contacts') {
          return res.status(400).json({ message: 'Entity type must be leads or contacts' });
        }
        
        const result = await storage.assignEntity(entityType, parseInt(id), userId);
        return res.json(result);
      } catch (error) {
        console.error('Error assigning entity:', error);
        return res.status(500).json({ message: 'Failed to assign entity' });
      }
    });

    // Generic available entities endpoint
    app.get("/api/available/:entityType", async (req, res) => {
      try {
        const { entityType } = req.params;
        const { userId, userRole } = req.query;

        if (!userId || !userRole) {
          return res.status(400).json({ message: 'User ID and user role are required' });
        }

        if (entityType !== 'leads' && entityType !== 'contacts') {
          return res.status(400).json({ message: 'Entity type must be leads or contacts' });
        }

        const entities = await storage.getAvailableEntities(
          parseInt(userId as string), 
          userRole as any, 
          entityType
        );
        
        return res.json(entities);
      } catch (error) {
        console.error('Error getting available entities:', error);
        return res.status(500).json({ message: 'Failed to get available entities' });
      }
    });

    // Permission-based entity listing
    app.get("/api/:entityType/user/:userId", async (req, res) => {
      try {
        const { entityType, userId } = req.params;
        const { userRole } = req.query;

        if (!entityType || !userId || !userRole) {
          return res.status(400).json({ message: 'Entity type, user ID, and user role are required' });
        }

        if (entityType !== 'leads' && entityType !== 'contacts') {
          return res.status(400).json({ message: 'Entity type must be leads or contacts' });
        }

        let entities;
        if (entityType === 'leads') {
          entities = await storage.getLeadsForUser(parseInt(userId), userRole as any);
        } else {
          entities = await storage.getContactsForUser(parseInt(userId), userRole as any);
        }
        
        return res.json(entities);
      } catch (error) {
        console.error('Error getting entities for user:', error);
        return res.status(500).json({ message: 'Failed to get entities' });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}