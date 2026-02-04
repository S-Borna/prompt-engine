'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Copy, Check, Save, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED PROMPT OUTPUT — GLOBAL DATA CONTRACT
// All prompt generation tools MUST resolve to this shape
// ═══════════════════════════════════════════════════════════════════════════

export interface EnhancedPromptResult {
    /** The original user input */
    originalPrompt: string;
    /** The ONLY primary result - clean enhanced prompt text */
    enhancedPrompt: string;
    /** Optional explanation of what was improved (collapsed by default) */
    explanation?: string[];
    /** Meta information - NEVER rendered in primary output */
    meta?: {
        score?: number;
        rulesUsed?: string[];
        model?: string;
        mode?: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPEWRITER — Demo-quality character-by-character animation
// ═══════════════════════════════════════════════════════════════════════════

interface TypeWriterProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    isActive: boolean;
    className?: string;
}

function TypeWriter({
    text,
    speed = 45,
    onComplete,
    isActive,
    className = '',
}: TypeWriterProps) {
    const [displayText, setDisplayText] = useState('');
    const indexRef = useRef(0);
    const completedRef = useRef(false);

    useEffect(() => {
        if (!isActive) {
            setDisplayText('');
            indexRef.current = 0;
            completedRef.current = false;
            return;
        }

        const intervalMs = 1000 / speed;
        const timer = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayText(text.slice(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(timer);
                if (!completedRef.current) {
                    completedRef.current = true;
                    onComplete?.();
                }
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [text, speed, onComplete, isActive]);

    const isTyping = isActive && indexRef.current < text.length;

    return (
        <span className={className}>
            {displayText}
            {isTyping && (
                <span className="inline-block w-0.5 h-[1.1em] bg-violet-400/60 ml-0.5 align-text-bottom animate-pulse" />
            )}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED PROMPT OUTPUT — THE ONE AND ONLY RENDERER
// All tools (Spark, Precision, Code, Personas) MUST use this component
// ═══════════════════════════════════════════════════════════════════════════

interface EnhancedPromptOutputProps {
    /** The structured result from prompt enhancement */
    result: EnhancedPromptResult | null;
    /** Whether to animate the enhanced prompt */
    animate: boolean;
    /** Called when animation completes */
    onAnimationComplete?: () => void;
    /** Called when user copies the prompt */
    onCopy?: () => void;
    /** Called when user saves the prompt */
    onSave?: () => void;
    /** Show save button */
    showSave?: boolean;
}

export function EnhancedPromptOutput({
    result,
    animate,
    onAnimationComplete,
    onCopy,
    onSave,
    showSave = true,
}: EnhancedPromptOutputProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDone, setAnimationDone] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [copied, setCopied] = useState(false);
    const prevPromptRef = useRef<string>('');

    // Trigger animation when new result arrives
    useEffect(() => {
        if (result?.enhancedPrompt && result.enhancedPrompt !== prevPromptRef.current) {
            if (animate) {
                setIsAnimating(true);
                setAnimationDone(false);
                setShowOriginal(false);
                setShowExplanation(false);
            } else {
                setAnimationDone(true);
            }
            prevPromptRef.current = result.enhancedPrompt;
        }
    }, [result, animate]);

    const handleAnimationComplete = useCallback(() => {
        setIsAnimating(false);
        setAnimationDone(true);
        onAnimationComplete?.();
    }, [onAnimationComplete]);

    const handleCopy = useCallback(() => {
        if (!result?.enhancedPrompt) return;
        navigator.clipboard.writeText(result.enhancedPrompt);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
        onCopy?.();
    }, [result, onCopy]);

    const handleSave = useCallback(() => {
        if (!result?.enhancedPrompt) return;
        onSave?.();
    }, [result, onSave]);

    // Empty state
    if (!result) {
        return (
            <div className="flex-1 min-h-[200px] p-8 rounded-2xl bg-white/[0.01] border border-white/[0.04] border-dashed flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/20" />
                </div>
                <p className="text-white/20 text-sm text-center">
                    Your enhanced prompt will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* ═══════════════════════════════════════════════════════════════
                ACTIONS BAR — Copy, Save
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-white/50 font-medium">Enhanced prompt</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        disabled={!animationDone}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    {showSave && onSave && (
                        <button
                            onClick={handleSave}
                            disabled={!animationDone}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-violet-400/70 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                PRIMARY OUTPUT — Enhanced Prompt ONLY
                No scores, no badges, no meta, no configuration
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-h-[180px] p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.04] to-indigo-500/[0.02] border border-violet-500/10">
                <div className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                    {animationDone ? (
                        result.enhancedPrompt
                    ) : (
                        <TypeWriter
                            text={result.enhancedPrompt}
                            speed={50}
                            isActive={isAnimating}
                            onComplete={handleAnimationComplete}
                        />
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECONDARY: Original Prompt (Collapsed)
            ═══════════════════════════════════════════════════════════════ */}
            {animationDone && result.originalPrompt && (
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
                            <p className="text-white/50 text-sm leading-relaxed">{result.originalPrompt}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECONDARY: Explanation (Collapsed)
            ═══════════════════════════════════════════════════════════════ */}
            {animationDone && result.explanation && result.explanation.length > 0 && (
                <div className="rounded-xl border border-white/[0.04] overflow-hidden">
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400/60" />
                            <span className="text-xs text-white/40 uppercase tracking-wider">Why This Is Better</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                    </button>
                    {showExplanation && (
                        <div className="px-4 py-3 border-t border-white/[0.04]">
                            <ul className="space-y-1.5">
                                {result.explanation.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                                        <span className="text-emerald-400 mt-0.5">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* META IS NEVER RENDERED — per contract */}
        </div>
    );
}

export default EnhancedPromptOutput;
