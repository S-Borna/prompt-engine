'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Wand2, Sparkles, Copy, Save, Check, ArrowRight,
    Zap, Star, Loader2, AlertCircle, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '@/lib/prompt-store';

// ═══════════════════════════════════════════════════════════════════════════
// SPARK - Instant Prompt Enhancement
// Dark theme unified with landing page
// ═══════════════════════════════════════════════════════════════════════════

const models = [
    { id: 'gpt4', name: 'GPT-4', icon: '🤖', desc: 'Best overall' },
    { id: 'claude', name: 'Claude 3.5', icon: '🧠', desc: 'Best for nuance' },
    { id: 'gemini', name: 'Gemini Pro', icon: '✨', desc: 'Best for speed' },
];

// Modifiers are OPTIONAL - user can select one to adjust how Spark improves their prompt
// Default: no modifier selected (pure enhancement)
const modifiers = [
    { id: 'expand', name: 'Expand', desc: 'Add more detail', icon: ArrowRight, color: 'blue' },
    { id: 'simplify', name: 'Simplify', desc: 'Make it concise', icon: Zap, color: 'emerald' },
    { id: 'professional', name: 'Professional', desc: 'Business tone', icon: Star, color: 'amber' },
];

const examplePrompts = [
    "Write a function to sort an array",
    "Explain machine learning to a beginner",
    "Create a marketing email for a product launch",
    "Summarize this article for executives",
];

