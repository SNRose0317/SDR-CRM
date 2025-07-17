import { Router } from 'express';
import { PortalAuthService, portalAuth } from './portalAuth';
import { db } from './db';
import { 
  contacts, 
  appointments, 
  patientMessages, 
  patientNotifications,
  patientActivities,
  users
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { insertPatientActivitySchema, insertPatientMessageSchema } from '@shared/schema';

const router = Router();
const authService = new PortalAuthService();

// Authentication endpoints
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginPatient(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials or portal access not enabled' });
    }

    // Log portal activity
    await db.insert(patientActivities).values({
      patientId: result.user.contactId,
      activityType: 'LOGIN',
      activityDescription: 'Patient logged into portal',
      metadata: JSON.stringify({ timestamp: new Date() }),
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

router.post('/auth/logout', portalAuth, async (req: any, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (sessionToken) {
      await authService.logoutPatient(sessionToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Portal logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Patient data endpoints
router.get('/patient/profile', portalAuth, async (req: any, res) => {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .leftJoin(users, eq(contacts.healthCoachId, users.id))
      .where(eq(contacts.id, req.user.contactId));

    if (!contact) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Log activity
    await db.insert(patientActivities).values({
      patientId: req.user.contactId,
      activityType: 'PROFILE_UPDATE',
      activityDescription: 'Patient viewed profile',
    });

    res.json({
      ...contact.contacts,
      healthCoach: contact.users ? {
        id: contact.users.id,
        firstName: contact.users.firstName,
        lastName: contact.users.lastName,
        email: contact.users.email,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/patient/appointments', portalAuth, async (req: any, res) => {
  try {
    const appointmentList = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .where(eq(appointments.contactId, req.user.contactId))
      .orderBy(desc(appointments.scheduledAt));

    // Log activity
    await db.insert(patientActivities).values({
      patientId: req.user.contactId,
      activityType: 'RECORD_ACCESSED',
      activityDescription: 'Patient viewed appointments',
    });

    const formattedAppointments = appointmentList.map(apt => ({
      ...apt.appointments,
      provider: apt.users ? {
        id: apt.users.id,
        firstName: apt.users.firstName,
        lastName: apt.users.lastName,
      } : null,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/patient/messages', portalAuth, async (req: any, res) => {
  try {
    const messages = await db
      .select()
      .from(patientMessages)
      .leftJoin(users, eq(patientMessages.healthCoachId, users.id))
      .where(eq(patientMessages.patientId, req.user.contactId))
      .orderBy(desc(patientMessages.createdAt));

    const formattedMessages = messages.map(msg => ({
      ...msg.patient_messages,
      healthCoach: msg.users ? {
        id: msg.users.id,
        firstName: msg.users.firstName,
        lastName: msg.users.lastName,
      } : null,
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/patient/messages', portalAuth, async (req: any, res) => {
  try {
    const { subject, message, healthCoachId } = req.body;

    const [newMessage] = await db
      .insert(patientMessages)
      .values({
        patientId: req.user.contactId,
        healthCoachId,
        subject,
        message,
        sentByPatient: true,
      })
      .returning();

    // Log activity
    await db.insert(patientActivities).values({
      patientId: req.user.contactId,
      activityType: 'MESSAGE_SENT',
      activityDescription: `Patient sent message: ${subject}`,
    });

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/patient/notifications', portalAuth, async (req: any, res) => {
  try {
    const notifications = await db
      .select()
      .from(patientNotifications)
      .where(eq(patientNotifications.patientId, req.user.contactId))
      .orderBy(desc(patientNotifications.createdAt));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/patient/notifications/:id/read', portalAuth, async (req: any, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    await db
      .update(patientNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(patientNotifications.id, notificationId),
          eq(patientNotifications.patientId, req.user.contactId)
        )
      );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.get('/patient/activities', portalAuth, async (req: any, res) => {
  try {
    const activities = await db
      .select()
      .from(patientActivities)
      .where(eq(patientActivities.patientId, req.user.contactId))
      .orderBy(desc(patientActivities.createdAt))
      .limit(50);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;