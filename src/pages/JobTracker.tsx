import { useState, useEffect } from 'react';
import { getJobApplications, saveJobApplication, deleteJobApplication, GetJobApplicationsOutputType } from 'zite-endpoints-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type App = GetJobApplicationsOutputType['applications'][0];
const statuses = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Joined'] as const;
const statusColors: Record<string, string> = { Wishlist: 'bg-muted text-muted-foreground', Applied: 'bg-blue-500/10 text-blue-600', Interview: 'bg-yellow-500/10 text-yellow-600', Offer: 'bg-green-500/10 text-green-600', Rejected: 'bg-red-500/10 text-red-600', Joined: 'bg-emerald-500/10 text-emerald-600' };

export default function JobTracker() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);
  const [form, setForm] = useState({ company: '', role: '', jobUrl: '', status: 'Wishlist', salary: '', notes: '', appliedDate: '', reminderDate: '' });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'board' | 'list'>('board');

  const load = () => { getJobApplications({}).then(r => setApps(r.applications)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ company: '', role: '', jobUrl: '', status: 'Wishlist', salary: '', notes: '', appliedDate: '', reminderDate: '' }); setDialogOpen(true); };
  const openEdit = (a: App) => { setEditing(a); setForm({ company: a.company || '', role: a.role || '', jobUrl: a.jobUrl || '', status: a.status || 'Wishlist', salary: a.salary || '', notes: a.notes || '', appliedDate: a.appliedDate || '', reminderDate: a.reminderDate || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.company || !form.role) { toast.error('Company and role are required'); return; }
    setSaving(true);
    try {
      const r = await saveJobApplication({ ...form, id: editing?.id, jobUrl: form.jobUrl || undefined, appliedDate: form.appliedDate || undefined, reminderDate: form.reminderDate || undefined });
      if (editing) setApps(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      else setApps(prev => [{ id: r.id, ...form, createdAt: new Date().toISOString() }, ...prev]);
      setDialogOpen(false);
      toast.success(editing ? 'Updated' : 'Added');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await deleteJobApplication({ id }); setApps(prev => prev.filter(a => a.id !== id)); toast.success('Deleted'); } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (app: App, newStatus: string) => {
    try {
      await saveJobApplication({ id: app.id, company: app.company || '', role: app.role || '', status: newStatus });
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="p-6 md:p-8"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Job Tracker</h1><p className="text-muted-foreground mt-1">{apps.length} application{apps.length !== 1 ? 's' : ''}</p></div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className={`px-3 py-1.5 text-xs font-medium ${view === 'board' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setView('board')}>Board</button>
            <button className={`px-3 py-1.5 text-xs font-medium ${view === 'list' ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setView('list')}>List</button>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Job</Button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const items = apps.filter(a => a.status === status);
            return (
              <div key={status} className="min-w-[260px] flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>{status}</span>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(a => (
                    <Card key={a.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openEdit(a)}>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{a.company}</p>
                        <p className="text-xs text-muted-foreground">{a.role}</p>
                        {a.salary && <p className="text-xs text-primary mt-1">{a.salary}</p>}
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No applications</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {apps.length === 0 ? (
            <div className="text-center py-16"><Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No applications yet</p></div>
          ) : apps.map(a => (
            <Card key={a.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openEdit(a)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-sm">{a.company}</p>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[a.status || 'Wishlist']}`}>{a.status}</span>
                  {a.jobUrl && <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Application' : 'Add Application'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Company *</label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Role *</label><Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Job URL</label><Input value={form.jobUrl} onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Salary</label><Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="e.g., ₹15-20 LPA" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Applied Date</label><Input type="date" value={form.appliedDate} onChange={e => setForm(p => ({ ...p, appliedDate: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Reminder Date</label><Input type="date" value={form.reminderDate} onChange={e => setForm(p => ({ ...p, reminderDate: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Notes</label><Textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this application..." /></div>
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {editing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" />Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete application?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { handleDelete(editing.id); setDialogOpen(false); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
