# HealthCRM API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: `https://your-app.replit.app`

## Authentication
Currently using development mode without authentication. Future implementation will include JWT tokens.

## Response Format
All responses follow a consistent JSON format:

```json
{
  "data": {...},
  "error": null
}
```

Error responses:
```json
{
  "error": "Error message",
  "data": null
}
```

## Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/toggle-active` - Toggle user active status

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `GET /api/leads/stats` - Get lead statistics by status
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Contacts
- `GET /api/contacts` - Get all contacts (with filters)
- `GET /api/contacts/stats` - Get contact statistics by stage
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Appointments
- `GET /api/appointments` - Get all appointments (with filters)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Activity Logs
- `GET /api/activity-logs` - Get activity history

## Data Models

### User
```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "SDR" | "Health Coach" | "Admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Lead
```typescript
{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "HHQ Started" | "HHQ Signed" | "Booking: Not Paid" | "Booking: Paid/Not Booked" | "Booking: Paid/Booked";
  ownerId?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact
```typescript
{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  stage: ContactStage; // 15 healthcare workflow stages
  healthCoachId?: number;
  leadId?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
{
  id: number;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  assignedToId?: number;
  createdById?: number;
  leadId?: number;
  contactId?: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment
```typescript
{
  id: number;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show";
  userId?: number;
  leadId?: number;
  contactId?: number;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Filter Parameters

### Leads
- `status` - Filter by lead status
- `ownerId` - Filter by owner ID
- `search` - Search in name and email

### Contacts
- `stage` - Filter by contact stage
- `healthCoachId` - Filter by health coach ID
- `search` - Search in name and email

### Tasks
- `status` - Filter by task status
- `priority` - Filter by priority
- `assignedToId` - Filter by assigned user ID

### Appointments
- `status` - Filter by appointment status
- `userId` - Filter by user ID
- `date` - Filter by date range

## Error Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
Currently no rate limiting implemented. Future implementation will include:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user