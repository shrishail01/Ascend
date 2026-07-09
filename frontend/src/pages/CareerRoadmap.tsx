import { useState } from 'react';
import { generateRoadmap, GenerateRoadmapOutputType, suggestRoles, SuggestRolesOutputType, generateRoleSOP, GenerateRoleSOPOutputType } from '@/api/roadmap';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from '@/components/UpgradeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Map, Clock, Award, DollarSign, ArrowRight, Target, CheckCircle2, BookOpen, Loader2, ArrowLeft, Zap, CalendarDays, Trophy, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

type RoleType = SuggestRolesOutputType['roles'][0];
type SOPType = GenerateRoleSOPOutputType['sop'];
type RoadmapType = GenerateRoadmapOutputType['roadmap'];

export default function CareerRoadmap() {
  const [activeTab, setActiveTab] = useState('smart');
  const { checkAccess, showUpgrade, closeUpgrade, onUpgraded, usageCount, limit } = useFeatureAccess('roadmap');

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8 mx-auto">
      <UpgradeModal open={showUpgrade} onClose={closeUpgrade} onUpgraded={onUpgraded} featureName="Career Roadmap" usageCount={usageCount} limit={limit} />
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Career Roadmap</h1>
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

  if (selectedRole && (sop || sopLoading)) {
    return (
      <div className="space-y-5">
        <Button variant="outline" size="sm" onClick={() => { setSelectedRole(null); setSop(null); }} className="rounded-xl hover:bg-white/10 dark:hover:bg-neutral-800/50">
          <ArrowLeft className="mr-2 h-4 w-4" />Back to Roles
        </Button>
        {sopLoading ? <SOPSkeleton role={selectedRole.title} /> : sop && <SOPView sop={sop} role={selectedRole} />}
      </div>
    );
  }

  if (roles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">{profileSummary}</p>
          <Button variant="outline" size="sm" onClick={() => { setRoles(null); setProfileSummary(''); }} className="rounded-xl">
            Refresh Suggestions
          </Button>
        </div>
        <div className="space-y-4">
          {roles.map((role, i) => (
            <RoleCard key={i} role={role} rank={i + 1} onClick={() => handleSelectRole(role)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="glass-card border-border/40 overflow-hidden">
      <CardContent className="p-10 text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/15 flex items-center justify-center mx-auto shadow-inner">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold">Smart Role Matching</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            We'll analyze your resume and profile to find the top 5 most in-demand roles that match your skills — with a detailed action plan for each.
          </p>
        </div>
        <Button onClick={handleSuggest} disabled={loading} size="lg" className="h-12 px-6 bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg">
          {loading ? <><Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />Analyzing your profile...</> : <><Sparkles className="mr-2 h-4.5 w-4.5" />Find My Best Roles</>}
        </Button>
      </CardContent>
    </Card>
  );
}

function RoleCard({ role, rank, onClick }: { role: RoleType; rank: number; onClick: () => void }) {
  const scoreColor = role.matchScore >= 80 ? 'text-emerald-500' : role.matchScore >= 60 ? 'text-amber-500' : 'text-rose-500';
  const demandColor = role.demand === 'Very High' ? 'bg-emerald-500/10 text-emerald-600' : role.demand === 'High' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600';

  return (
    <Card className="glass-card glow-hover border-border/40 cursor-pointer group hover:-translate-y-1 duration-300 relative overflow-hidden" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md shadow-primary/20">
            #{rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-extrabold text-base group-hover:text-primary transition-colors">{role.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge className={`${demandColor} border-0 text-[10px]`}>{role.demand} Demand</Badge>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {role.avgSalary}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-black ${scoreColor}`}>{role.matchScore}%</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">match</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-light">{role.justification}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {role.keySkillsMatched.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />{s}</Badge>
              ))}
              {role.skillGaps.map((s, i) => (
                <Badge key={`gap-${i}`} variant="outline" className="text-[10px] text-muted-foreground border-border/60">{s}</Badge>
              ))}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function SOPSkeleton({ role }: { role: string }) {
  return (
    <Card className="glass-card border-border/40">
      <CardContent className="p-10 text-center space-y-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <h3 className="font-extrabold">Building SOP timeline for {role}...</h3>
        <p className="text-xs text-muted-foreground">Mapping milestones and learning roadmaps...</p>
      </CardContent>
    </Card>
  );
}

function SOPView({ sop, role }: { sop: SOPType; role: RoleType }) {
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  return (
    <div className="space-y-6">
      <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">{sop.targetRole}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1 font-semibold"><Clock className="h-3.5 w-3.5" /> {sop.estimatedTimeline}</span>
                <span className="flex items-center gap-1 font-semibold"><BarChart3 className="h-3.5 w-3.5" /> {role.matchScore}% matching</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">{sop.overview}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sop.phases.map((phase, pi) => (
          <Card key={pi} className={`glass-card border-border/40 overflow-hidden ${expandedPhase === pi ? 'ring-2 ring-primary/20' : ''}`}>
            <button className="w-full text-left p-5 flex items-center justify-between" onClick={() => setExpandedPhase(expandedPhase === pi ? -1 : pi)}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {phase.phase}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm truncate">{phase.title}</h3>
                    <Badge variant="outline" className="text-[10px] shrink-0"><CalendarDays className="h-3 w-3 mr-1" />{phase.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{phase.objective}</p>
                </div>
              </div>
            </button>
            {expandedPhase === pi && (
              <div className="px-5 pb-5 pt-0">
                <div className="ml-[18px] border-l-2 border-primary/20 pl-6 space-y-4 pt-2">
                  {phase.steps.map((step, si) => (
                    <div key={si} className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold text-primary">{step.step}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-foreground/90">{step.action}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed font-light">{step.details}</p>
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          <Badge variant="secondary" className="text-[10px] bg-muted"><BookOpen className="h-3.5 w-3.5 mr-1" /> {step.resource}</Badge>
                          <Badge variant="outline" className="text-[10px]"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {step.deliverable}</Badge>
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

      {sop.certifications.length > 0 && (
        <Card className="glass-card border-border/40">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="h-4.5 w-4.5 text-primary" />Recommended Certifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sop.certifications.map((c, i) => (
                <div key={i} className="flex items-start justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 gap-3">
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.provider} • {c.timeToComplete} • {c.cost}</p>
                  </div>
                  <Badge className={`border-0 text-[10px] ${c.priority === 'Must-have' ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary'}`}>
                    {c.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card border-border/40">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4.5 w-4.5 text-primary" />Weekly Routine</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {sop.weeklyRoutine.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/40">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4.5 w-4.5 text-primary" />Success Metrics</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {sop.successMetrics.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
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
    if (!currentRole || !targetRole) {
      toast.error('Please enter both current and target roles');
      return;
    }
    const allowed = await checkAccess(true);
    if (!allowed) return;
    setLoading(true);
    try {
      const r = await generateRoadmap({
        currentRole,
        targetRole,
        skills: skills || undefined,
        experience: experience || undefined,
      });
      setResult(r.roadmap);
      toast.success('Custom roadmap generated!');
    } catch {
      toast.error('Failed to generate roadmap');
    }
    setLoading(false);
  };

  const priorityColor = (p: string) =>
    p === 'High'
      ? 'bg-red-500/10 text-red-600 border-0'
      : p === 'Medium'
      ? 'bg-yellow-500/10 text-yellow-600 border-0'
      : 'bg-green-500/10 text-green-600 border-0';

  return (
    <div className="space-y-6">
      {!result ? (
        <Card className="glass-card border-border/40">
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Role *</label>
                <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g., Junior Developer" className="rounded-xl border-border/50 bg-muted/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Role *</label>
                <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g., Senior Software Engineer" className="rounded-xl border-border/50 bg-muted/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Skills (Optional)</label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g., JavaScript, React, Node.js" className="rounded-xl border-border/50 bg-muted/10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Years of Experience (Optional)</label>
              <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g., 2 years in web development" className="rounded-xl border-border/50 bg-muted/10" />
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover shadow-lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating custom roadmap...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Custom Roadmap</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Button variant="outline" size="sm" onClick={() => setResult(null)} className="rounded-xl hover:bg-white/10 dark:hover:bg-neutral-800/50">
            <ArrowLeft className="mr-2 h-4 w-4" />New Roadmap
          </Button>

          <Card className="glass-card border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Map className="h-5 w-5 text-primary" /></div>
                <div>
                  <h2 className="font-extrabold text-base">{currentRole} → {targetRole}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Clock className="h-3.5 w-3.5" /> ~{result.timelineMonths} months</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">{result.summary}</p>
              <div className="flex gap-4 pt-2 border-t border-border/40 flex-wrap items-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold"><DollarSign className="h-4 w-4 text-muted-foreground" />Current: {result.salaryRange.current}</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1 text-xs text-primary font-bold"><DollarSign className="h-4 w-4 text-primary" />Target: {result.salaryRange.target}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Skill Gaps Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.skillGaps.map((sg, i) => (
                  <div key={i} className="flex items-start justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 gap-3">
                    <div>
                      <p className="font-bold text-sm">{sg.skill}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sg.resources}</p>
                    </div>
                    <Badge className={priorityColor(sg.priority)}>{sg.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/40">
            <CardHeader className="pb-3"><CardTitle className="text-base font-bold">Milestones Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="border-l-2 border-primary/20 pl-6 space-y-6 relative py-2 ml-4">
                {result.milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[33px] top-0.5 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-3">
                        <h4 className="font-extrabold text-sm text-foreground/90">{m.title}</h4>
                        <Badge variant="outline" className="text-[9px] shrink-0">{m.timeframe}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.certifications && result.certifications.length > 0 && (
            <Card className="glass-card border-border/40">
              <CardHeader className="pb-3"><CardTitle className="text-base font-bold flex items-center gap-2"><Award className="h-4.5 w-4.5 text-primary" />Recommended Certifications</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.certifications.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border/40 bg-muted/20">
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.provider}</p>
                      <p className="text-xs mt-1 text-muted-foreground font-light">{c.relevance}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
