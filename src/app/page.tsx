'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Target, Layers, Cpu, BarChart3, Shield } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Premium Landing Page
// Inspired by sortmeout.saidborna.com design language
// ═══════════════════════════════════════════════════════════════════════════

// Demo content (logic preserved exactly)
const WEAK_PROMPT = "write an email to my boss about being late tomorrow";
const STRONG_PROMPT = `You are a professional communication expert.

**Context:**
Employee needs to inform their manager about arriving late tomorrow due to a medical appointment.

**Task:**
Write a brief, professional email that:
- Notifies about the delay (arriving 2 hours late)
- Mentions rescheduled medical appointment
- Confirms important meetings are unaffected
- Offers to make up time

**Tone:** Respectful, responsible, concise`;

const WEAK_OUTPUT = `Hi Boss,

I'm going to be late tomorrow.
I have an appointment.

Sorry about that.

Thanks`;

const STRONG_OUTPUT = `Subject: Late Arrival Tomorrow - 10:30 AM

Hi Sarah,

I wanted to give you advance notice that I'll be arriving at 10:30 AM tomorrow due to a rescheduled medical appointment that couldn't be moved.

I've reviewed my calendar and confirmed no client meetings are affected. I'll complete my morning tasks remotely before arriving, and I'm happy to stay later if needed.

Please let me know if you need anything adjusted.

Best regards,
Michael`;

