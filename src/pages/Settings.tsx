import { useState } from 'react';
import { useAuth } from 'zite-auth-sdk';
import { updateProfile } from 'zite-endpoints-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';

export default function Settings() {
  const { user, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [linkedInUrl, setLinkedInUrl] = useState(user?.linkedInUrl || '');
  const [currentRole, setCurrentRole] = useState(user?.currentRole || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, linkedInUrl: linkedInUrl || undefined, currentRole: currentRole || undefined, targetRole: targetRole || undefined });
      toast.success('Profile updated');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">First Name</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Last Name</label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Email</label><Input value={user?.email || ''} disabled className="bg-muted" /></div>
          <div><label className="text-sm font-medium mb-1 block">LinkedIn URL</label><Input value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Current Role</label><Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g., Junior Developer" /></div>
            <div><label className="text-sm font-medium mb-1 block">Target Role</label><Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Senior Engineer" /></div>
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={user?.plan === 'Premium' ? 'default' : 'secondary'}>{user?.plan || 'Free'}</Badge>
              <span className="text-sm text-muted-foreground">
                {user?.plan === 'Premium' ? 'You have full access to all features.' : 'Upgrade to unlock unlimited AI analyses and premium features.'}
              </span>
            </div>
            {user?.plan !== 'Premium' && (
              <Button onClick={() => setShowUpgrade(true)} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro — ₹89
              </Button>
            )}
          </div>
          <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} onUpgraded={() => { setShowUpgrade(false); window.location.reload(); }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => logout()}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
