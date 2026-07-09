import { useState } from 'react';
import { generateInterviewQuestions, scoreInterview, GenerateInterviewQuestionsOutputType, ScoreInterviewOutputType } from '@/api/interview';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ChevronDown, ChevronUp, Send, Loader2, ArrowLeft, HelpCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (!jobTitle) {
      toast.error('Please enter a job title');
      return;
    }
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
    } catch {
      toast.error('Failed to generate questions');
    }
    setLoading(false);
  };

  const handleScore = async () => {
    const answeredQs = questions.filter((_, i) => answers[i]?.trim());
    if (answeredQs.length === 0) {
      toast.error('Please answer at least one question');
      return;
    }
    setScoring(true);
    try {
      const r = await scoreInterview({
        sessionId,
        answers: questions.map((q, i) => ({ questionId: q.id, question: q.question, answer: answers[i] || 'No answer provided' })),
      });
      setScoreResult(r);
      setMode('results');
    } catch {
      toast.error('Failed to score');
    }
    setScoring(false);
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-amber-500' : 'text-rose-500';

  const elementVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Interview Prep" usageCount={usageCount} limit={limit} />

      <AnimatePresence mode="wait">
        {mode === 'setup' && (
          <motion.div
            key="setup-pane"
            variants={elementVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6 max-w-3xl mx-auto"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">AI Interview Preparation</h1>
              <p className="text-muted-foreground mt-1">Practice with AI-generated interview questions and get scored instantly</p>
            </div>
            <Card className="glass-card border-border/40">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Title *</label>
                  <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name (Optional)</label>
                  <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Google" className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Interview Focus Type</label>
                  <Select value={type} onValueChange={(v: string) => setType(v as any)}>
                    <SelectTrigger className="rounded-xl border-border/50 bg-muted/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      <SelectItem value="hr">HR / General</SelectItem>
                      <SelectItem value="technical">Technical Focus</SelectItem>
                      <SelectItem value="behavioral">Behavioral (STAR Method)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg shadow-primary/25">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {loading ? 'Generating questions...' : 'Start Mock Interview'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {mode === 'practice' && (
          <motion.div
            key="practice-pane"
            variants={elementVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setMode('setup')} className="hover:bg-white/10 dark:hover:bg-neutral-800/50 rounded-xl">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Exit practice
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={idx} className="glass-card border-border/40 overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5"><HelpCircle className="h-5 w-5" /></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-foreground/90">{q.question}</h3>
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground" onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}>
                            Tips & Resources {expandedQ === idx ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedQ === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="pl-12 border-l-2 border-primary/20 space-y-2 overflow-hidden"
                        >
                          <p className="text-xs text-muted-foreground leading-relaxed"><strong>Coach Tip:</strong> {q.tips}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed"><strong>Sample Answer:</strong> {q.sampleAnswer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Answer</label>
                      <Textarea value={answers[idx] || ''} onChange={e => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))} rows={4} placeholder="Type your STAR response here..." className="rounded-xl border-border/50 bg-muted/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleScore} disabled={scoring} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg">
              {scoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {scoring ? 'Scoring your answers...' : 'Submit Interview for Scoring'}
            </Button>
          </motion.div>
        )}

        {mode === 'results' && scoreResult && (
          <motion.div
            key="results-pane"
            variants={elementVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Interview Results</h1>
              <Button variant="outline" onClick={() => setMode('setup')} className="rounded-xl hover:bg-white/10 dark:hover:bg-neutral-800/50">Practice Again</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Score visualizer widget */}
              <Card className="glass-card border-border/40 flex flex-col items-center justify-center p-6 space-y-4 md:col-span-1">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="6" fill="transparent" />
                    <motion.circle 
                      cx="56" cy="56" r="48" 
                      className={`stroke-current ${scoreColor(scoreResult.overallScore)}`}
                      strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - scoreResult.overallScore / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <span className="absolute text-2xl font-extrabold">{scoreResult.overallScore}</span>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-sm">Overall score</h3>
                  <p className="text-xs text-muted-foreground">Based on communications structure and logic.</p>
                </div>
              </Card>

              {/* General Feedback widget */}
              <Card className="glass-card border-border/40 p-6 md:col-span-2 flex flex-col justify-center">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy className="h-4.5 w-4.5 text-primary" /> General Coach Feedback</h3>
                  <p className="text-sm leading-relaxed text-foreground/90 font-light">{scoreResult.feedback}</p>
                </div>
              </Card>
            </div>

            {/* Questions-specific feedback list */}
            <div className="space-y-4">
              <h2 className="text-base font-bold tracking-tight px-1">Questions Audit</h2>
              {scoreResult.questionFeedback.map((qFeedback, idx) => (
                <Card key={idx} className="glass-card border-border/40">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-start gap-4 border-b border-border/40 pb-3">
                      <p className="font-bold text-sm text-foreground/90">Question {idx + 1}: {questions[idx]?.question}</p>
                      <span className={`text-sm font-extrabold ${scoreColor(qFeedback.score)}`}>{qFeedback.score}%</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <h4 className="font-bold text-emerald-500 uppercase tracking-wider">Strengths</h4>
                        <p className="text-muted-foreground leading-relaxed">{qFeedback.strengths}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-500 uppercase tracking-wider">Improvements</h4>
                        <p className="text-muted-foreground leading-relaxed">{qFeedback.improvements}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
