import { useState, useEffect } from 'react';
import { useAuth } from '@/services/auth';
import { updateProfile } from '@/api/auth';
import api from '@/services/axios';
import { getBillingInfo, BillingInfoType } from '@/api/payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Sun, Moon, LogOut, Loader2, Sparkles, Receipt, CheckCircle2, BarChart2, ShieldAlert } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile');

  // Profile fields state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [linkedInUrl, setLinkedInUrl] = useState(user?.linkedInUrl || '');
  const [currentRole, setCurrentRole] = useState(user?.currentRole || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [saving, setSaving] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Billing history & Usage state
  const [billingInfo, setBillingInfo] = useState<BillingInfoType | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadBilling = () => {
    setLoadingBilling(true);
    getBillingInfo()
      .then((info) => setBillingInfo(info))
      .catch(() => toast.error('Failed to load billing transaction info.'))
      .finally(() => setLoadingBilling(false));
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Both password fields are required.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setSavingPassword(false);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast.success(`Theme switched to ${newTheme} mode`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        linkedInUrl: linkedInUrl || undefined,
        currentRole: currentRole || undefined,
        targetRole: targetRole || undefined,
      });
      toast.success('Profile settings updated successfully!');
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8 mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-neutral-200 to-neutral-400">Settings</h1>
        <p className="text-muted-foreground mt-1 font-light text-sm">Configure your personal profile details, preferences, subscriptions, and transaction invoices.</p>
      </div>

      {/* Sliding Tabs Underline Selector */}
      <div className="flex border-b border-border/40 pb-px gap-6 text-sm font-semibold relative">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 relative text-xs uppercase tracking-wider ${activeTab === 'profile' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}
        >
          Profile details
          {activeTab === 'profile' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 relative text-xs uppercase tracking-wider ${activeTab === 'preferences' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}
        >
          Preferences
          {activeTab === 'preferences' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 relative text-xs uppercase tracking-wider ${activeTab === 'billing' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}
        >
          Billing & Usage
          {activeTab === 'billing' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Profile Details</CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Update your identity and career target roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl border-border/50 bg-muted/10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <Input value={user?.email || ''} disabled className="rounded-xl border-border/50 bg-muted/20 opacity-80" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn URL</label>
                <Input value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="rounded-xl border-border/50 bg-muted/10" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Role</label>
                  <Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g., Junior Developer" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Role</label>
                  <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Senior Engineer" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover px-5">
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />} Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Change Password</CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Modify your account security credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
              <Button onClick={handleChangePassword} disabled={savingPassword} className="h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover px-5">
                {savingPassword ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />} Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-rose-500">Security & Sign Out</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={logout} className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500 border-rose-500/20 hover:border-rose-500/40 text-xs font-bold gap-2">
                <LogOut className="h-4 w-4" /> Sign Out of Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'preferences' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Preferences</CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Customize application color themes.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">App Theme Mode</span>
              <div className="flex gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => toggleTheme('light')} className="rounded-xl gap-2 font-semibold text-xs h-9">
                  <Sun className="h-4 w-4" /> Light Mode
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => toggleTheme('dark')} className="rounded-xl gap-2 font-semibold text-xs h-9">
                  <Moon className="h-4 w-4" /> Dark Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'billing' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Plan Selector Header Panel */}
          <Card className="glass-card border-border/40 overflow-hidden relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Active Subscription</span>
                <Badge variant={billingInfo?.plan !== 'Free' ? 'default' : 'secondary'} className={`rounded-lg py-1 border-0 ${billingInfo?.plan !== 'Free' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' : 'bg-muted text-muted-foreground'}`}>
                  {billingInfo?.plan || 'Free'} Plan
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Review your pricing plan benefits, limits, and renewal dates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5"><CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Plan Status: <span className="uppercase text-emerald-500">{billingInfo?.status || 'active'}</span></p>
                  {billingInfo?.renewalDate && (
                    <p className="text-xs text-muted-foreground">Renewal scheduled on: {new Date(billingInfo.renewalDate).toLocaleDateString()}</p>
                  )}
                </div>
                <Button onClick={() => setShowUpgrade(true)} className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:brightness-110 text-white font-bold text-xs px-4 h-10 rounded-xl glow-hover border-0 shadow-md">
                  <Crown className="mr-1.5 h-4 w-4 fill-white animate-pulse" /> Upgrade / Swap Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Limits Usage Dashboard */}
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5"><BarChart2 className="h-5 w-5 text-primary" /> Usage Dashboard</CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Current monthly usage limits compared against plan caps.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBilling ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {billingInfo?.usage.map((u, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border/40 bg-muted/5 flex flex-col justify-between space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{u.feature} limit</span>
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-black text-foreground">{u.used} <span className="text-xs font-light text-muted-foreground">/ {u.limit}</span></span>
                        <span className="text-[10px] font-semibold text-muted-foreground">Used</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, (u.used / u.limit) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing & Invoice History */}
          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-1.5"><Receipt className="h-5 w-5 text-primary" /> Invoice & Transactions History</CardTitle>
              <CardDescription className="text-xs font-light text-muted-foreground">Transaction billing histories and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBilling ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : !billingInfo?.invoices || billingInfo.invoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-2xl flex flex-col items-center gap-2"><ShieldAlert className="h-6 w-6 text-muted-foreground/60" /> No transaction invoices recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider font-semibold">
                        <th className="pb-3 font-semibold">Invoice ID</th>
                        <th className="pb-3 font-semibold">Billed Date</th>
                        <th className="pb-3 font-semibold">Plan</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingInfo.invoices.map((inv, idx) => (
                        <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                          <td className="py-3 font-bold text-foreground/80">{inv.invoiceId}</td>
                          <td className="py-3 text-muted-foreground">{new Date(inv.billedAt).toLocaleDateString()}</td>
                          <td className="py-3 font-medium text-foreground">{inv.plan}</td>
                          <td className="py-3 font-extrabold text-foreground">₹{inv.amount}</td>
                          <td className="py-3 font-bold text-emerald-500">{inv.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} onUpgraded={() => { setShowUpgrade(false); loadBilling(); window.location.reload(); }} />
    </div>
  );
}
