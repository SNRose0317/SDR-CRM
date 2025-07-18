import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, contacts, leads, portalSessions } from '@shared/schema';
import { eq, and, gt, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

interface PortalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'lead' | 'contact';
  entityId: number;
}

export class PortalAuthService {
  async loginExternalUser(email: string, password: string): Promise<{
    user: PortalUser;
    sessionToken: string;
  } | null> {
    // First try to find as a contact with portal access (prioritize contacts over leads)
    const [contactResult] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.email, email),
          eq(contacts.portalAccess, true)
        )
      );

    if (contactResult && contactResult.passwordHash) {
      const isValidPassword = await bcrypt.compare(password, contactResult.passwordHash);
      if (isValidPassword) {
        const sessionToken = nanoid(32);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(portalSessions).values({
          contactId: contactResult.id,
          sessionToken,
          expiresAt,
        });

        return {
          user: {
            id: contactResult.id,
            email: contactResult.email,
            firstName: contactResult.firstName,
            lastName: contactResult.lastName,
            userType: 'contact',
            entityId: contactResult.id,
          },
          sessionToken,
        };
      }
    }

    // Then try to find as a lead with portal access (only if no contact exists)
    const [leadResult] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.email, email),
          eq(leads.portalAccess, true)
        )
      );

    if (leadResult && leadResult.passwordHash) {
      const isValidPassword = await bcrypt.compare(password, leadResult.passwordHash);
      if (isValidPassword) {
        const sessionToken = nanoid(32);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(portalSessions).values({
          leadId: leadResult.id,
          sessionToken,
          expiresAt,
        });

        return {
          user: {
            id: leadResult.id,
            email: leadResult.email,
            firstName: leadResult.firstName,
            lastName: leadResult.lastName,
            userType: 'lead',
            entityId: leadResult.id,
          },
          sessionToken,
        };
      }
    }



    return null;
  }

  async validateSession(sessionToken: string): Promise<PortalUser | null> {
    const [sessionResult] = await db
      .select()
      .from(portalSessions)
      .leftJoin(leads, eq(portalSessions.leadId, leads.id))
      .leftJoin(contacts, eq(portalSessions.contactId, contacts.id))
      .where(
        and(
          eq(portalSessions.sessionToken, sessionToken),
          gt(portalSessions.expiresAt, new Date())
        )
      );

    if (!sessionResult) {
      return null;
    }

    // Check if it's a lead session
    if (sessionResult.leads) {
      return {
        id: sessionResult.leads.id,
        email: sessionResult.leads.email,
        firstName: sessionResult.leads.firstName,
        lastName: sessionResult.leads.lastName,
        userType: 'lead',
        entityId: sessionResult.leads.id,
      };
    }

    // Check if it's a contact session
    if (sessionResult.contacts) {
      return {
        id: sessionResult.contacts.id,
        email: sessionResult.contacts.email,
        firstName: sessionResult.contacts.firstName,
        lastName: sessionResult.contacts.lastName,
        userType: 'contact',
        entityId: sessionResult.contacts.id,
      };
    }

    return null;
  }

  async logoutExternalUser(sessionToken: string): Promise<void> {
    await db.delete(portalSessions).where(eq(portalSessions.sessionToken, sessionToken));
  }
}

export const portalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const authService = new PortalAuthService();
  
  try {
    const user = await authService.validateSession(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};