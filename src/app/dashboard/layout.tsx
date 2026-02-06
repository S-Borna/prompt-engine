'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
    Wand2, FolderOpen, Clock, Settings, CreditCard,
    Search, ChevronDown, Sparkles, LogOut,
    Menu, X, Plus, ChevronLeft, SlidersHorizontal
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
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

                {/* Collapse Toggle */}
                <div className={`p-3 border-t border-white/[0.04] ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/30 hover:text-white/50 transition-all"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
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

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* New Prompt */}
                            <button
                                onClick={handleNewPrompt}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New</span>
                            </button>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1 hover:bg-white/[0.04] rounded-lg transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                                        {userInitial}
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-white/40 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-[#0c0c0f] rounded-xl border border-white/[0.06] shadow-2xl py-1.5 z-50">
                                        <div className="px-3 py-2 border-b border-white/[0.04]">
                                            <div className="font-medium text-white text-sm">{userName}</div>
                                            <div className="text-xs text-white/40 truncate">{userEmail}</div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:bg-white/[0.04] transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/dashboard/billing"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/60 hover:bg-white/[0.04] transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Billing
                                            </Link>
                                        </div>
                                        <div className="border-t border-white/[0.04] pt-1">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
