import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from 'zite-auth-sdk';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, BarChart3, Mail, Mic, Briefcase, Map, Linkedin, Lightbulb, Settings, LogOut, Menu, LayoutDashboard, ChevronUp, Sparkles, Crown, Zap } from 'lucide-react';
import { useState as useModalState } from 'react';
import UpgradeModal from '@/components/UpgradeModal';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resumes', label: 'Resume Builder', icon: FileText },
  { to: '/ats-analyzer', label: 'ATS Analyzer', icon: BarChart3 },
  { to: '/cover-letters', label: 'Cover Letters', icon: Mail },
  { to: '/interview-prep', label: 'Interview Prep', icon: Mic },
  { to: '/job-tracker', label: 'Job Tracker', icon: Briefcase },
  { to: '/career-roadmap', label: 'Career Roadmap', icon: Map },
  { to: '/linkedin-review', label: 'LinkedIn Review', icon: Linkedin },
  { to: '/project-generator', label: 'Project Ideas', icon: Lightbulb },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const { user, isLoading, loginWithRedirect, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isPremium = user?.plan === 'Premium' || user?.plan === 'Admin';

  useEffect(() => {
    if (!isLoading && !user) loginWithRedirect({ redirectUrl: window.location.href });
  }, [isLoading, user, loginWithRedirect]);

  if (isLoading || !user) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} onUpgraded={() => { setShowUpgrade(false); window.location.reload(); }} />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <ChevronUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ASCEND</span>
          </NavLink>
        </div>
        <div className="flex-1 px-3 overflow-y-auto">
          <NavItems />
        </div>
        {!isPremium && (
          <div className="px-3 pb-2">
            <button onClick={() => setShowUpgrade(true)} className="w-full p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition-colors text-left">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Unlimited AI features — ₹89</p>
            </button>
          </div>
        )}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{user.firstName || user.email.split('@')[0]}</p>
                    {isPremium && <Crown className="h-3.5 w-3.5 text-yellow-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{isPremium ? 'Pro Member' : user.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <ChevronUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">ASCEND</span>
          </NavLink>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                    <ChevronUp className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold">ASCEND</span>
                </div>
                <NavItems onClick={() => setMobileOpen(false)} />
              </div>
              <div className="mt-auto pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
