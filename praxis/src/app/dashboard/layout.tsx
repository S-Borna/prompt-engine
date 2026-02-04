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
    Menu, X, Plus, Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Dashboard Layout
// Dark theme unified with landing page - All interactions verified working
// ═══════════════════════════════════════════════════════════════════════════

const mainNav = [
    { name: 'Spark', href: '/dashboard/spark', icon: Wand2, color: 'text-violet-400', bg: 'bg-violet-500/20', description: 'Instant enhancement' },
    { name: 'Mind Map', href: '/dashboard/mindmap', icon: Brain, color: 'text-pink-400', bg: 'bg-pink-500/20', description: 'Visual ideation' },
    { name: 'Fusion', href: '/dashboard/fusion', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/20', description: 'Multi-step workflows' },
    { name: 'Persona Studio', href: '/dashboard/personas', icon: Palette, color: 'text-orange-400', bg: 'bg-orange-500/20', description: 'AI characters' },
    { name: 'Code Whisper', href: '/dashboard/code', icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-500/20', description: 'Developer mode' },
    { name: 'Precision', href: '/dashboard/precision', icon: Target, color: 'text-red-400', bg: 'bg-red-500/20', description: 'Goal optimizer' },
];

const secondaryNav = [
    { name: 'Library', href: '/dashboard/library', icon: FolderOpen },
    { name: 'History', href: '/dashboard/history', icon: Clock },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

const settingsNav = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
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

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Search Modal Overlay */}
            {showSearch && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                >
                    <div className="flex items-start justify-center pt-32" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSearch} className="w-full max-w-xl mx-4">
                            <div className="bg-[#0f0f17] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
                                <div className="flex items-center px-5 py-4 gap-3">
                                    <Search className="w-5 h-5 text-white/40" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search prompts, templates..."
                                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
                                        autoFocus
                                    />
                                    <kbd className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white/50">ESC</kbd>
                                </div>
                                <div className="px-5 py-3 border-t border-white/5 text-sm text-white/40">
                                    <Info className="w-4 h-4 inline mr-2" />
                                    Search functionality coming soon. Press ESC to close.
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <Link href="/dashboard/spark" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white hidden sm:block">
                                PRAXIS
                            </span>
                        </Link>
                    </div>

                    {/* Search Trigger */}
                    <div className="flex-1 max-w-xl mx-8 hidden md:block">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="w-full flex items-center px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:border-white/20 transition-colors text-left"
                        >
                            <Search className="w-4 h-4 mr-3" />
                            <span className="flex-1">Search prompts, templates...</span>
                            <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs">⌘K</kbd>
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Quick Create */}
                        <button
                            onClick={handleNewPrompt}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-[10px] hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Prompt
                        </button>

                        {/* Notifications - disabled */}
                        <button
                            className="relative p-2.5 text-white/40 rounded-xl cursor-not-allowed"
                            title="Notifications coming soon"
                            disabled
                        >
                            <Bell className="w-5 h-5" />
                        </button>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-xl transition-colors"
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                    {userInitial}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/50 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-[#0f0f17] rounded-xl border border-white/[0.08] shadow-2xl py-2 z-50">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <div className="font-semibold text-white">{userName}</div>
                                        <div className="text-sm text-white/50 truncate">{userEmail}</div>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/5 transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </Link>
                                        <Link
                                            href="/dashboard/billing"
                                            className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/5 transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Billing
                                        </Link>
                                    </div>
                                    <div className="border-t border-white/5 pt-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
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

            {/* Sidebar */}
            <aside className={`fixed left-0 top-[61px] bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 z-40 transform transition-transform lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <nav className="p-4 space-y-6 h-full overflow-y-auto">
                    {/* Main Tools */}
                    <div>
                        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-3">
                            AI Tools
                        </div>
                        <div className="space-y-1">
                            {mainNav.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                            ? `${item.bg} ${item.color} font-semibold`
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? item.bg : 'bg-white/5 group-hover:bg-white/10'
                                            }`}>
                                            <item.icon className={`w-4 h-4 ${isActive ? item.color : 'text-white/50 group-hover:text-white/70'}`} />
                                        </div>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Library & History */}
                    <div>
                        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-3">
                            Your Content
                        </div>
                        <div className="space-y-1">
                            {secondaryNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Settings */}
                    <div>
                        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-3">
                            Account
                        </div>
                        <div className="space-y-1">
                            {settingsNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="mx-3 p-4 bg-violet-500/[0.08] rounded-2xl border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            <span className="font-semibold text-white">Upgrade to Pro</span>
                        </div>
                        <p className="text-sm text-white/50 mb-3">
                            Unlock unlimited prompts & all AI tools
                        </p>
                        <Link
                            href="/dashboard/billing"
                            className="block w-full py-2 text-center bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-[10px] hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-[61px] min-h-screen">
                <div className="p-6 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
