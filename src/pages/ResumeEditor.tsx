import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResume, saveResume, exportResumePdf } from 'zite-endpoints-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Download, Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

type ResumeContent = {
  fullName: string; title: string; email: string; phone: string; location: string; summary: string;
  experience: { id: string; title: string; company: string; startDate: string; endDate: string; description: string }[];
  education: { id: string; degree: string; school: string; year: string }[];
  skills: string[];
  projects: { id: string; name: string; description: string }[];
};

const emptyContent: ResumeContent = { fullName: '', title: '', email: '', phone: '', location: '', summary: '', experience: [], education: [], skills: [], projects: [] };

export default function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resumeTitle, setResumeTitle] = useState('');
  const [template, setTemplate] = useState('Modern');
  const [content, setContent] = useState<ResumeContent>(emptyContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!id) return;
    getResume({ id }).then(r => {
      if (r.resume) {
        setResumeTitle(r.resume.title || '');
        setTemplate(r.resume.template || 'Modern');
        try { setContent(JSON.parse(r.resume.content || '{}')); } catch { setContent(emptyContent); }
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const autoSave = useDebouncedCallback(async (c: ResumeContent) => {
    if (!id) return;
    await saveResume({ id, title: resumeTitle, template, content: JSON.stringify(c) });
  }, 2000);

  const updateContent = useCallback((updates: Partial<ResumeContent>) => {
    setContent(prev => { const next = { ...prev, ...updates }; autoSave(next); return next; });
  }, [autoSave]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await saveResume({ id, title: resumeTitle, template, content: JSON.stringify(content) });
      toast.success('Resume saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      await handleSave();
      const { url } = await exportResumePdf({ id });
      window.open(url, '_blank');
      toast.success('PDF generated');
    } catch { toast.error('Failed to export'); }
    setExporting(false);
  };

  const addExperience = () => updateContent({ experience: [...content.experience, { id: crypto.randomUUID(), title: '', company: '', startDate: '', endDate: '', description: '' }] });
  const addEducation = () => updateContent({ education: [...content.education, { id: crypto.randomUUID(), degree: '', school: '', year: '' }] });
  const addProject = () => updateContent({ projects: [...content.projects, { id: crypto.randomUUID(), name: '', description: '' }] });
  const addSkill = () => { if (skillInput.trim()) { updateContent({ skills: [...content.skills, skillInput.trim()] }); setSkillInput(''); } };

  if (loading) return <div className="p-6 md:p-8"><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/resumes')}><ArrowLeft className="h-4 w-4" /></Button>
          <Input value={resumeTitle} onChange={e => setResumeTitle(e.target.value)} className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 max-w-md" placeholder="Resume title" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
          <Button onClick={handleExport} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? 'Exporting...' : 'Export PDF'}</Button>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
          {['Personal', 'Experience', 'Education', 'Skills', 'Projects'].map(t => (
            <TabsTrigger key={t} value={t.toLowerCase()} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card><CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Full Name</label><Input value={content.fullName} onChange={e => updateContent({ fullName: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Job Title</label><Input value={content.title} onChange={e => updateContent({ title: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Email</label><Input value={content.email} onChange={e => updateContent({ email: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={content.phone} onChange={e => updateContent({ phone: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Location</label><Input value={content.location} onChange={e => updateContent({ location: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Professional Summary</label><Textarea rows={4} value={content.summary} onChange={e => updateContent({ summary: e.target.value })} placeholder="A brief professional summary highlighting your key strengths..." /></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-6 space-y-4">
          {content.experience.map((exp, i) => (
            <Card key={exp.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Experience {i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateContent({ experience: content.experience.filter(e => e.id !== exp.id) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Job Title" value={exp.title} onChange={e => { const u = [...content.experience]; u[i] = { ...u[i], title: e.target.value }; updateContent({ experience: u }); }} />
                  <Input placeholder="Company" value={exp.company} onChange={e => { const u = [...content.experience]; u[i] = { ...u[i], company: e.target.value }; updateContent({ experience: u }); }} />
                  <Input placeholder="Start Date" value={exp.startDate} onChange={e => { const u = [...content.experience]; u[i] = { ...u[i], startDate: e.target.value }; updateContent({ experience: u }); }} />
                  <Input placeholder="End Date (or Present)" value={exp.endDate} onChange={e => { const u = [...content.experience]; u[i] = { ...u[i], endDate: e.target.value }; updateContent({ experience: u }); }} />
                </div>
                <Textarea placeholder="Describe your responsibilities and achievements..." rows={3} value={exp.description} onChange={e => { const u = [...content.experience]; u[i] = { ...u[i], description: e.target.value }; updateContent({ experience: u }); }} />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addExperience} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
        </TabsContent>

        <TabsContent value="education" className="mt-6 space-y-4">
          {content.education.map((edu, i) => (
            <Card key={edu.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Education {i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateContent({ education: content.education.filter(e => e.id !== edu.id) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="Degree" value={edu.degree} onChange={e => { const u = [...content.education]; u[i] = { ...u[i], degree: e.target.value }; updateContent({ education: u }); }} />
                  <Input placeholder="School" value={edu.school} onChange={e => { const u = [...content.education]; u[i] = { ...u[i], school: e.target.value }; updateContent({ education: u }); }} />
                  <Input placeholder="Year" value={edu.year} onChange={e => { const u = [...content.education]; u[i] = { ...u[i], year: e.target.value }; updateContent({ education: u }); }} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Education</Button>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card><CardContent className="p-6">
            <div className="flex gap-2 mb-4">
              <Input placeholder="Add a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
              <Button onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  {s}
                  <button onClick={() => updateContent({ skills: content.skills.filter((_, j) => j !== i) })} className="ml-1 hover:text-destructive">×</button>
                </span>
              ))}
              {content.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet. Type a skill and press Enter.</p>}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6 space-y-4">
          {content.projects.map((proj, i) => (
            <Card key={proj.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Project {i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateContent({ projects: content.projects.filter(p => p.id !== proj.id) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input placeholder="Project Name" value={proj.name} onChange={e => { const u = [...content.projects]; u[i] = { ...u[i], name: e.target.value }; updateContent({ projects: u }); }} />
                <Textarea placeholder="Describe the project..." rows={3} value={proj.description} onChange={e => { const u = [...content.projects]; u[i] = { ...u[i], description: e.target.value }; updateContent({ projects: u }); }} />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addProject} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
