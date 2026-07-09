import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResumes, GetResumesOutputType, saveResume, deleteResume } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, FileText, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type Resume = GetResumesOutputType['resumes'][0];

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('Modern');
  const [creating, setCreating] = useState(false);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('resume');

  const load = () => { getResumes({}).then(r => setResumes(r.resumes)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const allowed = await checkAccess();
    if (!allowed) { setCreateOpen(false); return; }
    setCreating(true);
    try {
      const defaultContent = JSON.stringify({ fullName: '', title: '', email: '', phone: '', location: '', summary: '', experience: [], education: [], skills: [], projects: [] });
      const { id } = await saveResume({ title: newTitle, template: newTemplate, content: defaultContent });
      setCreateOpen(false);
      setNewTitle('');
      navigate(`/resumes/${id}`);
    } catch { toast.error('Failed to create resume'); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResume({ id });
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Resume" usageCount={usageCount} limit={limit} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage your resumes</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Resume</Button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered resume</p>
          <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Resume</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map(r => (
            <Card key={r.id} className="group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/resumes/${r.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(r.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold mb-1">{r.title || 'Untitled'}</h3>
                <p className="text-xs text-muted-foreground mb-2">{r.template} Template</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'Complete' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {r.status || 'Draft'}
                  </span>
                  {r.atsScore ? <span className="text-xs font-medium text-primary">ATS: {r.atsScore}%</span> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Resume</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Resume title (e.g., Software Engineer Resume)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Select value={newTemplate} onValueChange={setNewTemplate}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Modern">Modern</SelectItem>
                <SelectItem value="Classic">Classic</SelectItem>
                <SelectItem value="Minimal">Minimal</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="ATS Optimized">ATS Optimized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
