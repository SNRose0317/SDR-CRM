// Global permission settings for CRM access control
export interface GlobalPermissions {
  // Lead visibility rules
  sdrCanSeeAllUnassignedLeads: boolean;
  sdrCanSeeOnlyOwnAssignedLeads: boolean;
  healthCoachCanSeeUnassignedLeadsAfterHours: number; // 24 hours default
  healthCoachCanSeeOwnAssignedLeads: boolean;
  
  // Contact visibility rules
  sdrCanSeeAllUnassignedContacts: boolean;
  sdrCanSeeOnlyOwnAssignedContacts: boolean;
  healthCoachCanSeeAllContacts: boolean;
  healthCoachCanSeeOwnAssignedContacts: boolean;
  
  // Admin access
  adminCanSeeAllRecords: boolean;
}

// Default CRM permissions
export const DEFAULT_PERMISSIONS: GlobalPermissions = {
  // SDR lead access
  sdrCanSeeAllUnassignedLeads: true,
  sdrCanSeeOnlyOwnAssignedLeads: true,
  
  // Health Coach lead access (after 24 hours)
  healthCoachCanSeeUnassignedLeadsAfterHours: 24,
  healthCoachCanSeeOwnAssignedLeads: true,
  
  // SDR contact access
  sdrCanSeeAllUnassignedContacts: false,
  sdrCanSeeOnlyOwnAssignedContacts: true,
  
  // Health Coach contact access
  healthCoachCanSeeAllContacts: true,
  healthCoachCanSeeOwnAssignedContacts: true,
  
  // Admin access
  adminCanSeeAllRecords: true,
};

export type UserRole = 'SDR' | 'health_coach' | 'admin';
export type EntityType = 'lead' | 'contact';

// Permission checker functions
export function canUserSeeEntity(
  userRole: UserRole,
  entityType: EntityType,
  entityOwnerId: number | null,
  userId: number,
  entityCreatedAt: Date,
  permissions: GlobalPermissions = DEFAULT_PERMISSIONS
): boolean {
  // Admin can see everything
  if (userRole === 'admin' && permissions.adminCanSeeAllRecords) {
    return true;
  }

  // Check if entity is assigned to the user
  const isAssignedToUser = entityOwnerId === userId;
  
  // Check if entity is unassigned
  const isUnassigned = entityOwnerId === null;

  if (entityType === 'lead') {
    if (userRole === 'SDR') {
      // SDR can see their own assigned leads
      if (isAssignedToUser && permissions.sdrCanSeeOnlyOwnAssignedLeads) {
        return true;
      }
      // SDR can see all unassigned leads
      if (isUnassigned && permissions.sdrCanSeeAllUnassignedLeads) {
        return true;
      }
    }
    
    if (userRole === 'health_coach') {
      // Health Coach can see their own assigned leads
      if (isAssignedToUser && permissions.healthCoachCanSeeOwnAssignedLeads) {
        return true;
      }
      // Health Coach can see unassigned leads after time limit
      if (isUnassigned && permissions.healthCoachCanSeeUnassignedLeadsAfterHours > 0) {
        const hoursElapsed = (Date.now() - entityCreatedAt.getTime()) / (1000 * 60 * 60);
        return hoursElapsed >= permissions.healthCoachCanSeeUnassignedLeadsAfterHours;
      }
    }
  }

  if (entityType === 'contact') {
    if (userRole === 'SDR') {
      // SDR can see their own assigned contacts
      if (isAssignedToUser && permissions.sdrCanSeeOnlyOwnAssignedContacts) {
        return true;
      }
      // SDR can see all unassigned contacts (if enabled)
      if (isUnassigned && permissions.sdrCanSeeAllUnassignedContacts) {
        return true;
      }
    }
    
    if (userRole === 'health_coach') {
      // Health Coach can see their own assigned contacts
      if (isAssignedToUser && permissions.healthCoachCanSeeOwnAssignedContacts) {
        return true;
      }
      // Health Coach can see all contacts (if enabled)
      if (permissions.healthCoachCanSeeAllContacts) {
        return true;
      }
    }
  }

  return false;
}

// Get available entities for claiming (unassigned entities user can see)
export function canUserClaimEntity(
  userRole: UserRole,
  entityType: EntityType,
  entityOwnerId: number | null,
  entityCreatedAt: Date,
  permissions: GlobalPermissions = DEFAULT_PERMISSIONS
): { canClaim: boolean; reason?: string } {
  // Can't claim if already assigned
  if (entityOwnerId !== null) {
    return { canClaim: false, reason: 'Already assigned to another user' };
  }

  // Admin can claim anything
  if (userRole === 'admin' && permissions.adminCanSeeAllRecords) {
    return { canClaim: true };
  }

  if (entityType === 'lead') {
    if (userRole === 'SDR' && permissions.sdrCanSeeAllUnassignedLeads) {
      return { canClaim: true };
    }
    
    if (userRole === 'health_coach' && permissions.healthCoachCanSeeUnassignedLeadsAfterHours > 0) {
      const hoursElapsed = (Date.now() - entityCreatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursElapsed >= permissions.healthCoachCanSeeUnassignedLeadsAfterHours) {
        return { canClaim: true };
      } else {
        const remainingHours = Math.ceil(permissions.healthCoachCanSeeUnassignedLeadsAfterHours - hoursElapsed);
        return { 
          canClaim: false, 
          reason: `Available to Health Coaches in ${remainingHours} hours` 
        };
      }
    }
  }

  if (entityType === 'contact') {
    if (userRole === 'SDR' && permissions.sdrCanSeeAllUnassignedContacts) {
      return { canClaim: true };
    }
    
    if (userRole === 'health_coach' && permissions.healthCoachCanSeeAllContacts) {
      return { canClaim: true };
    }
  }

  return { canClaim: false, reason: 'No permission to claim this entity' };
}