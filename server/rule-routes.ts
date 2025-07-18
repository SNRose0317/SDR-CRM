import { Router } from "express";
import { ruleEngine } from "./rule-engine";
import { z } from "zod";
import type { RuleConfig } from "@shared/rule-schema";

const router = Router();

// Enhanced validation schema for compound conditions
const simpleConditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum(['>', '<', '=', '!=', 'contains', 'starts_with', 'ends_with', 'in', 'between', 'is_empty', 'is_not_empty']),
  value: z.any(),
});

const compoundConditionSchema: z.ZodSchema<any> = z.lazy(() => z.object({
  logic: z.enum(['AND', 'OR']),
  conditions: z.array(z.union([simpleConditionSchema, compoundConditionSchema])),
}));

const conditionSchema = z.union([simpleConditionSchema, compoundConditionSchema]);

// Rule configuration validation schema
const ruleConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  subject: z.object({
    type: z.enum(['lead', 'contact', 'task', 'appointment']),
  }),
  condition: conditionSchema,
  action: z.object({
    type: z.enum(['grant_access', 'assign_entity', 'trigger_workflow', 'send_notification']),
    target: z.object({
      type: z.enum(['user', 'role', 'team']),
      id: z.string().optional(),
    }),
    permissions: z.object({
      read: z.boolean().optional(),
      write: z.boolean().optional(),
      assign: z.boolean().optional(),
      delete: z.boolean().optional(),
    }),
  }),
});

// Get all rules
router.get("/", async (req, res) => {
  try {
    const rules = await ruleEngine.getAllRules();
    res.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ message: "Failed to fetch rules" });
  }
});

// Create a new rule
router.post("/", async (req, res) => {
  try {
    const validatedData = ruleConfigSchema.parse(req.body);
    const createdBy = req.body.createdBy || 1; // TODO: Get from auth context
    
    const rule = await ruleEngine.createRule(validatedData, createdBy);
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      console.error("Error creating rule:", error);
      res.status(500).json({ message: "Failed to create rule" });
    }
  }
});

// Update a rule
router.put("/:id", async (req, res) => {
  try {
    const ruleId = parseInt(req.params.id);
    const validatedData = ruleConfigSchema.partial().parse(req.body);
    
    const rule = await ruleEngine.updateRule(ruleId, validatedData);
    res.json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      console.error("Error updating rule:", error);
      res.status(500).json({ message: "Failed to update rule" });
    }
  }
});

// Delete a rule
router.delete("/:id", async (req, res) => {
  try {
    const ruleId = parseInt(req.params.id);
    await ruleEngine.deleteRule(ruleId);
    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ message: "Failed to delete rule" });
  }
});

// Test rule evaluation
router.post("/test", async (req, res) => {
  try {
    const { entityType, entityId, userId } = req.body;
    
    if (!entityType || !entityId || !userId) {
      return res.status(400).json({ 
        message: "entityType, entityId, and userId are required" 
      });
    }
    
    const evaluation = await ruleEngine.evaluateUserAccess(
      entityType, 
      parseInt(entityId), 
      parseInt(userId)
    );
    
    res.json(evaluation);
  } catch (error) {
    console.error("Error testing rule:", error);
    res.status(500).json({ message: "Failed to test rule" });
  }
});

export default router;