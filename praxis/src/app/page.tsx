'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles, Wand2, Brain, Target, ArrowRight,
  Code, Layers, Play, RotateCcw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS - AI Prompt Engineering Platform
// World-class landing page with animated demo
// ═══════════════════════════════════════════════════════════════════════════

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  width: '100%',
} as const;

const features = [
  {
    icon: Brain,
    name: 'Mind Map',
    description: 'Visual brainstorming for structured prompts.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Wand2,
    name: 'Prompt Studio',
    description: 'AI-powered enhancement with real-time suggestions.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Layers,
    name: 'Chain Builder',
    description: 'Link prompts for complex multi-step workflows.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Code,
    name: 'Code Mode',
    description: 'Specialized tools for coding prompts.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    name: 'Precision',
    description: 'Goal-based optimization for tailored prompts.',
    gradient: 'from-red-500 to-rose-500',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED DEMO - The Heart of the Product
// Shows before/after with typing animation
// ═══════════════════════════════════════════════════════════════════════════

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

function TypeWriter({
  text,
  speed = 30,
  onComplete,
  isActive,
  className = ''
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isActive: boolean;
  className?: string;
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
    <span className={className}>
      {displayText}
      {isActive && indexRef.current < text.length && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          backgroundColor: 'currentColor',
          marginLeft: '2px',
          animation: 'blink 1s step-end infinite'
        }} />
      )}
    </span>
  );
}

