import { useState } from 'react';
import { generateInterviewQuestions, scoreInterview, GenerateInterviewQuestionsOutputType, ScoreInterviewOutputType } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, Mic, Send } from 'lucide-react';
import { toast } from 'sonner';

type Question = GenerateInterviewQuestionsOutputType['questions'][0];

export default function InterviewPrep() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'hr' | 'technical' | 'behavioral'>('hr');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreInterviewOutputType | null>(null);
  const [mode, setMode] = useState<'setup' | 'practice' | 'results'>('setup');
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('interview');

  const handleGenerate = async () => {
    if (!jobTitle) { toast.error('Please enter a job title'); return; }
    const allowed = await checkAccess();
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await generateInterviewQuestions({ jobTitle, company: company || undefined, type });
      setSessionId(r.id);
      setQuestions(r.questions);
      setAnswers({});
      setScoreResult(null);
      setMode('practice');
    } catch { toast.error('Failed to generate questions'); }
    setLoading(false);
  };

  const handleScore = async () => {
    const answeredQs = questions.filter((_, i) => answers[i]?.trim());
    if (answeredQs.length === 0) { toast.error('Please answer at least one question'); return; }
    setScoring(true);
    try {
      const r = await scoreInterview({
        sessionId,
        answers: questions.map((q, i) => ({ question: q.question, answer: answers[i] || 'No answer provided' })),
      });
      setScoreResult(r);
      setMode('results');
    } catch { toast.error('Failed to score'); }
    setScoring(false);
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500';

  if (mode === 'setup') {
    return (
      <div className="p-6 md:p-8 max-w-3xl space-y-6">
        <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Interview Prep" usageCount={usageCount} limit={limit} />
        <div><h1 className="text-2xl font-bold">AI Interview Preparation</h1><p className="text-muted-foreground mt-1">Practice with AI-generated interview questions and get scored</p></div>
        <Card><CardContent className="p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Job Title *</label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" /></div>
          <div><label className="text-sm font-medium mb-1 block">Company (optional)</label><Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Google" /></div>
          <div>
            <label className="text-sm font-medium mb-1 block">Interview Type</label>
            <Select value={type} onValueChange={v => setType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR / General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral (STAR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full"><Sparkles className="mr-2 h-4 w-4" />{loading ? 'Generating...' : 'Start Mock Interview'}</Button>
        </CardContent></Card>
      </div>
    );
  }

  if (mode === 'results' && scoreResult) {
    return (
      <div className="p-6 md:p-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interview Results</h1>
          <Button variant="outline" onClick={() => setMode('setup')}>Practice Again</Button>
        </div>
        <Card><CardContent className="p-6 flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" /><circle cx="60" cy="60" r="52" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeDasharray={`${(scoreResult.overallScore / 100) * 327} 327`} strokeLinecap="round" /></svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className={`text-2xl font-bold ${scoreColor(scoreResult.overallScore)}`}>{scoreResult.overallScore}</span></div>
          </div>
          <div><h2 className="text-lg font-bold">Overall Score: {scoreResult.overallScore}/100</h2><p className="text-sm text-muted-foreground mt-1">{scoreResult.feedback}</p></div>
        </CardContent></Card>
        <div className="space-y-4">
          {scoreResult.questionFeedback.map((qf, i) => (
            <Card key={i}><CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Q{i + 1}: {questions[i]?.question}</p>
                <Badge className={scoreColor(qf.score)}>{qf.score}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 bg-muted p-2 rounded">Your answer: {answers[i] || 'No answer'}</p>
              <p className="text-xs text-green-600 mb-1"><strong>Strengths:</strong> {qf.strengths}</p>
              <p className="text-xs text-orange-600"><strong>Improvements:</strong> {qf.improvements}</p>
            </CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Mock Interview</h1><p className="text-muted-foreground mt-1">{jobTitle} {company ? `at ${company}` : ''} — {type.toUpperCase()}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('setup')}>Back</Button>
          <Button onClick={handleScore} disabled={scoring}><Send className="mr-2 h-4 w-4" />{scoring ? 'Scoring...' : 'Submit & Score'}</Button>
        </div>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <button className="w-full flex items-center justify-between text-left" onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                <p className="font-medium text-sm">Q{i + 1}: {q.question}</p>
                {expandedQ === i ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              {expandedQ === i && (
                <div className="mt-4 space-y-3">
                  <div className="bg-muted/50 p-3 rounded-lg"><p className="text-xs text-muted-foreground"><strong>Tips:</strong> {q.tips}</p></div>
                  <Textarea rows={4} value={answers[i] || ''} onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))} placeholder="Type your answer here..." />
                  <details className="text-xs"><summary className="cursor-pointer text-primary font-medium">View Sample Answer</summary><p className="mt-2 text-muted-foreground whitespace-pre-wrap">{q.sampleAnswer}</p></details>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
