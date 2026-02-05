'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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

// Capabilities data - reframed for enterprise positioning
const capabilities = [
  {
    title: 'Structural Enforcement',
    description: 'Every prompt is decomposed into role, task, constraints, and output format',
    impact: 'Eliminates ambiguity before it reaches the model',
  },
  {
    title: 'Model-Specific Adaptation',
    description: 'Execution parameters are tuned per model family',
    impact: 'Same intent, optimal delivery for GPT, Claude, Gemini, or Grok',
  },
  {
    title: 'Inspectable Transformations',
    description: 'Every enhancement is visible and reversible',
    impact: 'Full audit trail for compliance and debugging',
  },
  {
    title: 'Quality Metrics',
    description: 'Prompts are scored on specificity, structure, and completeness',
    impact: 'Quantified improvement before execution',
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
              className="text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Subtle ambient glow only - no grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-violet-500/[0.06] via-transparent to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-medium">
                Prompt Engineering System
              </span>
            </div>

            {/* Headline - Enterprise positioning */}
            <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] mb-6">
              <span className="block text-center">Precision prompts</span>
              <span className="block text-center bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Predictable results
              </span>
            </h1>

            {/* Subtitle - TRUE center alignment */}
            <p className="text-center text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
              PRAXIS formalizes your intent into execution-ready prompts<br />
              Every output is structured, inspectable, and reproducible
            </p>

            {/* CTA Button - Visible with gradient background */}
            <div className="mb-20">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
              >
                Start Building
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Demo Section with Framing */}
            <div id="demo" className="max-w-4xl mx-auto">
              {/* Demo Context */}
              <div className="flex justify-center mb-6">
                <p className="text-sm text-white/40 max-w-lg text-center">
                  PRAXIS does not rewrite your intent, it formalizes it into a structure that models can execute precisely
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0f] overflow-hidden shadow-2xl shadow-black/50">
                {/* Window Chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                  <span className="text-xs text-white/30 font-medium">Prompt Comparison</span>
                  <div className="w-16" />
                </div>

                {/* Demo Content */}
                <div className="grid md:grid-cols-2 divide-x divide-white/[0.06]">
                  {/* Unstructured Prompt */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Unstructured Prompt</span>
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

                  {/* Execution-Ready Prompt */}
                  <div className="p-6 bg-gradient-to-br from-violet-500/[0.02] to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Execution-Ready Prompt</span>
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
                  <span className="text-[10px] text-white/30">Continuous comparison</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/30">Structure score: <span className="text-white/40">12%</span> → <span className="text-violet-400">94%</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="features" className="py-24 relative">
          <div className="max-w-5xl mx-auto px-6">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white/90 text-center">
                How it works
              </h2>
              <p className="text-base text-white/40 max-w-lg text-center">
                Structure enforced before generation, every improvement visible and accountable
              </p>
            </div>

            {/* Capabilities Grid - 2x2 */}
            <div className="grid md:grid-cols-2 gap-8">
              {capabilities.map((capability, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.015]"
                >
                  <h3 className="text-base font-medium mb-2 text-white/90">{capability.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-2">{capability.description}</p>
                  <p className="text-sm text-white/30">{capability.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section - Principles, not claims */}
        <section className="py-16 relative">
          <div className="max-w-3xl mx-auto px-6">
            <div className="border-t border-b border-white/[0.06] py-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/50">Structure enforced before generation</p>
                </div>
                <div>
                  <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/50">Every transformation is inspectable</p>
                </div>
                <div>
                  <CheckCircle2 className="w-5 h-5 text-white/30 mx-auto mb-3" />
                  <p className="text-sm text-white/50">Nothing is hidden from the user</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Calm, confident */}
        <section id="pricing" className="py-24 relative">
          <div className="max-w-2xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-white/90 text-center">
              Start building with PRAXIS
            </h2>
            <p className="text-base text-white/40 max-w-md mb-8 text-center">
              Free to start, no credit card required
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold tracking-tight text-white/80">PRAXIS</span>
            </div>

            {/* Legal Links */}
            <nav className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cookies" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                Cookie Policy
              </Link>
            </nav>

            {/* Contact */}
            <a
              href="mailto:said@saidborna.com"
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              said@saidborna.com
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.04] pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/25">
                © 2026 Said Borna · All rights reserved
              </p>
              <p className="text-xs text-white/30">
                Built and designed by{' '}
                <a
                  href="https://saidborna.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/60 transition-colors"
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
