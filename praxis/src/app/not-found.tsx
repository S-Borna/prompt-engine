import Link from 'next/link';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Custom 404 Not Found Page - Branded
// ═══════════════════════════════════════════════════════════════════════════

export default function NotFound() {
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
                        margin: '0 auto 24px',
                    }}
                >
                    <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>

                {/* 404 Display */}
                <div
                    style={{
                        fontSize: '80px',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        marginBottom: '16px',
                    }}
                >
                    404
                </div>

                <h1
                    style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        marginBottom: '10px',
                        color: 'white',
                    }}
                >
                    Page not found
                </h1>

                <p
                    style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.6,
                        marginBottom: '28px',
                    }}
                >
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            textDecoration: 'none',
                        }}
                    >
                        <Home style={{ width: '16px', height: '16px' }} />
                        Go Home
                    </Link>

                    <Link
                        href="/dashboard"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '10px',
                            textDecoration: 'none',
                        }}
                    >
                        <ArrowLeft style={{ width: '16px', height: '16px' }} />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
