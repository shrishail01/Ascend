import { useState, useRef } from 'react';
import { analyzeATS, AnalyzeATSOutputType, optimizeResumeATS, OptimizeResumeATSOutputType } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { uploadFile } from 'zite-file-upload-sdk';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Sparkles, CheckCircle2, AlertCircle, Upload, FileText, X, Download, Wand2, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AtsAnalyzer() {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<(AnalyzeATSOutputType & { parsedResumeText: string }) | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<OptimizeResumeATSOutputType | null>(null);
  const fileRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement | null>;
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('ats');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && isValidFile(f)) setFile(f);
    else toast.error('Please upload a PDF or DOCX file');
  };

  const isValidFile = (f: File) => {
    const ext = f.name.toLowerCase();
    return ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && isValidFile(f)) setFile(f);
    else if (f) toast.error('Please upload a PDF or DOCX file');
  };

  const handleAnalyze = async () => {
    if (tab === 'upload' && !file) { toast.error('Please upload a resume file'); return; }
    if (tab === 'paste' && !resumeText.trim()) { toast.error('Please paste your resume text'); return; }

    const allowed = await checkAccess();
    if (!allowed) return;

    setAnalyzing(true);
    setResult(null);
    setOptimized(null);

    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (tab === 'upload' && file) {
        setUploading(true);
        const { fileUrl: url } = await uploadFile({ data: file, filename: file.name });
        fileUrl = url;
        fileName = file.name;
        setUploading(false);
      }

      const r = await analyzeATS({
        resumeText: tab === 'paste' ? resumeText : undefined,
        fileUrl,
        fileName,
        jobDescription: jd || undefined,
      });
      setResult(r as any);
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error(err?.message || 'Analysis failed. Please try again.');
    }
    setAnalyzing(false);
    setUploading(false);
  };

  const handleOptimize = async () => {
    if (!result?.parsedResumeText) return;
    setOptimizing(true);
    try {
      const r = await optimizeResumeATS({
        resumeText: result.parsedResumeText,
        jobDescription: jd || undefined,
      });
      setOptimized(r);
      toast.success('Resume optimized! Download below.');
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

  const scoreColor = (s: number) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500';
  const scoreBg = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="ATS Analysis" usageCount={usageCount} limit={limit} />
      <div>
        <h1 className="text-2xl font-bold">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">Upload your resume, get an ATS score, and optimize it with AI</p>
      </div>

      {!result ? (
        <InputSection
          tab={tab} setTab={setTab} file={file} setFile={setFile} fileRef={fileRef}
          resumeText={resumeText} setResumeText={setResumeText} jd={jd} setJd={setJd}
          analyzing={analyzing} uploading={uploading}
          handleAnalyze={handleAnalyze} handleFileDrop={handleFileDrop} handleFileSelect={handleFileSelect}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={() => { setResult(null); setOptimized(null); setFile(null); }}>← Analyze Another</Button>
            {!optimized && (
              <Button onClick={handleOptimize} disabled={optimizing} className="bg-gradient-to-r from-primary to-primary/80">
                {optimizing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Optimizing...</> : <><Wand2 className="mr-2 h-4 w-4" />Optimize Resume for ATS</>}
              </Button>
            )}
          </div>

          {/* Score ring */}
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <ScoreRing score={result.overallScore} scoreColor={scoreColor} />
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold mb-1">ATS Score: {result.overallScore}/100</h2>
                <p className="text-muted-foreground text-sm">
                  {result.overallScore >= 80 ? 'Excellent! Your resume is well-optimized for ATS systems.' :
                   result.overallScore >= 60 ? 'Good start, but there are areas for improvement.' :
                   'Your resume needs significant optimization to pass ATS systems.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.categories.map(c => (
              <Card key={c.name}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className={`font-bold text-sm ${scoreColor(c.score)}`}>{c.score}%</span>
                  </div>
                  <Progress value={c.score} className="h-2 mb-3" />
                  <ul className="text-xs text-muted-foreground leading-relaxed space-y-1">
                    {c.feedback.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Keywords */}
          <Card>
            <CardHeader><CardTitle className="text-base">Keyword Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Found Keywords ({result.keywords.found.length})</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.found.map((k, i) => <Badge key={`found-${i}`} variant="secondary" className="bg-green-500/10 text-green-600 border-0">{k}</Badge>)}
                  {result.keywords.found.length === 0 && <span className="text-sm text-muted-foreground">None detected</span>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Missing Keywords ({result.keywords.missing.length})</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.missing.map((k, i) => <Badge key={`missing-${i}`} variant="secondary" className="bg-red-500/10 text-red-600 border-0">{k}</Badge>)}
                  {result.keywords.missing.length === 0 && <span className="text-sm text-muted-foreground">No missing keywords — great!</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-semibold">{i + 1}</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Optimized resume */}
          {optimized && <OptimizedSection optimized={optimized} handleCopyText={handleCopyText} />}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function InputSection({
  tab, setTab, file, setFile, fileRef,
  resumeText, setResumeText, jd, setJd,
  analyzing, uploading,
  handleAnalyze, handleFileDrop, handleFileSelect,
}: {
  tab: 'upload' | 'paste'; setTab: (v: 'upload' | 'paste') => void;
  file: File | null; setFile: (f: File | null) => void; fileRef: React.RefObject<HTMLInputElement | null>;
  resumeText: string; setResumeText: (v: string) => void;
  jd: string; setJd: (v: string) => void;
  analyzing: boolean; uploading: boolean;
  handleAnalyze: () => void; handleFileDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-5">
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
              <TabsTrigger value="paste"><FileText className="mr-2 h-4 w-4" />Paste Text</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              {!file ? (
                <div
                  className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop your resume here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOCX, DOC — up to 25 MB</p>
                  <input ref={fileRef as React.RefObject<HTMLInputElement>} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB • {file.name.split('.').pop()?.toUpperCase()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paste" className="mt-4">
              <Textarea rows={10} value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your complete resume text here..." />
            </TabsContent>
          </Tabs>

          <div>
            <label className="text-sm font-medium mb-2 block">Job Description <span className="text-muted-foreground font-normal">(optional — for targeted analysis)</span></label>
            <Textarea rows={5} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description to get a match score and tailored recommendations..." />
          </div>

          <Button onClick={handleAnalyze} disabled={analyzing} size="lg" className="w-full md:w-auto">
            {analyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{uploading ? 'Uploading & Parsing...' : 'Analyzing with AI...'}</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Analyze Resume</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreRing({ score, scoreColor }: { score: number; scoreColor: (s: number) => string }) {
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <circle cx="60" cy="60" r="52" stroke="hsl(var(--primary))" strokeWidth="8" fill="none"
          strokeDasharray={`${(score / 100) * 327} 327`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
      </div>
    </div>
  );
}

function OptimizedSection({ optimized, handleCopyText }: { optimized: OptimizeResumeATSOutputType; handleCopyText: () => void }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" /> Optimized ATS Resume
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText}>
              <Copy className="mr-2 h-3 w-3" /> Copy Text
            </Button>
            <Button size="sm" asChild>
              <a href={optimized.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-3 w-3" /> Download PDF
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview sections */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="text-center border-b border-border pb-4">
            <h3 className="text-lg font-bold">{optimized.sections.fullName}</h3>
            <p className="text-sm text-muted-foreground">{optimized.sections.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {[optimized.sections.email, optimized.sections.phone, optimized.sections.location, optimized.sections.linkedIn].filter(Boolean).join(' • ')}
            </p>
          </div>

          {optimized.sections.summary && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Summary</h4>
              <p className="text-sm leading-relaxed">{optimized.sections.summary}</p>
            </div>
          )}

          {optimized.sections.experience?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Experience</h4>
              {optimized.sections.experience.map((e, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm font-medium">{e.jobTitle} — {e.company}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap ml-3">{e.duration}</p>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {e.bullets.map((b, j) => <li key={j} className="text-xs text-muted-foreground pl-3 relative before:content-['•'] before:absolute before:left-0">
                      {b}
                    </li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {optimized.sections.skills?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {optimized.sections.skills.map((s, i) => <Badge key={`skill-${i}`} variant="secondary" className="text-xs">{s}</Badge>)}
              </div>
            </div>
          )}

          {optimized.sections.education?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Education</h4>
              {optimized.sections.education.map((e, i) => (
                <p key={i} className="text-sm">{e.degree} — {e.institution} ({e.year})</p>
              ))}
            </div>
          )}

          {optimized.sections.certifications?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Certifications</h4>
              {optimized.sections.certifications.map((c, i) => <p key={i} className="text-sm">{c}</p>)}
            </div>
          )}

          {optimized.sections.projects?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Projects</h4>
              {optimized.sections.projects.map((p, i) => (
                <p key={i} className="text-sm"><strong>{p.name}</strong> — {p.description}</p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
