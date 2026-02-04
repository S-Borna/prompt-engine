'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Sparkles, ArrowRight, Zap, Star, Loader2, AlertCircle, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';
import { EnhancedPromptOutput, EnhancedPromptResult } from '@/components/ui/EnhancedPromptOutput';

// ═══════════════════════════════════════════════════════════════════════════
// SPARK — Flagship Prompt Enhancement Experience
// Uses the global EnhancedPromptOutput contract
// ═══════════════════════════════════════════════════════════════════════════

const models = [
    { id: 'gpt4', name: 'GPT-4', icon: '🤖' },
    { id: 'claude', name: 'Claude 3.5', icon: '🧠' },
    { id: 'gemini', name: 'Gemini Pro', icon: '✨' },
];

const modifiers = [
    { id: 'expand', name: 'Expand', icon: ArrowRight },
    { id: 'simplify', name: 'Simplify', icon: Zap },
    { id: 'professional', name: 'Professional', icon: Star },
];

const examplePrompts = [
    "Write a function to sort an array",
    "Explain machine learning simply",
    "Create a marketing email",
];

export default function SparkPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<EnhancedPromptResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt4');
    const [selectedModifier, setSelectedModifier] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
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

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.max(180, inputRef.current.scrollHeight) + 'px';
        }
    };

    const handleSpark = useCallback(async () => {
        if (!input.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setShouldAnimate(true);

        const effectiveMode = selectedModifier || 'enhance';

        try {
            const response = await fetch('/api/ai/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: input,
                    mode: effectiveMode,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                throw new Error('Enhancement failed');
            }

            const data = await response.json();
            
            // Build the result per contract
            const promptResult: EnhancedPromptResult = {
                originalPrompt: input,
                enhancedPrompt: data.enhanced || data.result,
                explanation: data.improvements || getDefaultExplanation(effectiveMode),
                meta: {
                    score: data.scores?.after || 85,
                    model: selectedModel,
                    mode: effectiveMode,
                },
            };

            setResult(promptResult);

            addToHistory({
                tool: 'spark',
                action: `${selectedModifier || 'Spark'} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: promptResult.enhancedPrompt.slice(0, 100) + '...',
            });

        } catch {
            // Fallback to local enhancement
            const enhanced = generateLocalEnhancement(input, effectiveMode);
            
            const promptResult: EnhancedPromptResult = {
                originalPrompt: input,
                enhancedPrompt: enhanced,
                explanation: getDefaultExplanation(effectiveMode),
                meta: {
                    score: 78,
                    model: selectedModel,
                    mode: effectiveMode,
                },
            };

            setResult(promptResult);

            addToHistory({
                tool: 'spark',
                action: `${selectedModifier || 'Spark'} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: enhanced.slice(0, 100) + '...',
            });
        } finally {
            setIsProcessing(false);
        }
    }, [input, selectedModifier, selectedModel, addToHistory]);

    const handleSave = useCallback(() => {
        if (!result) return;

        addPrompt({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            content: result.originalPrompt,
            enhancedContent: result.enhancedPrompt,
            tags: selectedModifier ? [selectedModifier, selectedModel] : [selectedModel],
            folder: 'Personal',
            starred: false,
            tool: 'spark',
            metadata: result.meta,
        });

        toast.success('Saved to Library!');
    }, [input, result, selectedModifier, selectedModel, addPrompt]);

    const handleClear = () => {
        setInput('');
        setResult(null);
        setError(null);
        setShouldAnimate(false);
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
    };

    // Keyboard shortcut: Cmd/Ctrl + Enter to spark
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && input.trim() && !isProcessing) {
                handleSpark();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [input, isProcessing, handleSpark]);

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                        Transform your prompts
                    </h1>
                    <p className="text-white/40 text-sm">
                        Paste any prompt and watch it become more effective
                    </p>
                </div>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                        showSettings 
                            ? 'bg-white/[0.06] text-white/70' 
                            : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-6 p-5 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30 uppercase tracking-wider">Style</span>
                            <div className="flex items-center gap-1">
                                {modifiers.map((mod) => (
                                    <button
                                        key={mod.id}
                                        onClick={() => setSelectedModifier(selectedModifier === mod.id ? null : mod.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            selectedModifier === mod.id
                                                ? 'bg-violet-500/20 text-violet-300'
                                                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <mod.icon className="w-3 h-3" />
                                        {mod.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/30 uppercase tracking-wider">Model</span>
                            <div className="flex items-center gap-1">
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => setSelectedModel(model.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                                            selectedModel === model.id
                                                ? 'bg-white/[0.06] text-white/70'
                                                : 'text-white/30 hover:text-white/50'
                                        }`}
                                    >
                                        <span>{model.icon}</span>
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Workspace */}
            <div className="flex-1 grid lg:grid-cols-2 gap-6 lg:gap-8">
                {/* INPUT PANEL */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                            <span className="text-sm text-white/50 font-medium">Your prompt</span>
                        </div>
                        {input && (
                            <button
                                onClick={handleClear}
                                className="text-xs text-white/30 hover:text-white/50 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type or paste your prompt here..."
                            className="w-full min-h-[180px] p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.1] focus:bg-white/[0.03] transition-all text-[15px] leading-relaxed"
                        />

                        {!input && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex flex-wrap gap-2">
                                    {examplePrompts.map((example) => (
                                        <button
                                            key={example}
                                            onClick={() => {
                                                setInput(example);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-3 py-1.5 text-xs text-white/25 hover:text-white/40 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-colors"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={handleSpark}
                            disabled={!input.trim() || isProcessing}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Enhancing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Spark It</span>
                                    <kbd className="hidden sm:inline ml-2 px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">⌘↵</kbd>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* OUTPUT PANEL — Uses Global EnhancedPromptOutput */}
                <div className="flex flex-col">
                    <EnhancedPromptOutput
                        result={result}
                        animate={shouldAnimate}
                        onAnimationComplete={() => setShouldAnimate(false)}
                        onSave={handleSave}
                        showSave={true}
                    />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-6 flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Local Enhancement Logic
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultExplanation(mode: string): string[] {
    const explanations: Record<string, string[]> = {
        enhance: [
            'Added clear context and scope',
            'Specified desired output format',
            'Included success criteria',
            'Improved clarity and precision',
        ],
        expand: [
            'Added comprehensive scope coverage',
            'Included multiple perspectives',
            'Specified depth requirements',
            'Added structural guidance',
        ],
        simplify: [
            'Removed ambiguous language',
            'Focused on core objective',
            'Streamlined request structure',
        ],
        professional: [
            'Elevated tone to executive level',
            'Added business context',
            'Structured for decision-making',
            'Included actionable outcomes',
        ],
    };
    return explanations[mode] || explanations.enhance;
}

function generateLocalEnhancement(input: string, mode: string): string {
    const inputLower = input.toLowerCase();
    const trimmed = input.trim();

    if (mode === 'expand') {
        return `Provide a comprehensive, in-depth analysis of: ${trimmed}. Cover all relevant aspects thoroughly, include background context, explore multiple perspectives with detailed examples and case studies, address edge cases, reference best practices, and conclude with actionable recommendations. Use clear headings and organized sections.`;
    }

    if (mode === 'simplify') {
        const core = trimmed.replace(/please\s+/gi, '').replace(/could you\s+/gi, '').replace(/can you\s+/gi, '');
        return `${core}. Be brief and direct—focus only on the essentials.`;
    }

    if (mode === 'professional') {
        return `${trimmed}. Structure the response as an executive briefing: lead with a summary, support points with evidence, use formal business language, include strategic recommendations, and conclude with clear next steps.`;
    }

    // Default enhance mode
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
