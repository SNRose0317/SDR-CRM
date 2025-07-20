import { Request, Response, NextFunction } from 'express';
import { createUserClient, type UserSupabaseClient } from '../lib/supabase-server';

/**
 * Extended Request interface with Supabase client and user info
 */
export interface AuthRequest extends Request {
  supabase?: UserSupabaseClient;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  permissions?: string[];
}

/**
 * Middleware to authenticate requests using Supabase JWT
 * Creates a user-specific Supabase client that respects RLS policies
 */
export async function authenticateRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Bearer token'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Create Supabase client with user's token
    const supabaseClient = createUserClient(token);
    req.supabase = supabaseClient;
    
    // Verify token and get user info
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please login again'
      });
    }
    
    // Attach user info to request
    req.userId = user.id;
    req.userEmail = user.email || undefined;
    
    // Extract custom claims from JWT if available
    // These would be added by the custom access token hook
    const jwt = parseJWT(token);
    if (jwt) {
      req.userRole = jwt.user_role || jwt.role || undefined;
      req.permissions = jwt.permissions || [];
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Middleware for optional authentication
 * Continues even if no token is provided, but adds user info if available
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without auth
    return next();
  }
  
  // If token is provided, validate it
  return authenticateRequest(req, res, next);
}

/**
 * Middleware to check for specific permissions
 * Must be used after authenticateRequest
 */
export function requirePermission(permission: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Please login first'
      });
    }
    
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = req.permissions || [];
    
    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(perm => 
      userPermissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `You need one of these permissions: ${requiredPermissions.join(', ')}`
      });
    }
    
    next();
  };
}

/**
 * Helper to parse JWT and extract claims
 */
function parseJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}