# Client Portal Implementation Guide

## Step-by-Step Implementation

This guide provides detailed implementation steps for building the client portal within your existing HealthCRM system.

## Phase 1: Foundation Setup

### Step 1: Database Schema Extensions

#### 1.1 Update User Schema
```sql
-- Add patient portal support to existing users table
ALTER TABLE users ADD COLUMN contact_id INTEGER REFERENCES contacts(id);
ALTER TABLE users ADD COLUMN portal_access BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN last_portal_login TIMESTAMP;

-- Update role enum to include Patient
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR;
-- Then update constraint to include Patient role
```

#### 1.2 Create Portal-Specific Tables
```sql
-- Patient portal sessions for security
CREATE TABLE patient_sessions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track patient portal activities
CREATE TABLE patient_activities (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patient messages/communication
CREATE TABLE patient_messages (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  health_coach_id INTEGER REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_by_patient BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patient notifications
CREATE TABLE patient_notifications (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES contacts(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Update Shared Schema

#### 2.1 Extend shared/schema.ts
```typescript
// Add to shared/schema.ts
export const patientSessions = pgTable("patient_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientActivities = pgTable("patient_activities", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  activityDescription: text("activity_description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientMessages = pgTable("patient_messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  healthCoachId: integer("health_coach_id").references(() => users.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  sentByPatient: boolean("sent_by_patient").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientNotifications = pgTable("patient_notifications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => contacts.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update users table to include portal fields
export const users = pgTable("users", {
  // ... existing fields ...
  contactId: integer("contact_id").references(() => contacts.id),
  portalAccess: boolean("portal_access").default(false),
  lastPortalLogin: timestamp("last_portal_login"),
});

// Add types
export type PatientSession = typeof patientSessions.$inferSelect;
export type PatientActivity = typeof patientActivities.$inferSelect;
export type PatientMessage = typeof patientMessages.$inferSelect;
export type PatientNotification = typeof patientNotifications.$inferSelect;
```

### Step 3: Portal Authentication System

#### 3.1 Create Portal Auth Service
```typescript
// server/portalAuth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, contacts, patientSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
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
    // Find user with portal access
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(contacts, eq(users.contactId, contacts.id))
      .where(
        and(
          eq(users.email, email),
          eq(users.portalAccess, true),
          eq(users.isActive, true)
        )
      );

    if (!user || !await bcrypt.compare(password, user.users.password)) {
      return null;
    }

    // Create session
    const sessionToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(patientSessions).values({
      patientId: user.users.contactId!,
      sessionToken,
      expiresAt,
    });

    return {
      user: {
        id: user.users.id,
        email: user.users.email,
        firstName: user.users.firstName,
        lastName: user.users.lastName,
        contactId: user.users.contactId!,
        contact: user.contacts,
      },
      sessionToken,
    };
  }

  async validateSession(sessionToken: string): Promise<PortalUser | null> {
    const [session] = await db
      .select()
      .from(patientSessions)
      .leftJoin(users, eq(patientSessions.patientId, users.contactId))
      .leftJoin(contacts, eq(patientSessions.patientId, contacts.id))
      .where(
        and(
          eq(patientSessions.sessionToken, sessionToken),
          gt(patientSessions.expiresAt, new Date())
        )
      );

    if (!session) return null;

    return {
      id: session.users!.id,
      email: session.users!.email,
      firstName: session.users!.firstName,
      lastName: session.users!.lastName,
      contactId: session.users!.contactId!,
      contact: session.contacts,
    };
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

  req.user = user;
  next();
};
```

### Step 4: Portal API Routes

#### 4.1 Create Portal Routes
```typescript
// server/portalRoutes.ts
import { Router } from 'express';
import { PortalAuthService, portalAuth } from './portalAuth';
import { db } from './db';
import { 
  contacts, 
  appointments, 
  patientMessages, 
  patientNotifications,
  patientActivities 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();
const authService = new PortalAuthService();

// Authentication endpoints
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginPatient(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/auth/logout', portalAuth, async (req: any, res) => {
  // Invalidate session
  // Implementation here
  res.json({ message: 'Logged out successfully' });
});

// Patient data endpoints
router.get('/patient/profile', portalAuth, async (req: any, res) => {
  try {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, req.user.contactId));

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/patient/appointments', portalAuth, async (req: any, res) => {
  try {
    const appointmentList = await db
      .select()
      .from(appointments)
      .where(eq(appointments.contactId, req.user.contactId))
      .orderBy(desc(appointments.scheduledAt));

    res.json(appointmentList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/patient/appointments/book', portalAuth, async (req: any, res) => {
  // Book appointment logic
  // Trigger events for staff notification
  // Implementation here
});

router.get('/patient/messages', portalAuth, async (req: any, res) => {
  try {
    const messages = await db
      .select()
      .from(patientMessages)
      .where(eq(patientMessages.patientId, req.user.contactId))
      .orderBy(desc(patientMessages.createdAt));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/patient/messages', portalAuth, async (req: any, res) => {
  // Send message logic
  // Trigger notifications for health coach
  // Implementation here
});

export default router;
```

#### 4.2 Integrate Portal Routes
```typescript
// server/routes.ts - Add portal routes
import portalRoutes from './portalRoutes';

export async function registerRoutes(app: Express) {
  // ... existing routes ...
  
  // Portal routes
  app.use('/api/portal', portalRoutes);
  
  // ... rest of routes ...
}
```

## Phase 2: Frontend Portal Structure

### Step 1: Create Portal Feature Structure

#### 1.1 Create Portal Directory
```bash
mkdir -p client/src/features/portal/{components,pages,hooks}
mkdir -p client/src/features/portal/components/{auth,dashboard,records,appointments,messages,profile}
```

#### 1.2 Portal Authentication Components
```typescript
// client/src/features/portal/components/auth/portal-login.tsx
import { useState } from 'react';
import { useNavigate } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/portal/auth/login', {
        email,
        password,
      });

      // Store session token
      localStorage.setItem('portalToken', response.sessionToken);
      localStorage.setItem('portalUser', JSON.stringify(response.user));

      toast({
        title: 'Success',
        description: 'Welcome to your patient portal',
      });

      navigate('/portal/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Patient Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 2: Portal Dashboard

#### 2.1 Patient Dashboard Component
```typescript
// client/src/features/portal/components/dashboard/patient-dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, MessageCircle, FileText, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['/api/portal/patient/profile'],
    queryFn: () => apiRequest('GET', '/api/portal/patient/profile'),
  });

  const { data: appointments } = useQuery({
    queryKey: ['/api/portal/patient/appointments'],
    queryFn: () => apiRequest('GET', '/api/portal/patient/appointments'),
  });

  const { data: messages } = useQuery({
    queryKey: ['/api/portal/patient/messages'],
    queryFn: () => apiRequest('GET', '/api/portal/patient/messages'),
  });

  const nextAppointment = appointments?.find(
    (apt: any) => new Date(apt.scheduledAt) > new Date()
  );

  const unreadMessages = messages?.filter((msg: any) => !msg.isRead).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.stage}</div>
            <Badge variant="secondary" className="mt-1">
              Healthcare Journey
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div>
                <div className="text-2xl font-bold">
                  {new Date(nextAppointment.scheduledAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(nextAppointment.scheduledAt).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No upcoming appointments
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {profile?.updatedAt 
                ? new Date(profile.updatedAt).toLocaleDateString()
                : 'No recent activity'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Activity items */}
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Profile updated</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3: Portal Layout and Navigation

#### 3.1 Portal Layout Component
```typescript
// client/src/features/portal/components/layout/portal-layout.tsx
import { Link, useLocation } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  FileText, 
  User, 
  LogOut 
} from 'lucide-react';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: Home },
    { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
    { name: 'Messages', href: '/portal/messages', icon: MessageCircle },
    { name: 'Records', href: '/portal/records', icon: FileText },
    { name: 'Profile', href: '/portal/profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('portalToken');
    localStorage.removeItem('portalUser');
    window.location.href = '/portal/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                      location === item.href
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 w-64 p-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Portal Routing Integration

#### 4.1 Update Main App Router
```typescript
// client/src/App.tsx - Add portal routes
import { Switch, Route } from 'wouter';
import PortalLogin from '@/features/portal/components/auth/portal-login';
import PortalDashboard from '@/features/portal/pages/portal-dashboard';
import PortalLayout from '@/features/portal/components/layout/portal-layout';

function App() {
  return (
    <Switch>
      {/* Portal routes */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/*">
        {(params) => (
          <PortalLayout>
            <Switch>
              <Route path="/portal/dashboard" component={PortalDashboard} />
              {/* Add more portal routes */}
            </Switch>
          </PortalLayout>
        )}
      </Route>
      
      {/* Existing CRM routes */}
      <Route path="/" component={Home} />
      {/* ... existing routes ... */}
    </Switch>
  );
}
```

## Phase 3: Event System and Notifications

### Step 1: Event System Implementation

#### 1.1 Create Event Service
```typescript
// server/eventService.ts
interface SystemEvent {
  type: string;
  source: 'staff' | 'patient';
  entityType: string;
  entityId: number;
  userId: number;
  data: any;
  timestamp: Date;
}

class EventService {
  private handlers: Map<string, Array<(event: SystemEvent) => Promise<void>>> = new Map();

  register(eventType: string, handler: (event: SystemEvent) => Promise<void>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async emit(event: SystemEvent) {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }
}

export const eventService = new EventService();

// Register portal event handlers
eventService.register('PATIENT_APPOINTMENT_BOOKED', async (event) => {
  // Notify health coach
  // Create confirmation task
  // Send patient confirmation email
});

eventService.register('PATIENT_MESSAGE_SENT', async (event) => {
  // Create response task for health coach
  // Send notification to health coach
});
```

This implementation guide provides a comprehensive step-by-step approach to building the client portal within your existing HealthCRM system. The portal will share the same database and backend while providing a distinct patient-facing interface with integrated event-driven workflows.