/**
 * Enterprise RBAC Permissions Config.
 * Maps permissions directly to administrative roles.
 */
export const rolePermissions: Record<string, string[]> = {
  SuperAdmin: [
    'users.read',
    'users.update',
    'users.delete',
    'subscriptions.manage',
    'analytics.view',
    'billing.manage',
    'system.manage',
    'ai.manage',
    'support.manage',
    'logs.view',
  ],
  Admin: [
    'users.read',
    'users.update',
    'subscriptions.manage',
    'analytics.view',
    'billing.manage',
    'ai.manage',
    'support.manage',
    'logs.view',
  ],
  Support: [
    'users.read',
    'support.manage',
    'logs.view',
  ],
  Moderator: [
    'users.read',
    'users.update',
    'support.manage',
  ],
  Finance: [
    'analytics.view',
    'billing.manage',
    'subscriptions.manage',
  ],
};

export default rolePermissions;
