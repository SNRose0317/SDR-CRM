import { Router } from 'express';
import { PortalAuthService, portalAuth } from '../middleware/portalAuth';
import { db } from '../db';
import { 
  users,
  activityLogs,
  leads
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { signupSchema } from '@shared/schema';
import bcrypt from 'bcrypt';
import { automationManager } from '../automation/automationManager';

const router = Router();
const authService = new PortalAuthService();

// Signup endpoint - creates user account and automatically creates a lead
router.post('/signup', async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);
    
    // Create user account with portal access
    const [newUser] = await db.insert(users).values({
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      passwordHash,
      role: 'patient',
      portalAccess: true,
    }).returning();
    
    // Trigger automation for portal signup
    const automationResults = await automationManager.triggerPortalSignup({
      ...validatedData,
      role: 'Patient',
      id: newUser.id
    }, newUser.id);
    
    // Get the lead that was created by automation
    const leadCreationResult = automationResults.find(r => 
      r.success && r.data && r.data.leadId
    );
    
    let leadInfo = null;
    if (leadCreationResult) {
      leadInfo = leadCreationResult.data;
    }
    
    res.status(201).json({ 
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      lead: leadInfo ? {
        id: leadInfo.leadId,
        status: leadInfo.lead.status,
        message: 'Lead created automatically - our team will contact you soon!'
      } : null,
      automation: {
        triggered: automationResults.length > 0,
        results: automationResults.map(r => ({
          success: r.success,
          message: r.message
        }))
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
});

// Login endpoint
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginExternalUser(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log portal activity
    await db.insert(activityLogs).values({
      entityType: 'user',
      entityId: result.user.id,
      userId: result.user.id,
      action: 'portal_login',
      details: 'Patient logged into portal',
    });

    res.json({
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error) {
    console.error('Portal login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/auth/logout', portalAuth, async (req: any, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (sessionToken) {
      await authService.logoutExternalUser(sessionToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get user profile
router.get('/patient/profile', portalAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const [profile] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user activities
router.get('/patient/activities', portalAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const activities = await db
      .select({
        id: activityLogs.id,
        activityType: activityLogs.action,
        activityDescription: activityLogs.details,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(50);
    
    res.json(activities);
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Placeholder endpoints for future implementation
router.get('/patient/appointments', portalAuth, async (req: any, res) => {
  res.json([]);
});

router.get('/patient/messages', portalAuth, async (req: any, res) => {
  res.json([]);
});

router.get('/patient/notifications', portalAuth, async (req: any, res) => {
  res.json([]);
});

export default router;