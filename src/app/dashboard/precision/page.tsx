'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';
import { StructuredPromptOutput, type StructuredResult } from '@/components/ui/StructuredPromptOutput';
import { ModelCardWithInsight } from '@/components/ui/ModelInsightPopover';

// ═══════════════════════════════════════════════════════════════════════════
// REFINE PROMPT — 3-step wizard with AI-generated questions
//
// Step 1: Enter Prompt + choose target platform
// Step 2: Answer AI-generated clarifying questions
// Step 3: Get refined, structured result
// ═══════════════════════════════════════════════════════════════════════════

const aiModels = [
    { id: 'gpt-5.2', name: 'GPT 5.2', family: 'OpenAI', logo: '/logos/openai.svg', color: '#10b981' },
    { id: 'gpt-5.1', name: 'GPT 5.1', family: 'OpenAI', logo: '/logos/openai.svg', color: '#10b981' },
    { id: 'claude-opus-4.5', name: 'Opus 4.5', family: 'Anthropic', logo: '/logos/anthropic.svg', color: '#f97316' },
    { id: 'claude-sonnet-4.5', name: 'Sonnet 4.5', family: 'Anthropic', logo: '/logos/anthropic.svg', color: '#f97316' },
    { id: 'gemini-3', name: 'Gemini 3', family: 'Google', logo: '/logos/gemini.svg', color: '#3b82f6' },
    { id: 'gemini-2.5', name: 'Gemini 2.5', family: 'Google', logo: '/logos/gemini.svg', color: '#3b82f6' },
    { id: 'grok-3', name: 'Grok 3', family: 'xAI', logo: '/logos/xai.svg', color: '#94a3b8' },
    { id: 'grok-2', name: 'Grok 2', family: 'xAI', logo: '/logos/xai.svg', color: '#94a3b8' },
];

interface WizardQuestion {
    id: number;
    question: string;
    options: { id: string; label: string; description: string }[];
}

const STEPS = [
    { id: 1, label: 'Enter Prompt' },
    { id: 2, label: 'Answer Questions' },
    { id: 3, label: 'Get Result' },
];

