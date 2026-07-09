import { useState } from 'react';
import { suggestProjects, SuggestProjectsOutputType } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Clock, Github } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectGenerator() {
  const [skills, setSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<SuggestProjectsOutputType['projects']>([]);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('projects');

  const handleGenerate = async () => {
    if (!skills) { toast.error('Please enter your skills'); return; }
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await suggestProjects({ skills, targetRole: targetRole || undefined, level });
      setProjects(r.projects);
    } catch { toast.error('Failed to generate project ideas'); }
    setLoading(false);
  };

  const diffColor = (d: string) => d === 'Beginner' ? 'bg-green-500/10 text-green-600' : d === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600';

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Project Ideas" usageCount={usageCount} limit={limit} />
      <div><h1 className="text-2xl font-bold">AI Project Generator</h1><p className="text-muted-foreground mt-1">Get portfolio project ideas tailored to your skills and target role</p></div>

      <Card><CardContent className="p-6 space-y-4">
        <div><label className="text-sm font-medium mb-1 block">Your Skills *</label><Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., React, Node.js, Python, SQL" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">Target Role (optional)</label><Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Full Stack Developer" /></div>
          <div><label className="text-sm font-medium mb-1 block">Experience Level</label>
            <Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent></Select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading}><Sparkles className="mr-2 h-4 w-4" />{loading ? 'Generating...' : 'Generate Project Ideas'}</Button>
      </CardContent></Card>

      {projects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Lightbulb className="h-5 w-5 text-primary" /></div>
                  <Badge className={diffColor(p.difficulty)}>{p.difficulty}</Badge>
                </div>
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.timeEstimate}</span>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium flex items-center gap-1 mb-1"><Github className="h-3 w-3" /> GitHub Structure</p>
                  <p className="text-xs text-muted-foreground">{p.githubIdea}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
