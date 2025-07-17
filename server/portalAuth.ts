import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, contacts, patientSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface PortalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  contactId: number;
  contact: any;
}

export class PortalAuthService {
  async loginPatient(email: string, password: string): Promise<{
    user: PortalUser;
    sessionToken: string;
  } | null> {
    // For now, use email as password for portal access (in production, use proper password hashing)
    // Find user with portal access and Patient role
    const [userResult] = await db
      .select()
      .from(users)
      .leftJoin(contacts, eq(users.contactId, contacts.id))
      .where(
        and(
          eq(users.email, email),
          eq(users.role, 'Patient'),
          eq(users.portalAccess, true),
          eq(users.isActive, true)
        )
      );

    if (!userResult || !userResult.users) {
      return null;
    }

    // Create session
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(patientSessions).values({
      patientId: userResult.users.contactId!,
      sessionToken,
      expiresAt,
    });

    // Update last portal login
    await db
      .update(users)
      .set({ lastPortalLogin: new Date() })
      .where(eq(users.id, userResult.users.id));

    return {
      user: {
        id: userResult.users.id,
        email: userResult.users.email,
        firstName: userResult.users.firstName || '',
        lastName: userResult.users.lastName || '',
        contactId: userResult.users.contactId!,
        contact: userResult.contacts,
      },
      sessionToken,
    };
  }

  async validateSession(sessionToken: string): Promise<PortalUser | null> {
    const [sessionResult] = await db
      .select()
      .from(patientSessions)
      .leftJoin(contacts, eq(patientSessions.patientId, contacts.id))
      .leftJoin(users, eq(users.contactId, patientSessions.patientId))
      .where(
        and(
          eq(patientSessions.sessionToken, sessionToken),
          gt(patientSessions.expiresAt, new Date())
        )
      );

    if (!sessionResult || !sessionResult.users) return null;

    return {
      id: sessionResult.users.id,
      email: sessionResult.users.email,
      firstName: sessionResult.users.firstName || '',
      lastName: sessionResult.users.lastName || '',
      contactId: sessionResult.users.contactId!,
      contact: sessionResult.contacts,
    };
  }

  async logoutPatient(sessionToken: string): Promise<void> {
    await db
      .update(patientSessions)
      .set({ expiresAt: new Date() }) // Expire the session
      .where(eq(patientSessions.sessionToken, sessionToken));
  }
}

// Middleware for portal authentication
export const portalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session token provided' });
  }

  const authService = new PortalAuthService();
  const user = await authService.validateSession(sessionToken);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  (req as any).user = user;
  next();
};