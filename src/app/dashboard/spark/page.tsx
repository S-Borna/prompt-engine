'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, Globe, Languages, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';
import { EnhancedPromptOutput, EnhancedPromptResult } from '@/components/ui/EnhancedPromptOutput';
import { PromptWizard } from '@/components/ui/PromptWizard';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════════════════════════
// SPARK — Flagship Prompt Enhancement Experience
// Premium, focused interface for the core product feature
// ═══════════════════════════════════════════════════════════════════════════

// AI Model definitions - 10 models
const aiModels = [
    { id: 'gpt-5.2', name: 'GPT 5.2', family: 'OpenAI', logo: '/logos/openai.svg', color: '#10b981' },
    { id: 'gpt-5.1', name: 'GPT 5.1', family: 'OpenAI', logo: '/logos/openai.svg', color: '#10b981' },
    { id: 'claude-sonnet-4.5', name: 'Sonnet 4.5', family: 'Anthropic', logo: '/logos/anthropic.svg', color: '#f97316' },
    { id: 'claude-opus-4.1', name: 'Opus 4.1', family: 'Anthropic', logo: '/logos/anthropic.svg', color: '#f97316' },
    { id: 'gemini-3', name: 'Gemini 3', family: 'Google', logo: '/logos/gemini.svg', color: '#3b82f6' },
    { id: 'gemini-2.5', name: 'Gemini 2.5', family: 'Google', logo: '/logos/gemini.svg', color: '#3b82f6' },
    { id: 'grok-3', name: 'Grok 3', family: 'xAI', logo: '/logos/xai.svg', color: '#94a3b8' },
    { id: 'grok-2', name: 'Grok 2', family: 'xAI', logo: '/logos/xai.svg', color: '#94a3b8' },
    { id: 'nano-banana-pro', name: 'Banana Pro', family: 'Nano', logo: '/logos/banana.svg', color: '#eab308' },
    { id: 'sora', name: 'Sora', family: 'OpenAI', logo: '/logos/sora.svg', color: '#ec4899' },
];

