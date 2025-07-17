import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, contacts, portalSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

interface PortalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  contactId?: number;
  contact?: any;
}

export class PortalAuthService {
  async loginPatient(email: string, password: string): Promise<{
    user: PortalUser;
    sessionToken: string;
  } | null> {
    // Find user with Patient role
    const [userResult] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.role, 'Patient')
        )
      );

    if (!userResult || !userResult.passwordHash) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userResult.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Create session
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(portalSessions).values({
      userId: userResult.id,
      sessionToken,
      expiresAt,
    });

    return {
      user: {
        id: userResult.id,
        email: userResult.email,
        firstName: userResult.firstName,
        lastName: userResult.lastName,
      },
      sessionToken,
    };
  }

  async validateSession(sessionToken: string): Promise<PortalUser | null> {
    const [sessionResult] = await db
      .select()
      .from(portalSessions)
      .leftJoin(users, eq(portalSessions.userId, users.id))
      .where(
        and(
          eq(portalSessions.sessionToken, sessionToken),
          gt(portalSessions.expiresAt, new Date())
        )
      );

    if (!sessionResult || !sessionResult.users) {
      return null;
    }

    return {
      id: sessionResult.users.id,
      email: sessionResult.users.email,
      firstName: sessionResult.users.firstName,
      lastName: sessionResult.users.lastName,
    };
  }

  async logoutPatient(sessionToken: string): Promise<void> {
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