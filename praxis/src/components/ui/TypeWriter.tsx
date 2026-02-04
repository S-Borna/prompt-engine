'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL TYPEWRITER — Enhanced Prompt Renderer
// Premium progressive typing animation for all Enhanced Prompt outputs
// Matches landing page demo quality
// ═══════════════════════════════════════════════════════════════════════════

interface TypeWriterProps {
    /** The text to animate */
    text: string;
    /** Characters per second (default: 40 for premium feel) */
    speed?: number;
    /** Called when animation completes */
    onComplete?: () => void;
    /** Whether the animation should be active */
    isActive: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Show blinking cursor during typing */
    showCursor?: boolean;
    /** Cursor color (default: currentColor) */
    cursorColor?: string;
}

export function TypeWriter({
    text,
    speed = 40,
    onComplete,
    isActive,
    className = '',
    showCursor = true,
    cursorColor = 'currentColor',
}: TypeWriterProps) {
    const [displayText, setDisplayText] = useState('');
    const indexRef = useRef(0);
    const completedRef = useRef(false);

    // Reset when text changes or becomes inactive
    useEffect(() => {
        if (!isActive) {
            setDisplayText('');
            indexRef.current = 0;
            completedRef.current = false;
            return;
        }

        // Start animation
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
            {showCursor && isTyping && (
                <span
                    style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1em',
                        backgroundColor: cursorColor,
                        marginLeft: '2px',
                        animation: 'blink 1s step-end infinite',
                        verticalAlign: 'text-bottom',
                    }}
                />
            )}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED PROMPT RENDERER — The Global Output Component
// Use this for ALL Enhanced Prompt outputs across the app
// ═══════════════════════════════════════════════════════════════════════════

interface EnhancedPromptRendererProps {
    /** The enhanced prompt text to display */
    content: string;
    /** Whether to animate (true for new content, false for already-shown) */
    animate: boolean;
    /** Called when animation completes */
    onAnimationComplete?: () => void;
    /** Additional CSS classes for the container */
    className?: string;
    /** Animation speed in characters per second */
    speed?: number;
}

export function EnhancedPromptRenderer({
    content,
    animate,
    onAnimationComplete,
    className = '',
    speed = 50,
}: EnhancedPromptRendererProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showFullContent, setShowFullContent] = useState(!animate);
    const prevContentRef = useRef<string>('');

    // Detect new content and trigger animation
    useEffect(() => {
        if (content && content !== prevContentRef.current) {
            if (animate) {
                setIsAnimating(true);
                setShowFullContent(false);
            } else {
                setShowFullContent(true);
            }
            prevContentRef.current = content;
        }
    }, [content, animate]);

    const handleComplete = useCallback(() => {
        setIsAnimating(false);
        setShowFullContent(true);
        onAnimationComplete?.();
    }, [onAnimationComplete]);

    if (!content) {
        return null;
    }

    return (
        <pre className={`whitespace-pre-wrap font-sans ${className}`}>
            {showFullContent ? (
                content
            ) : (
                <TypeWriter
                    text={content}
                    speed={speed}
                    isActive={isAnimating}
                    onComplete={handleComplete}
                    showCursor={true}
                    cursorColor="rgb(139 92 246 / 0.6)" // violet-500/60
                />
            )}
        </pre>
    );
}

export default TypeWriter;
