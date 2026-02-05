'use client';

import { useState, useCallback } from 'react';
import { Loader2, CheckCircle2, Circle, ArrowRight, BarChart3, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CompiledSpec } from '@/lib/prompt-engine';

// ═══════════════════════════════════════════════════════════════════════════
// 4-STEP PROMPT WIZARD — Educational & Proof-Driven
// ═══════════════════════════════════════════════════════════════════════════

type WizardStep = 1 | 2 | 3 | 4;

interface ABResult {
    outputA: {
        prompt: string;
        output: string;
        metrics: {
            completeness: number;
            specificity: number;
            structureAdherence: number;
        };
        label: string;
    };
    outputB: {
        prompt: string;
        output: string;
        metrics: {
            completeness: number;
            specificity: number;
            structureAdherence: number;
        };
        label: string;
    };
    diff: {
        addedSections: number;
        addedConstraints: number;
        addedContext: number;
        structureImprovement: number;
    };
}

interface PromptWizardProps {
    selectedModel: string;
    selectedLanguage: string;
}

export function PromptWizard({ selectedModel, selectedLanguage }: PromptWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [rawPrompt, setRawPrompt] = useState('');
    const [spec, setSpec] = useState<CompiledSpec | null>(null);
    const [proPrompt, setProPrompt] = useState('');
    const [abResult, setAbResult] = useState<ABResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Raw Prompt Input
    const handleStep1Next = useCallback(() => {
        if (!rawPrompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }
        setCurrentStep(2);
        handleCompile();
    }, [rawPrompt]);

    // Step 2: Compile to Spec
    const handleCompile = useCallback(async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/enhance?stage=compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: rawPrompt,
                    rawPrompt,
                }),
            });

            if (!response.ok) throw new Error('Compilation failed');

            const data = await response.json();
            setSpec(data.spec);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Compilation failed');
            toast.error('Failed to compile prompt');
        } finally {
            setIsProcessing(false);
        }
    }, [rawPrompt]);

    // Step 3: Assemble Pro Prompt
    const handleAssemble = useCallback(async () => {
        if (!spec) {
            toast.error('No spec available');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setCurrentStep(3);

        try {
            const platformMap: Record<string, string> = {
                'gpt-5.2': 'chatgpt', 'gpt-5.1': 'chatgpt',
                'claude-sonnet-4.5': 'claude', 'claude-opus-4.1': 'claude',
                'gemini-3': 'gemini', 'gemini-2.5': 'gemini',
                'grok-3': 'grok', 'grok-2': 'grok',
                'nano-banana-pro': 'general', 'sora': 'general',
            };

            const languageMap: Record<string, string> = {
                'en': 'en',
                'sv': 'sv',
                'sv-en': 'sv-to-en',
            };

            const response = await fetch('/api/ai/enhance?stage=assemble', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    spec,
                    platform: platformMap[selectedModel] || 'general',
                    outputLanguage: languageMap[selectedLanguage] || 'auto',
                }),
            });

            if (!response.ok) throw new Error('Assembly failed');

            const data = await response.json();
            setProPrompt(data.assembledPrompt);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Assembly failed');
            toast.error('Failed to assemble prompt');
        } finally {
            setIsProcessing(false);
        }
    }, [spec, selectedModel, selectedLanguage]);

    // Step 4: Run A/B Test
    const handleABTest = useCallback(async () => {
        if (!rawPrompt || !proPrompt) {
            toast.error('Missing prompts for A/B test');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setCurrentStep(4);

        try {
            const response = await fetch('/api/ai/ab-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawPrompt,
                    proPrompt,
                    model: selectedModel,
                    spec,
                }),
            });

            if (!response.ok) throw new Error('A/B test failed');

            const data = await response.json();
            setAbResult(data.results);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'A/B test failed');
            toast.error('Failed to run A/B test');
        } finally {
            setIsProcessing(false);
        }
    }, [rawPrompt, proPrompt, selectedModel, spec]);

    const handleReset = () => {
        setCurrentStep(1);
        setRawPrompt('');
        setSpec(null);
        setProPrompt('');
        setAbResult(null);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => {
                    const isActive = currentStep === step;
                    const isCompleted = currentStep > step;
                    const labels = ['Raw Input', 'Compile', 'Assemble', 'A/B Test'];

                    return (
                        <div key={step} className="flex items-center flex-1">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${isCompleted
                                            ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50'
                                            : isActive
                                                ? 'bg-violet-500/20 text-violet-400 ring-2 ring-violet-500/50'
                                                : 'bg-white/[0.04] text-white/30'
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                                </div>
                                <div className="hidden sm:block">
                                    <div
                                        className={`text-xs font-medium ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-white/30'
                                            }`}
                                    >
                                        {labels[step - 1]}
                                    </div>
                                </div>
                            </div>
                            {step < 4 && (
                                <div
                                    className={`flex-1 h-[2px] mx-3 ${isCompleted ? 'bg-emerald-500/30' : 'bg-white/[0.06]'
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Raw Prompt Input */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Step 1: Enter Your Prompt</h3>
                        <p className="text-sm text-white/50">
                            Paste your original prompt exactly as you would use it.
                        </p>
                    </div>

                    <textarea
                        value={rawPrompt}
                        onChange={(e) => setRawPrompt(e.target.value)}
                        placeholder="e.g., Write a function to sort an array..."
                        className="w-full min-h-[280px] p-5 bg-white/[0.015] border border-white/[0.06] rounded-xl text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.02] transition-all text-sm leading-relaxed"
                    />

                    <button
                        onClick={handleStep1Next}
                        disabled={!rawPrompt.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
                    >
                        <span>Next: Compile</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Step 2: Compiled Spec */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Step 2: Decision Spec</h3>
                        <p className="text-sm text-white/50">
                            Structural analysis of your prompt. No creative additions.
                        </p>
                    </div>

                    {isProcessing ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        </div>
                    ) : spec ? (
                        <div className="space-y-3">
                            <SpecSection title="Objective" content={spec.objective} />
                            <SpecSection title="Context" content={spec.context} />
                            {spec.constraints.length > 0 && (
                                <SpecSection title="Constraints" items={spec.constraints} />
                            )}
                            {spec.nonNegotiables.length > 0 && (
                                <SpecSection title="Non-Negotiables" items={spec.nonNegotiables} />
                            )}
                            {spec.assumptions.length > 0 && (
                                <SpecSection title="Assumptions Detected" items={spec.assumptions} warning />
                            )}
                            {spec.missingInformation.length > 0 && (
                                <SpecSection title="Missing Information" items={spec.missingInformation} warning />
                            )}
                        </div>
                    ) : null}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium rounded-lg transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAssemble}
                            disabled={!spec || isProcessing}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1"
                        >
                            <span>Next: Assemble Pro Prompt</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Pro Prompt */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Step 3: Pro Prompt</h3>
                        <p className="text-sm text-white/50">
                            Template-based assembly from your spec. No guessing.
                        </p>
                    </div>

                    {isProcessing ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        </div>
                    ) : proPrompt ? (
                        <div className="p-5 bg-white/[0.015] border border-white/[0.06] rounded-xl">
                            <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                                {proPrompt}
                            </pre>
                        </div>
                    ) : null}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium rounded-lg transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleABTest}
                            disabled={!proPrompt || isProcessing}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Run A/B Test</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: A/B Results */}
            {currentStep === 4 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Step 4: A/B Proof</h3>
                        <p className="text-sm text-white/50">
                            Same model, same settings. See the difference.
                        </p>
                    </div>

                    {isProcessing ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        </div>
                    ) : abResult ? (
                        <>
                            {/* Metrics Comparison */}
                            <MetricsComparison
                                metricsA={abResult.outputA.metrics}
                                metricsB={abResult.outputB.metrics}
                            />

                            {/* Output Comparison */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <OutputPanel
                                    label={abResult.outputA.label}
                                    output={abResult.outputA.output}
                                    metrics={abResult.outputA.metrics}
                                    color="red"
                                />
                                <OutputPanel
                                    label={abResult.outputB.label}
                                    output={abResult.outputB.output}
                                    metrics={abResult.outputB.metrics}
                                    color="emerald"
                                />
                            </div>

                            {/* Why This Improved */}
                            <WhyImproved diff={abResult.diff} spec={spec} />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium rounded-lg transition-colors"
                                >
                                    Start Over
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(proPrompt);
                                        toast.success('Pro prompt copied!');
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex-1"
                                >
                                    Copy Pro Prompt
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════

function SpecSection({
    title,
    content,
    items,
    warning
}: {
    title: string;
    content?: string;
    items?: string[];
    warning?: boolean;
}) {
    return (
        <div className={`p-4 rounded-lg ${warning ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${warning ? 'text-amber-400' : 'text-white/50'}`}>
                {title}
            </div>
            {content && (
                <div className={`text-sm ${content === '[UNDECIDED]' ? 'text-white/30 italic' : 'text-white/80'}`}>
                    {content}
                </div>
            )}
            {items && items.length > 0 && (
                <ul className="space-y-1">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-white/40 mt-0.5">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function MetricsComparison({ metricsA, metricsB }: {
    metricsA: { completeness: number; specificity: number; structureAdherence: number };
    metricsB: { completeness: number; specificity: number; structureAdherence: number };
}) {
    const metrics = [
        { key: 'completeness', label: 'Completeness' },
        { key: 'specificity', label: 'Specificity' },
        { key: 'structureAdherence', label: 'Structure' },
    ] as const;

    return (
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                <h4 className="font-semibold text-white">Validation Metrics</h4>
            </div>
            <div className="space-y-4">
                {metrics.map(({ key, label }) => {
                    const valueA = metricsA[key];
                    const valueB = metricsB[key];
                    const improvement = valueB - valueA;

                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white/60">{label}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-red-400">{valueA}%</span>
                                    <ArrowRight className="w-3 h-3 text-white/30" />
                                    <span className="text-xs text-emerald-400">{valueB}%</span>
                                    {improvement > 0 && (
                                        <span className="text-xs text-emerald-400">+{improvement}%</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500/50 rounded-full transition-all"
                                        style={{ width: `${valueA}%` }}
                                    />
                                </div>
                                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${valueB}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function OutputPanel({
    label,
    output,
    metrics,
    color
}: {
    label: string;
    output: string;
    metrics: { completeness: number; specificity: number; structureAdherence: number };
    color: 'red' | 'emerald';
}) {
    const avg = Math.round((metrics.completeness + metrics.specificity + metrics.structureAdherence) / 3);
    const colorClasses = color === 'emerald'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-red-500/30 bg-red-500/5';
    const badgeColor = color === 'emerald' ? 'text-emerald-400 bg-emerald-500/20' : 'text-red-400 bg-red-500/20';

    return (
        <div className={`p-5 border rounded-xl ${colorClasses}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{label}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColor}`}>
                    {avg}% avg
                </span>
            </div>
            <div className="p-4 bg-black/20 rounded-lg max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                    {output}
                </pre>
            </div>
        </div>
    );
}

function WhyImproved({ diff, spec }: { diff: ABResult['diff']; spec: CompiledSpec | null }) {
    const improvements: string[] = [];

    if (diff.addedSections > 0) {
        improvements.push(`Added ${diff.addedSections} structural sections for clarity`);
    }
    if (diff.addedConstraints > 0) {
        improvements.push(`Specified ${diff.addedConstraints} explicit constraints`);
    }
    if (diff.addedContext > 0) {
        improvements.push('Included contextual background');
    }
    if (spec?.nonNegotiables && spec.nonNegotiables.length > 0) {
        improvements.push(`Declared ${spec.nonNegotiables.length} non-negotiable requirements`);
    }
    if (spec?.assumptions && spec.assumptions.length > 0) {
        improvements.push(`Surfaced ${spec.assumptions.length} implicit assumptions`);
    }

    if (improvements.length === 0) {
        improvements.push('Applied template-based structure');
    }

    return (
        <div className="p-5 bg-violet-500/5 border border-violet-500/20 rounded-xl">
            <h4 className="font-semibold text-white mb-3">Why This Improved</h4>
            <ul className="space-y-2">
                {improvements.map((item, idx) => (
                    <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-white/40 italic">
                    All improvements derived from spec analysis. No creative additions.
                </p>
            </div>
        </div>
    );
}
