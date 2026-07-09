import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/auth';
import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Mail, Mic, Briefcase, ArrowRight, TrendingUp, Sparkles, Plus, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const actions = [
  { label: 'Build Resume', to: '/resumes', desc: 'Create a tailored CV', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Analyze ATS', to: '/ats-analyzer', desc: 'Check resume score', icon: BarChart3, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Cover Letter', to: '/cover-letters', desc: 'Generate target draft', icon: Mail, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { label: 'Practice Interview', to: '/interview-prep', desc: 'Simulate questions', icon: Mic, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading: loading } = useDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.firstName || 'User'}!</h1>
          <p className="text-muted-foreground mt-1">Here is a snapshot of your job preparation progress.</p>
        </div>
        <Button onClick={() => navigate('/resumes')} className="glow-hover bg-gradient-to-r from-primary to-secondary text-white border-0 py-2 h-11 px-5 rounded-xl font-bold">
          <Plus className="mr-2 h-4.5 w-4.5" /> Create New Resume
        </Button>
      </div>

      {/* Main stats widgets */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Resumes count widget */}
        <motion.div variants={cardVariants}>
          <Card className="glass-card glow-hover border-border/40 relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resumes Created</p>
                <div className="text-4xl font-extrabold tracking-tight">
                  <CountUp end={stats?.resumeCount || 0} duration={1.5} />
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average ATS Score widget */}
        <motion.div variants={cardVariants}>
          <Card className="glass-card glow-hover border-border/40 relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg ATS Score</p>
                <div className="text-4xl font-extrabold tracking-tight flex items-baseline">
                  <CountUp end={stats?.avgAtsScore || 0} duration={1.5} />
                  <span className="text-sm font-medium text-muted-foreground ml-1">/100</span>
                </div>
                {/* Score progress slider bar */}
                <div className="w-full bg-muted dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.avgAtsScore || 0}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 flex items-center justify-center ml-4">
                <Award className="h-6 w-6 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications tracker widget */}
        <motion.div variants={cardVariants}>
          <Card className="glass-card glow-hover border-border/40 relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Applications Sent</p>
                <div className="text-4xl font-extrabold tracking-tight">
                  <CountUp end={stats?.applicationCount || 0} duration={1.5} />
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main panel layout grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold tracking-tight px-1">Quick Tools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {actions.map((act) => (
              <Card 
                key={act.label} 
                className="glass-card glow-hover cursor-pointer border-border/40 hover:-translate-y-1 hover:border-primary/20 duration-300 relative overflow-hidden group"
                onClick={() => navigate(act.to)}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl ${act.bg} flex items-center justify-center shrink-0`}>
                    <act.icon className={`h-5 w-5 ${act.color} transition-transform duration-300 group-hover:scale-115`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">{act.label}</h3>
                    <p className="text-xs text-muted-foreground">{act.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 ml-auto group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent ATS scores analyses list */}
          <Card className="glass-card border-border/40 overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Recent ATS Scans
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ats-analyzer')} className="text-xs font-semibold hover:bg-white/10 dark:hover:bg-neutral-800/50">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-1">
              {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {stats.recentAnalyses.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <p className="font-bold text-sm truncate max-w-xs">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${item.matchScore >= 80 ? 'text-green-500' : item.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {item.matchScore}%
                        </span>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/ats-analyzer`)} className="h-8 rounded-lg text-xs">Analyze</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No analyses performed yet.</p>
                  <Button size="sm" onClick={() => navigate('/ats-analyzer')} className="h-8 text-xs">Run your first scan</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="glass-card border-border/40 overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-secondary" /> Recent Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-1">
              {(stats as any)?.recentActivity && (stats as any).recentActivity.length > 0 ? (
                <div className="relative pl-6 border-l border-border/40 space-y-6 pt-2">
                  {(stats as any).recentActivity.map((act: any) => (
                    <div key={act.id} className="relative group">
                      <span className="absolute -left-[32px] top-1.5 h-3.5 w-3.5 rounded-full bg-background border-2 border-secondary scale-100 group-hover:scale-120 duration-300" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm text-left">{act.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span>IP: {act.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted dark:bg-neutral-800 flex items-center justify-center mx-auto text-muted-foreground">
                    <Activity className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No recent activity logged.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side analytics column */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold tracking-tight px-1">Overview Stats</h2>
          <Card className="glass-card border-border/40 overflow-hidden h-full min-h-[300px]">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
              {/* Feature usage gauge checklist */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Service Limits Usage
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Resume Builder</span>
                      <span>{stats?.resumeCount || 0} / 2 built</span>
                    </div>
                    <div className="w-full bg-muted dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${Math.min(100, ((stats?.resumeCount || 0) / 2) * 100)}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>AI ATS Analyzer</span>
                      <span>{stats?.recentAnalyses?.length || 0} / 2 scans</span>
                    </div>
                    <div className="w-full bg-muted dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-secondary h-full rounded-full" 
                        style={{ width: `${Math.min(100, ((stats?.recentAnalyses?.length || 0) / 2) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade promo callout */}
              {user?.plan !== 'Premium' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/15 text-center space-y-3">
                  <h4 className="font-bold text-sm">Need Unlimited access?</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Upgrade to Ascend Pro to unlock unlimited resume templates, resume analysis, and interview simulations.</p>
                  <Button size="sm" onClick={() => navigate('/settings')} className="w-full h-9 rounded-lg text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white border-0 glow-hover">
                    Unlock Premium Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
