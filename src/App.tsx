import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeEditor from './pages/ResumeEditor';
import AtsAnalyzer from './pages/AtsAnalyzer';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import InterviewPrep from './pages/InterviewPrep';
import JobTracker from './pages/JobTracker';
import CareerRoadmap from './pages/CareerRoadmap';
import LinkedInReview from './pages/LinkedInReview';
import ProjectGenerator from './pages/ProjectGenerator';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
