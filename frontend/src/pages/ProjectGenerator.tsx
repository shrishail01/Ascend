import { useState } from 'react';
import { suggestProjects, SuggestProjectsOutputType } from '@/api/roadmap';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Clock, Github, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectGenerator() {
  const [skills, setSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<SuggestProjectsOutputType['projects']>([]);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('projects');

  const handleGenerate = async () => {
    if (!skills.trim()) {
      toast.error('Please enter your skills');
      return;
    }
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await suggestProjects({ skills, targetRole: targetRole || undefined, level });
      setProjects(r.projects);
      toast.success('Project suggestions generated!');
    } catch {
      toast.error('Failed to generate project ideas');
    }
    setLoading(false);
  };

  const diffColor = (d: string) => d === 'Beginner' ? 'bg-emerald-500/10 text-emerald-600 border-0' : d === 'Intermediate' ? 'bg-primary/10 text-primary border-0' : 'bg-rose-500/10 text-rose-600 border-0';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Project Ideas" usageCount={usageCount} limit={limit} />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Project Generator</h1>
        <p className="text-muted-foreground mt-1">Get customized portfolio project ideas tailored to your target developer role and skill sets</p>
      </div>

      <Card className="glass-card border-border/40">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Skill Sets *</label>
            <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., React, TypeScript, Node.js, Mongoose" className="rounded-xl border-border/50 bg-muted/10" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Job Role (Optional)</label>
              <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Full Stack Engineer" className="rounded-xl border-border/50 bg-muted/10" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Experience Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="rounded-xl border-border/50 bg-muted/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-border/50">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg shadow-primary/25">
            {loading ? <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> : <Sparkles className="mr-2 h-4.5 w-4.5" />}
            {loading ? 'Generating project ideas...' : 'Generate Project Suggestions'}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {projects.length > 0 && (
          <motion.div 
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projects.map((p, i) => (
              <motion.div key={i} variants={cardVariants}>
                <Card className="glass-card glow-hover border-border/40 hover:-translate-y-1 duration-300 h-full relative overflow-hidden flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Lightbulb className="h-5.5 w-5.5" /></div>
                      <Badge className={`${diffColor(p.difficulty)} text-[10px]`}>{p.difficulty}</Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base leading-tight">{p.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">{p.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {p.skills.map(s => <Badge key={s} variant="secondary" className="text-[9px] bg-muted/60">{s}</Badge>)}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold"><Clock className="h-3.5 w-3.5" /> {p.timeEstimate}</div>

                    <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5 mt-2">
                      <p className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground"><Github className="h-3.5 w-3.5" /> Implementation Scope</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-light">{p.githubIdea}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
