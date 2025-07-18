import { Request, Response } from 'express';
import { db } from '../db';
import { leads, users, activityLogs } from '@shared/schema';
import { eq, and, sql, or } from 'drizzle-orm';

// API endpoint to claim a lead
export async function claimLead(req: Request, res: Response) {
  try {
    const { leadId } = req.params;
    const { userId } = req.body;

    if (!leadId || !userId) {
      return res.status(400).json({ message: 'Lead ID and User ID are required' });
    }

    // Get the lead and user info
    const [lead] = await db.select().from(leads).where(eq(leads.id, parseInt(leadId)));
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if lead is already claimed
    if (lead.poolStatus === 'claimed') {
      return res.status(400).json({ message: 'Lead is already claimed' });
    }

    // Check if user has permission to claim this lead
    const canClaim = await canUserClaimLead(user.role, lead.poolEnteredAt);
    if (!canClaim.allowed) {
      return res.status(403).json({ message: canClaim.reason });
    }

    // Claim the lead
    const [updatedLead] = await db.update(leads)
      .set({
        ownerId: parseInt(userId),
        poolStatus: 'claimed',
        claimedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(leads.id, parseInt(leadId)))
      .returning();

    // Log the activity
    await db.insert(activityLogs).values({
      entityType: 'lead',
      entityId: parseInt(leadId),
      userId: parseInt(userId),
      action: 'lead_claimed',
      details: `Lead claimed by ${user.firstName} ${user.lastName} (${user.role})`,
    });

    return res.json({
      success: true,
      message: 'Lead claimed successfully',
      data: { lead: updatedLead }
    });

  } catch (error) {
    console.error('Error claiming lead:', error);
    return res.status(500).json({ message: 'Failed to claim lead' });
  }
}

// API endpoint to get available leads for claiming
export async function getAvailableLeads(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user info
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId as string)));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let availableLeads;

    if (user.role === 'SDR') {
      // SDRs can see all open leads
      availableLeads = await db.select().from(leads)
        .where(eq(leads.poolStatus, 'open'));
    } else if (user.role === 'health_coach') {
      // Health Coaches can see leads that are:
      // 1. Open and older than 24 hours
      // 2. Available to health coaches
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      availableLeads = await db.select().from(leads)
        .where(
          or(
            and(
              eq(leads.poolStatus, 'open'),
              sql`${leads.poolEnteredAt} < ${twentyFourHoursAgo}`
            ),
            eq(leads.poolStatus, 'available_to_health_coaches')
          )
        );
    } else {
      return res.status(403).json({ message: 'User role not authorized to claim leads' });
    }

    return res.json({
      success: true,
      data: { leads: availableLeads }
    });

  } catch (error) {
    console.error('Error getting available leads:', error);
    return res.status(500).json({ message: 'Failed to get available leads' });
  }
}

// Helper function to check if a user can claim a lead
async function canUserClaimLead(userRole: string, leadEnteredAt: Date | null): Promise<{allowed: boolean, reason?: string}> {
  if (!leadEnteredAt) {
    return { allowed: false, reason: 'Lead has no entry date' };
  }

  const now = new Date();
  const hoursElapsed = (now.getTime() - leadEnteredAt.getTime()) / (1000 * 60 * 60);

  if (userRole === 'SDR') {
    // SDRs can claim leads anytime
    return { allowed: true };
  } else if (userRole === 'health_coach') {
    // Health Coaches can only claim leads after 24 hours
    if (hoursElapsed >= 24) {
      return { allowed: true };
    } else {
      return { 
        allowed: false, 
        reason: `Lead is still in SDR claiming period. ${Math.ceil(24 - hoursElapsed)} hours remaining.` 
      };
    }
  } else {
    return { allowed: false, reason: 'User role not authorized to claim leads' };
  }
}