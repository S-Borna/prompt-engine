'use client';

import {
    BarChart3, Clock, Zap, Target,
    FileText, Info, Sparkles
} from 'lucide-react';
import { usePromptStore } from '@/lib/prompt-store';

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS - Usage Insights & Statistics
// Shows REAL data from user's activity - no fake metrics
// ═══════════════════════════════════════════════════════════════════════════

export default function AnalyticsPage() {
    const { prompts, history } = usePromptStore();

    // Calculate real stats from actual data
    const totalPrompts = prompts.length;
    const totalEnhancements = history.length;
    const toolUsage = history.reduce((acc, item) => {
        acc[item.tool] = (acc[item.tool] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const hasData = totalPrompts > 0 || totalEnhancements > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Analytics</h1>
                        <p className="text-white/50">Your productivity insights</p>
                    </div>
                </div>
            </div>

            {hasData ? (
                <>
                    {/* Real Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-violet-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{totalPrompts}</div>
                            <div className="text-sm text-white/50">Saved Prompts</div>
                        </div>

                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-teal-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{totalEnhancements}</div>
                            <div className="text-sm text-white/50">Total Enhancements</div>
                        </div>

                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{Object.keys(toolUsage).length}</div>
                            <div className="text-sm text-white/50">Tools Used</div>
                        </div>
                    </div>

                    {/* Tool Usage */}
                    {Object.keys(toolUsage).length > 0 && (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Tool Usage</h3>
                            <div className="space-y-4">
                                {Object.entries(toolUsage).sort((a, b) => b[1] - a[1]).map(([tool, count]) => {
                                    const maxCount = Math.max(...Object.values(toolUsage));
                                    const percentage = Math.round((count / maxCount) * 100);
                                    return (
                                        <div key={tool}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium text-white/80 capitalize">{tool}</span>
                                                <span className="text-sm text-white/50">{count} uses</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                        <BarChart3 className="w-10 h-10 text-white/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No data yet</h3>
                    <p className="text-white/50 max-w-md mx-auto mb-6">
                        Start using PRAXIS tools to see your productivity insights here.
                        Analytics will appear once you enhance your first prompt.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                        <Info className="w-4 h-4" />
                        <span>All statistics are based on your real usage</span>
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-500/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">About Analytics</h3>
                        <p className="text-white/60">
                            All metrics shown here are calculated from your actual PRAXIS usage.
                            We don&apos;t display fabricated numbers or projections—only real data from your activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
