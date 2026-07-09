import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'zite-auth-sdk';
import { getDashboardStats, GetDashboardStatsOutputType } from 'zite-endpoints-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Mail, Mic, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GetDashboardStatsOutputType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDashboardStats({}).then(setStats).finally(() => setLoading(false));
  }, [user]);

  const quickActions = [
    { label: 'Build Resume', icon: FileText, to: '/resumes', color: 'text-blue-500' },
    { label: 'Analyze ATS', icon: BarChart3, to: '/ats-analyzer', color: 'text-green-500' },
    { label: 'Cover Letter', icon: Mail, to: '/cover-letters', color: 'text-purple-500' },
    { label: 'Interview Prep', icon: Mic, to: '/interview-prep', color: 'text-orange-500' },
    { label: 'Track Jobs', icon: Briefcase, to: '/job-tracker', color: 'text-pink-500' },
  ];

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'there'} 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your career progress at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Resumes" value={stats?.resumeCount ?? 0} sub={stats?.avgAtsScore ? `Avg ATS: ${stats.avgAtsScore}%` : 'No scores yet'} icon={<FileText className="h-4 w-4" />} />
        <StatCard title="Applications" value={stats?.applicationCount ?? 0} sub={`${stats?.applicationsByStatus?.find(s => s.status === 'Interview')?.count || 0} interviews`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard title="Cover Letters" value={stats?.coverLetterCount ?? 0} sub="Generated" icon={<Mail className="h-4 w-4" />} />
        <StatCard title="Mock Interviews" value={stats?.interviewCount ?? 0} sub={stats?.avgInterviewScore ? `Avg score: ${stats.avgInterviewScore}%` : 'No scores yet'} icon={<Mic className="h-4 w-4" />} />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => navigate(a.to)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors">
              <a.icon className={`h-6 w-6 ${a.color}`} />
              <span className="text-sm font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* App pipeline + recent */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Application Pipeline</CardTitle></CardHeader>
          <CardContent>
            {stats?.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
              <div className="space-y-3">
                {stats.applicationsByStatus.map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-sm">{s.status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (s.count / (stats.applicationCount || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-6 text-right">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/job-tracker')}>Start Tracking <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent ATS Analyses</CardTitle></CardHeader>
          <CardContent>
            {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAnalyses.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{a.matchScore ?? 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No analyses yet</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/ats-analyzer')}>Analyze Resume <ArrowRight className="ml-1 h-3 w-3" /></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }: { title: string; value: number; sub: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
