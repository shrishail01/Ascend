process.env.NODE_ENV = 'test';

import AdminService from './admin.service';
import User from '../models/User';
import Subscription from '../models/Subscription';
import FeatureUsage from '../models/FeatureUsage';
import AuditLog from '../models/AuditLog';
import SupportTicket from '../models/SupportTicket';
import SystemConfig from '../models/SystemConfig';
import RefreshToken from '../models/RefreshToken';
import { rolePermissions } from '../config/permissions.config';

// Mock DB targets
const mockUser = {
  _id: 'user_dummy_123',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@ascend.com',
  role: 'SuperAdmin',
  plan: 'Pro',
  isDeleted: false,
  subject: 'Bug report details',
  message: 'Interview simulation page crashes',
  priority: 'high',
  status: 'open',
  action: 'login',
  ipAddress: '127.0.0.1',
  requestId: 'req_123',
  resolutionHistory: [] as any[],
  save: () => Promise.resolve(),
};

const mockTicket = mockUser;

const mockConfig = {
  maintenanceMode: false,
  featureFlags: [
    { featureName: 'ats', enabled: true, rolloutPercentage: 100 },
  ],
  aiConfig: {
    modelName: 'gemini-1.5-flash',
    temperature: 0.2,
  },
  save: () => Promise.resolve(),
};

const mockQuery: any = {
  limit: function() { return this; },
  skip: function() { return this; },
  sort: function() { return this; },
  populate: function() { return this; },
  then: function(resolve: any) { resolve([mockUser]); }
};

(User as any).countDocuments = () => Promise.resolve(10);
(User as any).find = () => mockQuery;
(User as any).findById = () => Promise.resolve(mockUser);
(User as any).updateOne = () => Promise.resolve({});
(Subscription as any).find = () => Promise.resolve([]);
(Subscription as any).findOne = () => Promise.resolve(null);
(Subscription as any).updateOne = () => Promise.resolve({});
(FeatureUsage as any).findOne = () => Promise.resolve(null);
(FeatureUsage as any).create = () => Promise.resolve({});
(AuditLog as any).find = () => mockQuery;
(AuditLog as any).countDocuments = () => Promise.resolve(0);
(SupportTicket as any).find = () => mockQuery;
(SupportTicket as any).findById = () => Promise.resolve(mockTicket);
(SystemConfig as any).findOne = () => Promise.resolve(mockConfig);
(SystemConfig as any).create = () => Promise.resolve(mockConfig);
(RefreshToken as any).countDocuments = () => Promise.resolve(2);

/**
 * Validates RBAC permissions checks, dashboard aggregation, limits manipulation, and settings updates.
 */
async function runAdminTests() {
  console.log('--- STARTING ENTERPRISE OPERATIONS ADMIN TESTS ---');
  const service = new AdminService();

  // Test 1: Verify RBAC permissions map
  console.log('Testing RBAC Permissions matrix config...');
  const saPermissions = rolePermissions['SuperAdmin'];
  const supportPermissions = rolePermissions['Support'];
  if (saPermissions.includes('system.manage') && !supportPermissions.includes('system.manage')) {
    console.log('✓ RBAC Permissions Mapping Passed');
  } else {
    throw new Error('RBAC Permissions check failed');
  }

  // Test 2: Get Dashboard Stats
  console.log('Testing getDashboardStats analytical logs...');
  const stats = await service.getDashboardStats();
  if (stats.metrics.totalUsers === 10 && stats.health.gemini === 'healthy') {
    console.log('✓ getDashboardStats Passed');
  } else {
    throw new Error('getDashboardStats failed');
  }

  // Test 3: Modify User plans
  console.log('Testing updateUserPlanLimits adjustments...');
  const updateRes = await service.updateUserPlanLimits('user_dummy_123', {
    plan: 'Professional',
    role: 'Admin',
    isSuspended: true,
  });
  if (updateRes.success) {
    console.log('✓ updateUserPlanLimits Passed');
  } else {
    throw new Error('updateUserPlanLimits failed');
  }

  // Test 4: Support ticket triage
  console.log('Testing updateSupportTicket triage notes...');
  const ticketRes = await service.updateSupportTicket('ticket_dummy_123', {
    status: 'resolved',
    priority: 'medium',
    internalNotes: 'Treated and fixed.',
  });
  if (ticketRes.status === 'resolved' && ticketRes.priority === 'medium') {
    console.log('✓ updateSupportTicket triage Passed');
  } else {
    throw new Error('updateSupportTicket failed');
  }

  // Test 5: AI configurations sliders updates
  console.log('Testing updateAIConfig sliders updates...');
  const aiRes = await service.updateAIConfig({
    aiConfig: {
      modelName: 'gemini-1.5-pro',
      temperature: 0.5,
    },
  });
  if (aiRes?.aiConfig?.modelName === 'gemini-1.5-pro') {
    console.log('✓ updateAIConfig Passed');
  } else {
    throw new Error('updateAIConfig failed');
  }

  // Test 6: Global search lookups
  console.log('Testing globalSearch lookups...');
  const searchRes = await service.globalSearch('test');
  if (Array.isArray(searchRes.users) && Array.isArray(searchRes.tickets)) {
    console.log('✓ globalSearch Passed');
  } else {
    throw new Error('globalSearch failed');
  }

  console.log('--- ALL ENTERPRISE OPERATIONS ADMIN TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runAdminTests().catch((err) => {
  console.error('Admin test suite failed:', err);
  process.exit(1);
});
