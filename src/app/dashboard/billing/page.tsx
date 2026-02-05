'use client';

import { useState } from 'react';
import {
    CreditCard, Check, Zap, Star, Crown,
    ArrowRight, Shield, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// BILLING - Subscription & Plans
// No fake payment data - honest empty states
// ═══════════════════════════════════════════════════════════════════════════

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        icon: Zap,
        color: 'gray',
        features: [
            '50 prompts/month',
            'Basic enhancement',
            'Spark & Mind Map access',
            'Community support',
        ],
        cta: 'Current Plan',
        disabled: true,
        current: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 19,
        period: 'month',
        icon: Star,
        color: 'violet',
        popular: true,
        features: [
            '1,000 prompts/month',
            'All 6 AI tools',
            'Advanced personas',
            'Fusion workflows',
            'Priority support',
            'API access',
        ],
        cta: 'Coming Soon',
        comingSoon: true,
    },
    {
        id: 'team',
        name: 'Team',
        price: 49,
        period: 'user/month',
        icon: Crown,
        color: 'amber',
        features: [
            'Unlimited prompts',
            'Everything in Pro',
            'Team workspaces',
            'Admin dashboard',
            'SSO & SAML',
            'Dedicated support',
        ],
        cta: 'Coming Soon',
        comingSoon: true,
    },
];

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const planColors: Record<string, { bg: string; text: string; gradient: string; shadow: string }> = {
        gray: { bg: 'bg-white/10', text: 'text-white/60', gradient: 'from-gray-500 to-gray-600', shadow: '' },
        violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
        amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
    };

    const handlePlanClick = (planId: string) => {
        if (planId === 'free') return;
        toast('Paid plans coming soon!', { icon: '🚀' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">Billing</h1>
                        <p className="text-white/40 text-sm">Manage your subscription and payment</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.02] rounded-lg p-1 border border-white/[0.06]">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white/[0.08] text-white' : 'text-white/40'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white/[0.08] text-white' : 'text-white/40'}`}
                        >
                            Yearly <span className="text-emerald-400">-20%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Plan Banner */}
            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-white/40 text-xs mb-0.5">Current Plan</p>
                            <h2 className="text-xl font-semibold text-white">Free</h2>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/40 text-xs mb-0.5">No usage limits in demo</p>
                        <p className="text-sm font-medium text-white/70">Explore freely</p>
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const colors = planColors[plan.color];
                    const yearlyPrice = Math.round(plan.price * 0.8);
                    const displayPrice = billingCycle === 'yearly' ? yearlyPrice : plan.price;

                    return (
                        <div
                            key={plan.id}
                            className={`bg-white/5 rounded-2xl border-2 p-6 relative ${plan.popular ? 'border-violet-500' : 'border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                    <plan.icon className={`w-6 h-6 ${colors.text}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">${displayPrice}</span>
                                {plan.price > 0 && (
                                    <span className="text-white/50">/{plan.period}</span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center`}>
                                            <Check className={`w-3 h-3 ${colors.text}`} />
                                        </div>
                                        <span className="text-white/70">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePlanClick(plan.id)}
                                disabled={plan.disabled || plan.current}
                                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${plan.current
                                    ? 'bg-white/5 text-white/40 cursor-default'
                                    : plan.comingSoon
                                        ? 'bg-white/10 text-white/60 cursor-not-allowed'
                                        : `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.shadow}`
                                    }`}
                            >
                                {plan.cta}
                                {!plan.disabled && !plan.comingSoon && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* No Payment Method Message */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-white/40" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Payment Method</h3>
                        <p className="text-white/50 mb-4">
                            No payment method required for the free plan. When paid plans launch, you&apos;ll be able to add your payment details here.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/40">
                            <Info className="w-4 h-4" />
                            <span>Secure payments via Stripe (coming soon)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enterprise CTA */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/30 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Need Enterprise?</h3>
                            <p className="text-white/60">Custom pricing, dedicated support, and advanced security.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toast('Enterprise contact form coming soon!', { icon: '📧' })}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-400 font-semibold rounded-xl hover:bg-amber-500/30 border border-amber-500/30"
                    >
                        <Shield className="w-5 h-5" />
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    );
}
