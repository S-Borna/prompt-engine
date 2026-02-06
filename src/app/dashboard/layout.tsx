'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
    Wand2, FolderOpen, Clock, Settings, CreditCard,
    Search, Sparkles, LogOut,
    Menu, X, Plus, ChevronLeft, SlidersHorizontal,
    Crown, Zap, AlertTriangle, ArrowUpRight
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Dashboard Layout — Premium Post-Login Experience
// Calm, spacious, intentional — feels like one continuous product surface
// ═══════════════════════════════════════════════════════════════════════════

// Navigation structure — minimal, purposeful
const mainNav = [
    {
        name: 'Improve Prompt',
        href: '/dashboard/spark',
        icon: Wand2,
        gradient: 'from-violet-500 to-indigo-600',
        description: 'One-click prompt enhancement'
    },
    {
        name: 'Refine Prompt',
        href: '/dashboard/precision',
        icon: SlidersHorizontal,
        gradient: 'from-indigo-500 to-blue-600',
        description: 'Guided step-by-step refinement'
    },
];

const secondaryNav = [
    { name: 'Library', href: '/dashboard/library', icon: FolderOpen },
    { name: 'History', href: '/dashboard/history', icon: Clock },
];

const settingsNav = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDesktop, setIsDesktop] = useState(false);
    const [livePromptsUsed, setLivePromptsUsed] = useState<number | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Detect desktop viewport
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
                setTimeout(() => searchRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Listen for real-time prompt usage updates from Spark/Precision
    useEffect(() => {
        const handleUsageUpdate = (e: CustomEvent) => {
            if (e.detail?.promptsUsed !== undefined) {
                setLivePromptsUsed(e.detail.promptsUsed);
            }
        };
        window.addEventListener('praxis:usage-update', handleUsageUpdate as EventListener);
        return () => window.removeEventListener('praxis:usage-update', handleUsageUpdate as EventListener);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            toast.success('Signed out successfully');
            router.push('/login');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            toast('Search coming soon', { icon: '🔍' });
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    const handleNewPrompt = () => {
        router.push('/dashboard/spark');
        toast.success('Ready to create!');
    };

    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
    const userEmail = session?.user?.email || 'user@example.com';
    const userInitial = userName.charAt(0).toUpperCase();
    const userTier = (session?.user as Record<string, unknown>)?.tier as string || 'FREE';
    const promptsUsed = livePromptsUsed ?? (Number((session?.user as Record<string, unknown>)?.promptsUsed) || 0);
    const trialEndsAt = (session?.user as Record<string, unknown>)?.trialEndsAt as string | null;
    const isCreator = userTier === 'CREATOR';
    const isPaid = ['CREATOR', 'PRO', 'TEAM', 'ENTERPRISE'].includes(userTier);
    const TRIAL_LIMIT = 100;
    const promptsRemaining = isPaid ? Infinity : Math.max(0, TRIAL_LIMIT - promptsUsed);

    // Trial countdown — days remaining
    const trialDaysLeft = (() => {
        if (isPaid || !trialEndsAt) return null;
        const diff = new Date(trialEndsAt).getTime() - Date.now();
        if (diff <= 0) return 0;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    })();
    const trialExpired = trialDaysLeft !== null && trialDaysLeft <= 0;

    // Tier display config
    const tierConfig: Record<string, { label: string; gradient: string; icon: typeof Crown; glow: string }> = {
        CREATOR: { label: 'Creator', gradient: 'from-amber-400 via-yellow-500 to-orange-500', icon: Crown, glow: 'shadow-amber-500/30' },
        PRO: { label: 'Pro', gradient: 'from-violet-500 to-indigo-600', icon: Zap, glow: 'shadow-violet-500/20' },
        TEAM: { label: 'Team', gradient: 'from-blue-500 to-cyan-500', icon: Zap, glow: 'shadow-blue-500/20' },
        ENTERPRISE: { label: 'Enterprise', gradient: 'from-emerald-500 to-teal-600', icon: Crown, glow: 'shadow-emerald-500/20' },
        FREE: { label: 'Free Trial', gradient: 'from-zinc-500 to-zinc-600', icon: Zap, glow: '' },
    };
    const tier = tierConfig[userTier] || tierConfig.FREE;
    const TierIcon = tier.icon;

    // Counter warning state
    const counterWarning = promptsRemaining <= 3 ? 'critical' : promptsRemaining <= 10 ? 'warning' : promptsRemaining <= 20 ? 'notice' : 'normal';

    const currentTool = mainNav.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* ═══════════════════════════════════════════════════════════════
                SEARCH MODAL — Command palette style
            ═══════════════════════════════════════════════════════════════ */}
            {showSearch && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                >
                    <div className="flex items-start justify-center pt-[20vh]" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSearch} className="w-full max-w-xl mx-4">
                            <div className="bg-[#0c0c0f] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
                                <div className="flex items-center px-5 py-4 gap-4">
                                    <Search className="w-5 h-5 text-white/30" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search prompts, templates..."
                                        className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-base"
                                        autoFocus
                                    />
                                    <kbd className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded text-xs text-white/40">ESC</kbd>
                                </div>
                                <div className="px-5 py-3 border-t border-white/[0.04] text-xs text-white/30">
                                    Search functionality coming soon
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SIDEBAR — Elegant, minimal, visually secondary
            ═══════════════════════════════════════════════════════════════ */}
            <aside className={`fixed left-0 top-0 bottom-0 z-40 bg-[#09090b] border-r border-white/[0.06] transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
                } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                {/* Logo */}
                <div className={`h-14 flex items-center border-b border-white/[0.04] ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                    <Link href="/dashboard/spark" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <span className="text-base font-bold tracking-tight">PRAXIS</span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-5 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                    {/* Main Tools */}
                    <div className="space-y-1 mb-6">
                        {mainNav.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-white/[0.05]'
                                        : 'hover:bg-white/[0.03]'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive
                                        ? `bg-gradient-to-br ${item.gradient}`
                                        : 'bg-white/[0.04] group-hover:bg-white/[0.06]'
                                        }`}>
                                        <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`} />
                                    </div>
                                    {!sidebarCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm block ${isActive ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80'}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className={`h-px bg-white/[0.04] mb-4 ${sidebarCollapsed ? 'mx-1' : 'mx-2'}`} />

                    {/* Secondary Nav */}
                    <div className="space-y-0.5 mb-6">
                        {!sidebarCollapsed && (
                            <div className="px-3 mb-2">
                                <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Library</span>
                            </div>
                        )}
                        {secondaryNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-white/[0.04] text-white'
                                        : 'text-white/40 hover:bg-white/[0.02] hover:text-white/60'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Settings Nav */}
                    <div className="space-y-0.5">
                        {!sidebarCollapsed && (
                            <div className="px-3 mb-2">
                                <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Account</span>
                            </div>
                        )}
                        {settingsNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-white/[0.04] text-white'
                                        : 'text-white/40 hover:bg-white/[0.02] hover:text-white/60'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* ═══════════════════════════════════════════════════════
                    PROFILE CARD + PROMPT COUNTER — Sidebar bottom
                ═══════════════════════════════════════════════════════ */}
                <div className={`border-t border-white/[0.04] ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
                    {/* Trial Info — Only for free users */}
                    {!isPaid && !sidebarCollapsed && (
                        <div className={`mb-3 rounded-xl p-3 transition-all duration-500 ${trialExpired
                            ? 'bg-red-500/10 border border-red-500/20'
                            : counterWarning === 'critical'
                                ? 'bg-red-500/10 border border-red-500/20 animate-pulse'
                                : counterWarning === 'warning'
                                    ? 'bg-amber-500/10 border border-amber-500/15'
                                    : counterWarning === 'notice'
                                        ? 'bg-amber-500/[0.06] border border-amber-500/10'
                                        : 'bg-white/[0.02] border border-white/[0.04]'
                            }`}>
                            {/* Trial days countdown */}
                            {trialDaysLeft !== null && (
                                <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b border-white/[0.04]">
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${trialExpired ? 'text-red-400' : trialDaysLeft <= 2 ? 'text-amber-400' : 'text-white/40'}`}>
                                        Free Trial
                                    </span>
                                    {trialExpired ? (
                                        <span className="text-xs font-bold text-red-400">Expired</span>
                                    ) : (
                                        <span className={`text-xs font-bold tabular-nums ${trialDaysLeft <= 2 ? 'text-amber-400' : 'text-white/60'}`}>
                                            {trialDaysLeft}d left
                                        </span>
                                    )}
                                </div>
                            )}
                            {/* Prompt counter */}
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${counterWarning === 'critical' ? 'text-red-400' :
                                    counterWarning === 'warning' ? 'text-amber-400' : 'text-white/40'
                                    }`}>
                                    Prompts Remaining
                                </span>
                                <span className={`text-lg font-bold tabular-nums ${counterWarning === 'critical' ? 'text-red-400' :
                                    counterWarning === 'warning' ? 'text-amber-400' :
                                        counterWarning === 'notice' ? 'text-amber-300' : 'text-white/80'
                                    }`}>
                                    {promptsRemaining}
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${counterWarning === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                        counterWarning === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                            counterWarning === 'notice' ? 'bg-gradient-to-r from-amber-500/70 to-yellow-400' :
                                                'bg-gradient-to-r from-violet-500 to-indigo-500'
                                        }`}
                                    style={{ width: `${Math.max(2, (promptsRemaining / TRIAL_LIMIT) * 100)}%` }}
                                />
                            </div>
                            {/* Warning messages */}
                            {counterWarning === 'critical' && (
                                <div className="flex items-start gap-1.5 mt-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-300/90 leading-snug">
                                        Only <strong>{promptsRemaining}</strong> left! Upgrade now to keep creating.
                                    </p>
                                </div>
                            )}
                            {counterWarning === 'warning' && (
                                <div className="flex items-start gap-1.5 mt-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-300/80 leading-snug">
                                        Running low — upgrade for unlimited prompts.
                                    </p>
                                </div>
                            )}
                            {counterWarning === 'notice' && (
                                <p className="text-[11px] text-white/40 leading-snug">
                                    Enjoying Praxis? Go Pro for unlimited access.
                                </p>
                            )}
                            {(counterWarning === 'critical' || counterWarning === 'warning') && (
                                <Link
                                    href="/dashboard/billing"
                                    className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    Upgrade to Pro
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Prompt counter — collapsed sidebar (minimal) */}
                    {!isPaid && sidebarCollapsed && (
                        <div className="mb-2 flex justify-center" title={`${promptsRemaining} prompts remaining`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums ${counterWarning === 'critical' ? 'bg-red-500/15 text-red-400 animate-pulse' :
                                counterWarning === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                                    'bg-white/[0.04] text-white/50'
                                }`}>
                                {promptsRemaining}
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    <div className={`rounded-xl transition-all duration-200 ${sidebarCollapsed
                        ? 'flex flex-col items-center gap-2'
                        : `p-3 ${isCreator ? 'bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] border border-amber-500/10' : 'bg-white/[0.02] border border-white/[0.04]'}`
                        }`}>
                        {/* Avatar + Info */}
                        <div className={`flex items-center ${sidebarCollapsed ? 'flex-col' : 'gap-3'}`}>
                            <div className={`relative flex-shrink-0 ${sidebarCollapsed ? '' : ''}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${isCreator
                                    ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                                    : `bg-gradient-to-br ${tier.gradient} text-white`
                                    }`}>
                                    {userInitial}
                                </div>
                                {/* Tier badge dot */}
                                {isPaid && (
                                    <div className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center ring-2 ring-[#09090b]`}>
                                        <TierIcon className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </div>

                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-white truncate">{userName}</span>
                                        {isPaid && (
                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${tier.gradient} text-white shadow-sm ${tier.glow}`}>
                                                <TierIcon className="w-2.5 h-2.5" />
                                                {tier.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-white/35 truncate mt-0.5">{userEmail}</div>
                                    {isCreator && (
                                        <div className="text-[10px] text-amber-400/60 mt-0.5">Unlimited access</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions — expanded only */}
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/[0.04]">
                                <Link
                                    href="/dashboard/settings"
                                    className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.03] rounded-md transition-all"
                                >
                                    <Settings className="w-3 h-3" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 text-[11px] text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-all"
                                >
                                    <LogOut className="w-3 h-3" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Collapse Toggle */}
                    <div className={`mt-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/30 hover:text-white/50 transition-all"
                        >
                            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MAIN WORKSPACE — Dominant, spacious, focused
            ═══════════════════════════════════════════════════════════════ */}
            <div
                className="min-h-screen transition-all duration-300"
                style={{
                    marginLeft: isDesktop ? (sidebarCollapsed ? 68 : 240) : 0,
                }}
            >
                {/* Top Bar — Minimal, functional */}
                <header className="sticky top-0 z-30 h-20 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.06]">
                    <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
                        {/* Left: Mobile menu + Current tool */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {currentTool && (
                                <div className="hidden sm:flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentTool.gradient} flex items-center justify-center`}>
                                        <currentTool.icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white">{currentTool.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Center: Page Title */}
                        <div className="flex-1 hidden sm:flex flex-col items-center justify-center text-center">
                            <h1 className="text-3xl font-semibold text-white tracking-tight">
                                Transform your prompts
                            </h1>
                            <p className="text-white/50 text-sm mt-1">
                                Select your AI model, paste any prompt, and see the difference in action
                            </p>
                        </div>

                        {/* Right: New Prompt */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNewPrompt}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content — Spacious, focused */}
                <main className="min-h-[calc(100vh-80px)]">
                    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
