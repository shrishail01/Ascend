import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ResumeBuilder = lazy(() => import('@/pages/ResumeBuilder'));
const ResumeEditor = lazy(() => import('@/pages/ResumeEditor'));
const AtsAnalyzer = lazy(() => import('@/pages/AtsAnalyzer'));
const CoverLetterGenerator = lazy(() => import('@/pages/CoverLetterGenerator'));
const InterviewPrep = lazy(() => import('@/pages/InterviewPrep'));
const JobTracker = lazy(() => import('@/pages/JobTracker'));
const CareerRoadmap = lazy(() => import('@/pages/CareerRoadmap'));
const LinkedInReview = lazy(() => import('@/pages/LinkedInReview'));
const ProjectGenerator = lazy(() => import('@/pages/ProjectGenerator'));
const Settings = lazy(() => import('@/pages/Settings'));
const AdminPortal = lazy(() => import('@/pages/AdminPortal'));

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-light">Loading Page...</p>
      </div>
    </div>
  );
}

/**
 * Main Application routing table incorporating route-based code-splitting.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<ResumeBuilder />} />
            <Route path="/resumes/:id" element={<ResumeEditor />} />
            <Route path="/ats-analyzer" element={<AtsAnalyzer />} />
            <Route path="/cover-letters" element={<CoverLetterGenerator />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/job-tracker" element={<JobTracker />} />
            <Route path="/career-roadmap" element={<CareerRoadmap />} />
            <Route path="/linkedin-review" element={<LinkedInReview />} />
            <Route path="/project-generator" element={<ProjectGenerator />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}
