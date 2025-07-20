# Phase 3: API Migration Guide

## Overview

This guide explains how to migrate the existing Express + Drizzle APIs to use Supabase client, allowing RLS policies to handle authorization automatically.

## Current Architecture

```
Frontend → Express API → Drizzle ORM → PostgreSQL
                ↓
        Custom permission checks
```

## Target Architecture

```
Frontend → Express API → Supabase Client → PostgreSQL (with RLS)
     ↓                        ↓
JWT with claims        Automatic permission filtering
```

## Implementation Steps

### 1. Add Supabase Client to Server

First, install Supabase client on the server:

```bash
cd server
npm install @supabase/supabase-js
```

Create server Supabase client configuration:

```typescript
// server/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create a client with user's JWT for RLS
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
```

### 2. Update Authentication Middleware

Create middleware to extract JWT from requests:

```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { createUserClient } from '../lib/supabase-server'

export interface AuthRequest extends Request {
  supabase?: ReturnType<typeof createUserClient>
  userId?: string
}

export async function authenticateRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' })
  }
  
  const token = authHeader.substring(7)
  
  try {
    // Create Supabase client with user's token
    req.supabase = createUserClient(token)
    
    // Verify token and get user
    const { data: { user }, error } = await req.supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.userId = user.id
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}
```

### 3. Update API Routes

#### Before (with Drizzle and custom permissions):

```typescript
// server/routes/leads.ts
router.get("/", async (req, res) => {
  try {
    // Custom permission logic
    const leads = await storage.getLeadsForUser(req.userId, req.userRole);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});
```

#### After (with Supabase client and RLS):

```typescript
// server/routes/leads.ts
import { authenticateRequest, AuthRequest } from '../middleware/auth'

router.get("/", authenticateRequest, async (req: AuthRequest, res) => {
  try {
    // RLS automatically filters based on user's permissions
    const { data: leads, error } = await req.supabase!
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    res.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    res.status(500).json({ message: 'Failed to fetch leads' })
  }
})

router.post("/", authenticateRequest, async (req: AuthRequest, res) => {
  try {
    const { data: lead, error } = await req.supabase!
      .from('leads')
      .insert(req.body)
      .select()
      .single()
    
    if (error) {
      // RLS will block if user doesn't have persons.create permission
      if (error.code === '42501') {
        return res.status(403).json({ message: 'Permission denied' })
      }
      throw error
    }
    
    res.status(201).json(lead)
  } catch (error) {
    console.error('Error creating lead:', error)
    res.status(500).json({ message: 'Failed to create lead' })
  }
})
```

### 4. Update Storage Layer

Transform storage methods to use Supabase:

```typescript
// server/storage-supabase.ts
import { AuthRequest } from './middleware/auth'

export class SupabaseStorage {
  // No need for permission checks - RLS handles it
  async getLeads(supabase: AuthRequest['supabase']) {
    const { data, error } = await supabase!
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
  
  async getLead(supabase: AuthRequest['supabase'], id: number) {
    const { data, error } = await supabase!
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }
  
  async createLead(supabase: AuthRequest['supabase'], lead: any) {
    const { data, error } = await supabase!
      .from('leads')
      .insert(lead)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // Similar for other methods...
}
```

### 5. Remove Hardcoded Permission Checks

Files to update:

#### `/server/storage.ts`
- Remove `canUserSeeEntity`, `canUserClaimEntity` imports
- Remove role-based filtering logic
- Let RLS handle visibility

#### `/shared/permissions.ts`
- Mark as deprecated
- Keep for reference during transition
- Remove once all APIs migrated

#### `/server/routes/hhq.ts`
- Remove `user.role === 'admin'` checks
- Use Supabase client for queries

### 6. Update Frontend API Calls

Ensure frontend sends JWT with requests:

```typescript
// client/src/lib/api.ts
import { supabase } from './supabase'

async function apiRequest(path: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession()
  
  if (!session.data.session) {
    throw new Error('Not authenticated')
  }
  
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.data.session.access_token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  
  return response.json()
}

// Usage
export const leadsApi = {
  getAll: () => apiRequest('/leads'),
  getOne: (id: number) => apiRequest(`/leads/${id}`),
  create: (lead: any) => apiRequest('/leads', {
    method: 'POST',
    body: JSON.stringify(lead)
  })
}
```

### 7. Testing Strategy

1. **Unit Tests**: Mock Supabase client responses
2. **Integration Tests**: Use Supabase local instance
3. **E2E Tests**: Test full flow with different user roles

Example test:

```typescript
describe('Leads API with RLS', () => {
  it('SDR sees only their leads', async () => {
    const sdrToken = await loginAs('sdr1@test.com')
    
    const response = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${sdrToken}`)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(5) // Only SDR's leads
  })
  
  it('Manager sees team leads', async () => {
    const managerToken = await loginAs('manager@test.com')
    
    const response = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${managerToken}`)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(25) // Team's leads
  })
})
```

## Migration Checklist

- [ ] Install Supabase client on server
- [ ] Create server Supabase configuration
- [ ] Add authentication middleware
- [ ] Update leads routes
- [ ] Update contacts routes
- [ ] Update tasks routes
- [ ] Update appointments routes
- [ ] Update HHQ routes
- [ ] Remove custom permission checks
- [ ] Update frontend API client
- [ ] Test with all user roles
- [ ] Monitor performance
- [ ] Remove old permission code

## Benefits After Migration

1. **Simpler Code**: No custom permission logic
2. **Better Security**: Database-level enforcement
3. **Improved Performance**: Fewer queries
4. **Easier Maintenance**: Permissions in one place
5. **Automatic Filtering**: RLS handles everything