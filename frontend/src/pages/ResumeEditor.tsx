import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResume, saveResume, exportResumePdf } from '@/api/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Download, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { db } from '@/services/dexie';

type ResumeContent = {
  fullName: string; title: string; email: string; phone: string; location: string; summary: string; linkedIn?: string;
  skills: string[]; experience: { company: string; role: string; duration: string; bullets: string[] }[];
  education: { school: string; degree: string; year: string }[];
  projects: { name: string; description: string }[];
  certifications: string[];
};

export default function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('modern');
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activePane, setActivePane] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (id) {
      getResume({ id })
        .then((r) => {
          if (r.resume) {
            setTitle(r.resume.title || '');
            setTemplate(r.resume.template || 'modern');
            setContent(JSON.parse(r.resume.content || '{}'));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const autosave = useDebouncedCallback(async (updatedContent: ResumeContent) => {
    if (!id) return;
    setSaving(true);

    if (!navigator.onLine) {
      try {
        await db.resumeDrafts.put({
          id,
          title,
          template,
          content: JSON.stringify(updatedContent),
          updatedAt: Date.now(),
        });
        toast.info('Saved draft locally (Offline mode)');
      } catch (err) {
        console.error('Failed to save local offline draft:', err);
      }
      setSaving(false);
      return;
    }

    try {
      await saveResume({
        id,
        title,
        template,
        content: JSON.stringify(updatedContent),
      });
    } catch {
      try {
        await db.resumeDrafts.put({
          id,
          title,
          template,
          content: JSON.stringify(updatedContent),
          updatedAt: Date.now(),
        });
        toast.info('Saved draft locally (Network offline fallback)');
      } catch (err) {
        console.error('Failed to save local draft:', err);
        toast.error('Autosave failed');
      }
    }
    setSaving(false);
  }, 1500);

  const handleFieldChange = (field: keyof ResumeContent, value: any) => {
    if (!content) return;
    const updated = { ...content, [field]: value };
    setContent(updated);
    autosave(updated);
  };

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const res = await exportResumePdf({ id });
      if (res.url && res.url !== '#') {
        window.open(res.url, '_blank');
        toast.success('Resume PDF generated successfully!');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch {
      toast.error('Failed to export PDF');
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex gap-4"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-48" /></div>
        <div className="grid md:grid-cols-2 gap-8"><Skeleton className="h-[600px]" /><Skeleton className="h-[600px]" /></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header bar actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/resumes')} className="hover:bg-white/10 dark:hover:bg-neutral-800/50 rounded-xl"><ArrowLeft className="h-4.5 w-4.5" /></Button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground capitalize">{template} Layout</span>
              <span className="text-[10px] text-muted-foreground">•</span>
              {/* Autosave status indicator tag */}
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                {saving ? (
                  <span className="text-amber-500 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving changes...</span>
                ) : (
                  <span className="text-emerald-500 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Autosaved</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={handleExport} disabled={exporting} className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover">
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF Export
          </Button>
        </div>
      </div>

      {/* Pane Toggles on Mobile */}
      <div className="md:hidden">
        <Tabs value={activePane} onValueChange={(v: string) => setActivePane(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editor</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Dual Pane Layout Grid */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Editor Form Pane */}
        <div className={`space-y-6 ${activePane === 'edit' ? 'block' : 'hidden md:block'}`}>
          <Card className="glass-card border-border/40">
            <CardContent className="p-6 space-y-6">
              <Accordion type="single" collapsible defaultValue="personal" className="space-y-4">
                {/* Personal Information */}
                <AccordionItem value="personal" className="border border-border/50 rounded-xl px-4 bg-muted/10">
                  <AccordionTrigger className="font-bold py-4 hover:no-underline text-sm">Personal Information</AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4 pt-1">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <Input value={content?.fullName || ''} onChange={(e) => handleFieldChange('fullName', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Job Title</label>
                        <Input value={content?.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <Input value={content?.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <Input value={content?.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                        <Input value={content?.location || ''} onChange={(e) => handleFieldChange('location', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn URL</label>
                        <Input value={content?.linkedIn || ''} onChange={(e) => handleFieldChange('linkedIn', e.target.value)} className="rounded-xl border-border/50 bg-background" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Professional Summary */}
                <AccordionItem value="summary" className="border border-border/50 rounded-xl px-4 bg-muted/10">
                  <AccordionTrigger className="font-bold py-4 hover:no-underline text-sm">Professional Summary</AccordionTrigger>
                  <AccordionContent className="pb-4 pt-1 space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professional Summary</label>
                    <Textarea value={content?.summary || ''} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={4} className="rounded-xl border-border/50 bg-background" />
                  </AccordionContent>
                </AccordionItem>

                {/* Skills Section */}
                <AccordionItem value="skills" className="border border-border/50 rounded-xl px-4 bg-muted/10">
                  <AccordionTrigger className="font-bold py-4 hover:no-underline text-sm">Skills</AccordionTrigger>
                  <AccordionContent className="pb-4 pt-1 space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills (Comma-separated)</label>
                    <Input 
                      value={content?.skills?.join(', ') || ''} 
                      onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                      className="rounded-xl border-border/50 bg-background"
                      placeholder="React, TypeScript, Node.js, Mongoose"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Work Experience Subform */}
                <AccordionItem value="experience" className="border border-border/50 rounded-xl px-4 bg-muted/10">
                  <AccordionTrigger className="font-bold py-4 hover:no-underline text-sm">Work Experience</AccordionTrigger>
                  <AccordionContent className="pb-4 pt-1 space-y-4">
                    {content?.experience?.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-3 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const updated = content.experience.filter((_, i) => i !== idx);
                            handleFieldChange('experience', updated);
                          }}
                          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company</span>
                            <Input value={exp.company} onChange={e => {
                              const updated = [...content.experience];
                              updated[idx].company = e.target.value;
                              handleFieldChange('experience', updated);
                            }} className="h-9 rounded-lg" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Role</span>
                            <Input value={exp.role} onChange={e => {
                              const updated = [...content.experience];
                              updated[idx].role = e.target.value;
                              handleFieldChange('experience', updated);
                            }} className="h-9 rounded-lg" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
                          <Input value={exp.duration} onChange={e => {
                            const updated = [...content.experience];
                            updated[idx].duration = e.target.value;
                            handleFieldChange('experience', updated);
                          }} className="h-9 rounded-lg" placeholder="e.g., Jan 2023 - Present" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bullet Points (Comma-separated)</span>
                          <Textarea value={exp.bullets.join(', ')} onChange={e => {
                            const updated = [...content.experience];
                            updated[idx].bullets = e.target.value.split(',').map(b => b.trim()).filter(Boolean);
                            handleFieldChange('experience', updated);
                          }} className="rounded-lg h-20" />
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const updated = [...(content?.experience || []), { company: '', role: '', duration: '', bullets: [] }];
                        handleFieldChange('experience', updated);
                      }} 
                      className="w-full h-10 border-dashed rounded-xl border-border/80 text-xs hover:bg-white/5"
                    >
                      <Plus className="mr-1 h-4.5 w-4.5" /> Add Work Experience
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Pane */}
        <div className={`space-y-6 md:sticky md:top-24 ${activePane === 'preview' ? 'block' : 'hidden md:block'}`}>
          <Card className="glass-card border-border/40 overflow-hidden shadow-xl min-h-[600px] bg-white text-black p-8 font-sans">
            <div className="space-y-6">
              {/* Header profile details */}
              <div className="text-center pb-4 border-b border-neutral-200">
                <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">{content?.fullName || 'Your Full Name'}</h2>
                <p className="text-sm font-semibold text-primary/80 mt-0.5">{content?.title || 'Target Job Title'}</p>
                <p className="text-xs text-neutral-500 mt-1">{content?.email || 'email@example.com'} | {content?.phone || 'Phone'} | {content?.location || 'Location'} | {content?.linkedIn || 'LinkedIn'}</p>
              </div>

              {/* Summary */}
              {content?.summary && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Professional Summary</h3>
                  <p className="text-sm leading-relaxed text-neutral-800">{content.summary}</p>
                </div>
              )}

              {/* Skills */}
              {content?.skills && content.skills.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {content.skills.map((s, i) => <Badge key={i} variant="secondary" className="text-xs bg-neutral-100 text-neutral-800 hover:bg-neutral-100 border-0">{s}</Badge>)}
                  </div>
                </div>
              )}

              {/* Work Experience logs */}
              {content?.experience && content.experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Work Experience</h3>
                  {content.experience.map((exp, i) => (
                    <div key={i} className="space-y-1 text-sm">
                      <div className="flex justify-between font-bold text-neutral-900">
                        <span>{exp.role} at {exp.company}</span>
                        <span className="font-normal text-xs text-neutral-500 shrink-0">{exp.duration}</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-neutral-600 text-xs leading-relaxed">
                        {exp.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