export default function RefinePage() {
    const [step, setStep] = useState(1);
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-5.2');
    const [questions, setQuestions] = useState<WizardQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
    const [domain, setDomain] = useState('general');
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<StructuredResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { addPrompt, addToHistory } = usePromptStore();

    useEffect(() => { inputRef.current?.focus(); }, []);

    const platformMap: Record<string, string> = {
        'gpt-5.2': 'chatgpt', 'gpt-5.1': 'chatgpt',
        'claude-opus-4.5': 'claude', 'claude-sonnet-4.5': 'claude',
        'gemini-3': 'gemini', 'gemini-2.5': 'gemini',
        'grok-3': 'grok', 'grok-2': 'grok',
    };

    // Step 1 → 2: Fetch AI questions
    const handleStartRefining = useCallback(async () => {
        if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }

        setIsLoadingQuestions(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/refine?stage=questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    platform: platformMap[selectedModel] || 'chatgpt',
                }),
            });

            if (!response.ok) throw new Error('Failed to generate questions');

            const data = await response.json();
            setQuestions(data.questions || []);
            setDomain(data.domain || 'general');
            setAnswers({});
            setCustomAnswers({});
            setStep(2);
        } catch (err) {
            setError('Failed to generate questions. Please try again.');
            toast.error('Question generation failed');
        } finally {
            setIsLoadingQuestions(false);
        }
    }, [prompt, selectedModel]);

    // Step 2 → 3: Generate refined prompt
    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        setError(null);

        // Build answers map: question text → selected answer
        const formattedAnswers: Record<string, string> = {};
        for (const q of questions) {
            const selectedOption = answers[q.id];
            if (selectedOption === 'other') {
                formattedAnswers[q.question] = customAnswers[q.id] || 'Not specified';
            } else if (selectedOption) {
                const option = q.options.find(o => o.id === selectedOption);
                formattedAnswers[q.question] = option ? `${option.label} - ${option.description}` : selectedOption;
            }
        }

        try {
            const startTime = Date.now();
            const response = await fetch('/api/ai/refine?stage=generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    platform: platformMap[selectedModel] || 'chatgpt',
                    answers: formattedAnswers,
                    domain,
                }),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            const elapsed = Date.now() - startTime;

            setResult({
                sections: data.sections || {
                    expertRole: '',
                    mainObjective: data.enhanced || '',
                    contextBackground: '',
                    outputFormat: '',
                    constraints: '',
                    approachGuidelines: '',
                },
                domain: (data.domain || domain).toUpperCase(),
                improvements: data.improvements || [],
                targetPlatform: platformMap[selectedModel] || 'chatgpt',
                meta: {
                    tokensIn: data.meta?.tokensIn,
                    tokensOut: data.meta?.tokensOut,
                    timeMs: data.meta?.timeMs || elapsed,
                    model: platformMap[selectedModel] || selectedModel,
                    score: data.quality?.score,
                },
            });

            addToHistory({
                tool: 'precision',
                action: 'Prompt refined',
                input: prompt.slice(0, 100),
                output: (data.enhanced || '').slice(0, 100) + '...',
            });

            setStep(3);
        } catch (err) {
            setError('Failed to generate refined prompt. Please try again.');
            toast.error('Generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, selectedModel, questions, answers, customAnswers, domain, addToHistory]);

    const handleSave = useCallback(async () => {
        if (!result) return;
        const flatPrompt = Object.values(result.sections).filter(Boolean).join('\n\n');

        // Save to local store (localStorage cache)
        addPrompt({
            title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
            content: prompt,
            enhancedContent: flatPrompt,
            tags: [selectedModel, 'refined'],
            folder: 'Personal',
            starred: false,
            tool: 'precision',
            metadata: result.meta,
        });

        // Save to Postgres
        try {
            await fetch('/api/prompts/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: prompt.slice(0, 80),
                    originalPrompt: prompt,
                    enhancedPrompt: flatPrompt,
                    tags: [selectedModel, 'refined'],
                    tool: 'precision',
                    sections: result.sections,
                }),
            });
        } catch (e) {
            console.warn('Failed to save to database:', e);
        }

        toast.success('Saved to Library!');
    }, [prompt, result, selectedModel, addPrompt]);

    const handleReset = () => {
        setStep(1);
        setPrompt('');
        setQuestions([]);
        setAnswers({});
        setCustomAnswers({});
        setResult(null);
        setError(null);
    };

    const handleSelectAnswer = (questionId: number, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const answeredCount = Object.keys(answers).length;
    const selectedModelInfo = aiModels.find(m => m.id === selectedModel);

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Refine Prompt</h1>
                <p className="text-white/50 text-sm mt-1">
                    Answer a few questions to create a perfectly tailored prompt for your specific needs.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-0">
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step > s.id ? 'bg-emerald-500 text-white' :
                                step === s.id ? 'bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/50' :
                                    'bg-white/[0.06] text-white/30'
                                }`}>
                                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                            </div>
                            <span className={`text-sm ${step >= s.id ? 'text-white/70' : 'text-white/30'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-16 h-px mx-4 ${step > s.id ? 'bg-emerald-500' : 'bg-white/[0.08]'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* ═══ STEP 1: Enter Prompt ═══ */}
            {step === 1 && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                    {/* Target Platform */}
                    <div className="px-6 pt-6 pb-4">
                        <span className="text-sm font-medium text-white/60 mb-3 block">Target Platform</span>
                        <div className="flex flex-wrap gap-1.5">
                            {aiModels.map((model) => (
                                <ModelCardWithInsight key={model.id} model={model} isSelected={selectedModel === model.id} onSelect={() => setSelectedModel(model.id)} />
                            ))}
                        </div>
                    </div>

                    {/* Prompt Input */}
                    <div className="px-6 pb-2">
                        <span className="text-sm font-medium text-white/60 mb-3 block">Your Prompt</span>
                        <textarea
                            ref={inputRef}
                            value={prompt}
                            onChange={(e) => { setPrompt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.max(120, e.target.scrollHeight) + 'px'; }}
                            placeholder="Enter the prompt you want to refine. We'll ask you a few questions to tailor it to your needs..."
                            className="w-full min-h-[120px] p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/30 text-sm leading-relaxed"
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[11px] text-white/20">{prompt.length}/10 000</span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="px-6 pb-6">
                        <button
                            onClick={handleStartRefining}
                            disabled={!prompt.trim() || isLoadingQuestions}
                            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoadingQuestions ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /><span>Starting...</span></>
                            ) : (
                                <><span>Start Refining</span><ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 2: Answer Questions ═══ */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Original prompt reminder */}
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] px-5 py-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 block mb-1">YOUR PROMPT</span>
                        <p className="text-sm text-white/60">{prompt}</p>
                    </div>

                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-white">Answer a few questions</h2>
                        <p className="text-sm text-white/40 mt-1">Help us understand your needs to create the perfect prompt</p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <div key={q.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-violet-300">{q.id}</span>
                                    </div>
                                    <p className="text-sm font-medium text-white/80">{q.question}</p>
                                </div>
                                <div className="space-y-2 ml-9">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectAnswer(q.id, opt.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${answers[q.id] === opt.id
                                                ? 'border-violet-500/40 bg-violet-500/10 text-white'
                                                : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/[0.12] hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <span className="text-sm">{opt.label}</span>
                                            {opt.description && opt.id !== 'other' && (
                                                <span className="text-xs text-white/30 ml-2">— {opt.description}</span>
                                            )}
                                        </button>
                                    ))}
                                    {/* Custom input for "Other" */}
                                    {answers[q.id] === 'other' && (
                                        <input
                                            type="text"
                                            value={customAnswers[q.id] || ''}
                                            onChange={(e) => setCustomAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                            placeholder="Specify your answer..."
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-violet-500/20 rounded-xl text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/40 text-sm mt-2"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-5 py-2.5 text-white/50 hover:text-white/70 hover:bg-white/[0.04] rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={answeredCount < 3 || isGenerating}
                            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></>
                            ) : (
                                <><span>Generate Prompt</span><ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 3: Result ═══ */}
            {step === 3 && result && (
                <StructuredPromptOutput
                    result={result}
                    onSave={handleSave}
                    onRefineAnother={handleReset}
                    actionLabel="Refine"
                />
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
