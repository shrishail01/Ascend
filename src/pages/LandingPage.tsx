import { useNavigate } from 'react-router-dom';
import { useAuth } from 'zite-auth-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronUp, FileText, BarChart3, Mail, Mic, Briefcase, Map, Linkedin, Lightbulb, Sparkles, ArrowRight, Check, Star } from 'lucide-react';

const features = [
  { icon: FileText, title: 'AI Resume Builder', desc: 'Build professional resumes with multiple templates and AI-powered optimization.' },
  { icon: BarChart3, title: 'ATS Analyzer', desc: 'Score your resume against ATS systems and get actionable improvements.' },
  { icon: Mail, title: 'Cover Letter Generator', desc: 'Generate tailored cover letters for any job in seconds.' },
  { icon: Mic, title: 'Interview Prep', desc: 'Practice with AI-generated questions and get real-time feedback.' },
  { icon: Briefcase, title: 'Job Tracker', desc: 'Track applications from wishlist to offer with a visual board.' },
  { icon: Map, title: 'Career Roadmap', desc: 'Get a personalized career path with skill gap analysis.' },
  { icon: Linkedin, title: 'LinkedIn Review', desc: 'Optimize your LinkedIn profile for maximum visibility.' },
  { icon: Lightbulb, title: 'Project Generator', desc: 'Get portfolio project ideas tailored to your target role.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer at Google', text: 'ASCEND helped me optimize my resume and land interviews at top tech companies. The ATS analyzer was a game-changer.' },
  { name: 'Rahul Verma', role: 'Product Manager at Microsoft', text: 'The interview prep module gave me the confidence I needed. I aced my PM interviews thanks to the STAR method coaching.' },
  { name: 'Ananya Patel', role: 'Data Scientist at Amazon', text: 'The career roadmap feature showed me exactly what skills I needed. I went from analyst to data scientist in 8 months.' },
];

const faqs = [
  { q: 'How does the ATS analyzer work?', a: 'Our AI scans your resume against industry ATS standards, checking formatting, keywords, section structure, readability, and impact. You get a detailed score with specific recommendations to improve.' },
  { q: 'Can I export my resume as PDF?', a: 'Yes! You can export any resume you build as a professionally formatted PDF, ready to submit to employers.' },
  { q: 'Is the AI feedback accurate?', a: 'Our AI is powered by Google Gemini and trained on thousands of successful resumes. While no AI is perfect, our feedback is highly actionable and based on real hiring patterns.' },
  { q: 'How many resumes can I create?', a: 'Free users can create up to 3 resumes. Premium users get unlimited resumes, cover letters, and AI analyses.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted and stored securely. We never share your personal information with third parties.' },
];

export default function LandingPage() {
  const { user, loginWithRedirect } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate('/dashboard');
    else loginWithRedirect({ initialView: 'signup' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <ChevronUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">ASCEND</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => loginWithRedirect()}>Sign in</Button>
                <Button onClick={() => loginWithRedirect({ initialView: 'signup' })}>Get Started Free</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" /> AI-Powered Career Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Land your dream job with <span className="text-primary">AI-powered</span> career tools
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build ATS-optimized resumes, practice interviews, track applications, and accelerate your career — all in one platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={handleCTA} className="h-12 px-8">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to accelerate your career</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive AI-powered tools designed to give you an unfair advantage in your job search.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map(f => (
              <Card key={f.title} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-1">Free</h3>
                <p className="text-sm text-muted-foreground mb-4">Perfect to get started</p>
                <div className="text-4xl font-bold mb-6">₹0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8 text-sm">
                  {['3 Resumes', '5 AI analyses/month', 'Basic templates', 'Job tracker', 'Cover letter generator'].map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={handleCTA}>Get Started</Button>
              </CardContent>
            </Card>
            <Card className="border-primary ring-2 ring-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold">Premium</h3>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Popular</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">For serious job seekers</p>
                <div className="text-4xl font-bold mb-6">₹89<span className="text-base font-normal text-muted-foreground"> one-time</span></div>
                <ul className="space-y-3 mb-8 text-sm">
                  {['Unlimited resumes', 'Unlimited AI analyses', 'All premium templates', 'Interview prep & scoring', 'Career roadmaps', 'LinkedIn optimization', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full" onClick={handleCTA}>Start Free Trial</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Loved by job seekers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map(t => (
              <Card key={t.name} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
                  <p className="text-sm mb-4">{t.text}</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" id="faq">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to accelerate your career?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">Join thousands of professionals who landed their dream jobs with ASCEND.</p>
          <Button size="lg" variant="secondary" onClick={handleCTA} className="h-12 px-8">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <ChevronUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">ASCEND</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ASCEND. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
