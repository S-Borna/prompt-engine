'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Premium Landing Page
// Inspired by sortmeout.saidborna.com design language
// ═══════════════════════════════════════════════════════════════════════════

// Demo content — realistic, unstructured → structured transformation
const UNSTRUCTURED_PROMPT = "need to migrate a postgres db to aurora. ~2TB data, mostly transactional, peak is 10k rpm. what's the best approach?";

const STRUCTURED_PROMPT = `Plan a production PostgreSQL to Aurora migration with the following parameters:

System context: 2TB transactional database, peak load 10,000 reads/minute, production environment requiring high availability.

Required deliverables:
- Phased migration timeline with explicit cutover strategy
- Data validation checkpoints at each phase
- Rollback procedures if integrity issues emerge
- Performance benchmarks to confirm parity with current system
- Zero-downtime requirement during business hours (9 AM - 6 PM EST)

Constraints:
- No data loss tolerance
- Must maintain read replica for reporting during migration
- Budget ceiling: $15K for migration tooling and temporary infra
- Completion target: 6 weeks

Output format: Structured plan with phases, owner responsibilities, and go/no-go decision points.`;

const UNSTRUCTURED_OUTPUT = `For migrating PostgreSQL to Aurora, here's a recommended approach:

1. **Assessment Phase**: Analyze your current database schema, identify any PostgreSQL-specific features you're using, and check Aurora compatibility.

2. **Preparation**: Set up Aurora cluster, configure replication, and test connectivity.

3. **Data Migration**: Use AWS DMS (Database Migration Service) to migrate the data. For 2TB, this might take several hours.

4. **Testing**: Run performance tests to ensure 10k RPM can be handled.

5. **Cutover**: Switch your application to point to Aurora, monitor closely.

Consider using a blue-green deployment to minimize downtime. Make sure you have backups before starting.`;

const STRUCTURED_OUTPUT = `## Aurora Migration Plan — 6-Week Timeline

### Phase 1: Assessment & Compatibility (Week 1)
**Owner:** Database team lead
**Deliverables:**
- Schema compatibility report (identify PostGIS, extensions, custom functions)
- Current performance baseline (capture 10k RPM metrics, query patterns, connection pools)
- Cost projection for Aurora provisioned vs. serverless

**Go/No-Go:** Confirm <5% schema incompatibility or remediation plan exists

---

### Phase 2: Parallel Infrastructure (Weeks 2-3)
**Owner:** DevOps + Database team
**Actions:**
- Provision Aurora cluster (db.r6g.2xlarge, 2 replicas for HA)
- Set up DMS replication instance (dms.c5.2xlarge for 2TB throughput)
- Configure Aurora read replica for reporting workload
- Establish VPN + security groups matching current Postgres setup

**Validation:** Replication lag <30 seconds, no connection drops in 72-hour test

---

### Phase 3: Data Sync & Validation (Week 4)
**Owner:** Data engineering
**Actions:**
- Start DMS continuous replication (Postgres → Aurora)
- Run checksum validation on 10% random sample every 6 hours
- Monitor replication lag and disk I/O on both systems
- Parallel write testing: dual-write to Postgres + Aurora for non-critical tables

**Go/No-Go:**
- Zero data discrepancies in validation samples
- Replication lag stable <1 minute under peak load

---

### Phase 4: Performance Benchmarking (Week 5)
**Owner:** Platform team
**Actions:**
- Run load tests simulating 10k RPM + 20% spike
- Compare query execution plans (Postgres EXPLAIN vs. Aurora)
- Optimize Aurora parameter groups (connection pooling, autovacuum, buffer cache)
- Document any queries requiring index adjustments

**Acceptance Criteria:**
- P95 latency ≤ current Postgres baseline
- No connection pool exhaustion at 12k RPM
- Read replica lag <5 seconds under reporting queries

---

### Phase 5: Cutover (Week 6)
**Cutover Window:** Saturday 2 AM - 6 AM EST (off-peak)
**Procedure:**
1. Enable maintenance mode (read-only state)
2. Final DMS sync + validation (checksum entire dataset)
3. Update application connection strings to Aurora endpoint
4. Smoke tests on critical transactions (10-minute burn-in)
5. Disable maintenance mode, monitor error rates for 2 hours
6. If error rate >0.1%: immediate rollback to Postgres

**Rollback Plan:**
- Keep Postgres instance running for 72 hours post-cutover
- One-command DNS switch back to Postgres if needed
- Aurora data archived to S3 for forensics

---

### Budget Breakdown
- DMS replication: $850/week × 4 weeks = $3,400
- Aurora test cluster: $1,200/week × 5 weeks = $6,000
- Temporary Postgres replica: $800/week × 6 weeks = $4,800
- **Total:** $14,200 (under $15K ceiling)

### Risk Mitigation
- **Data loss:** Continuous checksum validation + 72-hour rollback window
- **Performance regression:** Load testing in Phase 4 with acceptance gates
- **Extended downtime:** Blue-green cutover limits exposure to 4-hour window

**Final Go/No-Go:** Week 5 Friday — all phases green + executive signoff`;


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
                  Same model, same context. Structure is the only variable
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
                                  text={UNSTRUCTURED_PROMPT}
                                  speed={50}
                                  onComplete={handleWeakTypingComplete}
                                  isActive={phase === 'typing-weak'}
                                />
                                {phase !== 'typing-weak' && UNSTRUCTURED_PROMPT}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">AI Response</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[180px] border border-white/[0.04] overflow-y-auto max-h-[300px]">
                          <pre className={`text-xs text-white/50 font-mono whitespace-pre-wrap transition-all duration-500 ${weakOutputVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {UNSTRUCTURED_OUTPUT}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Execution-Ready Prompt */}
                  <div className="p-6 bg-gradient-to-br from-violet-500/[0.02] to-transparent">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Structured Prompt</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[60px] max-h-[200px] overflow-y-auto border border-violet-500/20">
                          <pre className="text-xs text-violet-200/80 font-mono whitespace-pre-wrap leading-relaxed">
                            {phase === 'typing-strong' ? (
                              <TypeWriter
                                text={STRUCTURED_PROMPT}
                                speed={15}
                                onComplete={handleStrongTypingComplete}
                                isActive={true}
                              />
                            ) : (['strong-output', 'complete'].includes(phase) ? STRUCTURED_PROMPT : (
                              phase === 'transforming' ? (
                                <span className="flex items-center gap-2 text-violet-400">
                                  <Sparkles className="w-3 h-3 animate-pulse" />
                                  Structuring...
                                </span>
                              ) : ''
                            ))}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">AI Response</div>
                        <div className="bg-black/40 rounded-lg p-3 min-h-[180px] max-h-[300px] overflow-y-auto border border-emerald-500/20">
                          <pre className={`text-xs text-emerald-200/80 font-mono whitespace-pre-wrap transition-all duration-500 ${strongOutputVisible ? 'opacity-100' : 'opacity-0'}`}>
                            {STRUCTURED_OUTPUT}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                  <span className="text-[10px] text-white/30">Same model, structured input</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/30">Specificity: <span className="text-white/40">18%</span> → <span className="text-violet-400">91%</span></span>
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
