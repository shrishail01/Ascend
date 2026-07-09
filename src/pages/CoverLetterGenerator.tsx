import { useState, useEffect } from 'react';
import { generateCoverLetter, getCoverLetters, deleteCoverLetter, GetCoverLettersOutputType } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sparkles, Copy, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

type CoverLetter = GetCoverLettersOutputType['coverLetters'][0];

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState('');
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('coverLetter');

  useEffect(() => { getCoverLetters({}).then(r => setLetters(r.coverLetters)).finally(() => setLoading(false)); }, []);

  const handleGenerate = async () => {
    if (!jobTitle || !company || !jd) { toast.error('Please fill in all required fields'); return; }
    const allowed = await checkAccess();
    if (!allowed) return;
    setGenerating(true);
    try {
      const r = await generateCoverLetter({ jobTitle, company, jobDescription: jd, tone });
      setGenerated(r.content);
      setLetters(prev => [{ id: r.id, title: `${jobTitle} at ${company}`, company, jobTitle, content: r.content, createdAt: new Date().toISOString() }, ...prev]);
      toast.success('Cover letter generated!');
    } catch { toast.error('Failed to generate. Please try again.'); }
    setGenerating(false);
  };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };

  const handleDelete = async (id: string) => {
    try { await deleteCoverLetter({ id }); setLetters(prev => prev.filter(l => l.id !== id)); if (selectedLetter?.id === id) setSelectedLetter(null); toast.success('Deleted'); } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Cover Letter" usageCount={usageCount} limit={limit} />
      <div>
        <h1 className="text-2xl font-bold">AI Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">Generate tailored cover letters in seconds</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList><TabsTrigger value="generate">Generate New</TabsTrigger><TabsTrigger value="history">History ({letters.length})</TabsTrigger></TabsList>

        <TabsContent value="generate" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Job Title *</label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer" /></div>
                <div><label className="text-sm font-medium mb-1 block">Company *</label><Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Google" /></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Job Description *</label><Textarea rows={6} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description..." /></div>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="Confident">Confident</SelectItem>
                  <SelectItem value="Conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={generating}><Sparkles className="mr-2 h-4 w-4" />{generating ? 'Generating...' : 'Generate Cover Letter'}</Button>
            </CardContent>
          </Card>

          {generated && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Generated Cover Letter</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleCopy(generated)}><Copy className="mr-2 h-3 w-3" /> Copy</Button>
              </CardHeader>
              <CardContent><div className="whitespace-pre-wrap text-sm leading-relaxed">{generated}</div></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {loading ? <Skeleton className="h-48" /> : letters.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No cover letters yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {letters.map(l => (
                <Card key={l.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedLetter(l)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); handleCopy(l.content || ''); }}><Copy className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete cover letter?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(l.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedLetter && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">{selectedLetter.title}</CardTitle></CardHeader>
              <CardContent><div className="whitespace-pre-wrap text-sm">{selectedLetter.content}</div></CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
