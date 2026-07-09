import { useState, useRef } from 'react';
import { analyzeATS, AnalyzeATSOutputType, optimizeResumeATS, OptimizeResumeATSOutputType } from '@/api/ats';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { uploadFile } from '@/services/upload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, AlertCircle, Upload, FileText, X, Download, Wand2, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AtsAnalyzer() {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeATSOutputType | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<OptimizeResumeATSOutputType | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('ats');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      toast.success('PDF Resume uploaded');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    const allowed = await checkAccess();
    if (!allowed) return;

    if (tab === 'upload' && !file) {
      toast.error('Please upload a resume file');
      return;
    }
    if (tab === 'paste' && !resumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }

    setAnalyzing(true);
    try {
      let fileUrl = '';
      if (tab === 'upload' && file) {
        setUploading(true);
        const upload = await uploadFile(file);
        fileUrl = upload.url;
        setUploading(false);
      }

      const res = await analyzeATS({
        resumeText: tab === 'paste' ? resumeText : undefined,
        fileUrl: fileUrl || undefined,
        fileName: file?.name || undefined,
        jobDescription: jd || undefined,
      });
      setResult(res);
      toast.success('Resume analyzed successfully!');
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
      setUploading(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await optimizeResumeATS({
        resumeText: result?.parsedResumeText || '',
        jobDescription: jd || undefined,
      });
      setOptimized(res);
      toast.success('Resume optimized successfully!');
    } catch {
      toast.error('Optimization failed. Please try again.');
    }
    setOptimizing(false);
  };

  const handleCopyText = () => {
    if (optimized?.optimizedText) {
      navigator.clipboard.writeText(optimized.optimizedText);
      toast.success('Copied to clipboard');
    }
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="ATS Analysis" usageCount={usageCount} limit={limit} />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">Upload your resume, get an ATS score, and optimize it with AI</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <InputSection
              tab={tab} setTab={setTab} file={file} setFile={setFile} fileRef={fileRef}
              handleFileDrop={handleFileDrop} handleFileSelect={handleFileSelect}
              resumeText={resumeText} setResumeText={setResumeText} jd={jd} setJd={setJd}
              analyzing={analyzing} uploading={uploading} handleAnalyze={handleAnalyze}
            />
          </motion.div>
        ) : (
          <motion.div
            key="results-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => { setResult(null); setOptimized(null); }} className="hover:bg-white/10 dark:hover:bg-neutral-800/50">
                <X className="mr-2 h-4 w-4" /> Reset Scan
              </Button>
              {!optimized && (
                <Button onClick={handleOptimize} disabled={optimizing} className="bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover">
                  {optimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  {optimizing ? 'Optimizing...' : 'Optimize with AI'}
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: ATS Score & Recommendations */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="glass-card border-border/40">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="text-base font-bold">Overall ATS Score</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                    {/* Circular score gauge */}
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="54" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="8" fill="transparent" />
                        <motion.circle 
                          cx="64" cy="64" r="54" 
                          className={`stroke-current ${scoreColor(result.overallScore)}`}
                          strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 54}
                          initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - result.overallScore / 100) }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </svg>
                      <span className="absolute text-3xl font-extrabold">{result.overallScore}</span>
                    </div>

                    <div className="w-full space-y-3 pt-2 text-sm font-semibold">
                      {result.categories.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{cat.name}</span>
                            <span className={`text-xs ${scoreColor(cat.score)}`}>{cat.score}%</span>
                          </div>
                          <Progress value={cat.score} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Analysis Widget */}
                <Card className="glass-card border-border/40">
                  <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Keyword Audit</CardTitle></CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Found Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.found.map(kw => <Badge key={kw} variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">{kw}</Badge>)}
                        {result.keywords.found.length === 0 && <span className="text-xs text-muted-foreground">None found.</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.missing.map(kw => <Badge key={kw} variant="secondary" className="bg-rose-500/10 text-rose-600 border-0 text-[10px]">{kw}</Badge>)}
                        {result.keywords.missing.length === 0 && <span className="text-xs text-muted-foreground">None missing.</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: AI Optimization Draft */}
              <div className="lg:col-span-2 space-y-6">
                {!optimized ? (
                  <Card className="glass-card border-border/40">
                    <CardHeader><CardTitle className="text-base font-bold">Key Recommendations</CardTitle></CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card border-border/40 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Sparkles className="h-4.5 w-4.5 text-primary" /> Optimized Resume Draft
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCopyText} className="h-8 hover:bg-white/10 dark:hover:bg-neutral-800/50"><Copy className="h-4.5 w-4.5" /></Button>
                        {optimized.pdfUrl && (
                          <a href={optimized.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="h-8 bg-gradient-to-r from-primary to-secondary text-white border-0"><Download className="mr-1.5 h-3.5 w-3.5" /> PDF</Button>
                          </a>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 text-foreground max-h-[600px] overflow-y-auto">
                      <div className="space-y-4">
                        <div className="text-center pb-4 border-b border-border/30">
                          <h3 className="text-xl font-bold">{optimized.sections.fullName}</h3>
                          <p className="text-sm text-primary font-medium mt-0.5">{optimized.sections.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{optimized.sections.email} | {optimized.sections.phone} | {optimized.sections.location} | {optimized.sections.linkedIn}</p>
                        </div>

                        {optimized.sections.summary && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</h4>
                            <p className="text-sm leading-relaxed">{optimized.sections.summary}</p>
                          </div>
                        )}

                        {optimized.sections.experience && optimized.sections.experience.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Experience</h4>
                            {optimized.sections.experience.map((exp, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <strong>{exp.jobTitle} at {exp.company}</strong>
                                  <span className="text-xs text-muted-foreground shrink-0">{exp.duration}</span>
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground leading-relaxed">
                                  {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {optimized.sections.skills && optimized.sections.skills.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {optimized.sections.skills.map((s, i) => <Badge key={`skill-${i}`} variant="secondary" className="text-xs bg-muted/60">{s}</Badge>)}
                            </div>
                          </div>
                        )}

                        {optimized.sections.education && optimized.sections.education.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Education</h4>
                            {optimized.sections.education.map((e, i) => (
                              <p key={i} className="text-sm">{e.degree} — {e.institution} ({e.year})</p>
                            ))}
                          </div>
                        )}

                        {optimized.sections.certifications && optimized.sections.certifications.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Certifications</h4>
                            {optimized.sections.certifications.map((c, i) => <p key={i} className="text-sm">{c}</p>)}
                          </div>
                        )}

                        {optimized.sections.projects && optimized.sections.projects.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Projects</h4>
                            {optimized.sections.projects.map((p, i) => (
                              <p key={i} className="text-sm"><strong>{p.name}</strong> — {p.description}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== INPUT PANEL WRAPPER ========== */

function InputSection({
  tab, setTab, file, setFile, fileRef, handleFileDrop, handleFileSelect,
  resumeText, setResumeText, jd, setJd, analyzing, uploading, handleAnalyze
}: {
  tab: 'upload' | 'paste';
  setTab: (t: 'upload' | 'paste') => void;
  file: File | null;
  setFile: (f: File | null) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resumeText: string;
  setResumeText: (t: string) => void;
  jd: string;
  setJd: (t: string) => void;
  analyzing: boolean;
  uploading: boolean;
  handleAnalyze: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="glass-card border-border/40">
        <CardContent className="p-6 space-y-6">
          <Tabs value={tab} onValueChange={(v: string) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
              <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4" />Upload PDF</TabsTrigger>
              <TabsTrigger value="paste" className="gap-2"><FileText className="h-4 w-4" />Paste Content</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              {!file ? (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-primary/50 dark:border-neutral-800 dark:hover:border-primary/40 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/20 hover:bg-primary/5 dark:hover:bg-primary/5 duration-300 min-h-[220px]"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Upload className="h-6 w-6 animate-bounce" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm">Drag and drop your PDF resume here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse from local files</p>
                  </div>
                  <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept="application/pdf" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><FileText className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF file</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"><X className="h-4.5 w-4.5" /></Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste" className="mt-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paste Resume Content</label>
                <Textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8} className="rounded-xl border-border/50 bg-muted/10 focus-visible:ring-primary focus-visible:border-primary" placeholder="Paste all text content from your resume here..." />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Job Description (Optional)</label>
            <Textarea value={jd} onChange={e => setJd(e.target.value)} rows={4} className="rounded-xl border-border/50 bg-muted/10 focus-visible:ring-primary focus-visible:border-primary" placeholder="Paste the target job description to match keywords and formatting criteria..." />
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing} 
            className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg shadow-primary/25"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> 
                {uploading ? 'Uploading Resume...' : 'Analyzing ATS Score...'}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4.5 w-4.5" /> Start Free Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
