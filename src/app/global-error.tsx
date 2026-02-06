'use client';

import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Global Error Boundary — Warm, humorous fallback for total crashes
// No external imports (lucide, Link, etc.) since the entire app is down
// ═══════════════════════════════════════════════════════════════════════════

const QUOTES = [
    "Even the best prompts need a second try sometimes.",
    "Our servers are doing their version of 'thinking...'",
    "Plot twist: the AI needed a prompt to fix itself.",
    "We're rewriting the error prompt as we speak.",
    "This is what happens when you skip the constraints section.",
];

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    useEffect(() => {
        console.error('Global error caught:', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0 }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#050507',
                        color: 'white',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        padding: '24px',
                        WebkitFontSmoothing: 'antialiased',
                    }}
                >
                    {/* Background glow */}
                    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', width: '500px', height: '500px',
                            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                            top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                        }} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '460px', textAlign: 'center' }}>
                        {/* Animated logo */}
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '18px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 28px', fontSize: '32px',
                            boxShadow: '0 0 60px rgba(139,92,246,0.2)',
                        }}>
                            ✦
                        </div>

                        <h1 style={{
                            fontSize: '26px', fontWeight: 700, marginBottom: '8px',
                            color: '#ffffff', letterSpacing: '-0.3px',
                        }}>
                            Oops, vi snubblade
                        </h1>

                        <p style={{
                            fontSize: '15px', color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.7, marginBottom: '8px',
                        }}>
                            Något gick fel på vår sida — inte din. Vi är medvetna om det och jobbar
                            för fullt med att fixa det. Håll ut! 💪
                        </p>

                        {/* Humorous quote */}
                        <p style={{
                            fontSize: '13px', fontStyle: 'italic',
                            color: 'rgba(139,92,246,0.6)', marginBottom: '32px',
                            lineHeight: 1.5,
                        }}>
                            &ldquo;{quote}&rdquo;
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={reset}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 28px', fontSize: '14px', fontWeight: 600,
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', transition: 'transform 0.15s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                🔄 Försök igen
                            </button>

                            <a
                                href="/"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 28px', fontSize: '14px', fontWeight: 500,
                                    backgroundColor: 'rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px', textDecoration: 'none',
                                    transition: 'background 0.15s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                            >
                                🏠 Startsidan
                            </a>
                        </div>

                        {/* Status note */}
                        <div style={{
                            marginTop: '40px', padding: '16px 20px',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                        }}>
                            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                                🟢 Teamet har fått notis och tittar på det. Din data är trygg.
                                {error.digest && (
                                    <span style={{ display: 'block', marginTop: '6px', fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                                        Ref: {error.digest}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
