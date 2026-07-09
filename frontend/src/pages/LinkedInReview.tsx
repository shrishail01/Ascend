import { useState } from 'react';
import { reviewLinkedIn, ReviewLinkedInOutputType } from '@/api/linkedin';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Copy, Linkedin, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LinkedInReview() {
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewLinkedInOutputType | null>(null);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('linkedin');

  const handleReview = async () => {
    if (!headline && !about && !experience) {
      toast.error('Please fill in at least one section');
      return;
    }
    const allowed = await checkAccess();
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await reviewLinkedIn({ headline: headline || undefined, about: about || undefined, experience: experience || undefined });
      setResult(r);
      toast.success('Profile analysis complete!');
    } catch {
      toast.error('Failed to review');
    }
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-500' : s >= 60 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="LinkedIn Review" usageCount={usageCount} limit={limit} />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">LinkedIn Profile Review</h1>
        <p className="text-muted-foreground mt-1">Optimize your LinkedIn profile copy with structured AI audit scores and improved suggestions</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-border/40">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professional Headline</label>
                  <Textarea rows={2} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Your current LinkedIn headline description..." className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About Section (Summary)</label>
                  <Textarea rows={5} value={about} onChange={e => setAbout(e.target.value)} placeholder="Copy and paste your LinkedIn About profile copy..." className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience Section</label>
                  <Textarea rows={5} value={experience} onChange={e => setExperience(e.target.value)} placeholder="Paste details of your job history here..." className="rounded-xl border-border/50 bg-muted/10" />
                </div>
                <Button onClick={handleReview} disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg">
                  {loading ? <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> : <Sparkles className="mr-2 h-4.5 w-4.5" />}
                  {loading ? 'Analyzing profile content...' : 'Audit LinkedIn Profile'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="review-results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setResult(null)} className="rounded-xl hover:bg-white/10 dark:hover:bg-neutral-800/50">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Review Another
              </Button>
            </div>

            {/* Score header widgets */}
            <Card className="glass-card border-border/40 relative overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Circular score gauge */}
                <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth="6" fill="transparent" />
                    <motion.circle 
                      cx="48" cy="48" r="40" 
                      className={`stroke-current ${scoreColor(result.overallScore)}`}
                      strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - result.overallScore / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <span className="absolute text-xl font-extrabold">{result.overallScore}</span>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-xl font-extrabold flex items-center gap-2 justify-center sm:justify-start">
                    <Linkedin className="h-5 w-5 text-[#0A66C2]" /> LinkedIn Score Audit
                  </h2>
                  <p className="text-sm text-muted-foreground">We matched your headline and summaries against recruiter search keywords.</p>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown sections audit cards */}
            <div className="space-y-6">
              {result.sections.map((s, idx) => (
                <Card key={idx} className="glass-card border-border/40 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold">{s.name}</CardTitle>
                      <span className={`text-sm font-extrabold ${scoreColor(s.score)}`}>{s.score}% Match</span>
                    </div>
                    <Progress value={s.score} className="h-1.5 mt-2" />
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Comparative layouts */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border/40 bg-muted/10 space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Current Copy</span>
                        <p className="text-xs leading-relaxed text-muted-foreground">{s.current || 'Not provided.'}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">AI Improved Copy</span>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(s.improved)} className="h-7 hover:bg-white/10 text-primary hover:text-primary"><Copy className="h-3.5 w-3.5 mr-1" /> Copy</Button>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/90 font-medium">{s.improved}</p>
                      </div>
                    </div>
                    {/* Optimization tips summary */}
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Optimization Tip:</strong> {s.tips}</span></p>
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
