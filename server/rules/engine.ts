// Rule evaluation engine for dynamic permission system
import { db } from "../db";
import { permissionRules, ruleEvaluations, ruleAuditLog, users, leads, contacts, tasks, appointments } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { PermissionRule, RuleConfig } from "@shared/rules/schema";

export class RuleEngine {
  private static instance: RuleEngine;
  private cachedRules: Map<string, PermissionRule[]> = new Map();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RuleEngine {
    if (!RuleEngine.instance) {
      RuleEngine.instance = new RuleEngine();
    }
    return RuleEngine.instance;
  }

  // Get all active rules for an entity type
  async getRulesForEntity(entityType: string): Promise<PermissionRule[]> {
    const cacheKey = `rules_${entityType}`;
    const now = Date.now();
    
    // Check cache first
    if (this.cachedRules.has(cacheKey) && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
      return this.cachedRules.get(cacheKey)!;
    }

    // Fetch from database
    const rules = await db
      .select()
      .from(permissionRules)
      .where(
        and(
          eq(permissionRules.subjectType, entityType),
          eq(permissionRules.isActive, true)
        )
      )
      .orderBy(desc(permissionRules.priority));

    // Update cache
    this.cachedRules.set(cacheKey, rules);
    this.lastCacheUpdate = now;

    return rules;
  }

  // Evaluate a single rule against an entity
  async evaluateRule(
    rule: PermissionRule,
    entityType: string,
    entityId: number,
    userId: number
  ): Promise<{ matches: boolean; permissions: any }> {
    try {
      // Get the entity data
      const entity = await this.getEntityData(entityType, entityId);
      if (!entity) {
        return { matches: false, permissions: {} };
      }

      // Evaluate the compound condition
      const matches = await this.evaluateCompoundCondition(
        rule.conditions as any,
        entity
      );

      // If condition matches, return the permissions
      if (matches) {
        return {
          matches: true,
          permissions: rule.permissions,
        };
      }

      return { matches: false, permissions: {} };
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return { matches: false, permissions: {} };
    }
  }

  // Evaluate all rules for a user-entity combination
  async evaluateUserAccess(
    entityType: string,
    entityId: number,
    userId: number
  ): Promise<{ 
    canRead: boolean; 
    canWrite: boolean; 
    canAssign: boolean; 
    canDelete: boolean;
    appliedRules: string[];
  }> {
    const rules = await this.getRulesForEntity(entityType);
    let permissions = {
      canRead: false,
      canWrite: false,
      canAssign: false,
      canDelete: false,
      appliedRules: [] as string[],
    };

    // Get user data for role-based evaluation
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return permissions;
    }

    // Evaluate each rule
    for (const rule of rules) {
      // Check if rule applies to this user (by role or specific user)
      const appliesToUser = await this.ruleAppliesToUser(rule, user);
      if (!appliesToUser) {
        continue;
      }

      // Evaluate the rule condition
      const evaluation = await this.evaluateRule(rule, entityType, entityId, userId);
      
      if (evaluation.matches) {
        // Merge permissions (OR operation - if any rule grants access, user gets access)
        const rulePermissions = evaluation.permissions as any;
        
        if (rulePermissions.read) permissions.canRead = true;
        if (rulePermissions.write) permissions.canWrite = true;
        if (rulePermissions.assign) permissions.canAssign = true;
        if (rulePermissions.delete) permissions.canDelete = true;
        
        permissions.appliedRules.push(rule.name);

        // Cache the evaluation for performance
        await this.cacheEvaluation(rule.id, entityType, entityId, userId, evaluation);
        
        // Log the access grant
        await this.logRuleApplication(rule.id, entityType, entityId, userId, 'access_granted', rulePermissions);
      }
    }

