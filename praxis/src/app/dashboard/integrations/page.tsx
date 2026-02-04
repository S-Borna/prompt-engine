'use client';

import { useState } from 'react';
import {
    Plug, ExternalLink, Info,
    Zap, Code, MessageSquare, GitBranch,
    FileText, Bot, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATIONS - Connect External Services
// Dark theme unified with landing page - NO FAKE "Connected" statuses
// All integrations show honest "Coming Soon" state
// ═══════════════════════════════════════════════════════════════════════════

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: typeof Zap;
    gradient: string;
    comingSoon?: boolean;
}

const aiProviders: Integration[] = [
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4o, GPT-4, GPT-3.5-turbo',
        icon: Sparkles,
        gradient: 'from-emerald-500 to-emerald-600',
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude 3 Opus, Sonnet, Haiku',
        icon: Bot,
        gradient: 'from-orange-500 to-orange-600',
    },
    {
        id: 'google',
        name: 'Google AI',
        description: 'Gemini Pro, Gemini Ultra',
        icon: Zap,
        gradient: 'from-blue-500 to-blue-600',
    },
];

const toolIntegrations: Integration[] = [
    {
        id: 'github',
        name: 'GitHub',
        description: 'Sync prompts with repositories',
        icon: GitBranch,
        gradient: 'from-gray-600 to-gray-700',
        comingSoon: true,
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Generate prompts from messages',
        icon: MessageSquare,
        gradient: 'from-purple-500 to-purple-600',
        comingSoon: true,
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Export prompts to Notion',
        icon: FileText,
        gradient: 'from-gray-500 to-gray-600',
        comingSoon: true,
    },
    {
        id: 'vscode',
        name: 'VS Code',
        description: 'IDE extension',
        icon: Code,
        gradient: 'from-blue-500 to-blue-600',
        comingSoon: true,
    },
];

export default function IntegrationsPage() {
    const [search, setSearch] = useState('');

    const handleConnect = (name: string) => {
        toast(`${name} integration coming soon!`, { icon: '🔌' });
    };

    const filteredAI = aiProviders.filter(int =>
        int.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredTools = toolIntegrations.filter(int =>
        int.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Plug className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Integrations</h1>
                        <p className="text-white/50">Connect external services to PRAXIS</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Info className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                    Integrations are coming soon. You can currently use PRAXIS with our built-in AI enhancement.
                </p>
            </div>

            {/* Search */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search integrations..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
                />
            </div>

            {/* AI Providers Section */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">AI Providers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredAI.map((int) => (
                        <div
                            key={int.id}
                            className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 transition-all hover:bg-white/[0.08]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${int.gradient} flex items-center justify-center`}>
                                    <int.icon className="w-7 h-7 text-white" />
                                </div>
                                <span className="px-2 py-1 bg-white/10 text-white/50 text-xs font-medium rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{int.name}</h3>
                            <p className="text-sm text-white/50 mb-4">{int.description}</p>
                            <button
                                onClick={() => handleConnect(int.name)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white/70 font-medium rounded-xl hover:bg-white/15 transition-colors"
                            >
                                <Plug className="w-4 h-4" />
                                Connect
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tools & Services */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Tools & Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTools.map((int) => (
                        <div
                            key={int.id}
                            className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4 transition-all hover:bg-white/[0.08]"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${int.gradient} flex items-center justify-center flex-shrink-0`}>
                                <int.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">{int.name}</h3>
                                    <span className="px-2 py-0.5 bg-white/10 text-white/40 text-xs font-medium rounded-full">
                                        Coming Soon
                                    </span>
                                </div>
                                <p className="text-sm text-white/50 truncate">{int.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleConnect(int.name)}
                                    className="px-4 py-2.5 bg-white/10 text-white/70 font-medium rounded-xl hover:bg-white/15 transition-colors"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Documentation */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Build Custom Integrations</h3>
                            <p className="text-white/50">REST API documentation coming soon</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toast('API documentation coming soon', { icon: '📖' })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] text-white text-sm font-medium rounded-[10px] hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
                    >
                        <FileText className="w-5 h-5" />
                        View API Docs
                    </button>
                </div>
            </div>
        </div>
    );
}
