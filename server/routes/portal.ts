import { Router } from 'express';
import { PortalAuthService, portalAuth } from '../middleware/portalAuth';
import { db } from '../db';
import { 
  users,
  activityLogs,
  leads,
  contacts,
  healthQuestionnaires,
  portalSessions,
  appointments
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { signupSchema } from '@shared/schema';
import bcrypt from 'bcrypt';
import { automationManager } from '../automation/automationManager';

const router = Router();
const authService = new PortalAuthService();

// Signup endpoint - creates lead directly with portal access
router.post('/signup', async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    // Check if lead already exists
    const existingLead = await db.select().from(leads).where(eq(leads.email, validatedData.email));
    if (existingLead.length > 0) {
      return res.status(400).json({ error: 'An account already exists with this email' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);
    
    // Create lead with portal access
    const [newLead] = await db.insert(leads).values({
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      state: validatedData.state,
      passwordHash,
      portalAccess: true,
      status: 'HHQ Started',
      source: 'Portal Signup',
      notes: 'Lead created through portal signup',
    }).returning();
    
    // Trigger automation for portal signup
    const automationResults = await automationManager.triggerPortalSignup({
      ...newLead,
      role: 'Lead',
    }, newLead.id);
    
    res.status(201).json({ 
      message: 'Account created successfully',
      lead: {
        id: newLead.id,
        email: newLead.email,
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        status: newLead.status,
      },
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

// Login endpoints (both /login and /auth/login for compatibility)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginExternalUser(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log portal activity
    await db.insert(activityLogs).values({
      entityType: result.user.userType === 'lead' ? 'lead' : 'contact',
      entityId: result.user.id,
      userId: null, // No system user for external users
      action: 'portal_login',
      details: `${result.user.userType} logged into portal`,
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

// Login endpoint (legacy path for compatibility)
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginExternalUser(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log portal activity
    await db.insert(activityLogs).values({
      entityType: result.user.userType === 'lead' ? 'lead' : 'contact',
      entityId: result.user.id,
      userId: null, // No system user for external users
      action: 'portal_login',
      details: `${result.user.userType} logged into portal`,
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
    const user = req.user;
    const userId = user.entityId;
    const userType = user.userType;
    
    let profile;
    
    if (userType === 'lead') {
      const [leadProfile] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, userId));
      profile = leadProfile;
    } else if (userType === 'contact') {
      const [contactProfile] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, userId));
      profile = contactProfile;
    }
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      userType: userType,
      status: profile.status,
      phone: profile.phone,
      state: profile.state,
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
    const user = req.user;
    const userId = user.entityId;
    const userType = user.userType;
    
    const activities = await db
      .select({
        id: activityLogs.id,
        activityType: activityLogs.action,
        activityDescription: activityLogs.details,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.entityType, userType),
          eq(activityLogs.entityId, userId)
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(50);
    
    res.json(activities);
  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// HHQ Status endpoint
router.get('/hhq/status', portalAuth, async (req: any, res) => {
  try {
    const user = req.user;
    const userId = user.entityId;
    const userType = user.userType;
    
    if (userType !== 'lead') {
      return res.json({ completed: true, isContact: true });
    }
    
    const hhq = await db
      .select()
      .from(healthQuestionnaires)
      .where(eq(healthQuestionnaires.leadId, userId))
      .limit(1);
    
    if (hhq.length === 0) {
      return res.json({ 
        completed: false, 
        exists: false 
      });
    }
    
    const questionnaire = hhq[0];
    const completed = questionnaire.isSigned && questionnaire.isPaid && questionnaire.appointmentBooked;
    
    res.json({
      completed,
      exists: true,
      isSigned: questionnaire.isSigned,
      isPaid: questionnaire.isPaid,
      appointmentScheduled: questionnaire.appointmentBooked,
      completedAt: completed ? questionnaire.updatedAt : null,
      id: questionnaire.id
    });
  } catch (error) {
    console.error('HHQ status error:', error);
    res.status(500).json({ error: 'Failed to fetch HHQ status' });
  }
});

// Portal logout endpoint
router.post('/logout', portalAuth, async (req: any, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (sessionToken) {
      await db.delete(portalSessions).where(eq(portalSessions.sessionToken, sessionToken));
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Get patient appointments
router.get('/patient/appointments', portalAuth, async (req: any, res) => {
  try {
    const user = req.user;
    const userId = user.entityId;
    const userType = user.userType;
    
    // Add cache-busting headers to prevent browser caching issues
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    let appointmentList = [];
    
    if (userType === 'lead') {
      // Get appointments for leads
      appointmentList = await db
        .select()
        .from(appointments)
        .where(eq(appointments.leadId, userId))
        .orderBy(desc(appointments.scheduledAt));
    } else if (userType === 'contact') {
      // Get appointments for contacts
      appointmentList = await db
        .select()
        .from(appointments)
        .where(eq(appointments.contactId, userId))
        .orderBy(desc(appointments.scheduledAt));
    }
    
    res.json(appointmentList);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/patient/messages', portalAuth, async (req: any, res) => {
  res.json([]);
});

router.get('/patient/notifications', portalAuth, async (req: any, res) => {
  res.json([]);
});

export default router;