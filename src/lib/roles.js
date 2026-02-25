// ─── RLCA Role System ────────────────────────────────────────────────────────
// Three roles: platform_owner > admin > user (parent)
// Platform owner is seeded by email — invite-only for admins.

export const ROLES = {
  PLATFORM_OWNER: 'platform_owner',
  ADMIN: 'admin',
  USER: 'user',
};

// Seed owner email — only this account gets platform_owner on first login
export const PLATFORM_OWNER_EMAIL = 'jarivera43019@gmail.com';

/**
 * Derive a user's role.
 * base44 stores custom fields on the user object.
 * We check `user.role` first; if missing, fall back to email match.
 */
export function getUserRole(user) {
  if (!user) return null;
  if (user.email === PLATFORM_OWNER_EMAIL) return ROLES.PLATFORM_OWNER;
  if (user.role === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.USER;
}

// ─── Permission helpers ───────────────────────────────────────────────────────

export function isPlatformOwner(user) {
  return getUserRole(user) === ROLES.PLATFORM_OWNER;
}

export function isAdmin(user) {
  const role = getUserRole(user);
  return role === ROLES.ADMIN || role === ROLES.PLATFORM_OWNER;
}

export function isParent(user) {
  return getUserRole(user) === ROLES.USER;
}

/**
 * What each role can do:
 *
 * platform_owner:
 *   - Everything admin can do
 *   - Invite / revoke admins
 *   - View platform-wide analytics
 *   - Edit any record
 *
 * admin:
 *   - View all student profiles and onboarding records
 *   - Edit student placement and learning plans
 *   - View parent profiles
 *   - Cannot manage other admins
 *
 * user (parent):
 *   - Create and manage their own child profiles (up to 10)
 *   - Complete onboarding for each child
 *   - Edit child profile after onboarding
 *   - Access child dashboard via profile switcher
 *   - Cannot see other families' data
 */

export const PERMISSIONS = {
  // Admin management
  INVITE_ADMIN:         [ROLES.PLATFORM_OWNER],
  REVOKE_ADMIN:         [ROLES.PLATFORM_OWNER],
  VIEW_ALL_STUDENTS:    [ROLES.PLATFORM_OWNER, ROLES.ADMIN],
  EDIT_ANY_STUDENT:     [ROLES.PLATFORM_OWNER, ROLES.ADMIN],
  VIEW_ANALYTICS:       [ROLES.PLATFORM_OWNER, ROLES.ADMIN],

  // Parent actions
  CREATE_CHILD_PROFILE: [ROLES.USER],
  EDIT_OWN_CHILDREN:    [ROLES.USER],
  VIEW_OWN_CHILDREN:    [ROLES.USER],
};

export function can(user, permission) {
  const role = getUserRole(user);
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

export const MAX_CHILDREN_PER_PARENT = 10;
