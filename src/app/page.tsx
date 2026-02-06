'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  BarChart3,
  Layers,
  Target,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Landing Page v2.0
// Enterprise-grade prompt engineering platform
// "Holy shit factor" — makes visitors NEED to try it
// ═══════════════════════════════════════════════════════════════════════════

// ── Live Before/After Demo Data ──
const BEFORE_PROMPT = `Help me plan a healthy weekly meal plan`;

const AFTER_PROMPT = `You are an experienced nutritionist and meal planning expert with 8+ years helping clients achieve their health goals through sustainable dietary changes.

Create a comprehensive 7-day meal plan for a busy professional who wants to eat healthier, lose weight gradually, and save time on meal prep.

The person works full-time (9-5), has moderate cooking skills, prefers simple recipes, and needs meals they can prep in advance. Budget is moderate ($80-100/week). They want to reduce processed foods and increase vegetables.

Provide the meal plan as a structured table with breakfast, lunch, dinner, and snacks for each day. Include a separate grocery list organized by category (produce, proteins, pantry items). Add prep time estimates and 3 make-ahead tips.

DO NOT include exotic ingredients that are hard to find. DO NOT suggest meals requiring more than 45 minutes of active cooking time. Avoid recipes with more than 10 ingredients.

Prioritize variety to prevent boredom, balance macronutrients in each meal, and make sure recipes are actually achievable for someone with limited time. Include portion sizes and estimated calorie ranges.`;

// ── Platform logos for carousel ──
const PLATFORMS = [
  { name: 'ChatGPT', color: '#10b981' },
  { name: 'Claude', color: '#f97316' },
  { name: 'Gemini', color: '#3b82f6' },
  { name: 'Grok', color: '#94a3b8' },
];

