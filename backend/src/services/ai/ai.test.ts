process.env.NODE_ENV = 'test';

import { GoogleGenerativeAI } from '@google/generative-ai';
import Subscription from '../../models/Subscription';
import FeatureUsage from '../../models/FeatureUsage';
import AuditLog from '../../models/AuditLog';
import SystemConfig from '../../models/SystemConfig';
import ATSAIService from './ats.service';
import ResumeAIService from './resume.service';
import CoverLetterAIService from './coverLetter.service';
import InterviewAIService from './interview.service';
import RoadmapAIService from './roadmap.service';
import LinkedinAIService from './linkedin.service';
import ProjectAIService from './project.service';

const originalGetGenerativeModel = GoogleGenerativeAI.prototype.getGenerativeModel;

/**
 * Reusable prototype mock helper for Gemini content generation tests.
 */
function mockGeminiResponse(mockObj: any) {
  const jsonText = JSON.stringify(mockObj);
  GoogleGenerativeAI.prototype.getGenerativeModel = function () {
    return {
      generateContent: async () => ({
        response: {
          text: () => jsonText,
        },
      }),
      generateContentStream: async () => {
        const chunks = [jsonText];
        return {
          stream: (async function* () {
            for (const chunk of chunks) {
              yield { text: () => chunk };
            }
          })(),
        };
      },
    } as any;
  };
}

function restoreGemini() {
  GoogleGenerativeAI.prototype.getGenerativeModel = originalGetGenerativeModel;
}

// Mock database operations
(Subscription as any).findOne = () => Promise.resolve({ plan: 'Pro' });
(FeatureUsage as any).findOne = () => Promise.resolve({ count: 0, limit: 500, save: () => Promise.resolve() });
(FeatureUsage as any).create = () => Promise.resolve({ count: 0, limit: 500, save: () => Promise.resolve() });
(AuditLog as any).create = () => Promise.resolve({});
(SystemConfig as any).findOne = () => Promise.resolve({
  featureFlags: [
    { featureName: 'ats', enabled: true },
    { featureName: 'resume', enabled: true },
    { featureName: 'roadmap', enabled: true },
    { featureName: 'interview', enabled: true },
    { featureName: 'linkedin', enabled: true },
    { featureName: 'projects', enabled: true },
    { featureName: 'coverLetter', enabled: true }
  ],
  aiConfig: {
    modelName: 'gemini-1.5-flash',
    temperature: 0.2
  }
});

async function runTests() {
  console.log('--- STARTING ENTERPRISE AI TEST SUITE ---');

  // Test 1: ATS Analysis
  console.log('Testing ATS analysis...');
  mockGeminiResponse({
    confidence: 95,
    reasoning: 'Matches keywords.',
    overallScore: 88,
    parsedResumeText: 'React expert...',
    categories: [{ name: 'Keywords', score: 90, feedback: 'Strong match.' }],
    keywords: { found: ['react'], missing: ['redis'] },
    recommendations: ['Add Redis experience.'],
  });
  const atsResult = await ATSAIService.analyzeATS('dummy-user', 'React dev...', 'React dev with Redis');
  if (atsResult.overallScore === 88 && atsResult.metadata) {
    console.log('✓ ATS Analysis Passed');
  } else {
    throw new Error('ATS Analysis Failed');
  }

  // Test 2: Resume Optimizer
  console.log('Testing Resume Optimizer...');
  mockGeminiResponse({
    confidence: 90,
    reasoning: 'Enhanced summaries.',
    optimizedSummary: 'Experienced Engineer...',
    improvedBullets: ['Optimized query speeds by 20%'],
  });
  const resumeResult = await ResumeAIService.optimizeResume('dummy-user', 'Developer', 'Built APIs');
  if (resumeResult.improvedBullets[0] === 'Optimized query speeds by 20%') {
    console.log('✓ Resume Optimizer Passed');
  } else {
    throw new Error('Resume Optimizer Failed');
  }

  // Test 3: Cover Letter
  console.log('Testing Cover Letter...');
  mockGeminiResponse({
    confidence: 95,
    reasoning: 'Aligned.',
    content: 'Dear manager, I am excited...',
    tone: 'Professional',
  });
  const clResult = await CoverLetterAIService.generateCoverLetter('dummy-user', 'Resume info', 'Developer role');
  if (clResult.tone === 'Professional') {
    console.log('✓ Cover Letter Passed');
  } else {
    throw new Error('Cover Letter Failed');
  }

  // Test 4: Interview Prep
  console.log('Testing Interview Prep...');
  mockGeminiResponse({
    confidence: 90,
    reasoning: 'Good answers.',
    overallScore: 82,
    feedback: 'Good STAR description.',
    questionFeedback: [
      {
        question: 'Tell me about React',
        answer: 'React is...',
        score: 85,
        strengths: 'Clear',
        improvements: 'None',
      },
    ],
  });
  const interviewResult = await InterviewAIService.scoreResponses('dummy-user', [
    { question: 'Tell me about React', answer: 'React is...' },
  ]);
  if (interviewResult.overallScore === 82) {
    console.log('✓ Interview prep score responses Passed');
  } else {
    throw new Error('Interview Prep Failed');
  }

  // Test 5: Career Roadmap
  console.log('Testing Career Roadmap...');
  mockGeminiResponse({
    confidence: 90,
    reasoning: 'Structured transitions.',
    steps: [
      {
        name: 'Learn NestJS',
        description: 'Advanced Node.',
        duration: '2 weeks',
        skills: ['NestJS'],
        resources: ['Docs'],
      },
    ],
    skills: [{ name: 'NestJS', status: 'gap', description: 'Need framework study.' }],
    certifications: ['AWS DevOps'],
    projects: [
      { name: 'Logger App', description: 'Log trace cacher.', difficulty: 'Medium', techStack: ['NestJS'] },
    ],
  });
  const roadmapResult = await RoadmapAIService.generateRoadmap('dummy-user', 'Backend Lead', 'Finance', 'Developer', [
    'Node',
  ]);
  if (roadmapResult.certifications[0] === 'AWS DevOps') {
    console.log('✓ Career Roadmap Passed');
  } else {
    throw new Error('Career Roadmap Failed');
  }

  // Test 6: LinkedIn Review
  console.log('Testing LinkedIn Review...');
  mockGeminiResponse({
    confidence: 90,
    reasoning: 'Good networking visibility.',
    overallScore: 85,
    sections: [{ name: 'Headline', score: 80, current: 'Developer', improved: 'Lead Developer', tips: 'Add tech names' }],
  });
  const linkedinResult = await LinkedinAIService.reviewProfile('dummy-user', 'Developer');
  if (linkedinResult.overallScore === 85) {
    console.log('✓ LinkedIn Review Passed');
  } else {
    throw new Error('LinkedIn Review Failed');
  }

  // Test 7: Project Generator
  console.log('Testing Project Generator...');
  mockGeminiResponse({
    confidence: 90,
    reasoning: 'Tailored matches.',
    projects: [
      {
        name: 'Redis Cache Wrapper',
        description: 'Decorator cachers.',
        difficulty: 'Hard',
        techStack: ['Redis'],
        timeline: '3 weeks',
        learningGoals: ['Caching'],
        implementationSteps: ['Initialize.'],
      },
    ],
  });
  const projectResult = await ProjectAIService.generateProjects('dummy-user', 'Architect');
  if (projectResult.projects[0].name === 'Redis Cache Wrapper') {
    console.log('✓ Project Generator Passed');
  } else {
    throw new Error('Project Generator Failed');
  }

  restoreGemini();
  console.log('--- ALL ENTERPRISE AI TEST SUITES PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