export default function SparkPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt4');
    const [selectedModifier, setSelectedModifier] = useState<string | null>(null); // null = no modifier (pure enhancement)
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [qualityScore, setQualityScore] = useState<{ before: number; after: number } | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { addPrompt, addToHistory } = usePromptStore();

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
            toast.error('Please enter a prompt to enhance');
            return;
        }

        setIsProcessing(true);
        setError(null);

        const effectiveMode = selectedModifier || 'enhance'; // Default to enhance if no modifier

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
                throw new Error('Enhancement failed. Please try again.');
            }

            const data = await response.json();

            setOutput(data.enhanced || data.result);
            setQualityScore(data.scores || { before: 35, after: 85 });

            const modifierName = selectedModifier
                ? modifiers.find(m => m.id === selectedModifier)?.name
                : 'Spark';
            addToHistory({
                tool: 'spark',
                action: `${modifierName} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: (data.enhanced || data.result).slice(0, 100) + '...',
            });

            toast.success('Prompt enhanced!');
        } catch {
            // Fallback to local enhancement
            const enhanced = generateLocalEnhancement(input, effectiveMode);
            setOutput(enhanced);
            setQualityScore({ before: 35, after: 78 });

            const modifierName = selectedModifier
                ? modifiers.find(m => m.id === selectedModifier)?.name
                : 'Spark';
            addToHistory({
                tool: 'spark',
                action: `${modifierName} enhancement`,
                input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
                output: enhanced.slice(0, 100) + '...',
            });

            toast.success('Enhanced locally');
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

        const effectiveMode = selectedModifier || 'enhance';
        addPrompt({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            content: input,
            enhancedContent: output,
            tags: selectedModifier ? [selectedModifier, selectedModel] : [selectedModel],
            folder: 'Personal',
            starred: false,
            tool: 'spark',
            metadata: {
                model: selectedModel,
                mode: effectiveMode,
            },
        });

        toast.success('Saved to Library!');
    }, [input, output, selectedModifier, selectedModel, addPrompt]);

    const handleExampleClick = (example: string) => {
        setInput(example);
        setOutput('');
        setQualityScore(null);
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col">
            {/* ═══════════════════════════════════════════════════════════════
                ZONE 1: HEADER — Purpose & Control (Compact, intentional)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-shrink-0 mb-8">
                {/* Title Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white tracking-tight">Transform prompts instantly</h1>
                            <p className="text-white/40 text-sm">Paste → Spark → Done</p>
                        </div>
                    </div>

                    {/* Advanced Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                    </button>
                </div>

                {/* Modifier Pills — Secondary, inline */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 uppercase tracking-wider">Style</span>
                    <div className="flex items-center gap-2">
                        {modifiers.map((modifier) => {
                            const isActive = selectedModifier === modifier.id;
                            return (
                                <button
                                    key={modifier.id}
                                    onClick={() => setSelectedModifier(isActive ? null : modifier.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        isActive 
                                            ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30' 
                                            : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <modifier.icon className="w-3 h-3" />
                                    {modifier.name}
                                </button>
                            );
                        })}
                        {selectedModifier && (
                            <button
                                onClick={() => setSelectedModifier(null)}
                                className="text-xs text-white/30 hover:text-white/50 ml-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Advanced Options — Model Selector (collapsed by default) */}
                {showAdvanced && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.04]">
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
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                ZONE 2: WORK — Before → After (Visual dominance)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 grid lg:grid-cols-2 gap-8 mb-8">
                {/* INPUT PANEL — Left */}
                <div className="flex flex-col bg-white/[0.02] rounded-2xl overflow-hidden">
                    {/* Panel Header */}
                    <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                            <span className="text-sm font-medium text-white/60">Your Prompt</span>
                        </div>
                        {input && (
                            <button
                                onClick={() => { setInput(''); setOutput(''); setQualityScore(null); }}
                                className="text-xs text-white/30 hover:text-white/50 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Textarea */}
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste your prompt here..."
                            className="absolute inset-0 w-full h-full px-6 py-4 bg-transparent text-white/90 placeholder-white/20 resize-none focus:outline-none text-[15px] leading-relaxed"
                            style={{ minHeight: '320px' }}
                        />
                    </div>

                    {/* Example Prompts — Only when empty */}
                    {!input && (
                        <div className="flex-shrink-0 px-6 py-4 border-t border-white/[0.03]">
                            <div className="flex flex-wrap gap-2">
                                {examplePrompts.slice(0, 3).map((example) => (
                                    <button
                                        key={example}
                                        onClick={() => handleExampleClick(example)}
                                        className="px-3 py-1.5 text-xs text-white/30 hover:text-white/50 hover:bg-white/[0.03] rounded-lg transition-colors"
                                    >
                                        {example.slice(0, 28)}...
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* OUTPUT PANEL — Right */}
                <div className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
                    output 
                        ? 'bg-gradient-to-br from-violet-500/[0.06] to-indigo-500/[0.04] ring-1 ring-violet-500/20' 
                        : 'bg-white/[0.02]'
                }`}>
                    {/* Panel Header */}
                    <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full transition-colors ${output ? 'bg-emerald-400' : 'bg-white/20'}`} />
                            <span className="text-sm font-medium text-white/60">Enhanced</span>
                            {qualityScore && output && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full">
                                    +{qualityScore.after - qualityScore.before}%
                                </span>
                            )}
                        </div>
                        {output && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-colors"
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

                    {/* Output Content */}
                    <div className="flex-1 px-6 py-4 overflow-auto" style={{ minHeight: '320px' }}>
                        {output ? (
                            <pre className="text-white/80 whitespace-pre-wrap text-[15px] leading-relaxed font-sans">
                                {output}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <Sparkles className="w-10 h-10 text-violet-400/30 mb-3" />
                                <p className="text-white/25 text-sm">Enhanced prompt appears here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                ZONE 3: ACTION — Primary CTA (Isolated, grounded)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-shrink-0 flex justify-center">
                <button
                    onClick={handleSpark}
                    disabled={!input.trim() || isProcessing}
                    className="flex items-center justify-center gap-2.5 px-12 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
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
                        </>
                    )}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

// Local enhancement fallback
function generateLocalEnhancement(input: string, mode: string): string {
    const templates: Record<string, (input: string) => string> = {
        enhance: (prompt) => `You are an expert assistant with deep knowledge in the relevant domain.

**Your Task:**
${prompt}

**Instructions:**
1. Analyze the request thoroughly before responding
2. Provide a structured, comprehensive answer
3. Include specific examples where relevant
4. Use clear formatting with headers and bullet points
5. Anticipate follow-up questions

**Output Requirements:**
- Be precise and actionable
- Avoid jargon unless necessary
- Include key takeaways at the end

Please proceed with a high-quality response.`,

        expand: (prompt) => `You are a detailed analyst and comprehensive responder.

**Context:**
The user needs an in-depth exploration of the following topic/task.

**Primary Task:**
${prompt}

**Expansion Guidelines:**
1. Cover all aspects of the topic thoroughly
2. Provide background context and history if relevant
3. Include multiple perspectives or approaches
4. Add detailed examples and case studies
5. Discuss edge cases and exceptions
6. Reference best practices and industry standards
7. Include actionable recommendations

**Format:**
Use clear sections with headers, bullet points for lists, and numbered steps for processes.`,

        simplify: (prompt) => `**Task:** ${prompt}

**Requirements:**
- Keep it brief and direct
- Use simple language
- Focus only on essentials
- Maximum 3-5 key points`,

        professional: (prompt) => `You are a senior professional consultant providing executive-level guidance.

**Subject Matter:**
${prompt}

**Approach:**
- Maintain a professional, business-appropriate tone
- Structure response with clear executive summary
- Include strategic recommendations
- Support points with relevant data or examples
- Conclude with actionable next steps

**Format:** Professional memo or briefing format with clear sections.`,
    };

    return templates[mode]?.(input) || templates.enhance(input);
}
