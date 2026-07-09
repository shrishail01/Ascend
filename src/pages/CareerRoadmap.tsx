import { useState, useEffect } from 'react';
import { generateRoadmap, GenerateRoadmapOutputType, suggestRoles, SuggestRolesOutputType, generateRoleSOP, GenerateRoleSOPOutputType } from 'zite-endpoints-sdk';
import { useAuth } from 'zite-auth-sdk';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Map, Clock, Award, DollarSign, ArrowRight, Target, TrendingUp, CheckCircle2, BookOpen, Loader2, ArrowLeft, Zap, CalendarDays, Trophy, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

type RoleType = SuggestRolesOutputType['roles'][0];
type SOPType = GenerateRoleSOPOutputType['sop'];
type RoadmapType = GenerateRoadmapOutputType['roadmap'];

export default function CareerRoadmap() {
  const [activeTab, setActiveTab] = useState('smart');
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('roadmap');

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Career Roadmap" usageCount={usageCount} limit={limit} />
      <div>
        <h1 className="text-2xl font-bold">Career Roadmap</h1>
        <p className="text-muted-foreground mt-1">AI-powered career planning — get matched to roles or build a custom roadmap</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="smart" className="gap-2"><Zap className="h-4 w-4" />Smart Match</TabsTrigger>
          <TabsTrigger value="custom" className="gap-2"><Map className="h-4 w-4" />Custom Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="mt-6">
          <SmartMatchTab checkAccess={checkAccess} />
        </TabsContent>
        <TabsContent value="custom" className="mt-6">
          <CustomRoadmapTab checkAccess={checkAccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ========== SMART MATCH TAB ========== */

function SmartMatchTab({ checkAccess }: { checkAccess: (increment?: boolean) => Promise<boolean> }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleType[] | null>(null);
  const [profileSummary, setProfileSummary] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [sop, setSop] = useState<SOPType | null>(null);
  const [sopLoading, setSopLoading] = useState(false);

  const handleSuggest = async () => {
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await suggestRoles({});
      setRoles(r.roles);
      setProfileSummary(r.profileSummary);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate suggestions. Make sure you have a resume or profile set up.');
    }
    setLoading(false);
  };

  const handleSelectRole = async (role: RoleType) => {
    setSelectedRole(role);
    setSopLoading(true);
    setSop(null);
    try {
      const r = await generateRoleSOP({ targetRole: role.title, matchScore: role.matchScore, skillGaps: role.skillGaps });
      setSop(r.sop);
    } catch {
      toast.error('Failed to generate SOP');
    }
    setSopLoading(false);
  };

  // Show SOP detail view
  if (selectedRole && (sop || sopLoading)) {
    return (
      <div className="space-y-5">
        <Button variant="outline" size="sm" onClick={() => { setSelectedRole(null); setSop(null); }}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Roles
        </Button>
        {sopLoading ? <SOPSkeleton role={selectedRole.title} /> : sop && <SOPView sop={sop} role={selectedRole} />}
      </div>
    );
  }

  // Show roles list or initial state
  if (roles) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{profileSummary}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setRoles(null); setProfileSummary(''); }}>
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {roles.map((role, i) => (
            <RoleCard key={i} role={role} rank={i + 1} onClick={() => handleSelectRole(role)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Smart Role Matching</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            We'll analyze your resume and profile to find the top 5 most in-demand roles that match your skills — with a detailed action plan for each.
          </p>
        </div>
        <Button onClick={handleSuggest} disabled={loading} size="lg">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing your profile...</> : <><Sparkles className="mr-2 h-4 w-4" />Find My Best Roles</>}
        </Button>
        {!user?.currentRole && (
          <p className="text-xs text-muted-foreground">Tip: Update your profile and upload a resume for better results</p>
        )}
      </CardContent>
    </Card>
  );
}

function RoleCard({ role, rank, onClick }: { role: RoleType; rank: number; onClick: () => void }) {
  const scoreColor = role.matchScore >= 80 ? 'text-green-600' : role.matchScore >= 60 ? 'text-yellow-600' : 'text-red-500';
  const demandColor = role.demand === 'Very High' ? 'bg-green-500/10 text-green-700' : role.demand === 'High' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-yellow-500/10 text-yellow-700';

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
            #{rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{role.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={demandColor}><TrendingUp className="h-3 w-3 mr-1" />{role.demand} Demand</Badge>
                  <span className="text-xs text-muted-foreground">{role.avgSalary}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-bold ${scoreColor}`}>{role.matchScore}%</div>
                <div className="text-xs text-muted-foreground">match</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{role.justification}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {role.keySkillsMatched.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />{s}</Badge>
              ))}
              {role.skillGaps.map((s, i) => (
                <Badge key={`gap-${i}`} variant="outline" className="text-xs text-muted-foreground">{s}</Badge>
              ))}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function SOPSkeleton({ role }: { role: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <h3 className="font-semibold">Building your SOP for {role}</h3>
        <p className="text-sm text-muted-foreground">Creating a detailed step-by-step action plan...</p>
      </CardContent>
    </Card>
  );
}

function SOPView({ sop, role }: { sop: SOPType; role: RoleType }) {
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{sop.targetRole}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{sop.estimatedTimeline}</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{role.matchScore}% match</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{sop.overview}</p>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-3">
        {sop.phases.map((phase, pi) => (
          <Card key={pi} className={expandedPhase === pi ? 'ring-1 ring-primary/30' : ''}>
            <button className="w-full text-left p-5" onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {phase.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{phase.title}</h3>
                    <Badge variant="outline" className="text-xs shrink-0 ml-2"><CalendarDays className="h-3 w-3 mr-1" />{phase.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{phase.objective}</p>
                </div>
              </div>
            </button>
            {expandedPhase === pi && (
              <div className="px-5 pb-5 pt-0">
                <div className="ml-[18px] border-l-2 border-primary/20 pl-6 space-y-4">
                  {phase.steps.map((step, si) => (
                    <div key={si} className="relative">
                      <div className="absolute -left-[30px] top-0.5 h-5 w-5 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{step.step}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs"><BookOpen className="h-3 w-3 mr-1" />{step.resource}</Badge>
                          <Badge variant="outline" className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />{step.deliverable}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Certifications */}
      {sop.certifications.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" />Recommended Certifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sop.certifications.map((c, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 gap-3">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.provider} • {c.timeToComplete} • {c.cost}</p>
                  </div>
                  <Badge className={c.priority === 'Must-have' ? 'bg-red-500/10 text-red-600' : c.priority === 'Recommended' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}>
                    {c.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Routine & Success Metrics side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" />Weekly Routine</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sop.weeklyRoutine.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" />Success Metrics</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sop.successMetrics.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ========== CUSTOM ROADMAP TAB ========== */

function CustomRoadmapTab({ checkAccess }: { checkAccess: (increment?: boolean) => Promise<boolean> }) {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapType | null>(null);

  const handleGenerate = async () => {
    if (!currentRole || !targetRole) { toast.error('Please enter both current and target roles'); return; }
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await generateRoadmap({ currentRole, targetRole, skills: skills || undefined, experience: experience || undefined });
      setResult(r.roadmap);
    } catch { toast.error('Failed to generate roadmap'); }
    setLoading(false);
  };

  const priorityColor = (p: string) => p === 'High' ? 'bg-red-500/10 text-red-600' : p === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600';

  if (result) {
    return (
      <div className="space-y-5">
        <Button variant="outline" size="sm" onClick={() => setResult(null)}>
          <ArrowLeft className="mr-2 h-4 w-4" />New Roadmap
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Map className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="font-bold">{currentRole} → {targetRole}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" /> ~{result.timelineMonths} months</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" />Current: {result.salaryRange.current}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-primary" /><span className="font-medium">Target: {result.salaryRange.target}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Skill Gaps</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.skillGaps.map((sg, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                  <div><p className="font-medium text-sm">{sg.skill}</p><p className="text-xs text-muted-foreground mt-1">{sg.resources}</p></div>
                  <Badge className={priorityColor(sg.priority)}>{sg.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    {i < result.milestones.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pb-6"><p className="font-medium text-sm">{m.title}</p><p className="text-xs text-muted-foreground">{m.timeframe}</p><p className="text-sm mt-1">{m.description}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" />Recommended Certifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.certifications.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.provider}</p>
                  <p className="text-xs mt-1">{c.relevance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1 block">Current Role *</label><Input value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g., Junior Developer" /></div>
          <div><label className="text-sm font-medium mb-1 block">Target Role *</label><Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Senior Software Engineer" /></div>
        </div>
        <div><label className="text-sm font-medium mb-1 block">Current Skills <span className="text-muted-foreground font-normal">(optional)</span></label><Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., JavaScript, React, Node.js" /></div>
        <div><label className="text-sm font-medium mb-1 block">Years of Experience <span className="text-muted-foreground font-normal">(optional)</span></label><Input value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 2 years in web development" /></div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Roadmap</>}
        </Button>
      </CardContent>
    </Card>
  );
}
