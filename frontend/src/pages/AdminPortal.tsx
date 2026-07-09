import { useState, useEffect } from 'react';
import { useAuth } from '@/services/auth';
import {
  getAdminStats,
  getAdminUsers,
  getUserTimeline,
  updateUserPlanLimits,
  getAIConfig,
  updateAIConfig,
  getSupportTickets,
  updateSupportTicket,
  getAuditLogs,
} from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  Activity,
  Settings,
  AlertTriangle,
  HardDrive,
  Cpu,
  Search,
  Sliders,
  DollarSign,
  Download,
  Clock,
  Eye,
  Key,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock permissions config for front-end view restrictions
const rolePermissions: Record<string, string[]> = {
  SuperAdmin: ['users.read', 'users.update', 'users.delete', 'subscriptions.manage', 'analytics.view', 'billing.manage', 'system.manage', 'ai.manage', 'support.manage', 'logs.view'],
  Admin: ['users.read', 'users.update', 'subscriptions.manage', 'analytics.view', 'billing.manage', 'ai.manage', 'support.manage', 'logs.view'],
  Support: ['users.read', 'support.manage', 'logs.view'],
  Moderator: ['users.read', 'users.update', 'support.manage'],
  Finance: ['analytics.view', 'billing.manage', 'subscriptions.manage'],
  User: [],
};

