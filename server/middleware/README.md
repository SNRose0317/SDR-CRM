# Server Middleware

This directory contains Express middleware functions for authentication, validation, and request processing.

## Structure

```
middleware/
├── portalAuth.ts       # Portal user authentication middleware
└── README.md          # This file
```

## Portal Authentication

### PortalAuthService
Handles authentication for external portal users (leads and contacts):

```typescript
import { PortalAuthService } from '../middleware/portalAuth';

const authService = new PortalAuthService();

// Login external user
const result = await authService.loginExternalUser(email, password);

// Create portal session
const session = await authService.createPortalSession(user);

// Validate portal session
const user = await authService.validatePortalSession(token);
```

### Middleware Functions

#### authenticatePortalUser
Validates portal user sessions for protected routes:

```typescript
import { authenticatePortalUser } from '../middleware/portalAuth';

router.get('/protected', authenticatePortalUser, (req, res) => {
  // Access authenticated user via req.portalUser
});
```

## Features

1. **Dual User Support**: Handles both leads and contacts as portal users
2. **Session Management**: Creates and validates session tokens
3. **Password Hashing**: Secure password comparison with bcrypt
4. **Token Expiration**: Automatic session expiry handling
5. **Database Integration**: Direct database queries for user validation

## Usage

Portal authentication is used for:
- Portal user login/logout
- Protected portal routes
- Session validation
- User profile access

## Security

- **Password Hashing**: All passwords stored with bcrypt
- **Session Tokens**: Secure random tokens with expiration
- **Input Validation**: All inputs validated before processing
- **Database Security**: Parameterized queries prevent SQL injection