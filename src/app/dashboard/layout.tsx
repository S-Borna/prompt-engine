'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
    Zap, Wand2, Brain, Layers, Palette, Code, Target,
    FolderOpen, Clock, BarChart3, Settings, CreditCard, Plug,
    Bell, Search, ChevronDown, Sparkles, LogOut,
    Menu, X, Plus, Info, ChevronLeft
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Dashboard Layout — Premium Workspace Shell
// Focused sidebar with "Which AI?" educational panel
// ═══════════════════════════════════════════════════════════════════════════

// Simplified main nav — only Spark
const mainNav = [
    { name: 'Spark', href: '/dashboard/spark', icon: Wand2, color: 'text-violet-400', bg: 'bg-violet-500/20', gradient: 'from-violet-500 to-indigo-600' },
];

// Secondary nav — Library & History only
const secondaryNav = [
    { name: 'Library', href: '/dashboard/library', icon: FolderOpen },
    { name: 'History', href: '/dashboard/history', icon: Clock },
];

// Settings nav — Settings & Billing only
const settingsNav = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

// "Which AI?" Educational content
const aiModelsInfo = [
    {
        name: 'GPT',
        logo: '/logos/openai.svg',
        color: 'from-emerald-500 to-teal-600',
        description: 'Excels at following structured instructions. Prefers explicit step-by-step prompts with clear output formats.',
    },
    {
        name: 'Claude',
        logo: '/logos/anthropic.svg',
        color: 'from-orange-500 to-amber-600',
        description: 'Strong at nuanced reasoning. Benefits from context-rich prompts with conversational framing.',
    },
    {
        name: 'Gemini',
        logo: '/logos/google.svg',
        color: 'from-blue-500 to-indigo-600',
        description: 'Multimodal native. Optimized for prompts combining analysis, code, and creative tasks.',
    },
    {
        name: 'Grok',
        logo: '/logos/xai.svg',
        color: 'from-slate-400 to-zinc-600',
        description: 'Real-time knowledge focus. Responds well to direct, concise queries with current context.',
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Detect desktop viewport for sidebar margin
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Handle keyboard shortcut for search
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

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            toast.success('Signed out successfully');
            router.push('/login');
        } catch {
            toast.error('Failed to sign out');
        }
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            toast('Search coming soon', { icon: '🔍' });
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    // Handle new prompt
    const handleNewPrompt = () => {
        router.push('/dashboard/spark');
        toast.success('Ready to create!');
    };

    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
    const userEmail = session?.user?.email || 'user@example.com';
    const userInitial = userName.charAt(0).toUpperCase();

    // Get current tool info for header
    const currentTool = mainNav.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* ═══════════════════════════════════════════════════════════════
                SEARCH MODAL
            ═══════════════════════════════════════════════════════════════ */}
            {showSearch && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                >
                    <div className="flex items-start justify-center pt-[20vh]" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-4">
                            <div className="bg-[#0f0f12] rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden">
                                <div className="flex items-center px-6 py-5 gap-4">
                                    <Search className="w-5 h-5 text-white/30" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search prompts, templates, history..."
                                        className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none text-lg"
                                        autoFocus
                                    />
                                    <kbd className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white/40">ESC</kbd>
                                </div>
                                <div className="px-6 py-4 border-t border-white/[0.04] text-sm text-white/30 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Search functionality coming soon
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SIDEBAR — Receding navigation
            ═══════════════════════════════════════════════════════════════ */}
            <aside className={`fixed left-0 top-0 bottom-0 z-40 bg-[#09090b] border-r border-white/[0.04] transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
                } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

                {/* Logo */}
                <div className={`h-16 flex items-center border-b border-white/[0.04] ${sidebarCollapsed ? 'justify-center px-0' : 'px-5'}`}>
                    <Link href="/dashboard/spark" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4.5 h-4.5 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <span className="text-lg font-bold text-white tracking-tight">PRAXIS</span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-6 ${sidebarCollapsed ? 'px-3' : 'px-4'}`}>
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
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? 'bg-white/[0.06]'
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
                                        <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80'}`}>
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className={`h-px bg-white/[0.04] mb-4 ${sidebarCollapsed ? 'mx-1' : 'mx-3'}`} />

                    {/* Secondary Nav */}
                    <div className="space-y-1 mb-6">
                        {secondaryNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-white/40 hover:bg-white/[0.03] hover:text-white/60'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Settings Nav */}
                    <div className="space-y-1 mb-6">
                        {settingsNav.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={sidebarCollapsed ? item.name : undefined}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-white/40 hover:bg-white/[0.03] hover:text-white/60'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        "WHICH AI?" EDUCATIONAL PANEL — Always visible
                    ═══════════════════════════════════════════════════════════ */}
                    {!sidebarCollapsed && (
                        <div className="mt-4 pt-4 border-t border-white/[0.04]">
                            <div className="px-3 mb-3">
                                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
                                    Which AI?
                                </h3>
                            </div>
                            <div className="space-y-3 px-2">
                                {aiModelsInfo.map((ai) => (
                                    <div
                                        key={ai.name}
                                        className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${ai.color} flex items-center justify-center`}>
                                                <span className="text-[10px] font-bold text-white">
                                                    {ai.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-white/80">{ai.name}</span>
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-white/40">
                                            {ai.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Collapse Toggle */}
                <div className={`p-4 border-t border-white/[0.04] ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-all"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MAIN WORKSPACE
            ═══════════════════════════════════════════════════════════════ */}
            <div
                className="min-h-screen transition-all duration-300"
                style={{
                    marginLeft: isDesktop ? (sidebarCollapsed ? 72 : 260) : 0,
                }}
            >
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]">
                    <div className="h-full px-6 flex items-center justify-between gap-4">
                        {/* Left: Mobile menu + Current tool */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {currentTool && (
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTool.gradient} flex items-center justify-center`}>
                                        <currentTool.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white">{currentTool.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Center: Search */}
                        <div className="flex-1 max-w-xl">
                            <button
                                onClick={() => setShowSearch(true)}
                                className="w-full flex items-center px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/30 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left text-sm"
                            >
                                <Search className="w-4 h-4 mr-3 flex-shrink-0" />
                                <span className="flex-1 truncate">Search...</span>
                                <kbd className="hidden sm:inline px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white/30">⌘K</kbd>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* New Prompt */}
                            <button
                                onClick={handleNewPrompt}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New</span>
                            </button>

                            {/* Notifications */}
                            <button
                                className="p-2.5 text-white/30 rounded-xl cursor-not-allowed"
                                title="Notifications coming soon"
                                disabled
                            >
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 hover:bg-white/[0.04] rounded-xl transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                        {userInitial}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white/40 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-[#0f0f12] rounded-xl border border-white/[0.06] shadow-2xl py-2 z-50">
                                        <div className="px-4 py-3 border-b border-white/[0.04]">
                                            <div className="font-medium text-white text-sm">{userName}</div>
                                            <div className="text-xs text-white/40 truncate">{userEmail}</div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/dashboard/billing"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Billing
                                            </Link>
                                        </div>
                                        <div className="border-t border-white/[0.04] pt-1">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-[calc(100vh-64px)]">
                    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
