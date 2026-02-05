'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

// ═══════════════════════════════════════════════════════════════════════════
// MODEL INSIGHT POPOVER — Premium Hover Experience
// ═══════════════════════════════════════════════════════════════════════════
//
// A signature micro-interaction that teaches users about each AI model.
// Designed to feel intentional, expensive, and delightful.
//
// Features:
// - Spring-like entrance animation (scale + fade + Y-lift)
// - Glassmorphism with model-tinted accents
// - Hover intent detection (delayed show)
// - 60fps performance target
//
// ═══════════════════════════════════════════════════════════════════════════

// ─── MODEL INSIGHTS DATA ────────────────────────────────────────────────────
// Written by someone who has actually used these models extensively.
// No buzzwords. No marketing fluff. Just signal.

export interface ModelInsight {
    id: string;
    name: string;
    family: string;
    color: string;
    logo: string;
    tagline: string;
    howItThinks: string[];
    howPraxisAdapts: string[];
    bestFor: string[];
}

export const MODEL_INSIGHTS: Record<string, ModelInsight> = {
    'gpt-5.2': {
        id: 'gpt-5.2',
        name: 'GPT 5.2',
        family: 'OpenAI',
        color: '#10b981',
        logo: '/logos/openai.svg',
        tagline: 'Peak instruction-following with nuanced reasoning',
        howItThinks: [
            'Excels at interpreting complex, multi-part instructions',
            'Strong preference for structured markdown output',
            'Balances creativity with precision based on prompt tone',
        ],
        howPraxisAdapts: [
            'Structures prompts with clear ## headers and hierarchical sections',
            'Adds explicit output format specifications',
            'Includes "think step-by-step" cues for complex reasoning tasks',
        ],
        bestFor: [
            'Complex multi-step tasks',
            'Technical documentation',
            'Code generation with context',
            'Analytical writing',
        ],
    },
    'gpt-5.1': {
        id: 'gpt-5.1',
        name: 'GPT 5.1',
        family: 'OpenAI',
        color: '#10b981',
        logo: '/logos/openai.svg',
        tagline: 'Reliable workhorse with consistent output quality',
        howItThinks: [
            'Favors explicit over implicit instructions',
            'Responds well to examples in the prompt',
            'More conservative in interpretation than 5.2',
        ],
        howPraxisAdapts: [
            'Uses bullet points for clearer requirement parsing',
            'Adds concrete examples where appropriate',
            'Keeps instruction density moderate to avoid confusion',
        ],
        bestFor: [
            'Standard content generation',
            'Email drafting',
            'Summarization tasks',
            'General Q&A',
        ],
    },
    'claude-sonnet-4.5': {
        id: 'claude-sonnet-4.5',
        name: 'Sonnet 4.5',
        family: 'Anthropic',
        color: '#f97316',
        logo: '/logos/anthropic.svg',
        tagline: 'Thoughtful reasoning with natural conversational flow',
        howItThinks: [
            'Prefers conversational prompts over rigid structures',
            'Naturally considers edge cases and nuances',
            'Strong ethical reasoning and safety awareness',
        ],
        howPraxisAdapts: [
            'Uses natural language framing with clear intent',
            'Includes context about why the task matters',
            'Structures output expectations as guidelines, not commands',
        ],
        bestFor: [
            'Nuanced analysis',
            'Content requiring empathy',
            'Safety-critical applications',
            'Long-form writing',
        ],
    },
    'claude-opus-4.1': {
        id: 'claude-opus-4.1',
        name: 'Opus 4.1',
        family: 'Anthropic',
        color: '#f97316',
        logo: '/logos/anthropic.svg',
        tagline: 'Deep reasoning for complex intellectual tasks',
        howItThinks: [
            'Thrives on complexity and ambiguity',
            'Excellent at synthesizing multiple perspectives',
            'Prefers comprehensive context over terse instructions',
        ],
        howPraxisAdapts: [
            'Provides rich context and background information',
            'Frames tasks as intellectual challenges',
            'Allows room for the model to reason and explain',
        ],
        bestFor: [
            'Research synthesis',
            'Philosophy and ethics',
            'Complex problem decomposition',
            'Academic writing',
        ],
    },
    'gemini-3': {
        id: 'gemini-3',
        name: 'Gemini 3',
        family: 'Google',
        color: '#3b82f6',
        logo: '/logos/gemini.svg',
        tagline: 'Multimodal powerhouse with real-time knowledge',
        howItThinks: [
            'Excels at connecting information across domains',
            'Strong factual grounding with current knowledge',
            'Comfortable with multimodal reasoning',
        ],
        howPraxisAdapts: [
            'Structures prompts for cross-domain synthesis',
            'Includes explicit fact-checking instructions',
            'Uses numbered steps for process-oriented tasks',
        ],
        bestFor: [
            'Research with current data',
            'Fact-based content',
            'Cross-domain analysis',
            'Visual-text integration',
        ],
    },
    'gemini-2.5': {
        id: 'gemini-2.5',
        name: 'Gemini 2.5',
        family: 'Google',
        color: '#3b82f6',
        logo: '/logos/gemini.svg',
        tagline: 'Fast and efficient for everyday tasks',
        howItThinks: [
            'Optimized for speed without sacrificing quality',
            'Handles structured data exceptionally well',
            'Direct and concise response style',
        ],
        howPraxisAdapts: [
            'Keeps prompts concise and action-oriented',
            'Uses explicit output length guidelines',
            'Structures for quick parsing and execution',
        ],
        bestFor: [
            'Quick answers',
            'Data extraction',
            'Rapid prototyping',
            'Bulk processing',
        ],
    },
    'grok-3': {
        id: 'grok-3',
        name: 'Grok 3',
        family: 'xAI',
        color: '#94a3b8',
        logo: '/logos/xai.svg',
        tagline: 'Unfiltered insights with real-time awareness',
        howItThinks: [
            'Direct and unvarnished response style',
            'Strong real-time knowledge integration',
            'Comfortable challenging assumptions',
        ],
        howPraxisAdapts: [
            'Frames prompts to invite direct, honest feedback',
            'Includes context about acceptable directness level',
            'Structures for actionable, no-nonsense output',
        ],
        bestFor: [
            'Contrarian analysis',
            'Real-time topics',
            'Direct feedback',
            'Unconventional perspectives',
        ],
    },
    'grok-2': {
        id: 'grok-2',
        name: 'Grok 2',
        family: 'xAI',
        color: '#94a3b8',
        logo: '/logos/xai.svg',
        tagline: 'Sharp and efficient with a distinctive voice',
        howItThinks: [
            'Balances wit with substance',
            'Quick to identify core issues',
            'Less verbose than larger models',
        ],
        howPraxisAdapts: [
            'Keeps prompts focused on the essential question',
            'Allows for personality in responses',
            'Structures for efficient, pointed answers',
        ],
        bestFor: [
            'Quick takes',
            'Social content',
            'Brainstorming',
            'Informal communication',
        ],
    },
    'sora': {
        id: 'sora',
        name: 'Sora',
        family: 'OpenAI',
        color: '#ec4899',
        logo: '/logos/sora.svg',
        tagline: 'Text-to-video with cinematic understanding',
        howItThinks: [
            'Interprets visual and temporal concepts from text',
            'Understands cinematographic language',
            'Excels at scene composition and motion',
        ],
        howPraxisAdapts: [
            'Translates abstract ideas into visual descriptions',
            'Adds camera movement and lighting specifications',
            'Includes timing and pacing cues',
        ],
        bestFor: [
            'Video concept development',
            'Storyboard creation',
            'Visual narrative planning',
            'Motion design briefs',
        ],
    },
    'nano-banana-pro': {
        id: 'nano-banana-pro',
        name: 'Banana Pro',
        family: 'Nano',
        color: '#eab308',
        logo: '/logos/banana.svg',
        tagline: 'Lightweight speed for rapid iteration',
        howItThinks: [
            'Optimized for latency over depth',
            'Works best with clear, simple instructions',
            'Fast feedback loops for iterative work',
        ],
        howPraxisAdapts: [
            'Simplifies prompts to core requirements',
            'Uses direct imperative language',
            'Minimizes context to speed execution',
        ],
        bestFor: [
            'Quick drafts',
            'Iteration cycles',
            'Simple transformations',
            'Latency-sensitive apps',
        ],
    },
};