export default function AdminPortal() {
  const { user } = useAuth();
  const userRole = (user as any)?.role || 'User';
  const permissions = rolePermissions[userRole] || [];

  const hasPermission = (perm: string) => permissions.includes(perm);

  const [activeTab, setActiveTab] = useState('dashboard');

  // States for stats, users, AI config, tickets, audits
  const [stats, setStats] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [aiConfigData, setAiConfigData] = useState<any>(null);
  const [ticketsData, setTicketsData] = useState<any>([]);
  const [auditLogs, setAuditLogs] = useState<any>([]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserTimeline, setSelectedUserTimeline] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState<any>(null);

  // Modal forms
  const [modifyPlan, setModifyPlan] = useState('Free');
  const [modifyRole, setModifyRole] = useState('User');
  const [modifySuspended, setModifySuspended] = useState(false);

  // AI slider state
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(8192);

  // Loaders
  const loadStats = async () => {
    if (!hasPermission('analytics.view')) return;
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      toast.error('Failed to load operations statistics.');
    }
  };

  const loadUsers = async () => {
    if (!hasPermission('users.read')) return;
    try {
      const data = await getAdminUsers(userSearch);
      setUsersData(data);
    } catch {
      toast.error('Failed to load user directories.');
    }
  };

  const loadAIConfig = async () => {
    if (!hasPermission('ai.manage')) return;
    try {
      const data = await getAIConfig();
      setAiConfigData(data);
      if (data.aiConfig) {
        setModelName(data.aiConfig.modelName || 'gemini-1.5-flash');
        setTemperature(data.aiConfig.temperature ?? 0.2);
        setMaxTokens(data.aiConfig.maxOutputTokens ?? 8192);
      }
    } catch {
      toast.error('Failed to load system AI configurations.');
    }
  };

  const loadTickets = async () => {
    if (!hasPermission('support.manage')) return;
    try {
      const data = await getSupportTickets();
      setTicketsData(data);
    } catch {
      toast.error('Failed to load support tickets queue.');
    }
  };

  const loadAuditLogs = async () => {
    if (!hasPermission('logs.view')) return;
    try {
      const data = await getAuditLogs();
      setAuditLogs(data.logs || []);
    } catch {
      toast.error('Failed to load system audit trails.');
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadAIConfig();
    loadTickets();
    loadAuditLogs();
  }, [userSearch]);

  const handleUpdateLimits = async (targetUserId: string) => {
    try {
      await updateUserPlanLimits(targetUserId, {
        plan: modifyPlan,
        role: modifyRole,
        isSuspended: modifySuspended,
      });
      toast.success('User parameters updated successfully!');
      setShowLimitModal(null);
      loadUsers();
    } catch {
      toast.error('Failed to modify user limits.');
    }
  };

  const handleUpdateAI = async () => {
    try {
      await updateAIConfig({
        aiConfig: {
          modelName,
          temperature,
          maxOutputTokens: maxTokens,
        },
      });
      toast.success('Gemini parameters updated successfully!');
      loadAIConfig();
    } catch {
      toast.error('Failed to update AI model configs.');
    }
  };

  const handleUpdateTicket = async (ticketId: string, status: string) => {
    try {
      await updateSupportTicket(ticketId, { status });
      toast.success('Ticket updated successfully!');
      loadTickets();
    } catch {
      toast.error('Failed to resolve support ticket.');
    }
  };

  const handleExport = (type: string) => {
    window.open(`${import.meta.env.VITE_API_URL}/admin/export?type=${type}`, '_blank');
  };

  // Render blocked access screen if normal user
  if (!['SuperAdmin', 'Admin', 'Support', 'Finance', 'Moderator'].includes(userRole)) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md text-center p-6 border border-rose-500/20 bg-rose-500/5 rounded-3xl">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
            <CardTitle className="text-xl font-extrabold text-rose-500 mt-2">Access Denied</CardTitle>
            <CardDescription className="text-muted-foreground font-light text-sm mt-1">
              You do not possess administrative clearance to view the Ascend operations portal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 flex items-center gap-2">
            <Shield className="h-8 w-8 text-orange-500 animate-pulse" /> Admin Operations Control
          </h1>
          <p className="text-muted-foreground mt-1 text-xs font-light">
            Platform wide statistics monitoring, security dashboard settings, and support ticketing triggers.
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission('system.manage') && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleExport('users')} className="rounded-xl gap-2 font-bold text-xs">
                <Download className="h-4 w-4" /> Export Users
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('logs')} className="rounded-xl gap-2 font-bold text-xs">
                <Download className="h-4 w-4" /> Export Logs
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs panels switchers */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-px">
        {hasPermission('analytics.view') && (
          <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('dashboard')} className="rounded-xl text-xs font-bold uppercase tracking-wider">
            Dashboard
          </Button>
        )}
        {hasPermission('users.read') && (
          <Button variant={activeTab === 'users' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('users')} className="rounded-xl text-xs font-bold uppercase tracking-wider">
            Users & limits
          </Button>
        )}
        {hasPermission('ai.manage') && (
          <Button variant={activeTab === 'ai' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('ai')} className="rounded-xl text-xs font-bold uppercase tracking-wider">
            AI Toggles
          </Button>
        )}
        {hasPermission('support.manage') && (
          <Button variant={activeTab === 'tickets' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('tickets')} className="rounded-xl text-xs font-bold uppercase tracking-wider">
            Support Queue
          </Button>
        )}
        {hasPermission('logs.view') && (
          <Button variant={activeTab === 'audits' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('audits')} className="rounded-xl text-xs font-bold uppercase tracking-wider">
            Audit logs
          </Button>
        )}
      </div>

      {/* TABS CONTENTS */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && stats && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Metric boxes */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card border-border/40">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Users</span>
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mt-2">{stats.metrics.totalUsers}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Growth registration index: +14%</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active users</span>
                    <Activity className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mt-2">{stats.metrics.activeUsers}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Retention Index: {stats.metrics.retentionRate}%</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Revenue</span>
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mt-2">₹{stats.metrics.revenue}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Conversion: {stats.metrics.conversionRate}%</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">AI Costs</span>
                    <Settings className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mt-2">₹{stats.metrics.aiCostEstimates.toFixed(3)}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Tokens: {stats.metrics.tokenConsumption}</p>
                </CardContent>
              </Card>
            </div>

            {/* Health checks list */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary animate-pulse" /> System health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">MongoDB Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-0">{stats.health.mongoDB}</Badge>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Gemini API Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-0">{stats.health.gemini}</Badge>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Razorpay API Status</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-0">{stats.health.razorpay}</Badge>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-bold text-foreground/80 flex items-center gap-1"><HardDrive className="h-3.5 w-3.5" /> {stats.health.memory}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">CPU Usage Load</span>
                    <span className="font-bold text-foreground/80 flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> {stats.health.cpu}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security widget */}
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5"><AlertTriangle className="h-4.5 w-4.5 text-rose-500" /> Security dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-rose-500">Failed Admin Logins</span>
                    <span className="font-bold text-rose-500">{stats.security.failedLogins}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Suspicious IP Alerts</span>
                    <span className="font-bold text-foreground">{stats.security.suspiciousIPs}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Rate Limit Actions Blocked</span>
                    <span className="font-bold text-foreground">{stats.security.blockedRequests}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Database Backups Size</span>
                    <Badge variant="outline">{stats.backup.databaseSize}</Badge>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-border/20">
                    <span className="text-muted-foreground">Last Database Backup Time</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(stats.backup.lastBackup).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Users manager panel */}
        {activeTab === 'users' && usersData && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="glass-card border-border/40">
              <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold">User directories</CardTitle>
                  <CardDescription className="text-xs font-light">Search directories, suspend login access, or re-tier credits.</CardDescription>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9 rounded-xl border-border/50 bg-muted/10 h-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-semibold">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Active Plan</th>
                        <th className="pb-3">Account State</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.users.map((u: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                          <td className="py-3 font-semibold text-foreground/80">{u.firstName} {u.lastName}</td>
                          <td className="py-3 text-muted-foreground">{u.email}</td>
                          <td className="py-3 font-semibold text-foreground">{u.role}</td>
                          <td className="py-3">
                            <Badge variant={u.plan !== 'Free' ? 'default' : 'secondary'} className="rounded-lg">
                              {u.plan}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={u.isDeleted ? 'bg-rose-500/20 text-rose-500 border-0' : 'bg-emerald-500/20 text-emerald-500 border-0'}>
                              {u.isDeleted ? 'Suspended' : 'Active'}
                            </Badge>
                          </td>
                          <td className="py-3 text-right flex justify-end gap-1.5">
                            <Button size="xs" variant="outline" onClick={() => {
                              setSelectedUserTimeline(null);
                              getUserTimeline(u._id).then(t => setSelectedUserTimeline(t));
                            }} className="h-8 rounded-lg text-[10px] gap-1 font-bold">
                              <Eye className="h-3.5 w-3.5" /> Timeline
                            </Button>
                            <Button size="xs" variant="outline" onClick={() => {
                              setShowLimitModal(u);
                              setModifyPlan(u.plan);
                              setModifyRole(u.role);
                              setModifySuspended(u.isDeleted);
                            }} className="h-8 rounded-lg text-[10px] gap-1 font-bold">
                              <Sliders className="h-3.5 w-3.5" /> Limits
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Timeline user details drawer */}
            {selectedUserTimeline && (
              <Card className="glass-card border-border/40 p-6 relative">
                <Button size="xs" variant="ghost" onClick={() => setSelectedUserTimeline(null)} className="absolute right-4 top-4 font-bold text-[10px]">Close X</Button>
                <h3 className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Clock className="h-4.5 w-4.5" /> User timeline history ({selectedUserTimeline.user.name})</h3>
                
                <div className="grid md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <h4 className="font-bold text-xs text-muted-foreground uppercase mb-2">Usage statistics</h4>
                    <div className="space-y-2.5">
                      {selectedUserTimeline.timeline.usages.map((usage: any, idx: number) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-border/20">
                          <span className="capitalize">{usage.feature}</span>
                          <span className="font-bold">{usage.count} / {usage.limit} used</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-muted-foreground uppercase mb-2">Recent activity logs</h4>
                    <div className="space-y-2 overflow-y-auto max-h-48">
                      {selectedUserTimeline.timeline.auditLogs.map((log: any, idx: number) => (
                        <div key={idx} className="p-2 border border-border/20 rounded-lg bg-muted/5">
                          <p className="font-semibold text-foreground/80">{log.action}</p>
                          <span className="text-[10px] text-muted-foreground block">{new Date(log.createdAt).toLocaleString()} • IP: {log.ipAddress}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Limits Form modal popover */}
            {showLimitModal && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md glass-panel border border-border/50 shadow-2xl rounded-3xl p-6 space-y-4">
                  <h3 className="font-black text-sm bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-wider text-center">Modify User boundaries</h3>
                  <p className="text-xs text-muted-foreground text-center font-light leading-none">Settings limits for: {showLimitModal.email}</p>
                  
                  <div className="space-y-3.5 text-xs py-2">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground block uppercase text-[10px]">Tier Plan</label>
                      <select value={modifyPlan} onChange={e => setModifyPlan(e.target.value)} className="w-full h-10 rounded-xl border border-border/50 bg-muted/20 px-3 outline-none">
                        <option value="Free">Free Plan</option>
                        <option value="Starter">Starter Plan</option>
                        <option value="Professional">Professional Plan</option>
                        <option value="Enterprise">Enterprise Plan</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground block uppercase text-[10px]">Admin role</label>
                      <select value={modifyRole} onChange={e => setModifyRole(e.target.value)} className="w-full h-10 rounded-xl border border-border/50 bg-muted/20 px-3 outline-none">
                        <option value="User">Standard User</option>
                        <option value="SuperAdmin">SuperAdmin Role</option>
                        <option value="Admin">Admin Role</option>
                        <option value="Support">Support Role</option>
                        <option value="Moderator">Moderator Role</option>
                        <option value="Finance">Finance Role</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <label className="font-bold text-muted-foreground uppercase text-[10px]">Suspend login privileges</label>
                      <input type="checkbox" checked={modifySuspended} onChange={e => setModifySuspended(e.target.checked)} className="h-5 w-5 rounded accent-orange-500 cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowLimitModal(null)} className="w-1/2 h-10 rounded-xl text-xs font-bold">Cancel</Button>
                    <Button onClick={() => handleUpdateLimits(showLimitModal._id)} className="w-1/2 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-xs font-bold border-0">Save Overrides</Button>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* AI Monitoring & Feature Flags Panel */}
        {activeTab === 'ai' && aiConfigData && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5"><Settings className="h-4.5 w-4.5 text-primary animate-spin" /> Gemini configurations</CardTitle>
                  <CardDescription className="text-xs font-light">Directly adjust core API variables globally.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground uppercase block text-[10px]">Active Gemini model name</label>
                    <select value={modelName} onChange={e => setModelName(e.target.value)} className="w-full h-10 rounded-xl border border-border/50 bg-muted/10 px-3 outline-none">
                      <option value="gemini-1.5-flash">gemini-1.5-flash (fast, default)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (comprehensive)</option>
                      <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (next gen experimental)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-semibold text-muted-foreground uppercase block text-[10px]">Model Temperature</label>
                      <span className="font-bold">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground uppercase block text-[10px]">Max Output tokens cap</label>
                    <Input
                      type="number"
                      value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value))}
                      className="rounded-xl border-border/50 bg-muted/10 h-10"
                    />
                  </div>

                  <Button onClick={handleUpdateAI} className="w-full h-10 bg-gradient-to-r from-orange-400 to-red-500 border-0 text-white font-bold text-xs rounded-xl glow-hover">
                    Save AI settings
                  </Button>
                </CardContent>
              </Card>

              {/* Feature flags rollouts list */}
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-1.5"><Key className="h-4.5 w-4.5 text-primary" /> Feature flags & rollouts</CardTitle>
                  <CardDescription className="text-xs font-light">Toggle modules availability and gradual rollout weights.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiConfigData.featureFlags.map((flag: any, idx: number) => (
                    <div key={idx} className="p-3 border border-border/30 rounded-xl bg-muted/5 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold uppercase tracking-wider flex items-center gap-2">
                          {flag.featureName}
                          <Badge className={flag.enabled ? 'bg-emerald-500/20 text-emerald-500 border-0' : 'bg-rose-500/20 text-rose-500 border-0'}>
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{flag.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Rollout: {flag.rolloutPercentage}%</span>
                        <span className="text-[10px] text-muted-foreground block uppercase">Env: {flag.environment}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Support Tickets Triaging list */}
        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="text-base font-bold">Support Requests queue</CardTitle>
                <CardDescription className="text-xs font-light">Assign triage statuses and resolution notes for user-reported bug alerts.</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsData.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-2xl">No open support tickets recorded.</div>
                ) : (
                  <div className="space-y-4">
                    {ticketsData.map((ticket: any, idx: number) => (
                      <div key={idx} className="p-4 border border-border/40 rounded-2xl bg-muted/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{ticket.type} ticket</span>
                            <h4 className="font-extrabold text-sm text-foreground/90 mt-0.5">{ticket.subject}</h4>
                            <p className="text-[10px] text-muted-foreground leading-normal mt-1 font-light">{ticket.message}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={`border-0 uppercase text-[9px] font-bold ${
                              ticket.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                              ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'
                            }`}>
                              {ticket.priority} priority
                            </Badge>
                            <Badge className="border-0 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 uppercase text-[9px] font-bold">
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/20">
                          <span>Reported by: {ticket.userId?.firstName} {ticket.userId?.lastName} ({ticket.userId?.email})</span>
                          {ticket.status !== 'resolved' && (
                            <Button size="xs" onClick={() => handleUpdateTicket(ticket._id, 'resolved')} className="h-7 bg-emerald-500 hover:bg-emerald-600 border-0 text-white rounded-lg text-[9px] font-bold px-3">
                              Mark resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Audit logs viewer table */}
        {activeTab === 'audits' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-primary animate-pulse" /> Security audit logs viewer</CardTitle>
                <CardDescription className="text-xs font-light">Interactive tracking of request headers correlation IDs and actions logging.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-semibold">
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3">Request ID</th>
                        <th className="pb-3">IP Address</th>
                        <th className="pb-3">Log Action details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                          <td className="py-3 text-muted-foreground text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-3 font-mono text-muted-foreground text-[10px]">{log.requestId}</td>
                          <td className="py-3 font-bold text-foreground/80">{log.ipAddress}</td>
                          <td className="py-3 font-medium text-foreground">{log.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