    return permissions;
  }

  // Evaluate compound condition (supports AND/OR logic)
  private async evaluateCompoundCondition(
    condition: any,
    entity: any
  ): Promise<boolean> {
    // If it's a simple condition
    if (condition.field && condition.operator) {
      return this.evaluateSimpleCondition(condition.field, condition.operator, condition.value, entity);
    }
    
    // If it's a compound condition with logic
    if (condition.logic && condition.conditions) {
      const results = await Promise.all(
        condition.conditions.map((subCondition: any) => 
          this.evaluateCompoundCondition(subCondition, entity)
        )
      );
      
      if (condition.logic === 'AND') {
        return results.every(result => result);
      } else if (condition.logic === 'OR') {
        return results.some(result => result);
      }
    }
    
    return false;
  }

  // Evaluate a simple condition against entity data
  private evaluateSimpleCondition(
    fieldName: string,
    operator: string,
    ruleValue: any,
    entity: any
  ): boolean {
    const entityValue = entity[fieldName];
    
    switch (operator) {
      case '>':
        if (fieldName.includes('At') || fieldName.includes('Date') || fieldName.includes('Time')) {
          // Date comparison
          const entityDate = new Date(entityValue);
          const ruleDate = this.parseRuleValue(ruleValue);
          return entityDate > ruleDate;
        }
        return entityValue > ruleValue;
        
      case '<':
        if (fieldName.includes('At') || fieldName.includes('Date') || fieldName.includes('Time')) {
          const entityDate = new Date(entityValue);
          const ruleDate = this.parseRuleValue(ruleValue);
          return entityDate < ruleDate;
        }
        return entityValue < ruleValue;
        
      case '=':
        return entityValue === ruleValue;
        
      case '!=':
        return entityValue !== ruleValue;
        
      case 'contains':
        return String(entityValue).toLowerCase().includes(String(ruleValue).toLowerCase());
        
      case 'starts_with':
        return String(entityValue).toLowerCase().startsWith(String(ruleValue).toLowerCase());
        
      case 'ends_with':
        return String(entityValue).toLowerCase().endsWith(String(ruleValue).toLowerCase());
        
      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(entityValue);
        
      case 'between':
        if (Array.isArray(ruleValue) && ruleValue.length === 2) {
          return entityValue >= ruleValue[0] && entityValue <= ruleValue[1];
        }
        return false;
        
      case 'is_empty':
        return entityValue === null || entityValue === undefined || entityValue === '';
        
      case 'is_not_empty':
        return entityValue !== null && entityValue !== undefined && entityValue !== '';
        
      default:
        return false;
    }
  }

  // Parse rule value (handle relative dates like "24 hours ago")
  private parseRuleValue(ruleValue: any): Date {
    if (typeof ruleValue === 'string') {
      // Handle relative time expressions
      const match = ruleValue.match(/^(\d+)\s*(hours?|days?|minutes?)\s*ago$/i);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const now = new Date();
        
        switch (unit) {
          case 'hour':
          case 'hours':
            return new Date(now.getTime() - amount * 60 * 60 * 1000);
          case 'day':
          case 'days':
            return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
          case 'minute':
          case 'minutes':
            return new Date(now.getTime() - amount * 60 * 1000);
          default:
            return new Date(ruleValue);
        }
      }
    }
    
    return new Date(ruleValue);
  }

  // Check if rule applies to a specific user
  private async ruleAppliesToUser(rule: PermissionRule, user: any): Promise<boolean> {
    switch (rule.targetType) {
      case 'user':
        return rule.targetId === user.id.toString();
      case 'role':
        return rule.targetId === user.role;
      case 'team':
        // TODO: Implement team-based evaluation
        return false;
      default:
        return false;
    }
  }

  // Get entity data from appropriate table
  private async getEntityData(entityType: string, entityId: number): Promise<any> {
    switch (entityType) {
      case 'lead':
        const [lead] = await db.select().from(leads).where(eq(leads.id, entityId));
        return lead;
      case 'contact':
        const [contact] = await db.select().from(contacts).where(eq(contacts.id, entityId));
        return contact;
      case 'task':
        const [task] = await db.select().from(tasks).where(eq(tasks.id, entityId));
        return task;
      case 'appointment':
        const [appointment] = await db.select().from(appointments).where(eq(appointments.id, entityId));
        return appointment;
      default:
        return null;
    }
  }

  // Cache evaluation result
  private async cacheEvaluation(
    ruleId: number,
    entityType: string,
    entityId: number,
    userId: number,
    evaluation: { matches: boolean; permissions: any }
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.CACHE_TTL);
    
    await db
      .insert(ruleEvaluations)
      .values({
        ruleId,
        entityType,
        entityId,
        userId,
        matches: evaluation.matches,
        permissions: evaluation.permissions,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [ruleEvaluations.ruleId, ruleEvaluations.entityType, ruleEvaluations.entityId, ruleEvaluations.userId],
        set: {
          matches: evaluation.matches,
          permissions: evaluation.permissions,
          evaluatedAt: new Date(),
          expiresAt,
        },
      });
  }

  // Log rule application for auditing
  private async logRuleApplication(
    ruleId: number,
    entityType: string,
    entityId: number,
    userId: number,
    action: string,
    details: any
  ): Promise<void> {
    await db.insert(ruleAuditLog).values({
      ruleId,
      entityType,
      entityId,
      userId,
      action,
      details,
    });
  }

  // Create a new rule from configuration
  async createRule(config: RuleConfig, createdBy: number): Promise<PermissionRule> {
    const [rule] = await db
      .insert(permissionRules)
      .values({
        name: config.name,
        description: config.description,
        subjectType: config.subject.type,
        conditions: config.condition,
        actionType: config.action.type,
        targetType: config.action.target.type,
        targetId: config.action.target.id,
        permissions: config.action.permissions,
        createdBy,
      })
      .returning();

    // Clear cache
    this.cachedRules.clear();
    
    return rule;
  }

  // Update an existing rule
  async updateRule(ruleId: number, config: Partial<RuleConfig>): Promise<PermissionRule> {
    const updateData: any = {};
    
    if (config.name) updateData.name = config.name;
    if (config.description) updateData.description = config.description;
    if (config.subject) updateData.subjectType = config.subject.type;
    if (config.condition) {
      updateData.conditions = config.condition;
    }
    if (config.action) {
      updateData.actionType = config.action.type;
      updateData.targetType = config.action.target.type;
      updateData.targetId = config.action.target.id;
      updateData.permissions = config.action.permissions;
    }
    
    updateData.updatedAt = new Date();

    const [rule] = await db
      .update(permissionRules)
      .set(updateData)
      .where(eq(permissionRules.id, ruleId))
      .returning();

    // Clear cache
    this.cachedRules.clear();
    
    return rule;
  }

  // Delete a rule
  async deleteRule(ruleId: number): Promise<void> {
    await db.delete(permissionRules).where(eq(permissionRules.id, ruleId));
    
    // Clear cache
    this.cachedRules.clear();
  }

  // Get all rules for management UI
  async getAllRules(): Promise<PermissionRule[]> {
    return await db
      .select()
      .from(permissionRules)
      .orderBy(desc(permissionRules.priority), desc(permissionRules.createdAt));
  }
}

// Global instance
export const ruleEngine = RuleEngine.getInstance();