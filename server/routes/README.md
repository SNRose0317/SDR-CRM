# Server Routes Organization

This directory contains all API route definitions organized by domain/feature.

## Structure

```
routes/
├── dashboard.ts        # Dashboard and analytics routes
├── users.ts           # User management routes  
├── leads.ts           # Lead management routes
├── contacts.ts        # Contact management routes
├── tasks.ts           # Task management routes
├── appointments.ts    # Appointment management routes
├── portal.ts          # Portal user routes
├── (leadClaiming.ts was removed - functionality moved to leads.ts)
└── index.ts           # Route exports
```

## Route Organization

Each route file follows the same pattern:

```typescript
import { Router } from "express";
import { storage } from "../storage";
import { insertEntitySchema } from "@shared/schema";

const router = Router();

// GET /api/entity - List all entities
router.get("/", async (req, res) => { /* ... */ });

// GET /api/entity/stats - Get entity statistics
router.get("/stats", async (req, res) => { /* ... */ });

// GET /api/entity/:id - Get single entity
router.get("/:id", async (req, res) => { /* ... */ });

// POST /api/entity - Create new entity
router.post("/", async (req, res) => { /* ... */ });

// PUT /api/entity/:id - Update entity
router.put("/:id", async (req, res) => { /* ... */ });

// DELETE /api/entity/:id - Delete entity
router.delete("/:id", async (req, res) => { /* ... */ });

export default router;
```

## Benefits

1. **Domain Separation**: Each file handles one specific domain
2. **Consistent Structure**: All routes follow the same CRUD pattern
3. **Easy Maintenance**: Changes to one domain don't affect others
4. **Clear Dependencies**: Each route file imports only what it needs
5. **Scalable**: Easy to add new routes without cluttering main files

## Usage

Routes are registered in the main `routes.ts` file:

```typescript
import { userRoutes, leadRoutes, contactRoutes } from "./routes";

app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
```

## Error Handling

All routes include consistent error handling:
- **400**: Bad request (validation errors)
- **404**: Entity not found
- **500**: Server errors

## Validation

All routes use Zod schemas for request validation:
- **POST/PUT**: Full validation with appropriate insert/update schemas
- **GET**: Query parameter validation where needed
- **Path Parameters**: Automatic parseInt for ID parameters