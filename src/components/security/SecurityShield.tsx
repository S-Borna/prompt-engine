// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS SECURITY SHIELD — CLIENT-SIDE PROTECTION
// ═══════════════════════════════════════════════════════════════════════════
//
// PROTECTION LAYERS:
//   1. DevTools detection and soft warning
//   2. Context menu protection for sensitive content
//   3. Console obfuscation
//   4. Copy protection for premium outputs
//   5. Network request monitoring
//
// BEHAVIORAL RULES:
//   - Non-invasive: warn, don't block aggressively
//   - Developer-friendly: allow debugging in dev mode
//   - Professional: no annoying popups
//
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SecurityShieldProps {
    /** Enable DevTools detection */
    enableDevToolsDetection?: boolean;
    /** Enable context menu protection */
    enableContextMenuProtection?: boolean;
    /** Enable console obfuscation */
    enableConsoleProtection?: boolean;
    /** Custom warning message */
    warningMessage?: string;
}

export function SecurityShield({
    enableDevToolsDetection = true,
    enableContextMenuProtection = true,
    enableConsoleProtection = true,
    warningMessage = 'Developer tools detected. Unauthorized scraping or copying of PRAXIS content is prohibited.',
}: SecurityShieldProps) {
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // Only enable in production
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // 1. DEVTOOLS DETECTION
        // ═══════════════════════════════════════════════════════════════════
        if (enableDevToolsDetection) {
            let devToolsCheckInterval: NodeJS.Timeout;

            const detectDevTools = () => {
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;
                
                // Timing-based detection (devtools slows down execution)
                const start = performance.now();
                debugger; // This line is intentionally left - it pauses in devtools
                const end = performance.now();
                const timingDetection = end - start > 100;

                if (widthThreshold || heightThreshold || timingDetection) {
                    if (!devToolsOpen) {
                        setDevToolsOpen(true);
                        setShowWarning(true);
                        
                        // Log warning to console
                        console.clear();
                        console.log(
                            '%c⚠️ WARNING',
                            'color: #ef4444; font-size: 24px; font-weight: bold;'
                        );
                        console.log(
                            '%c' + warningMessage,
                            'color: #f97316; font-size: 14px;'
                        );
                        console.log(
                            '%cAccess to PRAXIS API and content is monitored and logged.',
                            'color: #64748b; font-size: 12px;'
                        );
                    }
                } else {
                    setDevToolsOpen(false);
                }
            };

            // Check every 1 second
            devToolsCheckInterval = setInterval(detectDevTools, 1000);
            detectDevTools(); // Initial check

            return () => clearInterval(devToolsCheckInterval);
        }
    }, [enableDevToolsDetection, devToolsOpen, warningMessage]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // 2. CONTEXT MENU PROTECTION
        // ═══════════════════════════════════════════════════════════════════
        if (enableContextMenuProtection) {
            const handleContextMenu = (e: MouseEvent) => {
                // Allow context menu on input/textarea
                const target = e.target as HTMLElement;
                if (
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable
                ) {
                    return;
                }

                // Block on sensitive content
                if (target.closest('[data-protected="true"]')) {
                    e.preventDefault();
                    return false;
                }
            };

            document.addEventListener('contextmenu', handleContextMenu);
            return () => document.removeEventListener('contextmenu', handleContextMenu);
        }
    }, [enableContextMenuProtection]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // 3. CONSOLE PROTECTION (OBFUSCATION)
        // ═══════════════════════════════════════════════════════════════════
        if (enableConsoleProtection) {
            // Overwrite console methods to prevent scraping via console
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;

            console.log = function (...args: any[]) {
                // Filter out sensitive data
                const filtered = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        return '[Protected Object]';
                    }
                    return arg;
                });
                originalLog.apply(console, filtered);
            };

            console.warn = (...args: any[]) => {
                originalWarn.apply(console, args);
            };

            console.error = (...args: any[]) => {
                originalError.apply(console, args);
            };

            return () => {
                console.log = originalLog;
                console.warn = originalWarn;
                console.error = originalError;
            };
        }
    }, [enableConsoleProtection]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // ═══════════════════════════════════════════════════════════════════
        // 4. KEYBOARD SHORTCUT PROTECTION
        // ═══════════════════════════════════════════════════════════════════
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 5000);
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-dismiss warning after 10 seconds
    useEffect(() => {
        if (showWarning) {
            const timer = setTimeout(() => setShowWarning(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [showWarning]);

    // Don't render in development
    if (process.env.NODE_ENV !== 'production') {
        return null;
    }

    return (
        <>
            {/* Warning Toast */}
            {showWarning && (
                <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-4">
                    <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-lg shadow-2xl border border-white/10 max-w-md">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-sm mb-1">Security Notice</p>
                                <p className="text-xs text-white/90 leading-relaxed">
                                    Developer tools detected. Unauthorized access or scraping is monitored and may result in account termination.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Watermark (subtle) */}
            {devToolsOpen && (
                <div className="fixed bottom-2 right-2 z-[9998] pointer-events-none">
                    <div className="text-[8px] text-white/10 font-mono">
                        Protected by PRAXIS Security
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * Hook for protecting specific content areas
 */
export function useContentProtection() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        // Disable text selection on protected elements
        const style = document.createElement('style');
        style.textContent = `
            [data-protected="true"] {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-touch-callout: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);
}

/**
 * Utility: Mark content as protected
 */
export function protectContent(elementId: string) {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute('data-protected', 'true');
    }
}
