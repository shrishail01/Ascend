import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, BarChart3, Mail, Mic, Briefcase, Map, Linkedin, Lightbulb, Settings, LogOut, Menu, LayoutDashboard, ChevronUp, Sparkles, Crown, Shield } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';

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

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPremium = user?.plan === 'Premium';
  const isAdmin = ['SuperAdmin', 'Admin', 'Support', 'Finance', 'Moderator'].includes((user as any)?.role || '');
  const menuItems = isAdmin
    ? [...navItems, { to: '/admin', label: 'Admin Portal', icon: Shield }]
    : navItems;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      <AnimatedBackground />

      <UpgradeModal 
        open={upgradeOpen} 
        onClose={() => setUpgradeOpen(false)} 
        onUpgraded={() => window.location.reload()} 
      />

      {/* Desktop Sidebar */}
      <motion.aside 
        className="hidden md:flex flex-col w-64 glass-panel border-r border-border/50 h-screen sticky top-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Brand logo header */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
            <ChevronUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-foreground via-neutral-100 to-neutral-300">ASCEND</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary shadow-inner border border-primary/20'
                    : 'text-muted-foreground hover:bg-white/5 dark:hover:bg-neutral-800/30 hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      className="absolute left-0 w-1 h-5 rounded-r bg-primary" 
                      layoutId="sidebar-active-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Free Credits indicator banner */}
        {!isPremium && (
          <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> FREE CREDITS
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Upgrade to Ascend Pro to unlock unlimited AI resumes and tracking modules.</p>
            <Button size="sm" onClick={() => setUpgradeOpen(true)} className="w-full text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white border-0 py-1.5 h-8 shadow-md hover:shadow-primary/20 transition-all duration-300">
              <Crown className="mr-1.5 h-3.5 w-3.5" /> Upgrade
            </Button>
          </div>
        )}

        {/* User profile dropdown trigger */}
        <div className="p-4 border-t border-border/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 dark:hover:bg-neutral-800/30 transition-all text-left">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</p>
                  <p className="text-xs text-muted-foreground truncate leading-none mt-0.5">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-panel border border-border/50">
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Account Plan: <span className="font-bold text-primary">{user?.plan}</span></div>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem onClick={() => setUpgradeOpen(true)} className="gap-2 cursor-pointer text-sm py-2 hover:bg-white/5 dark:hover:bg-neutral-800/30">
                <Crown className="h-4 w-4 text-primary" /> Upgrade Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer text-sm text-red-500 hover:text-red-600 focus:text-red-500 py-2 hover:bg-red-500/10 focus:bg-red-500/10">
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* Mobile Sidebar & Header container */}
      <div className="flex-1 flex flex-col min-w-0">
        <motion.header 
          className="md:hidden glass-panel border-b border-border/50 sticky top-0 z-40 h-16 px-4 flex items-center justify-between"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <ChevronUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wider">ASCEND</span>
          </div>

          <div className="flex items-center gap-2">
            {!isPremium && (
              <Button size="sm" onClick={() => setUpgradeOpen(true)} className="text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white border-0 h-8">
                Upgrade
              </Button>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/10 dark:hover:bg-neutral-800/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 glass-panel border-r border-border/50">
                <div className="h-16 flex items-center gap-2 px-6 border-b border-border/40">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                    <ChevronUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-extrabold text-sm tracking-wider">ASCEND</span>
                </div>
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20 shadow-inner'
                            : 'text-muted-foreground hover:bg-white/5 dark:hover:bg-neutral-800/30 hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
                <div className="p-4 border-t border-border/40 absolute bottom-0 left-0 right-0 bg-background/50">
                  <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.header>

        {/* Main Dashboard Panel Body Content wrapper */}
        <main className="flex-1 overflow-y-auto max-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
