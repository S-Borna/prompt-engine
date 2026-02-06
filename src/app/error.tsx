'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// Route-Level Error Boundary — Warm, humorous fallback for page-level errors
// ═══════════════════════════════════════════════════════════════════════════

const MESSAGES = [
    { emoji: '🧪', text: "Vi blandade ihop promptformeln — tillbaka till labbet!" },
    { emoji: '🤖', text: "AI:n tog en kafferast. Vi drar tillbaka den." },
    { emoji: '🧵', text: "Tappade tråden — vi syr ihop det igen." },
    { emoji: '🔮', text: "Vår kristallkula buggade. Kalibrerar om..." },
    { emoji: '🎯', text: "Vi missade målet — siktar om." },
];

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.error('Page error caught:', error);
    }, [error]);

    return (
        <div
            style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.4s ease',
            }}
        >
            <div style={{ maxWidth: '440px', textAlign: 'center' }}>
                {/* Animated emoji */}
                <div style={{ fontSize: '48px', marginBottom: '24px', animation: 'errBounce 2s ease-in-out infinite' }}>
                    {msg.emoji}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                    Hoppsan!
                </h2>

                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '4px' }}>
                    {msg.text}
                </p>

                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: '28px' }}>
                    Vi vet om det och fixar det. Din data är helt säker.
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
                    <button
                        onClick={reset}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', fontSize: '14px', fontWeight: 600,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white', border: 'none', borderRadius: '10px',
                            cursor: 'pointer', transition: 'transform 0.15s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        🔄 Försök igen
                    </button>

                    <Link
                        href="/dashboard"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', fontSize: '14px', fontWeight: 500,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', textDecoration: 'none',
                            transition: 'background 0.15s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                    >
                        📊 Dashboard
                    </Link>

                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', fontSize: '14px', fontWeight: 500,
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
                    </Link>
                </div>

                {/* Status badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
                        <span style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            backgroundColor: '#4ade80', opacity: 0.6,
                            animation: 'errPing 1.5s cubic-bezier(0,0,0.2,1) infinite',
                        }} />
                        <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Teamet är på det</span>
                </div>

                {error.digest && (
                    <p style={{ marginTop: '16px', fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.15)' }}>
                        Ref: {error.digest}
                    </p>
                )}
            </div>

            <style>{`
                @keyframes errBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes errPing {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
