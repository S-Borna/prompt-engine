'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, Languages } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';
import { StructuredPromptOutput, type StructuredResult } from '@/components/ui/StructuredPromptOutput';
import { ModelCardWithInsight } from '@/components/ui/ModelInsightPopover';

// ═══════════════════════════════════════════════════════════════════════════
// SPARK — "Improve Prompt" — One-click prompt enhancement
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
    const [structuredResult, setStructuredResult] = useState<StructuredResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-5.2');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { addPrompt, addToHistory } = usePromptStore();

    useEffect(() => { inputRef.current?.focus(); }, []);

    useEffect(() => {
        const replayInput = sessionStorage.getItem('replay-input');
        if (replayInput) {
            setInput(replayInput);
            sessionStorage.removeItem('replay-input');
            toast.success('Loaded from history');
        }
    }, []);

    const handleSpark = useCallback(async () => {
        if (!input.trim()) { toast.error('Please enter a prompt'); return; }

        setIsProcessing(true);
        setError(null);
        setStructuredResult(null);
        const startTime = Date.now();

        const platformMap: Record<string, string> = {
            'gpt-5.2': 'chatgpt', 'gpt-5.1': 'chatgpt',
            'claude-opus-4.5': 'claude', 'claude-sonnet-4.5': 'claude',
            'gemini-3': 'gemini', 'gemini-2.5': 'gemini',
            'grok-3': 'grok', 'grok-2': 'grok',
        };

        const languageMap: Record<string, string> = {
            'en': 'en', 'sv': 'sv', 'sv-en': 'sv-to-en',
        };

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);

            const response = await fetch('/api/ai/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    prompt: input,
                    rawPrompt: input,
                    mode: 'enhance',
                    platform: platformMap[selectedModel] || 'general',
                    outputLanguage: languageMap[selectedLanguage] || 'auto',
                }),
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error('Enhancement failed');

            const data = await response.json();
            const elapsed = Date.now() - startTime;

            const sections = data.sections || {
                expertRole: '',
                mainObjective: data.enhanced || '',
                contextBackground: '',
                outputFormat: '',
                constraints: '',
                approachGuidelines: '',
            };

            const improvements = data.improvements || [
                'Enhanced prompt clarity and structure',
                'Added specific context and constraints',
                'Defined expert role for better responses',
            ];

            setStructuredResult({
                sections,
                domain: (data.meta?.domain || 'general').toUpperCase(),
                improvements,
                targetPlatform: platformMap[selectedModel] || 'general',
                meta: {
                    tokensIn: data.meta?.tokensIn,
                    tokensOut: data.meta?.tokensOut,
                    timeMs: elapsed,
                    model: platformMap[selectedModel] || selectedModel,
                    score: data.quality?.score,
                },
            });

            addToHistory({
                tool: 'spark',
                action: 'Prompt improved',
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: (data.enhanced || '').slice(0, 100) + '...',
            });

        } catch (err) {
            const isTimeout = err instanceof DOMException && err.name === 'AbortError';
            setError(isTimeout
                ? 'Request timed out. Try a shorter prompt or try again.'
                : 'AI service unavailable. Please try again.');
            toast.error(isTimeout ? 'Timed out' : 'Enhancement failed');
        } finally {
            setIsProcessing(false);
        }
    }, [input, selectedModel, selectedLanguage, addToHistory]);

    const handleSave = useCallback(async () => {
        if (!structuredResult) return;
        const { sections } = structuredResult;
        const flatPrompt = [sections.expertRole, sections.mainObjective, sections.contextBackground, sections.outputFormat, sections.constraints, sections.approachGuidelines]
            .filter(Boolean).join('\n\n');

        // Save to local store (localStorage cache)
        addPrompt({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            content: input,
            enhancedContent: flatPrompt,
            tags: [selectedModel],
            folder: 'Personal',
            starred: false,
            tool: 'spark',
            metadata: structuredResult.meta,
        });

        // Save to Postgres
        try {
            await fetch('/api/prompts/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: input.slice(0, 80),
                    originalPrompt: input,
                    enhancedPrompt: flatPrompt,
                    tags: [selectedModel],
                    tool: 'spark',
                    sections,
                }),
            });
        } catch (e) {
            console.warn('Failed to save to database:', e);
        }

        toast.success('Saved to Library!');
    }, [input, structuredResult, selectedModel, addPrompt]);

    const handleClear = () => {
        setInput('');
        setStructuredResult(null);
        setError(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim() && !isProcessing) handleSpark();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [input, isProcessing, handleSpark]);

    const selectedModelInfo = aiModels.find(m => m.id === selectedModel);

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Improve Prompt</h1>
                <p className="text-white/50 text-sm mt-1">
                    Transform your prompts with one click. Get clearer, more effective prompts tailored for your target AI platform.
                </p>
            </div>

            {/* Target Model */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">Target Platform</span>
                    {selectedModelInfo && (
                        <span className="text-[11px] text-white/50 px-2 py-0.5 bg-white/[0.04] rounded-md">
                            {selectedModelInfo.family} · {selectedModelInfo.name}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {aiModels.map((model) => (
                        <ModelCardWithInsight key={model.id} model={model} isSelected={selectedModel === model.id} onSelect={() => setSelectedModel(model.id)} />
                    ))}
                </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-violet-500/[0.06] to-indigo-500/[0.06] border border-violet-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Languages className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-sm text-white/60">
                        <span className="text-white/80 font-medium">Pro tip:</span> AI models perform best with English prompts
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
                    {languageOptions.map((lang) => (
                        <button key={lang.id} onClick={() => setSelectedLanguage(lang.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selectedLanguage === lang.id ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60'}`}
                        >
                            <span>{lang.flag}</span>
                            <span className="hidden sm:inline">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Input — hidden when result is showing */}
            {!structuredResult && !isProcessing && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <span className="text-sm font-medium text-white/50">Your Prompt</span>
                        <span className="text-[11px] text-white/20">{input.length}/10 000</span>
                    </div>
                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.max(160, e.target.scrollHeight) + 'px'; }}
                            placeholder="Enter the prompt you want to improve..."
                            className="w-full min-h-[160px] p-6 bg-transparent text-white/90 placeholder-white/20 resize-none focus:outline-none text-sm leading-relaxed"
                        />
                        {!input && (
                            <div className="absolute bottom-4 left-6 right-6">
                                <div className="flex flex-wrap gap-2">
                                    {examplePrompts.map((example) => (
                                        <button key={example} onClick={() => { setInput(example); inputRef.current?.focus(); }}
                                            className="px-2.5 py-1 text-[11px] text-white/20 hover:text-white/40 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-colors"
                                        >{example}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-6 pb-6">
                        <button onClick={handleSpark} disabled={!input.trim() || isProcessing}
                            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/15 hover:shadow-xl hover:shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Improve Prompt</span>
                            <kbd className="hidden sm:inline ml-1.5 px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/60">⌘↵</kbd>
                        </button>
                    </div>
                </div>
            )}

            {/* Processing */}
            {isProcessing && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                    <span className="text-sm text-white/40">Analyzing and improving your prompt...</span>
                </div>
            )}

            {/* Result */}
            {structuredResult && !isProcessing && (
                <StructuredPromptOutput
                    result={structuredResult}
                    onSave={handleSave}
                    onRefineAnother={handleClear}
                    actionLabel="Improve"
                />
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
