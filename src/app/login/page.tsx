'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Github, AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Login - Unified dark theme matching landing page
// Clean, confident, premium authentication experience
// ═══════════════════════════════════════════════════════════════════════════

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password. Please try again.');
                toast.error('Sign in failed');
            } else {
                toast.success('Welcome back!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Something went wrong. Please try again in a moment.');
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'github' | 'google') => {
        setIsLoading(true);
        setError('');
        try {
            await signIn(provider, { callbackUrl: '/dashboard' });
        } catch (err) {
            setError('Could not connect to ' + provider + '. Please try again.');
            toast.error('OAuth sign in failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white' }}>
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', width: '500px', height: '500px',
                    backgroundColor: 'rgb(139,92,246)', opacity: 0.12,
                    filter: 'blur(100px)', top: '-100px', left: '-100px'
                }} />
                <div style={{
                    position: 'absolute', width: '400px', height: '400px',
                    backgroundColor: 'rgb(59,130,246)', opacity: 0.08,
                    filter: 'blur(100px)', bottom: '-100px', right: '-100px'
                }} />
            </div>

            {/* Header */}
            <header style={{
                position: 'relative', zIndex: 50,
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>PRAXIS</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                position: 'relative', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 'calc(100vh - 70px)', padding: '40px 24px'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                            Welcome back
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
                            Don't have an account?{' '}
                            <Link href="/signup" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>
                                Sign up free
                            </Link>
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div style={{
                            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '14px 16px', backgroundColor: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px'
                        }}>
                            <AlertCircle style={{ width: '18px', height: '18px', color: '#f87171', flexShrink: 0 }} />
                            <span style={{ fontSize: '14px', color: '#fca5a5' }}>{error}</span>
                        </div>
                    )}

                    {/* OAuth Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <button
                            onClick={() => handleOAuthSignIn('github')}
                            disabled={isLoading}
                            type="button"
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            <Github style={{ width: '18px', height: '18px' }} />
                            GitHub
                        </button>
                        <button
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={isLoading}
                            type="button"
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            <GoogleIcon />
                            Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'
                    }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>or</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                    width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                    autoComplete="email"
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 44px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                        color: 'white', fontSize: '15px', outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{
                                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                    width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%', padding: '14px 44px 14px 44px',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                        color: 'white', fontSize: '15px', outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0
                                    }}
                                >
                                    {showPassword
                                        ? <EyeOff style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)' }} />
                                        : <Eye style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.4)' }} />
                                    }
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%', padding: '14px 24px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                border: 'none', borderRadius: '10px',
                                color: 'white', fontSize: '15px', fontWeight: 600,
                                cursor: isLoading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? (
                                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight style={{ width: '18px', height: '18px' }} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo hint */}
                    <div style={{
                        marginTop: '24px', padding: '14px 16px',
                        backgroundColor: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                            <strong style={{ color: '#a78bfa' }}>Demo mode:</strong> Use any email to explore
                        </p>
                    </div>

                    {/* Terms */}
                    <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        By signing in, you agree to our{' '}
                        <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                </div>
            </main>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: rgba(139,92,246,0.5); background-color: rgba(255,255,255,0.08); }
        button:hover:not(:disabled) { opacity: 0.9; }
      `}</style>
        </div>
    );
}