function AnimatedDemo() {
  const [phase, setPhase] = useState<'idle' | 'typing-weak' | 'weak-output' | 'transforming' | 'typing-strong' | 'strong-output' | 'complete'>('idle');
  const [weakOutputVisible, setWeakOutputVisible] = useState(false);
  const [strongOutputVisible, setStrongOutputVisible] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start demo on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('typing-weak');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const startDemo = useCallback(() => {
    setIsUserPaused(false);
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    setPhase('typing-weak');
    setWeakOutputVisible(false);
    setStrongOutputVisible(false);
  }, []);

  const resetDemo = useCallback(() => {
    setIsUserPaused(true);
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    // Smooth fade-out before reset
    setPhase('idle');
    setWeakOutputVisible(false);
    setStrongOutputVisible(false);
    // Auto-restart after brief pause
    setTimeout(() => {
      setIsUserPaused(false);
      setPhase('typing-weak');
    }, 300);
  }, []);

  const handleWeakTypingComplete = useCallback(() => {
    setTimeout(() => {
      setWeakOutputVisible(true);
      setPhase('weak-output');
      setTimeout(() => {
        setPhase('transforming');
        setTimeout(() => {
          setPhase('typing-strong');
        }, 1500);
      }, 2000);
    }, 500);
  }, []);

  const handleStrongTypingComplete = useCallback(() => {
    setTimeout(() => {
      setStrongOutputVisible(true);
      setPhase('complete');
      setHasPlayedOnce(true);

      // Auto-loop after 9 seconds if not user-paused (extended hold for viewing)
      loopTimeoutRef.current = setTimeout(() => {
        if (!isUserPaused) {
          // Smooth reset - fade out first
          setPhase('idle');
          setTimeout(() => {
            setWeakOutputVisible(false);
            setStrongOutputVisible(false);
            // Restart with same timing as initial playback
            setTimeout(() => {
              setPhase('typing-weak');
            }, 200);
          }, 300);
        }
      }, 9000);
    }, 500);
  }, [isUserPaused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section style={{ position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, marginBottom: '12px', color: 'white' }}>
            See the Difference
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto', fontSize: '16px' }}>
            A vague prompt gets a vague answer. A structured prompt gets a professional result.
          </p>
        </div>

        {/* Demo Container */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: '24px'
        }}>
          {/* BEFORE Panel */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
            opacity: phase === 'transforming' ? 0.5 : 1
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: 'rgba(239,68,68,0.05)'
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Without PRAXIS</span>
            </div>

            {/* Prompt Area */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                Input Prompt
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                padding: '16px',
                minHeight: '48px',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'height 0.15s ease-out',
                overflow: 'hidden'
              }}>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', margin: 0, lineHeight: 1.6 }}>
                  {phase === 'idle' ? (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>Waiting to start...</span>
                  ) : (
                    <TypeWriter
                      text={WEAK_PROMPT}
                      speed={50}
                      onComplete={handleWeakTypingComplete}
                      isActive={phase === 'typing-weak'}
                    />
                  )}
                  {(phase !== 'idle' && phase !== 'typing-weak') && WEAK_PROMPT}
                </p>
              </div>

              {/* Output Area */}
              <div style={{ marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                AI Response
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                padding: '16px',
                minHeight: '180px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}>
                <pre style={{
                  fontSize: '12px',
                  color: weakOutputVisible ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  margin: 0,
                  transition: 'all 0.5s ease',
                  opacity: weakOutputVisible ? 1 : 0,
                  transform: weakOutputVisible ? 'translateY(0)' : 'translateY(10px)'
                }}>
                  {WEAK_OUTPUT}
                </pre>
                {!weakOutputVisible && phase !== 'idle' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '160px', color: 'rgba(255,255,255,0.3)', fontSize: '13px'
                  }}>
                    {phase === 'typing-weak' ? 'Typing prompt...' : 'Generating...'}
                  </div>
                )}
                {phase === 'idle' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '160px', color: 'rgba(255,255,255,0.3)', fontSize: '13px'
                  }}>
                    Click "Start Demo" below
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AFTER Panel */}
          <div style={{
            backgroundColor: phase === 'complete' ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: phase === 'complete' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            transition: 'all 0.5s ease',
            boxShadow: phase === 'complete' ? '0 0 40px rgba(139,92,246,0.15)' : 'none'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: phase === 'complete' ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.05)'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: phase === 'complete' ? '#22c55e' : '#8b5cf6',
                transition: 'all 0.3s'
              }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>With PRAXIS</span>
              {phase === 'complete' && (
                <span style={{
                  marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                  backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80',
                  padding: '3px 10px', borderRadius: '6px'
                }}>
                  ✓ Enhanced
                </span>
              )}
            </div>

            {/* Prompt Area */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                Structured Prompt
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                padding: '16px',
                minHeight: '48px',
                marginBottom: '20px',
                border: '1px solid rgba(139,92,246,0.1)',
                transition: 'height 0.15s ease-out',
                overflow: phase === 'complete' ? 'auto' : 'hidden',
                maxHeight: phase === 'complete' ? '220px' : 'none'
              }}>
                <pre style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {(phase === 'idle' || phase === 'typing-weak' || phase === 'weak-output') ? (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>Waiting for transformation...</span>
                  ) : phase === 'transforming' ? (
                    <span style={{ color: '#a78bfa' }}>
                      <span style={{ display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }}>
                        ✨ Analyzing & enhancing prompt...
                      </span>
                    </span>
                  ) : (
                    <TypeWriter
                      text={STRONG_PROMPT}
                      speed={15}
                      onComplete={handleStrongTypingComplete}
                      isActive={phase === 'typing-strong'}
                    />
                  )}
                  {phase === 'complete' && STRONG_PROMPT}
                </pre>
              </div>

              {/* Output Area */}
              <div style={{ marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)' }}>
                AI Response
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                padding: '16px',
                minHeight: '180px',
                border: strongOutputVisible ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                transition: 'all 0.5s ease'
              }}>
                <pre style={{
                  fontSize: '11px',
                  color: strongOutputVisible ? '#4ade80' : 'rgba(255,255,255,0.2)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  margin: 0,
                  transition: 'all 0.5s ease',
                  opacity: strongOutputVisible ? 1 : 0,
                  transform: strongOutputVisible ? 'translateY(0)' : 'translateY(10px)'
                }}>
                  {STRONG_OUTPUT}
                </pre>
                {!strongOutputVisible && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '160px', color: 'rgba(255,255,255,0.3)', fontSize: '13px'
                  }}>
                    {phase === 'transforming' ? (
                      <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Processing...</span>
                    ) : phase === 'typing-strong' ? (
                      'Building structured prompt...'
                    ) : (
                      'Awaiting enhanced prompt'
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls - Simplified for auto-playing demo */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          {phase === 'complete' || hasPlayedOnce ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={resetDemo}
                type="button"
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <RotateCcw style={{ width: '16px', height: '16px' }} />
                Replay
              </button>
              <Link
                href="/signup"
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Try It Yourself
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          ) : phase === 'idle' ? (
            // Brief loading state before auto-start
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', color: 'rgba(255,255,255,0.4)', fontSize: '14px'
            }}>
              Starting demo...
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px',
              backgroundColor: 'rgba(139,92,246,0.1)',
              borderRadius: '10px',
              color: '#a78bfa',
              fontSize: '14px'
            }}>
              <div style={{
                width: '20px', height: '20px',
                border: '2px solid rgba(139,92,246,0.3)',
                borderTopColor: '#8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Demo in progress...
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </section>
  );
}

