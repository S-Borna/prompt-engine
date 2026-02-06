'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    History, Search, Calendar, Filter, Sparkles, Target,
    Code, Users, GitBranch, Zap, Clock, ChevronRight,
    Copy, Star, Trash2, RotateCcw, FileText, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore, HistoryItem } from '@/lib/prompt-store';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY - Activity Timeline (Postgres-backed + localStorage fallback)
// ═══════════════════════════════════════════════════════════════════════════

interface DbPrompt {
    id: string;
    title: string;
    originalPrompt: string;
    enhancedPrompt: string;
    sections: {
        expertRole: string;
        mainObjective: string;
        approachGuidelines: string;
        outputFormat: string;
    };
    tags: string[];
    tool: string;
    platform: string | null;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

const toolConfig = {
    spark: { name: 'Spark', icon: Zap, gradient: 'from-violet-500 to-purple-600' },
    mindmap: { name: 'Mind Map', icon: GitBranch, gradient: 'from-cyan-500 to-cyan-600' },
    fusion: { name: 'Fusion', icon: Sparkles, gradient: 'from-blue-500 to-blue-600' },
    personas: { name: 'Personas', icon: Users, gradient: 'from-pink-500 to-pink-600' },
    code: { name: 'Code Whisper', icon: Code, gradient: 'from-emerald-500 to-emerald-600' },
    precision: { name: 'Precision', icon: Target, gradient: 'from-red-500 to-red-600' },
    manual: { name: 'Manual', icon: FileText, gradient: 'from-gray-500 to-gray-600' },
};

export default function HistoryPage() {
    const router = useRouter();
    const { history, clearHistory, addPrompt } = usePromptStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    // ── Postgres-backed prompt history ──────────────────────────────
    const [dbPrompts, setDbPrompts] = useState<DbPrompt[]>([]);
    const [isLoadingDb, setIsLoadingDb] = useState(true);

    useEffect(() => {
        async function fetchPrompts() {
            try {
                const params = new URLSearchParams({ limit: '200' });
                if (selectedTool) params.set('tool', selectedTool);
                if (searchQuery) params.set('search', searchQuery);

                const res = await fetch(`/api/prompts?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setDbPrompts(data.prompts || []);
                }
            } catch (e) {
                console.warn('Failed to fetch prompts from DB:', e);
            } finally {
                setIsLoadingDb(false);
            }
        }
        fetchPrompts();
    }, [selectedTool, searchQuery]);

    // ── Merge DB prompts into timeline-style items ──────────────────
    const dbAsHistory: HistoryItem[] = useMemo(() => {
        return dbPrompts.map((p) => ({
            id: p.id,
            tool: p.tool || 'spark',
            action: p.tool === 'precision' ? 'Prompt refined' : 'Prompt improved',
            input: p.originalPrompt || p.title || '',
            output: p.enhancedPrompt || '',
            timestamp: p.createdAt,
            metadata: { platform: p.platform || undefined },
        }));
    }, [dbPrompts]);

    // Combine: DB prompts first (authoritative), then local-only history items
    const mergedHistory = useMemo(() => {
        const dbIds = new Set(dbAsHistory.map(i => i.id));
        const localOnly = history.filter(item => !dbIds.has(item.id));
        return [...dbAsHistory, ...localOnly];
    }, [dbAsHistory, history]);

    const filteredHistory = useMemo(() => {
        return mergedHistory.filter(item => {
            const matchesSearch = searchQuery === '' ||
                item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.output.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTool = !selectedTool || item.tool === selectedTool;
            return matchesSearch && matchesTool;
        });
    }, [mergedHistory, searchQuery, selectedTool]);

    // Group by date
    const groupedHistory = useMemo(() => {
        const groups: Record<string, HistoryItem[]> = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        filteredHistory.forEach(item => {
            const itemDate = new Date(item.timestamp);
            const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

            let dateLabel: string;
            if (itemDay.getTime() === today.getTime()) {
                dateLabel = 'Today';
            } else if (itemDay.getTime() === yesterday.getTime()) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            if (!groups[dateLabel]) groups[dateLabel] = [];
            groups[dateLabel].push(item);
        });

        return groups;
    }, [filteredHistory]);

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleCopyOutput = (output: string) => {
        navigator.clipboard.writeText(output);
        toast.success('Copied to clipboard!');
    };

    const handleSaveToLibrary = (item: HistoryItem) => {
        addPrompt({
            title: `${item.action} - ${new Date(item.timestamp).toLocaleDateString()}`,
            content: item.input,
            enhancedContent: item.output,
            tags: [item.tool, 'from-history'],
            folder: 'Personal',
            starred: false,
            tool: item.tool as 'spark' | 'mindmap' | 'fusion' | 'personas' | 'code' | 'precision' | 'manual',
        });
        toast.success('Saved to library!');
    };

    const handleReplay = (item: HistoryItem) => {
        // Navigate to the appropriate tool with the input
        const toolRoutes: Record<string, string> = {
            spark: '/dashboard/spark',
            mindmap: '/dashboard/mindmap',
            fusion: '/dashboard/fusion',
            personas: '/dashboard/personas',
            code: '/dashboard/code',
            precision: '/dashboard/precision',
        };
        const route = toolRoutes[item.tool] || '/dashboard/spark';
        // Store in sessionStorage for the target page to pick up
        sessionStorage.setItem('replay-input', item.input);
        router.push(route);
        toast.success('Loading replay...');
    };

    const handleClearHistory = () => {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            clearHistory();
            toast.success('History cleared');
        }
    };

    // Get unique tools from merged history for filter
    const availableTools = useMemo(() => {
        const tools = new Set(mergedHistory.map(h => h.tool));
        return Array.from(tools);
    }, [mergedHistory]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">History</h1>
                        <p className="text-white/40 text-sm">
                            {isLoadingDb ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                `${mergedHistory.length} activities tracked`
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleClearHistory}
                        disabled={history.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-white/40 border border-white/[0.06] rounded-lg hover:text-red-400 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your history..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedTool(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${!selectedTool ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'}`}
                    >
                        All
                    </button>
                    {availableTools.map((toolKey) => {
                        const config = toolConfig[toolKey as keyof typeof toolConfig] || toolConfig.manual;
                        return (
                            <button
                                key={toolKey}
                                onClick={() => setSelectedTool(toolKey)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedTool === toolKey ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'}`}
                            >
                                <config.icon className="w-3.5 h-3.5" />
                                {config.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
                {Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white/60" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">{date}</h2>
                            <span className="text-sm text-white/40">{items.length} activit{items.length === 1 ? 'y' : 'ies'}</span>
                        </div>

                        <div className="ml-5 pl-5 border-l-2 border-white/10 space-y-4">
                            {items.map((item) => {
                                const config = toolConfig[item.tool as keyof typeof toolConfig] || toolConfig.manual;
                                const isExpanded = expandedItem === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white/5 rounded-2xl border-2 transition-all ${isExpanded ? 'border-indigo-500/50' : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div
                                            className="p-4 cursor-pointer"
                                            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                                                    <config.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-white/80">{config.name}</span>
                                                        <span className="text-white/30">•</span>
                                                        <span className="text-sm text-white/50">{item.action}</span>
                                                    </div>
                                                    <p className="text-white truncate">{item.input}</p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="text-sm text-white/40 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(item.timestamp)}
                                                    </span>
                                                    <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 border-t border-white/10">
                                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-white/50 uppercase mb-2 block">Input</label>
                                                        <div className="bg-white/5 rounded-xl p-3 text-sm text-white/80 max-h-40 overflow-y-auto">
                                                            {item.input}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-white/50 uppercase mb-2 block">Output</label>
                                                        <div className="bg-white/5 rounded-xl p-3 text-sm text-white/80 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                                            {item.output}
                                                        </div>
                                                    </div>
                                                </div>
                                                {item.metadata && (
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                                                        {item.metadata.scoreBefore !== undefined && (
                                                            <span>Score: {item.metadata.scoreBefore} → {item.metadata.scoreAfter}</span>
                                                        )}
                                                        {item.metadata.platform && (
                                                            <span>Platform: {item.metadata.platform}</span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => handleReplay(item)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-colors"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        Replay
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyOutput(item.output)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/15 transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                        Copy Output
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveToLibrary(item)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/15 transition-colors"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                        Save to Library
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {filteredHistory.length === 0 && (
                <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {searchQuery || selectedTool ? 'No matching history' : 'No history yet'}
                    </h3>
                    <p className="text-white/50">
                        {searchQuery || selectedTool
                            ? 'Try adjusting your filters'
                            : 'Start using PRAXIS tools to build your history'}
                    </p>
                </div>
            )}
        </div>
    );
}