// ─── POPOVER COMPONENT ──────────────────────────────────────────────────────

interface ModelInsightPopoverProps {
    modelId: string;
    isVisible: boolean;
    anchorRect: DOMRect | null;
    onClose: () => void;
}

function ModelInsightPopover({ modelId, isVisible, anchorRect, onClose }: ModelInsightPopoverProps) {
    const insight = MODEL_INSIGHTS[modelId];
    const popoverRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!insight || !anchorRect || !mounted) return null;

    // Calculate position - prefer below and centered, but adapt to viewport
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const popoverWidth = 360;
    const popoverHeight = 420;
    const gap = 12;

    let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;
    let top = anchorRect.bottom + gap;

    // Clamp horizontal position
    if (left < 16) left = 16;
    if (left + popoverWidth > viewportWidth - 16) left = viewportWidth - popoverWidth - 16;

    // If not enough space below, show above
    if (top + popoverHeight > viewportHeight - 16) {
        top = anchorRect.top - popoverHeight - gap;
    }

    const content = (
        <div
            ref={popoverRef}
            role="tooltip"
            aria-hidden={!isVisible}
            className={`fixed z-[9999] pointer-events-none transition-all duration-150 ${
                isVisible
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-[0.96] translate-y-1'
            }`}
            style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${popoverWidth}px`,
                transitionTimingFunction: isVisible
                    ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring-like entrance
                    : 'cubic-bezier(0.4, 0, 0.2, 1)',     // Smooth exit
                transitionDuration: isVisible ? '180ms' : '100ms',
            }}
            onMouseEnter={(e) => e.stopPropagation()}
        >
            {/* Glass Panel */}
            <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    boxShadow: `
                        0 0 0 1px rgba(255,255,255,0.06),
                        0 4px 6px -1px rgba(0,0,0,0.3),
                        0 12px 24px -4px rgba(0,0,0,0.4),
                        0 24px 48px -8px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.05)
                    `,
                }}
            >
                {/* Model-tinted gradient edge */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, ${insight.color}15 0%, transparent 50%)`,
                    }}
                />

                {/* Inner glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 opacity-30 pointer-events-none blur-2xl"
                    style={{ background: insight.color }}
                />

                <div className="relative p-5 space-y-4">
                    {/* ─── Header ─────────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${insight.color}15` }}
                        >
                            <Image
                                src={insight.logo}
                                alt={insight.family}
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-base font-semibold text-white tracking-tight">
                                    {insight.name}
                                </h3>
                                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                    {insight.family}
                                </span>
                            </div>
                            <p className="text-[13px] text-white/50 leading-snug mt-0.5">
                                {insight.tagline}
                            </p>
                        </div>
                    </div>

                    {/* ─── How this model thinks ─────────────────────────── */}
                    <div>
                        <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                            How this model thinks
                        </h4>
                        <ul className="space-y-1.5">
                            {insight.howItThinks.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-white/60 leading-relaxed">
                                    <span
                                        className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                                        style={{ backgroundColor: insight.color }}
                                    />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ─── How PRAXIS adapts ─────────────────────────────── */}
                    <div>
                        <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                            How PRAXIS adapts prompts
                        </h4>
                        <ul className="space-y-1.5">
                            {insight.howPraxisAdapts.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-white/60 leading-relaxed">
                                    <span
                                        className="w-1 h-1 rounded-full mt-2 flex-shrink-0 bg-violet-400"
                                    />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ─── Best used for ─────────────────────────────────── */}
                    <div>
                        <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                            Best used for
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {insight.bestFor.map((useCase, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/60 bg-white/[0.04] border border-white/[0.06]"
                                >
                                    {useCase}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}

// ─── WRAPPER COMPONENT WITH HOVER LOGIC ─────────────────────────────────────

interface ModelCardWithInsightProps {
    model: {
        id: string;
        name: string;
        family: string;
        logo: string;
        color: string;
    };
    isSelected: boolean;
    onSelect: () => void;
}

export function ModelCardWithInsight({ model, isSelected, onSelect }: ModelCardWithInsightProps) {
    const [showPopover, setShowPopover] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = useCallback(() => {
        // Clear any pending leave timeout
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }

        // Hover intent detection - 200ms delay before showing
        hoverTimeoutRef.current = setTimeout(() => {
            if (buttonRef.current) {
                setAnchorRect(buttonRef.current.getBoundingClientRect());
                setShowPopover(true);
            }
        }, 200);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Clear any pending show timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Small delay before hiding to prevent flicker
        leaveTimeoutRef.current = setTimeout(() => {
            setShowPopover(false);
        }, 50);
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    // Update position on scroll/resize
    useEffect(() => {
        if (!showPopover) return;

        const updatePosition = () => {
            if (buttonRef.current) {
                setAnchorRect(buttonRef.current.getBoundingClientRect());
            }
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showPopover]);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={onSelect}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                title={`${model.name} — ${model.family}`}
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                    isSelected
                        ? 'bg-white/[0.08] ring-1 ring-white/20'
                        : 'bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
                style={isSelected ? {
                    boxShadow: `0 0 16px -4px ${model.color}40`
                } : {}}
            >
                <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                        isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'
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
                <span
                    className={`text-xs font-medium transition-colors ${
                        isSelected ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                    }`}
                >
                    {model.name}
                </span>
            </button>

            <ModelInsightPopover
                modelId={model.id}
                isVisible={showPopover}
                anchorRect={anchorRect}
                onClose={() => setShowPopover(false)}
            />
        </>
    );
}

export default ModelInsightPopover;
