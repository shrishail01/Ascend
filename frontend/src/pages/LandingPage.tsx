import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronUp, FileText, BarChart3, Mail, Mic, Briefcase, Map, Linkedin, Lightbulb, Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import AnimatedBackground from '@/components/AnimatedBackground';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <AnimatedBackground />

      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 glass-panel border-b border-border"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-foreground via-neutral-200 to-neutral-400">ASCEND</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/dashboard')} className="glow-hover bg-gradient-to-r from-primary to-secondary text-white border-0">
                Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => loginWithRedirect()} className="hover:bg-white/10 dark:hover:bg-neutral-800/50">Sign in</Button>
                <Button onClick={() => loginWithRedirect({ initialView: 'signup' })} className="glow-hover bg-gradient-to-r from-primary to-secondary text-white border-0">Get Started Free</Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-24 md:py-36 relative flex items-center justify-center">
        <motion.div 
          className="container mx-auto px-4 text-center max-w-4xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/10 dark:border-white/5 text-primary text-sm font-semibold mb-2 shadow-inner"
            variants={itemVariants}
          >
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" /> AI-Powered Career Platform
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground"
            variants={itemVariants}
          >
            Land your dream job with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">AI-powered</span> career tools
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed"
            variants={itemVariants}
          >
            Build ATS-optimized resumes, practice interviews, track applications, and accelerate your career — all in one platform.
          </motion.p>
          <motion.div 
            className="flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Button 
              size="lg" 
              onClick={handleCTA} 
              className="h-14 px-10 text-base font-semibold glow-hover bg-gradient-to-r from-primary to-secondary hover:brightness-110 border-0 text-white rounded-full transition-all duration-300 transform active:scale-95"
            >
              Start Free <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
            </Button>
          </motion.div>
          <motion.p 
            className="text-xs text-muted-foreground"
            variants={itemVariants}
          >
            No credit card required • Get access instantly
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-muted/30 dark:bg-neutral-900/10 border-y border-border/50" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Everything you need to accelerate your career</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">Comprehensive AI-powered tools designed to give you an unfair advantage in your job search.</p>
          </div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={itemVariants}>
                <Card className="glass-card hover:-translate-y-2 glow-hover duration-300 h-full">
                  <CardContent className="p-6 flex flex-col items-start space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shadow-inner">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Loved by job seekers everywhere</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">See how ASCEND is helping candidates land their dream roles.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <Card className="glass-card glow-hover h-full">
                  <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                    <p className="text-muted-foreground italic text-sm leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                        {t.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{t.name}</h4>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 relative bg-muted/20 dark:bg-neutral-900/5 border-t border-border/50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold">Free</h3>
                    <p className="text-sm text-muted-foreground">Perfect to get started</p>
                  </div>
                  <div className="text-5xl font-extrabold">
                    ₹0<span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-4 border-t border-border/50 pt-6 text-sm">
                    {['3 Resumes', '5 AI analyses/month', 'Basic templates', 'Job tracker', 'Cover letter generator'].map(f => (
                      <li key={f} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-neutral-800/50" onClick={handleCTA}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative glass-card border-primary/50 dark:border-primary/30 ring-2 ring-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/25">
                  Popular
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Premium</h3>
                    <p className="text-sm text-muted-foreground">For serious job seekers</p>
                  </div>
                  <div className="text-5xl font-extrabold flex items-baseline">
                    ₹<CountUp end={89} duration={2} />
                    <span className="text-base font-normal text-muted-foreground ml-1"> one-time</span>
                  </div>
                  <ul className="space-y-4 border-t border-border/50 pt-6 text-sm">
                    {['Unlimited resumes', 'Unlimited AI analyses', 'All premium templates', 'Interview prep & scoring', 'Career roadmaps', 'LinkedIn optimization', 'Priority support'].map(f => (
                      <li key={f} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white border-0 hover:brightness-110 glow-hover" onClick={handleCTA}>
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative max-w-3xl mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Got questions? We've got answers.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/50 rounded-xl px-4 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md">
              <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline text-base">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 relative bg-muted/10 dark:bg-neutral-950/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
              <ChevronUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wider">ASCEND</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ASCEND. All rights reserved. Created for premium job readiness.</p>
        </div>
      </footer>
    </div>
  );
}
