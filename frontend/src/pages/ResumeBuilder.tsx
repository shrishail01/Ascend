import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumes } from '@/hooks/useResumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Trash2, Calendar, Award, Layout, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';


const templates = [
  { id: 'modern', name: 'Modern Premium', desc: 'Sleek dark and light accents' },
  { id: 'professional', name: 'Professional Executive', desc: 'Standard business structure' },
  { id: 'creative', name: 'Creative Designer', desc: 'Bold sidebar layout' },
];

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { resumes, isLoading: loading, saveResume: createResume, deleteResume: deleteResumeHook } = useResumes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('modern');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Resume title is required');
      return;
    }
    setCreating(true);
    try {
      const defaultContent = {
        fullName: '', title: '', email: '', phone: '', location: '', summary: '',
        skills: [], experience: [], education: [], projects: [], certifications: []
      };
      const r = await createResume({
        title,
        template,
        content: JSON.stringify(defaultContent),
      });
      setDialogOpen(false);
      navigate(`/resumes/${r.id}`);
    } catch {
      // Handled inside query hook
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResumeHook({ id });
    } catch {
      // Handled inside query hook
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 md:p-8 max-w-6xl space-y-8 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Builder</h1>
          <p className="text-muted-foreground mt-1">Design and optimize professional resumes with automated templates</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="glow-hover bg-gradient-to-r from-primary to-secondary text-white border-0 py-2 h-11 px-5 rounded-xl font-bold">
          <Plus className="mr-1.5 h-4.5 w-4.5" /> Create Resume
        </Button>
      </div>

      {/* Resumes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((res) => (
          <motion.div key={res.id} variants={itemVariants}>
            <Card className="glass-card glow-hover border-border/40 hover:-translate-y-1.5 duration-300 relative overflow-hidden group">
              <CardContent className="p-6 flex flex-col justify-between h-full min-h-[160px] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><FileText className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-bold text-base truncate max-w-[140px]">{res.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{res.template} template</p>
                    </div>
                  </div>
                  {res.atsScore !== undefined && (
                    <Badge variant="secondary" className={`bg-primary/10 text-primary border-0 text-[10px] py-1 ${res.atsScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      <Award className="mr-1 h-3.5 w-3.5" /> {res.atsScore} Score
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(res.updatedAt || res.createdAt || '').toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/resumes/${res.id}`)} className="h-8 rounded-lg text-xs font-semibold hover:bg-white/10 dark:hover:bg-neutral-800/50">Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4.5 w-4.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-panel border border-border/50 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this resume? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-border/50">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(res.id)} className="bg-red-500 text-white hover:bg-red-600 rounded-xl">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Empty state dashboard grid card */}
        {resumes.length === 0 && (
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
            <Card className="glass-card border-dashed border-2 border-border/60 p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">No resumes found</h3>
                <p className="text-sm text-muted-foreground">Create your first resume using professional AI templates.</p>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="h-10 px-5 bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover">
                <Plus className="mr-1.5 h-4.5 w-4.5" /> Build a resume
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Creation Modal Overlay */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 glass-panel border border-border/50 rounded-3xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-extrabold">Create New Resume</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Enter a title and select a professional design format.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume Name</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineer Resume" className="rounded-xl border-border/50 bg-muted/10 focus-visible:ring-primary focus-visible:border-primary" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template Style</label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="rounded-xl border-border/50 bg-muted/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-border/50">
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                      <div className="text-left py-0.5">
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-border/50 hover:bg-white/10 dark:hover:bg-neutral-800/50">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover rounded-xl">
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Layout className="mr-1.5 h-4 w-4" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
