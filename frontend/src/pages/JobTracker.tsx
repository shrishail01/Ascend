import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { GetJobApplicationsOutputType } from '@/api/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase, Trash2, ExternalLink, DollarSign, Loader2, Sparkles, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type App = GetJobApplicationsOutputType['applications'][0];

const statuses = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Joined'] as const;

const statusConfigs: Record<string, { bg: string; border: string; text: string }> = {
  Wishlist: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  Applied: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-500' },
  Interview: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
  Offer: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
  Rejected: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500' },
  Joined: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-500' },
};

export default function JobTracker() {
  const { jobs: apps, isLoading: loading, saveJob, deleteJob } = useJobs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);
  const [form, setForm] = useState({
    company: '', role: '', jobUrl: '', status: 'Wishlist', salary: '', notes: '', appliedDate: '', reminderDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'board' | 'list'>('board');

  const openCreate = () => {
    setEditing(null);
    setForm({ company: '', role: '', jobUrl: '', status: 'Wishlist', salary: '', notes: '', appliedDate: '', reminderDate: '' });
    setDialogOpen(true);
  };

  const openEdit = (a: App) => {
    setEditing(a);
    setForm({
      company: a.company || '',
      role: a.role || '',
      jobUrl: a.jobUrl || '',
      status: a.status || 'Wishlist',
      salary: a.salary || '',
      notes: a.notes || '',
      appliedDate: a.appliedDate || '',
      reminderDate: a.reminderDate || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and role are required');
      return;
    }
    setSaving(true);
    try {
      await saveJob({
        ...form,
        id: editing?.id,
        jobUrl: form.jobUrl || undefined,
        appliedDate: form.appliedDate || undefined,
        reminderDate: form.reminderDate || undefined
      });
      setDialogOpen(false);
    } catch {
      // Handled inside query hook
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob({ id });
    } catch {
      // Handled inside query hook
    }
  };



  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
        <div className="grid md:grid-cols-5 gap-4"><Skeleton className="h-[400px]" /><Skeleton className="h-[400px]" /><Skeleton className="h-[400px]" /></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8 mx-auto h-screen flex flex-col">
      {/* Header bar actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground mt-1">{apps.length} active application{apps.length !== 1 ? 's' : ''} in pipeline</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Board vs List view toggler */}
          <div className="flex border border-border/50 rounded-xl overflow-hidden glass-panel p-0.5">
            <button 
              onClick={() => setView('board')} 
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${view === 'board' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${view === 'list' ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <Button onClick={openCreate} className="w-full sm:w-auto glow-hover bg-gradient-to-r from-primary to-secondary text-white border-0 py-2 h-11 px-5 rounded-xl font-bold">
            <Plus className="mr-1.5 h-4.5 w-4.5" /> Add Job
          </Button>
        </div>
      </div>

      {/* Main pipeline views */}
      <div className="flex-1 overflow-auto pb-6 -mx-6 px-6">
        {view === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 min-w-[1200px] h-full items-start">
            {statuses.map(status => {
              const list = apps.filter(a => a.status === status);
              const config = statusConfigs[status] || { bg: 'bg-muted', border: 'border-border/50', text: 'text-muted-foreground' };
              return (
                <div key={status} className="flex flex-col h-full min-h-[500px] rounded-2xl bg-muted/20 dark:bg-neutral-900/10 border border-border/50 p-3 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${config.text}`}>{status}</span>
                    <Badge variant="secondary" className="text-[10px] bg-muted dark:bg-neutral-800 font-bold">{list.length}</Badge>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(100vh-16rem)]">
                    {list.map(a => (
                      <motion.div
                        key={a.id}
                        layoutId={a.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <Card 
                          className="glass-card glow-hover border-border/40 cursor-pointer relative overflow-hidden group hover:-translate-y-0.5 duration-200"
                          onClick={() => openEdit(a)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div>
                              <h3 className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">{a.company}</h3>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{a.role}</p>
                            </div>
                            {a.salary && (
                              <p className="text-[11px] text-primary font-semibold flex items-center"><DollarSign className="h-3 w-3 mr-0.5 shrink-0" /> {a.salary}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {list.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/40 rounded-xl">No applications</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 max-w-5xl mx-auto">
            {apps.length === 0 ? (
              <Card className="glass-card border-dashed border-2 border-border/60 p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">No active applications in tracker</h3>
                  <p className="text-xs text-muted-foreground">Add a new application status above to begin mapping your search.</p>
                </div>
              </Card>
            ) : (
              apps.map(a => {
                const config = statusConfigs[a.status || 'Wishlist'] || { bg: 'bg-muted', border: 'border-border/50', text: 'text-muted-foreground' };
                return (
                  <motion.div 
                    key={a.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="glass-card border-border/40 cursor-pointer hover:border-primary/20 duration-200"
                      onClick={() => openEdit(a)}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm truncate">{a.company}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{a.role}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge className={`${config.bg} ${config.text} border-0 text-[10px] py-1 px-2.5 font-bold`}>{a.status}</Badge>
                          {a.jobUrl && (
                            <a 
                              href={a.jobUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={e => e.stopPropagation()} 
                              className="text-muted-foreground hover:text-primary transition-colors p-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Creation Modal form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 glass-panel border border-border/50 rounded-3xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-extrabold">{editing ? 'Edit Application' : 'Add Application'}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Keep tracking logs for company salaries, notes and interview dates.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company *</label>
                <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role *</label>
                <Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posting Job URL</label>
              <Input value={form.jobUrl} onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))} placeholder="https://..." className="rounded-xl border-border/50 bg-muted/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pipeline Stage</label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="rounded-xl border-border/50 bg-muted/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border/50">
                    {statuses.map(s => <SelectItem key={s} value={s} className="cursor-pointer text-xs">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salary Range</label>
                <Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="e.g., ₹15-20 LPA" className="rounded-xl border-border/50 bg-muted/10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied Date</label>
                <Input type="date" value={form.appliedDate} onChange={e => setForm(p => ({ ...p, appliedDate: e.target.value }))} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reminder Date</label>
                <Input type="date" value={form.reminderDate} onChange={e => setForm(p => ({ ...p, reminderDate: e.target.value }))} className="rounded-xl border-border/50 bg-muted/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Notes</label>
              <Textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this application..." className="rounded-xl border-border/50 bg-muted/10" />
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center gap-4">
            <div>
              {editing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="rounded-xl font-bold"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel border-border/50 rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete application log?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone. This application details will be deleted from database.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { handleDelete(editing.id); setDialogOpen(false); }} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover rounded-xl px-5 font-bold">
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                {editing ? 'Update' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
