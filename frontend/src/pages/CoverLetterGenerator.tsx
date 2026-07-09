import { useState, useEffect } from 'react';
import { generateCoverLetter, getCoverLetters, deleteCoverLetter, GetCoverLettersOutputType } from '@/api/coverLetter';
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
import { Sparkles, Copy, Trash2, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    getCoverLetters({})
      .then((r) => setLetters(r.coverLetters))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!jobTitle || !company || !jd) {
      toast.error('Please fill in all required fields');
      return;
    }
    const allowed = await checkAccess();
    if (!allowed) return;
    setGenerating(true);
    try {
      const r = await generateCoverLetter({ jobTitle, company, jobDescription: jd, tone });
      setGenerated(r.content);
      setLetters((prev) => [
        {
          id: r.id,
          title: `${jobTitle} at ${company}`,
          company,
          jobTitle,
          content: r.content,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast.success('Cover letter generated!');
    } catch {
      toast.error('Failed to generate. Please try again.');
    }
    setGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverLetter({ id });
      setLetters((prev) => prev.filter((l) => l.id !== id));
      if (selectedLetter?.id === id) setSelectedLetter(null);
      toast.success('Deleted successfully');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Cover Letter" usageCount={usageCount} limit={limit} />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">Generate tailored cover letters in seconds matching target descriptions</p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="history">History ({letters.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6 space-y-6">
          <Card className="glass-card border-border/40">
            <CardContent className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Title *</label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name *</label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Description *</label>
                <Textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description criteria to tailor details..." className="rounded-xl border-border/50 bg-muted/10" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tone of Voice</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-48 rounded-xl border-border/50 bg-muted/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="Confident">Confident</SelectItem>
                      <SelectItem value="Conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleGenerate} disabled={generating} className="h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg shadow-primary/25">
                  {generating ? <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> : <Sparkles className="mr-2 h-4.5 w-4.5" />}
                  {generating ? 'Generating letter...' : 'Generate Cover Letter'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card border-border/40 overflow-hidden shadow-xl">
                  <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold">Draft Output</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generated)} className="h-8 hover:bg-white/10 dark:hover:bg-neutral-800/50">
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Text
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8"><div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-serif">{generated}</div></CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {loading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : letters.length === 0 ? (
            <Card className="glass-card border-dashed border-2 border-border/60 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">No cover letters generated yet</h3>
                <p className="text-xs text-muted-foreground">Tailor your first cover letter to begin job hunting.</p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* History list sidebar panel */}
              <div className="md:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {letters.map((letItem) => (
                  <button
                    key={letItem.id}
                    onClick={() => setSelectedLetter(letItem)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedLetter?.id === letItem.id
                        ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 text-primary shadow-inner'
                        : 'border-border/40 hover:bg-white/5 dark:hover:bg-neutral-800/30'
                    }`}
                  >
                    <h3 className="font-bold text-sm truncate">{letItem.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(letItem.createdAt || '').toLocaleDateString()}</p>
                  </button>
                ))}
              </div>

              {/* Preview target panel */}
              <div className="md:col-span-2">
                {selectedLetter ? (
                  <Card className="glass-card border-border/40 overflow-hidden shadow-lg h-full">
                    <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold truncate max-w-[200px]">{selectedLetter.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopy(selectedLetter.content || '')} className="h-8 hover:bg-white/10"><Copy className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-panel border-border/50 rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Cover Letter</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete this cover letter? This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(selectedLetter.id)} className="bg-red-500 text-white hover:bg-red-600 rounded-xl">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 max-h-[400px] overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif">{selectedLetter.content}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-border/40 p-12 text-center flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                    <Mail className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-medium">Select a letter from the list to view its contents.</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
