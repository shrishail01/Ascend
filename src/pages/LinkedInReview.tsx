import { useState } from 'react';
import { reviewLinkedIn, ReviewLinkedInOutputType } from 'zite-endpoints-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Copy, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

export default function LinkedInReview() {
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewLinkedInOutputType | null>(null);
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('linkedin');

  const handleReview = async () => {
    if (!headline && !about && !experience) { toast.error('Please fill in at least one section'); return; }
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await reviewLinkedIn({ headline: headline || undefined, about: about || undefined, experience: experience || undefined });
      setResult(r);
    } catch { toast.error('Failed to review'); }
    setLoading(false);
  };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard'); };
  const scoreColor = (s: number) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="LinkedIn Review" usageCount={usageCount} limit={limit} />
      <div><h1 className="text-2xl font-bold">LinkedIn Profile Review</h1><p className="text-muted-foreground mt-1">Optimize your LinkedIn profile with AI feedback</p></div>

      {!result ? (
        <Card><CardContent className="p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Headline</label><Textarea rows={2} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Your current LinkedIn headline..." /></div>
          <div><label className="text-sm font-medium mb-1 block">About</label><Textarea rows={5} value={about} onChange={e => setAbout(e.target.value)} placeholder="Your LinkedIn about section..." /></div>
          <div><label className="text-sm font-medium mb-1 block">Experience Summary</label><Textarea rows={5} value={experience} onChange={e => setExperience(e.target.value)} placeholder="Copy-paste your experience section..." /></div>
          <Button onClick={handleReview} disabled={loading}><Sparkles className="mr-2 h-4 w-4" />{loading ? 'Reviewing...' : 'Review Profile'}</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setResult(null)}>← Review Another</Button>

          <Card><CardContent className="p-6 flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"><Linkedin className="h-8 w-8 text-primary" /></div>
            <div><h2 className="text-lg font-bold">Profile Score: <span className={scoreColor(result.overallScore)}>{result.overallScore}/100</span></h2><p className="text-sm text-muted-foreground">See detailed feedback below</p></div>
          </CardContent></Card>

          {result.sections.map(s => (
            <Card key={s.name}>
              <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">{s.name}</CardTitle><span className={`font-bold ${scoreColor(s.score)}`}>{s.score}%</span></div><Progress value={s.score} className="h-2 mt-2" /></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs font-medium text-muted-foreground mb-1">Current</p><p className="text-sm">{s.current || 'Not provided'}</p></div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between mb-1"><p className="text-xs font-medium text-primary">Improved Version</p><Button variant="ghost" size="sm" onClick={() => handleCopy(s.improved)}><Copy className="h-3 w-3 mr-1" />Copy</Button></div>
                  <p className="text-sm">{s.improved}</p>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Tips:</strong> {s.tips}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
