'use client';

import { useEffect } from 'react';
import { Sparkles, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// Global Error Boundary - Catches all unhandled errors
// Displays a branded, calm fallback UI instead of raw error screens
// ═══════════════════════════════════════════════════════════════════════════

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error for monitoring (replace with your error tracking service)
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
                        backgroundColor: '#0a0a0f',
                        color: 'white',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        padding: '24px',
                    }}
                >
                    {/* Background glow */}
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            pointerEvents: 'none',
                            overflow: 'hidden',
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
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                            }}
                        >
                            <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
                        </div>

                        <h1
                            style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                marginBottom: '12px',
                                color: 'white',
                            }}
                        >
                            Something went wrong
                        </h1>

                        <p
                            style={{
                                fontSize: '15px',
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: 1.6,
                                marginBottom: '32px',
                            }}
                        >
                            We encountered an unexpected error. Don't worry — your data is safe.
                            Please try again or return to the home page.
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                onClick={reset}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                }}
                            >
                                <RefreshCw style={{ width: '16px', height: '16px' }} />
                                Try Again
                            </button>

                            <Link
                                href="/"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.8)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                }}
                            >
                                <Home style={{ width: '16px', height: '16px' }} />
                                Go Home
                            </Link>
                        </div>

                        {/* Error reference (optional, for support) */}
                        {error.digest && (
                            <p
                                style={{
                                    marginTop: '32px',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.3)',
                                }}
                            >
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