// ── Animated counter ──
function AnimatedNumber({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Section reveal on scroll ──
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Before/After Interactive Demo ──
function LiveDemo() {
  const [phase, setPhase] = useState<'before' | 'transforming' | 'after'>('before');
  const [visibleSections, setVisibleSections] = useState(0);

  const startTransform = useCallback(() => {
    setPhase('transforming');
    setTimeout(() => {
      setPhase('after');
      setTimeout(() => setVisibleSections(1), 200);
    }, 1200);
  }, []);

  const reset = useCallback(() => {
    setPhase('before');
    setVisibleSections(0);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl shadow-violet-500/5">
      {/* Window Chrome */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 px-3 rounded-md bg-white/[0.04] flex items-center">
            <span className="text-[11px] text-white/30 font-mono">praxis.saidborna.com</span>
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Demo Body */}
      <div className="p-6 md:p-8 min-h-[420px]">
        {/* Before State */}
        {phase === 'before' && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-3 block">YOUR PROMPT</span>
            </div>
            <div className="w-full max-w-lg">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                <p className="text-white/60 text-sm font-mono leading-relaxed">{BEFORE_PROMPT}</p>
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-white/20">7 words</span>
                  <span className="text-[11px] text-white/20">No structure</span>
                  <span className="text-[11px] text-white/20">No constraints</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-red-400/70">Quality: 12%</span>
                  <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-[12%] bg-red-500/60 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={startTransform}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Transform with PRAXIS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Transforming Animation */}
        {phase === 'transforming' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-indigo-500/40 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60">Analyzing intent · Detecting domain · Structuring output</p>
            </div>
          </div>
        )}

        {/* After State */}
        {phase === 'after' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white/80">Prompt Improved</span>
                <span className="text-[10px] text-white/25 uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-md ml-2">CODE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-emerald-400/80">Quality: 94%</span>
                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500/80 rounded-full" />
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
              <div
                className={`transition-all duration-700 ${visibleSections > 0 ? 'opacity-100' : 'opacity-0'}`}
              >
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {AFTER_PROMPT}
                </p>
              </div>
            </div>

            {visibleSections > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-4">
                <span className="text-[11px] text-white/20">180 words · Structured · Expert-level</span>
                <button
                  onClick={reset}
                  className="text-[11px] text-violet-400/60 hover:text-violet-400 transition-colors"
                >
                  ↺ Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased overflow-x-hidden">
      {/* ── Navigation ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.06]' : ''}`}>
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">PRAXIS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#demo" className="text-sm text-white/50 hover:text-white transition-colors">Demo</a>
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ═══ HERO — The Hook ═══ */}
        <section className="relative pt-32 pb-4 overflow-hidden">
          {/* Ambient effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-500/[0.07] via-transparent to-transparent" />
            <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-radial from-indigo-500/[0.04] via-transparent to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6">
            {/* Eyebrow */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/20 text-violet-300/90 text-sm font-medium">
                <Zap className="w-3.5 h-3.5" />
                Prompt Engineering Platform
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="block">Stop guessing.</span>
              <span className="block bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                Start engineering.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-12 leading-relaxed text-center">
              Transform any prompt into a structured, platform-optimized instruction set — in seconds.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:scale-[1.02] transition-all text-base"
              >
                Try It Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/60 hover:text-white font-medium border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all text-base"
              >
                See It In Action
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social proof */}
            <p className="text-center text-sm text-white/25 mb-20">
              7-day free trial · No credit card required · Cancel anytime
            </p>

            {/* ── Stats Strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-24">
              {[
                { value: 4, suffix: '+', label: 'AI platforms supported' },
                { value: 9, suffix: '', label: 'Domains detected' },
                { value: 2, suffix: '', label: 'Enhancement modes' },
                { value: 30, suffix: 's', label: 'Average turnaround' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white/90 mb-1">
                    <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-white/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ INTERACTIVE DEMO — "Holy Shit" Moment ═══ */}
        <section id="demo" className="py-24 relative">
          <div className="max-w-4xl mx-auto px-6">
            <RevealSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  One prompt. <span className="text-violet-400">Six dimensions.</span>
                </h2>
                <p className="text-base text-white/40 max-w-lg mx-auto text-center">
                  See how a simple prompt becomes a comprehensive, execution-ready instruction set.
                </p>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <LiveDemo />
            </RevealSection>

            {/* Platform Support */}
            <RevealSection delay={400}>
              <div className="mt-12 flex flex-col items-center">
                <p className="text-xs text-white/20 uppercase tracking-widest mb-4">Optimized for</p>
                <div className="flex items-center gap-8">
                  {PLATFORMS.map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-white/40">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ═══ FEATURES — Why PRAXIS ═══ */}
        <section id="features" className="py-24 relative">
          <div className="max-w-5xl mx-auto px-6">
            <RevealSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Prompt engineering, <span className="text-violet-400">systematized</span>
                </h2>
                <p className="text-base text-white/40 max-w-lg mx-auto text-center">
                  A systematic approach to getting better results from any AI model.
                </p>
              </div>
            </RevealSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Layers,
                  title: 'Structured Output',
                  description: 'Your prompts are broken down into clear, purposeful sections that guide AI models to deliver precise results.',
                  color: 'from-violet-500/20 to-violet-500/5',
                },
                {
                  icon: Target,
                  title: 'Platform-Aware',
                  description: 'Optimized for the AI model you actually use. Same intent, better delivery — regardless of platform.',
                  color: 'from-indigo-500/20 to-indigo-500/5',
                },
                {
                  icon: Eye,
                  title: 'Nothing Hidden',
                  description: 'See exactly what changed and why. Every improvement is visible and inspectable.',
                  color: 'from-blue-500/20 to-blue-500/5',
                },
                {
                  icon: BarChart3,
                  title: 'Quality Metrics',
                  description: 'Know how good your prompt is before you use it. Measurable improvement, not guesswork.',
                  color: 'from-cyan-500/20 to-cyan-500/5',
                },
                {
                  icon: Zap,
                  title: 'Multiple Modes',
                  description: 'One-click enhancement for speed, or a guided wizard for when precision matters most.',
                  color: 'from-amber-500/20 to-amber-500/5',
                },
                {
                  icon: Shield,
                  title: 'Domain-Aware',
                  description: 'Automatically adapts to your use case — whether you\'re writing code, building a business plan, or creating content.',
                  color: 'from-emerald-500/20 to-emerald-500/5',
                },
              ].map((feature, i) => (
                <RevealSection key={feature.title} delay={i * 100}>
                  <div className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all h-full">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-5 h-5 text-white/70" />
                    </div>
                    <h3 className="text-base font-semibold text-white/90 mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — 3-step flow ═══ */}
        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-6">
            <RevealSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Three steps to <span className="text-violet-400">perfect prompts</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Paste your prompt',
                  description: 'Enter any prompt — vague, messy, or half-formed. Pick your target AI platform.',
                },
                {
                  step: '02',
                  title: 'PRAXIS structures it',
                  description: 'AI analyzes intent, detects domain, and decomposes your prompt into 6 optimized sections.',
                },
                {
                  step: '03',
                  title: 'Copy & use',
                  description: 'Get a platform-optimized, structured prompt ready to paste into any AI model. See exactly what improved.',
                },
              ].map((item, i) => (
                <RevealSection key={item.step} delay={i * 150}>
                  <div className="relative">
                    <div className="text-6xl font-black text-white/[0.03] mb-4">{item.step}</div>
                    <h3 className="text-lg font-semibold text-white/90 mb-2 -mt-8">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING — Clear tiers ═══ */}
        <section id="pricing" className="py-24 relative">
          <div className="max-w-5xl mx-auto px-6">
            <RevealSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Simple, transparent pricing
                </h2>
                <p className="text-base text-white/40 text-center">
                  Start free. Upgrade when you need more.
                </p>
              </div>
            </RevealSection>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Free Trial */}
              <RevealSection delay={0}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white/90 mb-1">Trial</h3>
                    <p className="text-sm text-white/40">Try it risk-free</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white/90">$0</span>
                    <span className="text-sm text-white/30 ml-2">/ 7 days</span>
                  </div>
                  <div className="space-y-3 mb-8 flex-1">
                    {[
                      'Full prompt structuring',
                      'All AI platforms supported',
                      'Both enhancement modes',
                      '100 prompts included',
                      'No credit card required',
                    ].map((f) => (
                      <p key={f} className="text-sm text-white/50">{f}</p>
                    ))}
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3 text-center text-sm font-medium border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white rounded-xl transition-all block"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </RevealSection>

              {/* Standard */}
              <RevealSection delay={100}>
                <div className="rounded-2xl border-2 border-violet-500/30 bg-violet-500/[0.03] p-8 h-full flex flex-col relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-[11px] font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white/90 mb-1">Standard</h3>
                    <p className="text-sm text-white/40">For professionals</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$9</span>
                    <span className="text-lg text-white/50">.99</span>
                    <span className="text-sm text-white/30 ml-2">/ month</span>
                  </div>
                  <div className="space-y-3 mb-8 flex-1">
                    {[
                      'Everything in Trial',
                      'Unlimited prompts',
                      'Save & organize your prompts',
                      'Priority processing',
                      'Full history & export',
                    ].map((f) => (
                      <p key={f} className="text-sm text-white/60">{f}</p>
                    ))}
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3 text-center text-sm font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all block"
                  >
                    Get Started
                  </Link>
                </div>
              </RevealSection>

              {/* Premium */}
              <RevealSection delay={200}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white/90 mb-1 flex items-center gap-2">
                      Premium
                      <Star className="w-4 h-4 text-amber-400" />
                    </h3>
                    <p className="text-sm text-white/40">Maximum power</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white/90">$14</span>
                    <span className="text-lg text-white/50">.99</span>
                    <span className="text-sm text-white/30 ml-2">/ month</span>
                  </div>
                  <div className="space-y-3 mb-8 flex-1">
                    {[
                      'Everything in Standard',
                      'Advanced prompt depth',
                      'Prompt comparison tools',
                      'Team collaboration',
                      'Early access to new features',
                    ].map((f) => (
                      <p key={f} className="text-sm text-white/50">{f}</p>
                    ))}
                  </div>
                  <Link
                    href="/signup"
                    className="w-full py-3 text-center text-sm font-medium border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white rounded-xl transition-all block"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-32 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-violet-500/[0.06] via-transparent to-transparent" />
          </div>

          <RevealSection>
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Your prompts deserve<br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">better engineering</span>
              </h2>
              <p className="text-base text-white/40 mb-10 max-w-md mx-auto text-center">
                Stop feeding AI models vague instructions and hoping for the best.
                Start with structure. Start with PRAXIS.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/35 hover:scale-[1.02] transition-all text-lg"
              >
                Get Started — Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </RevealSection>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-white/80">PRAXIS</span>
            </div>

            <nav className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-white/30 hover:text-white/50 transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-sm text-white/30 hover:text-white/50 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="text-sm text-white/30 hover:text-white/50 transition-colors">
                Cookies
              </Link>
            </nav>

            <a
              href="mailto:said@saidborna.com"
              className="text-sm text-white/30 hover:text-white/50 transition-colors"
            >
              said@saidborna.com
            </a>
          </div>

          <div className="border-t border-white/[0.04] pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/20">
                © 2026 Said Borna · All rights reserved
              </p>
              <p className="text-xs text-white/25">
                Created and designed by{' '}
                <a
                  href="https://saidborna.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/60 transition-colors font-medium"
                >
                  Said Borna
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
