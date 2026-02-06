import { Mail, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPendingPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 blur-2xl opacity-20 rounded-full" />
                        <div className="relative bg-gradient-to-br from-violet-600/10 to-indigo-600/10 p-6 rounded-2xl border border-white/10">
                            <Mail className="w-12 h-12 text-violet-400" />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-white">
                        Check Your Email
                    </h1>
                    <p className="text-white/60 text-lg">
                        We&apos;ve sent a verification link to your email address. Click the link to activate your account.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-start gap-3 text-left">
                        <Clock className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-white/80 text-sm font-medium">
                                Verification link expires in 24 hours
                            </p>
                            <p className="text-white/50 text-xs">
                                If you don&apos;t see the email, check your spam folder
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-indigo-500 transition-all"
                    >
                        I&apos;ve Verified My Email
                    </button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm"
                    >
                        Back to Login
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Help Text */}
                <p className="text-white/40 text-xs pt-4">
                    Didn&apos;t receive the email? Contact{' '}
                    <a href="mailto:support@praxis.app" className="text-violet-400 hover:text-violet-300">
                        support@praxis.app
                    </a>
                </p>
            </div>
        </div>
    );
}