// TypeWriter Component (logic preserved exactly)
function TypeWriter({
  text,
  speed = 30,
  onComplete,
  isActive,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isActive: boolean;
}) {
  const [displayText, setDisplayText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayText('');
      indexRef.current = 0;
      return;
    }

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete, isActive]);

  return (
    <span>
      {displayText}
      {isActive && indexRef.current < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-violet-400 ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

// Features data
const features = [
  {
    icon: Zap,
    title: 'Instant Enhancement',
    description: 'Transform vague prompts into detailed, effective instructions in seconds.',
    color: '#8B5CF6',
  },
  {
    icon: Target,
    title: 'AI-Optimized',
    description: 'Tailored outputs for GPT-4, Claude, Gemini, and other leading models.',
    color: '#EC4899',
  },
  {
    icon: Layers,
    title: 'Context-Aware',
    description: 'Understands intent and adds structure, constraints, and formatting.',
    color: '#6366F1',
  },
  {
    icon: Cpu,
    title: 'Multi-Model Support',
    description: 'Optimize for any AI model with platform-specific enhancements.',
    color: '#10B981',
  },
  {
    icon: BarChart3,
    title: 'Quality Scoring',
    description: 'Real-time analysis showing exactly how your prompt improves.',
    color: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Prompt Library',
    description: 'Save, organize, and reuse your best prompts across projects.',
    color: '#3B82F6',
  },
];

export default function LandingPage() {
  // Demo state (logic preserved exactly)
  type Phase = 'idle' | 'typing-weak' | 'weak-output' | 'transforming' | 'typing-strong' | 'strong-output' | 'complete';
  const [phase, setPhase] = useState<Phase>('idle');
  const [weakOutputVisible, setWeakOutputVisible] = useState(false);
  const [strongOutputVisible, setStrongOutputVisible] = useState(false);

  const handleWeakTypingComplete = useCallback(() => {
    setTimeout(() => {
      setPhase('weak-output');
      setWeakOutputVisible(true);
    }, 300);
  }, []);

  const handleStrongTypingComplete = useCallback(() => {
    setTimeout(() => {
      setPhase('strong-output');
      setStrongOutputVisible(true);
      setTimeout(() => setPhase('complete'), 2000);
    }, 300);
  }, []);

  useEffect(() => {
    if (phase === 'weak-output') {
      const timer = setTimeout(() => setPhase('transforming'), 2500);
      return () => clearTimeout(timer);
    }
    if (phase === 'transforming') {
      const timer = setTimeout(() => setPhase('typing-strong'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Auto-start and loop demo
  useEffect(() => {
    if (phase === 'idle') {
      const startTimer = setTimeout(() => setPhase('typing-weak'), 1000);
      return () => clearTimeout(startTimer);
    }
    if (phase === 'complete') {
      const restartTimer = setTimeout(() => {
        setWeakOutputVisible(false);
        setStrongOutputVisible(false);
        setPhase('idle');
      }, 5000);
      return () => clearTimeout(restartTimer);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">PRAXIS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-sm text-white/60 hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-500/20 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Prompt Engineering
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
              Write Prompts That<br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Actually Work
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-center text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed">
              PRAXIS transforms your basic prompts into detailed, structured instructions
              that get better results from any AI model.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-16">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
              >
                Start Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Demo Window */}
            <div id="demo" className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl shadow-black/50">
                {/* Window Chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-white/30 font-medium">PRAXIS — Live Demo</span>
                  <div className="w-16" />
                </div>

                {/* Demo Content */}
                <div className="grid md:grid-cols-2 divide-x divide-white/[0.06]">
                  {/* Before */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Before</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Your Prompt</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[60px] border border-white/[0.04]">
                          <p className="text-sm text-white/60 font-mono">
                            {phase === 'idle' ? (
                              <span className="text-white/20">Starting...</span>
                            ) : (
                              <>
                                <TypeWriter
                                  text={WEAK_PROMPT}
                                  speed={50}
                                  onComplete={handleWeakTypingComplete}
                                  isActive={phase === 'typing-weak'}
                                />
                                {phase !== 'typing-weak' && WEAK_PROMPT}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">AI Response</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[180px] border border-white/[0.04]">
                          <pre className={`text-xs text-white/50 font-mono whitespace-pre-wrap transition-all duration-500 ${weakOutputVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {WEAK_OUTPUT}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-6 bg-gradient-to-br from-violet-500/[0.03] to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">After PRAXIS</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Enhanced Prompt</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[60px] border border-violet-500/20">
                          <pre className="text-xs text-violet-200/80 font-mono whitespace-pre-wrap leading-relaxed">
                            {phase === 'typing-strong' ? (
                              <TypeWriter
                                text={STRONG_PROMPT}
                                speed={15}
                                onComplete={handleStrongTypingComplete}
                                isActive={true}
                              />
                            ) : (['strong-output', 'complete'].includes(phase) ? STRONG_PROMPT : (
                              phase === 'transforming' ? (
                                <span className="flex items-center gap-2 text-violet-400">
                                  <Sparkles className="w-3 h-3 animate-pulse" />
                                  Enhancing...
                                </span>
                              ) : ''
                            ))}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">AI Response</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[180px] border border-emerald-500/20">
                          <pre className={`text-xs text-emerald-200/80 font-mono whitespace-pre-wrap transition-all duration-500 ${strongOutputVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {STRONG_OUTPUT}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                  <span className="text-[10px] text-white/30">Demo auto-loops every 15s</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/30">Quality: <span className="text-red-400">32%</span> → <span className="text-emerald-400">94%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="max-w-6xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs font-medium uppercase tracking-wider mb-6">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Everything you need to<br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  master AI prompts
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Powerful features wrapped in a simple, intuitive interface. Write better prompts, get better results.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-24 relative">
          <div className="max-w-4xl mx-auto px-6">
            <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 p-12 text-center overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-xs font-medium uppercase tracking-wider mb-6">
                  Get Started
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Ready to write<br />
                  <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    better prompts?
                  </span>
                </h2>
                <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
                  Join thousands of professionals who use PRAXIS to get better results from AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
                  >
                    Start Free — No Credit Card
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-white/60">PRAXIS</span>
            </div>

            <p className="text-sm text-white/30">
              © 2026 PRAXIS. All rights reserved.
            </p>

            <p className="text-sm text-white/40">
              Built and Designed by <span className="text-white/60">Said Borna</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