// Language options
const languageOptions = [
    { id: 'en', name: 'English', flag: '🇬🇧' },
    { id: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { id: 'sv-en', name: 'Sve → Eng', flag: '🇸🇪→🇬🇧' },
];

const examplePrompts = [
    "Write a function to sort an array",
    "Explain machine learning simply",
    "Create a marketing email",
];

export default function SparkPage() {
    const [input, setInput] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [rawOutput, setRawOutput] = useState('');
    const [enhancedOutput, setEnhancedOutput] = useState('');
    const [result, setResult] = useState<EnhancedPromptResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRunningRaw, setIsRunningRaw] = useState(false);
    const [isRunningEnhanced, setIsRunningEnhanced] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-5.2');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [error, setError] = useState<string | null>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { addPrompt, addToHistory } = usePromptStore();

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Check for replay input from history
    useEffect(() => {
        const replayInput = sessionStorage.getItem('replay-input');
        if (replayInput) {
            setInput(replayInput);
            sessionStorage.removeItem('replay-input');
            toast.success('Loaded from history');
        }
    }, []);

    const handleSpark = useCallback(async () => {
        if (!input.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setShouldAnimate(true);
        setRawOutput('');
        setEnhancedOutput('');

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

        try {
            // Step 1: Enhance the prompt
            const response = await fetch('/api/ai/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    rawPrompt: input,
                    mode: 'enhance',
                    platform: platformMap[selectedModel] || 'general',
                    outputLanguage: languageMap[selectedLanguage] || 'auto',
                }),
            });

            if (!response.ok) throw new Error('Enhancement failed');

            const data = await response.json();
            const enhanced = data.enhanced || data.result || '';

            const promptResult: EnhancedPromptResult = {
                originalPrompt: input,
                enhancedPrompt: enhanced,
                explanation: data.changes || data.insights || getDefaultExplanation(),
                meta: {
                    score: data.scores?.after || 85,
                    model: selectedModel,
                    mode: 'enhance',
                },
            };

            if (!promptResult.enhancedPrompt) throw new Error('No enhanced prompt returned');

            setResult(promptResult);
            setEnhancedPrompt(enhanced);
            addToHistory({
                tool: 'spark',
                action: 'Spark enhancement',
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: enhanced.slice(0, 100) + '...',
            });

            // Step 2: Run A/B test to get both outputs
            setIsRunningRaw(true);
            setIsRunningEnhanced(true);

            const abResponse = await fetch('/api/ai/ab-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawPrompt: input,
                    proPrompt: enhanced,
                    model: selectedModel,
                    spec: data.spec,
                }),
            });

            if (abResponse.ok) {
                const abData = await abResponse.json();
                setRawOutput(abData.results?.outputA?.output || '');
                setEnhancedOutput(abData.results?.outputB?.output || '');
            }

            setIsRunningRaw(false);
            setIsRunningEnhanced(false);

        } catch {
            const enhanced = generateLocalEnhancement(input);
            const promptResult: EnhancedPromptResult = {
                originalPrompt: input,
                enhancedPrompt: enhanced,
                explanation: getDefaultExplanation(),
                meta: { score: 78, model: selectedModel, mode: 'enhance' },
            };
            setResult(promptResult);
            addToHistory({
                tool: 'spark',
                action: 'Spark enhancement',
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: enhanced.slice(0, 100) + '...',
            });
        } finally {
            setIsProcessing(false);
        }
    }, [input, selectedModel, selectedLanguage, addToHistory]);

    const handleSave = useCallback(() => {
        if (!result) return;
        addPrompt({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            content: result.originalPrompt,
            enhancedContent: result.enhancedPrompt,
            tags: [selectedModel],
            folder: 'Personal',
            starred: false,
            tool: 'spark',
            metadata: result.meta,
        });
        toast.success('Saved to Library!');
    }, [input, result, selectedModel, addPrompt]);

    const handleClear = () => {
        setInput('');
        setResult(null);
        setEnhancedPrompt('');
        setRawOutput('');
        setEnhancedOutput('');
        setError(null);
        setShouldAnimate(false);
    };

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim() && !isProcessing) {
                handleSpark();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [input, isProcessing, handleSpark]);

    const selectedModelInfo = aiModels.find(m => m.id === selectedModel);

    return (
        <div className="flex flex-col gap-6">
            {/* ═══════════════════════════════════════════════════════════════
                AI MODEL SELECTOR — All on one row
            ═══════════════════════════════════════════════════════════════ */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                        Target Model
                    </span>
                    {selectedModelInfo && (
                        <span className="text-[11px] text-white/50 px-2 py-0.5 bg-white/[0.04] rounded-md">
                            {selectedModelInfo.family} · {selectedModelInfo.name}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {aiModels.map((model) => {
                        const isSelected = selectedModel === model.id;
                        return (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                title={`${model.name} — ${model.family}`}
                                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${isSelected
                                    ? 'bg-white/[0.08] ring-1 ring-white/20'
                                    : 'bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                                style={isSelected ? {
                                    boxShadow: `0 0 16px -4px ${model.color}40`
                                } : {}}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
                                    }`}
                                    style={{ backgroundColor: `${model.color}15` }}
                                >
                                    <Image
                                        src={model.logo}
                                        alt={model.family}
                                        width={12}
                                        height={12}
                                        className="object-contain"
                                    />
                                </div>
                                <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                                    }`}>
                                    {model.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                LANGUAGE TIP + SELECTOR
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-violet-500/[0.06] to-indigo-500/[0.06] border border-violet-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Languages className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-sm text-white/60">
                        <span className="text-white/80 font-medium">Pro tip:</span> AI models perform best with English prompts — we can translate for you
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
                    {languageOptions.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setSelectedLanguage(lang.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedLanguage === lang.id
                                ? 'bg-white/[0.1] text-white'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span className="hidden sm:inline">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                4-PANEL COMPARISON GRID
            ═══════════════════════════════════════════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* INPUT PANEL */}
                <div className="flex flex-col">
                    <div className="flex flex-col flex-1">
                        {/* Textarea Container */}
                        <div className="relative flex flex-col">
                            <div className="absolute top-3 right-3 z-10">
                                {input && (
                                    <button
                                        onClick={handleClear}
                                        className="text-[11px] text-white/25 hover:text-white/50 transition-colors px-2 py-1 bg-white/[0.03] rounded hover:bg-white/[0.06]"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    // Auto-expand
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.max(280, e.target.scrollHeight) + 'px';
                                }}
                                placeholder="Type or paste your prompt here..."
                                className="w-full min-h-[280px] p-5 pr-16 bg-white/[0.015] border border-white/[0.06] rounded-t-xl text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.02] transition-all text-sm leading-relaxed overflow-hidden"
                            />

                            {!input && (
                                <div className="absolute bottom-4 left-5 right-5">
                                    <div className="flex flex-wrap gap-2">
                                        {examplePrompts.map((example) => (
                                            <button
                                                key={example}
                                                onClick={() => {
                                                    setInput(example);
                                                    inputRef.current?.focus();
                                                }}
                                                className="px-2.5 py-1 text-[11px] text-white/20 hover:text-white/40 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-colors"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Spark Button */}
                        <button
                            onClick={handleSpark}
                            disabled={!input.trim() || isProcessing}
                            className="flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-b-xl shadow-lg shadow-violet-500/15 hover:shadow-xl hover:shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Enhancing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Spark It</span>
                                    <kbd className="hidden sm:inline ml-1.5 px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/60">⌘↵</kbd>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ENHANCED PROMPT PANEL */}
                <div className="flex flex-col">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                                Enhanced Prompt
                            </span>
                            {enhancedPrompt && (
                                <button
                                    onClick={handleSave}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 bg-emerald-500/10 rounded hover:bg-emerald-500/20"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                        <div className="flex-1 p-5 bg-white/[0.015] border border-white/[0.06] rounded-xl text-white/80 text-sm leading-relaxed overflow-auto min-h-[280px] max-h-[400px]">
                            {isProcessing && !enhancedPrompt ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                                </div>
                            ) : enhancedPrompt ? (
                                <pre className="whitespace-pre-wrap font-sans">{enhancedPrompt}</pre>
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                                    Your enhanced prompt will appear here
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: OUTPUT COMPARISON */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* RAW OUTPUT PANEL */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                            Output · Original Prompt
                        </span>
                    </div>
                    <div className="p-5 bg-white/[0.015] border border-white/[0.06] rounded-xl text-white/70 text-sm leading-relaxed overflow-auto min-h-[320px] max-h-[500px]">
                        {isRunningRaw ? (
                            <div className="flex items-center justify-center h-full min-h-[200px]">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                                    <span className="text-xs text-white/40">Running original prompt...</span>
                                </div>
                            </div>
                        ) : rawOutput ? (
                            <pre className="whitespace-pre-wrap font-sans">{rawOutput}</pre>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[200px] text-white/20 text-sm">
                                Output from your original prompt will appear here
                            </div>
                        )}
                    </div>
                </div>

                {/* ENHANCED OUTPUT PANEL */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                            Output · Enhanced Prompt
                        </span>
                    </div>
                    <div className="p-5 bg-white/[0.015] border border-emerald-500/[0.15] rounded-xl text-white/70 text-sm leading-relaxed overflow-auto min-h-[320px] max-h-[500px]">
                        {isRunningEnhanced ? (
                            <div className="flex items-center justify-center h-full min-h-[200px]">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                    <span className="text-xs text-white/40">Running enhanced prompt...</span>
                                </div>
                            </div>
                        ) : enhancedOutput ? (
                            <pre className="whitespace-pre-wrap font-sans">{enhancedOutput}</pre>
                        ) : (
                            <div className="flex items-center justify-center h-full min-h-[200px] text-white/20 text-sm">
                                Output from your enhanced prompt will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultExplanation(): string[] {
    return [
        'Added clear context and scope',
        'Specified desired output format',
        'Included success criteria',
        'Improved clarity and precision',
    ];
}

function generateLocalEnhancement(input: string): string {
    const inputLower = input.toLowerCase();
    const trimmed = input.trim();

    if (inputLower.includes('write') || inputLower.includes('create')) {
        const subject = trimmed.replace(/^(write|create)\s+(a|an|the)?\s*/i, '').trim();
        return `Write a well-structured ${subject} that is clear, engaging, and formatted with appropriate sections. Include relevant examples where helpful and maintain a consistent professional tone throughout.`;
    }

    if (inputLower.includes('explain') || inputLower.includes('what is')) {
        const topic = trimmed.replace(/^(explain|what is|what are)\s+(a|an|the)?\s*/i, '').trim();
        return `Explain ${topic} clearly, starting with a concise 2-3 sentence summary. Break down complex concepts into digestible parts, use real-world analogies, and conclude with the key takeaways.`;
    }

    if (inputLower.includes('code') || inputLower.includes('function') || inputLower.includes('program')) {
        return `${trimmed}. Include clear comments explaining the logic, handle edge cases properly, follow language best practices, and provide a usage example.`;
    }

    if (inputLower.includes('email') || inputLower.includes('message') || inputLower.includes('letter')) {
        const purpose = trimmed.replace(/^(write|create|draft)\s+(a|an|the)?\s*(email|message|letter)\s*/i, '').trim();
        return `Draft a professional email about ${purpose || 'this topic'}. Open with a clear purpose statement, maintain an appropriate tone, include a specific call-to-action, and keep it concise.`;
    }

    return `${trimmed}. Provide a clear, well-organized response with specific actionable recommendations. Be comprehensive yet concise.`;
}
