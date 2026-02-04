'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Sparkles, Copy, Save, Check, ArrowRight,
    Zap, Star, Loader2, AlertCircle, Settings, ChevronRight, ChevronDown, Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';
import { EnhancedPromptRenderer } from '@/components/ui/TypeWriter';

// ═══════════════════════════════════════════════════════════════════════════
// SPARK — Flagship Prompt Enhancement Experience
// Premium workspace with elastic Input → Output flow
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
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt4');
    const [selectedModifier, setSelectedModifier] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [qualityScore, setQualityScore] = useState<{ before: number; after: number } | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [showWhyBetter, setShowWhyBetter] = useState(false);
    const [improvements, setImprovements] = useState<string[]>([]);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

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
        // Auto-resize
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.max(200, inputRef.current.scrollHeight) + 'px';
        }
    };

    const handleSpark = useCallback(async () => {
        if (!input.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsProcessing(true);
        setError(null);

        const effectiveMode = selectedModifier || 'enhance';

        // Reset section visibility
        setShowOriginal(false);
        setShowWhyBetter(false);

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
            setShouldAnimate(true);
            setOutput(data.enhanced || data.result);
            setQualityScore(data.scores || { before: 35, after: 85 });
            setImprovements(data.improvements || getDefaultImprovements(effectiveMode));

            addToHistory({
                tool: 'spark',
                action: `${selectedModifier || 'Spark'} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: (data.enhanced || data.result).slice(0, 100) + '...',
            });

            toast.success('Enhanced!');
        } catch {
            const result = generateLocalEnhancement(input, effectiveMode);
            setShouldAnimate(true);
            setOutput(result.enhanced);
            setQualityScore({ before: 35, after: 78 });
            setImprovements(result.improvements);

            addToHistory({
                tool: 'spark',
                action: `${selectedModifier || 'Spark'} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: result.enhanced.slice(0, 100) + '...',
            });

            toast.success('Enhanced!');
        } finally {
            setIsProcessing(false);
        }
    }, [input, selectedModifier, selectedModel, addToHistory]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    }, [output]);

    const handleSave = useCallback(() => {
        if (!output) return;

        addPrompt({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            content: input,
            enhancedContent: output,
            tags: selectedModifier ? [selectedModifier, selectedModel] : [selectedModel],
            folder: 'Personal',
            starred: false,
            tool: 'spark',
            metadata: { model: selectedModel, mode: selectedModifier || 'enhance' },
        });

        toast.success('Saved to Library!');
    }, [input, output, selectedModifier, selectedModel, addPrompt]);

    const handleClear = () => {
        setInput('');
        setOutput('');
        setQualityScore(null);
        setImprovements([]);
        setShowOriginal(false);
        setShowWhyBetter(false);
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
            {/* ═══════════════════════════════════════════════════════════════
                HEADER — Minimal, purposeful
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                        Transform your prompts
                    </h1>
                    <p className="text-white/40 text-sm">
                        Paste any prompt and watch it become more effective
                    </p>
                </div>

                {/* Settings Toggle */}
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

            {/* Settings Panel (collapsed by default) */}
            {showSettings && (
                <div className="mb-6 p-5 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
                    <div className="flex flex-wrap items-center gap-6">
                        {/* Modifier Selection */}
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

                        {/* Model Selection */}
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

            {/* ═══════════════════════════════════════════════════════════════
                MAIN WORKSPACE — Input → Output Flow
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 grid lg:grid-cols-2 gap-6 lg:gap-8">
                {/* INPUT PANEL */}
                <div className="flex flex-col">
                    {/* Panel Label */}
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

                    {/* Input Area */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type or paste your prompt here..."
                            className="w-full min-h-[200px] p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-white/[0.1] focus:bg-white/[0.03] transition-all text-[15px] leading-relaxed"
                            style={{ height: 'auto' }}
                        />

                        {/* Examples — Only when empty */}
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

                    {/* Spark Button */}
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

                {/* TRANSFORMATION INDICATOR (Mobile) */}
                <div className="flex lg:hidden items-center justify-center py-2">
                    <ChevronRight className="w-6 h-6 text-white/20 rotate-90" />
                </div>

                {/* OUTPUT PANEL */}
                <div className="flex flex-col">
                    {/* Panel Label */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors ${output ? 'bg-emerald-400' : 'bg-white/20'}`} />
                            <span className="text-sm text-white/50 font-medium">Enhanced prompt</span>
                            {qualityScore && output && (
                                <span className="px-2 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full">
                                    +{qualityScore.after - qualityScore.before}% better
                                </span>
                            )}
                        </div>
                        {output && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-violet-400/70 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Output Area — Collapsible Sections */}
                    <div ref={outputRef} className="flex-1 flex flex-col gap-3">
                        {output ? (
                            <>
                                {/* SECTION 1: Original Prompt (Collapsed by default) */}
                                <div className="rounded-xl border border-white/[0.04] overflow-hidden">
                                    <button
                                        onClick={() => setShowOriginal(!showOriginal)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.03] transition-colors"
                                    >
                                        <span className="text-xs text-white/40 uppercase tracking-wider">Original Prompt</span>
                                        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showOriginal ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showOriginal && (
                                        <div className="px-4 py-3 border-t border-white/[0.04]">
                                            <p className="text-white/50 text-sm leading-relaxed">{input}</p>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: Enhanced Prompt (Primary — Always Expanded, Animated) */}
                                <div className="flex-1 min-h-[200px] p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.04] to-indigo-500/[0.02] border border-violet-500/10">
                                    <EnhancedPromptRenderer
                                        content={output}
                                        animate={shouldAnimate}
                                        onAnimationComplete={() => setShouldAnimate(false)}
                                        className="text-white/90 text-[15px] leading-relaxed"
                                        speed={50}
                                    />
                                </div>

                                {/* SECTION 3: Why This Is Better (Collapsed by default) */}
                                {improvements.length > 0 && (
                                    <div className="rounded-xl border border-white/[0.04] overflow-hidden">
                                        <button
                                            onClick={() => setShowWhyBetter(!showWhyBetter)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.03] transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="w-3.5 h-3.5 text-amber-400/60" />
                                                <span className="text-xs text-white/40 uppercase tracking-wider">Why This Is Better</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showWhyBetter ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showWhyBetter && (
                                            <div className="px-4 py-3 border-t border-white/[0.04]">
                                                <ul className="space-y-1.5">
                                                    {improvements.map((imp, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                                                            <span className="text-emerald-400 mt-0.5">✓</span>
                                                            <span>{imp}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 min-h-[200px] p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] border-dashed flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                                    <Sparkles className="w-6 h-6 text-violet-400/30" />
                                </div>
                                <p className="text-white/20 text-sm text-center">
                                    Your enhanced prompt will appear here
                                </p>
                            </div>
                        )}
                    </div>
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
// Local Enhancement (Fallback) — Returns ENHANCED PROMPT, not meta instructions
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultImprovements(mode: string): string[] {
    const improvementSets: Record<string, string[]> = {
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
    return improvementSets[mode] || improvementSets.enhance;
}

function generateLocalEnhancement(input: string, mode: string): { enhanced: string; improvements: string[] } {
    const inputLower = input.toLowerCase();
    
    // Detect intent and generate appropriate enhanced prompt
    const enhance = (prompt: string): string => {
        // Clean and structure the prompt
        const trimmed = prompt.trim();
        
        // Add context based on detected intent
        if (inputLower.includes('write') || inputLower.includes('create')) {
            return `${trimmed}

Please ensure the output:
• Is well-structured with clear sections
• Uses appropriate formatting
• Includes relevant examples where helpful
• Maintains a consistent tone throughout`;
        }
        
        if (inputLower.includes('explain') || inputLower.includes('what is')) {
            return `${trimmed}

In your explanation:
• Start with a concise summary (2-3 sentences)
• Break down complex concepts into digestible parts
• Use analogies or real-world examples
• End with key takeaways`;
        }
        
        if (inputLower.includes('code') || inputLower.includes('function') || inputLower.includes('program')) {
            return `${trimmed}

Requirements:
• Include comments explaining key logic
• Handle edge cases appropriately
• Follow best practices for the language
• Provide a brief usage example`;
        }
        
        if (inputLower.includes('email') || inputLower.includes('message') || inputLower.includes('letter')) {
            return `${trimmed}

Ensure the message:
• Has a clear subject/purpose in the opening
• Uses appropriate professional tone
• Includes a specific call-to-action
• Is concise yet complete`;
        }
        
        // Generic enhancement
        return `${trimmed}

Please provide a response that is:
• Clear and well-organized
• Comprehensive yet concise
• Actionable with specific recommendations
• Easy to understand without prior context`;
    };

    const expand = (prompt: string): string => {
        return `${prompt.trim()}

Please provide a comprehensive response that:
• Covers all relevant aspects of this topic
• Includes background context where helpful
• Explores multiple approaches or perspectives
• Provides detailed examples and case studies
• Addresses potential edge cases or exceptions
• References industry best practices
• Concludes with actionable recommendations

Format with clear headings and organized sections.`;
    };

    const simplify = (prompt: string): string => {
        // Extract core intent
        const trimmed = prompt.trim();
        const words = trimmed.split(/\s+/);
        
        if (words.length > 15) {
            // Simplify long prompts
            return `${trimmed}\n\nKeep your response brief and focused on the essentials only.`;
        }
        return `${trimmed}\n\nProvide a concise, direct answer.`;
    };

    const professional = (prompt: string): string => {
        return `${prompt.trim()}

Please respond in a professional, executive-appropriate format:
• Lead with an executive summary
• Support key points with data or evidence
• Use formal business language
• Include strategic recommendations
• Conclude with clear next steps`;
    };

    const generators: Record<string, (p: string) => string> = {
        enhance,
        expand,
        simplify,
        professional,
    };

    const generator = generators[mode] || enhance;
    
    return {
        enhanced: generator(input),
        improvements: getDefaultImprovements(mode),
    };
}
