'use client';

import { useEffect } from 'react';
import { Sparkles, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// Route-level Error Boundary
// Catches errors within routes and displays a branded fallback
// ═══════════════════════════════════════════════════════════════════════════

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Route error:', error);
    }, [error]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0f',
                color: 'white',
                padding: '24px',
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        backgroundColor: 'rgb(139,92,246)',
                        opacity: 0.1,
                        filter: 'blur(100px)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '420px',
                    textAlign: 'center',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}
                >
                    <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>

                <h1
                    style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        marginBottom: '10px',
                        color: 'white',
                    }}
                >
                    Oops! Something went wrong
                </h1>

                <p
                    style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.6,
                        marginBottom: '28px',
                    }}
                >
                    We hit an unexpected issue. Please try again — if the problem persists,
                    head back to the home page.
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <button
                        onClick={reset}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw style={{ width: '15px', height: '15px' }} />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                        }}
                    >
                        <Home style={{ width: '15px', height: '15px' }} />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
