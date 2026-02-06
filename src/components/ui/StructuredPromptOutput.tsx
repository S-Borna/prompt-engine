'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Save, ChevronDown, CheckCircle2, Cpu, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED PROMPT OUTPUT — Unified display (IP-protected)
// ═══════════════════════════════════════════════════════════════════════════
//
// Displays enhanced prompts as a single, seamless block.
// Sections are kept INTERNALLY for storage/scoring but NEVER exposed
// visually with labels. This protects our methodology from being
// reverse-engineered from a single screenshot.
//
// ═══════════════════════════════════════════════════════════════════════════

export interface StructuredPromptSections {
    expertRole: string;
    mainObjective: string;
    contextBackground: string;
    outputFormat: string;
    constraints: string;
    approachGuidelines: string;
}

export interface StructuredResult {
    sections: StructuredPromptSections;
    domain: string;
    improvements: string[];
    targetPlatform?: string;
    meta?: {
        tokensIn?: number;
        tokensOut?: number;
        timeMs?: number;
        model?: string;
        score?: number;
    };
}

interface StructuredPromptOutputProps {
    result: StructuredResult | null;
    onSave?: () => void;
    onCopy?: () => void;
    onRefineAnother?: () => void;
    showSave?: boolean;
    actionLabel?: string;
}

// Assemble a single seamless prompt from sections — NO labels
function assembleUnifiedPrompt(sections: StructuredPromptSections): string {
    return [
        sections.expertRole,
        sections.mainObjective,
        sections.contextBackground,
        sections.outputFormat,
        sections.constraints,
        sections.approachGuidelines,
    ].filter(Boolean).join('\n\n');
}

export function StructuredPromptOutput({
    result,
    onSave,
    onCopy,
    onRefineAnother,
    showSave = true,
    actionLabel = 'Improve',
}: StructuredPromptOutputProps) {
    const [copied, setCopied] = useState(false);
    const [showImprovements, setShowImprovements] = useState(false);

    const handleCopy = useCallback(() => {
        if (!result) return;
        const text = assembleUnifiedPrompt(result.sections);
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
        onCopy?.();
    }, [result, onCopy]);

    // Empty state
    if (!result) {
        return (
            <div className="flex-1 min-h-[320px] p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/20" />
                </div>
                <p className="text-white/20 text-sm text-center">
                    Your enhanced prompt will appear here
                </p>
            </div>
        );
    }

    const { sections, domain, improvements, meta, targetPlatform } = result;
    const unifiedPrompt = assembleUnifiedPrompt(sections);

    // Platform display mapping
    const platformDisplayMap: Record<string, { label: string; color: string }> = {
        'chatgpt': { label: 'Optimized for ChatGPT', color: 'text-emerald-400' },
        'claude': { label: 'Optimized for Claude', color: 'text-orange-400' },
        'gemini': { label: 'Optimized for Gemini', color: 'text-blue-400' },
        'grok': { label: 'Optimized for Grok', color: 'text-slate-300' },
        'general': { label: 'Universal Prompt', color: 'text-violet-400' },
    };
    const platformInfo = platformDisplayMap[targetPlatform || ''] || platformDisplayMap['general'];

    // Quality indicator
    const qualityLevel = (meta?.score ?? 0) >= 80 ? 'excellent' : (meta?.score ?? 0) >= 60 ? 'good' : 'enhanced';
    const qualityConfig = {
        excellent: { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        good: { label: 'Strong', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        enhanced: { label: 'Enhanced', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    }[qualityLevel];

    return (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Platform Profile Badge */}
            {targetPlatform && (
                <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.015]">
                    <Cpu className="w-3.5 h-3.5 text-white/25" />
                    <span className={`text-[11px] font-medium tracking-wide ${platformInfo.color}`}>
                        {platformInfo.label}
                    </span>
                    <span className="text-[10px] text-white/20 ml-auto">Platform-specific formatting applied</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-white">Prompt {actionLabel === 'Refine' ? 'Refined' : 'Improved'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider bg-white/[0.04] px-2.5 py-1 rounded-md">
                        {domain}
                    </span>
                    {meta?.score && (
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${qualityConfig.bg} ${qualityConfig.color}`}>
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {qualityConfig.label}
                        </span>
                    )}
                    {/* Copy & Save */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors"
                        title="Copy prompt"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {showSave && onSave && (
                        <button
                            onClick={onSave}
                            className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.04] rounded-lg transition-colors"
                            title="Save to library"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                UNIFIED PROMPT — Single seamless block, NO section labels
                This is the core IP protection: users see the result,
                not the methodology blueprint.
            ═══════════════════════════════════════════════════════════════ */}
            <div className="p-6">
                <div className="pl-4 border-l-2 border-violet-500/30">
                    <p className="text-white/85 text-[15px] leading-[1.8] whitespace-pre-wrap font-sans">
                        {unifiedPrompt}
                    </p>
                </div>
            </div>

            {/* What was improved */}
            {improvements.length > 0 && (
                <div className="border-t border-white/[0.06]">
                    <button
                        onClick={() => setShowImprovements(!showImprovements)}
                        className="w-full flex items-center gap-2 px-6 py-3 text-left hover:bg-white/[0.02] transition-colors"
                    >
                        <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${showImprovements ? 'rotate-180' : ''}`} />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                            What was improved
                        </span>
                        <span className="text-[11px] text-white/20">({improvements.length})</span>
                    </button>
                    {showImprovements && (
                        <div className="px-6 pb-4 space-y-2">
                            {improvements.map((item, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-white/50">{item}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer: meta + actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-4 text-[11px] text-white/25">
                    {meta?.tokensIn && meta?.tokensOut && (
                        <span>⚡ {meta.tokensIn} in / {meta.tokensOut} out tokens</span>
                    )}
                    {meta?.timeMs && (
                        <span>⏱ {(meta.timeMs / 1000).toFixed(1)}s</span>
                    )}
                    {meta?.model && (
                        <span className="capitalize">{meta.model}</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {onRefineAnother && (
                        <button
                            onClick={onRefineAnother}
                            className="px-4 py-2 text-sm text-white/50 hover:text-white/70 border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-colors"
                        >
                            {actionLabel} Another Prompt
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy {actionLabel === 'Refine' ? 'Refined' : 'Improved'} Prompt
                    </button>
                </div>
            </div>
        </div>
    );
}