// Feature Card Component
function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const Icon = feature.icon;
  return (
    <div style={{
      padding: '24px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.3s ease'
    }}>
      <div
        className={`rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
        style={{ width: '44px', height: '44px', marginBottom: '16px' }}
      >
        <Icon style={{ width: '22px', height: '22px', color: 'white' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
        {feature.name}
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
        {feature.description}
      </p>
    </div>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white' }}>
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          backgroundColor: 'rgb(139,92,246)', opacity: 0.12,
          filter: 'blur(120px)', top: '-200px', left: '-200px'
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          backgroundColor: 'rgb(59,130,246)', opacity: 0.08,
          filter: 'blur(120px)', bottom: '-150px', right: '-150px'
        }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <nav style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
            <div
              className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
              style={{ width: '36px', height: '36px' }}
            >
              <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>PRAXIS</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/login"
              style={{ padding: '8px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '8px 18px', fontSize: '14px', fontWeight: 500,
                background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                borderRadius: '8px', textDecoration: 'none', color: 'white'
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '40px' }}>
          <div style={container}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', backgroundColor: 'rgba(139,92,246,0.15)',
                  borderRadius: '20px', marginBottom: '24px',
                  border: '1px solid rgba(139,92,246,0.2)'
                }}
              >
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  Early Preview — Now in Beta
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700,
                lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em'
              }}>
                <span style={{ color: 'white' }}>Write Better AI Prompts,</span>
                <br />
                <span style={{
                  background: 'linear-gradient(to right, #a78bfa, #818cf8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                  Get Better Results
                </span>
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: 'rgba(255,255,255,0.55)',
                maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6
              }}>
                PRAXIS helps you craft precise, effective prompts for any AI model.
                Visual tools, intelligent suggestions, and structured workflows.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/signup"
                  style={{
                    padding: '14px 28px', fontSize: '16px', fontWeight: 600,
                    background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                    borderRadius: '10px', textDecoration: 'none', color: 'white',
                    display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  Start Free
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </Link>
                <a
                  href="#demo"
                  style={{
                    padding: '14px 28px', fontSize: '16px', fontWeight: 500,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', textDecoration: 'none', color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Demo Section */}
        <div id="demo">
          <AnimatedDemo />
        </div>

        {/* Features Section */}
        <section id="features" style={{ position: 'relative', zIndex: 10, paddingTop: '64px', paddingBottom: '80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={container}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '12px', color: 'white' }}>
                Tools for Every Workflow
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto' }}>
                A focused suite of prompt engineering tools built for clarity and efficiency.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px', maxWidth: '900px', margin: '0 auto'
            }}>
              {features.map((feature) => (
                <FeatureCard key={feature.name} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ position: 'relative', zIndex: 10, paddingTop: '64px', paddingBottom: '80px' }}>
          <div style={{ ...container, maxWidth: '600px' }}>
            <div style={{
              backgroundColor: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '20px', padding: '40px 32px', textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>
                Ready to Write Better Prompts?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                Start using PRAXIS today. No credit card required.
              </p>
              <Link
                href="/signup"
                style={{
                  padding: '12px 24px', fontSize: '15px', fontWeight: 600,
                  background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                  borderRadius: '10px', textDecoration: 'none', color: 'white',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                Get Started Free
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '32px', paddingBottom: '32px'
      }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className="rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
              style={{ width: '24px', height: '24px' }}
            >
              <Sparkles style={{ width: '12px', height: '12px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>PRAXIS</span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            © 2026 PRAXIS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
