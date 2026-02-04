'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Brain, ZoomIn, ZoomOut, Lightbulb, Copy, Save, Sparkles,
    Trash2, Plus, ChevronRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS MIND MAP - Premium Visual Prompt Ideation
// Apple & Lovable Inspired Design
// ═══════════════════════════════════════════════════════════════════════════

interface MindMapNode {
    id: string;
    text: string;
    type: 'root' | 'branch' | 'leaf';
    color: string;
    children: MindMapNode[];
    x?: number;
    y?: number;
}

interface BranchTemplate {
    name: string;
    emoji: string;
    color: string;
    leafColor: string;
    options: string[];
}

const branchTemplates: Record<string, BranchTemplate> = {
    audience: {
        name: 'Target Audience',
        emoji: '👥',
        color: 'from-violet-500 to-purple-600',
        leafColor: 'from-violet-400 to-purple-500',
        options: ['Tech enthusiasts', 'Business leaders', 'Beginners', 'Students', 'Professionals', 'General public'],
    },
    tone: {
        name: 'Tone & Style',
        emoji: '🎨',
        color: 'from-pink-500 to-rose-600',
        leafColor: 'from-pink-400 to-rose-500',
        options: ['Professional', 'Casual', 'Academic', 'Playful', 'Authoritative', 'Empathetic'],
    },
    format: {
        name: 'Output Format',
        emoji: '📋',
        color: 'from-cyan-500 to-blue-600',
        leafColor: 'from-cyan-400 to-blue-500',
        options: ['Step-by-step guide', 'Bullet points', 'Narrative', 'Code examples', 'Q&A format', 'Comparison table'],
    },
    context: {
        name: 'Context & Angle',
        emoji: '🎯',
        color: 'from-emerald-500 to-green-600',
        leafColor: 'from-emerald-400 to-green-500',
        options: ['Future predictions', 'Historical context', 'Personal story', 'Case study', 'Comparison', 'Problem-solution'],
    },
    constraints: {
        name: 'Constraints',
        emoji: '⚡',
        color: 'from-amber-500 to-orange-600',
        leafColor: 'from-amber-400 to-orange-500',
        options: ['Under 100 words', 'Technical depth', 'Beginner-friendly', 'No jargon', 'Include examples', 'Actionable steps'],
    },
};

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

function generateMindMap(prompt: string): MindMapNode {
    const branches = Object.entries(branchTemplates).map(([key, template]) => ({
        id: key,
        text: `${template.emoji} ${template.name}`,
        type: 'branch' as const,
        color: template.color,
        children: template.options.slice(0, 3).map((option) => ({
            id: generateId(),
            text: option,
            type: 'leaf' as const,
            color: template.leafColor,
            children: [],
        })),
    }));

    return {
        id: 'root',
        text: prompt || 'Your Prompt Idea',
        type: 'root',
        color: 'from-indigo-500 to-purple-600',
        children: branches,
    };
}

// Premium Node Component
function NodeComponent({
    node,
    depth = 0,
    onSelect,
    selectedId,
    onAddChild,
    onDelete,
}: {
    node: MindMapNode;
    depth?: number;
    onSelect: (id: string) => void;
    selectedId: string | null;
    onAddChild: (parentId: string) => void;
    onDelete: (id: string) => void;
}) {
    const isSelected = selectedId === node.id;
    const isRoot = node.type === 'root';

    return (
        <div className="flex items-start gap-4">
            {/* Node */}
            <button
                onClick={() => onSelect(node.id)}
                className={`
          group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl
          font-medium transition-all duration-300 ease-out
          ${isRoot ? 'text-lg' : 'text-sm'}
          ${isSelected
                        ? 'ring-2 ring-white/50 shadow-2xl scale-105'
                        : 'hover:scale-102 hover:shadow-xl'
                    }
          bg-gradient-to-r ${node.color}
          text-white shadow-lg
        `}
            >
                <span className="relative z-10">{node.text}</span>

                {/* Glow effect */}
                <div className={`
          absolute inset-0 rounded-2xl bg-gradient-to-r ${node.color}
          opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300
        `} />

                {/* Action buttons on hover */}
                {isSelected && (
                    <div className="absolute -right-2 -top-2 flex gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                        {!isRoot && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                                className="p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-500 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
            </button>

            {/* Children */}
            {node.children.length > 0 && (
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-white/10">
                    {node.children.map((child) => (
                        <NodeComponent
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MindMapPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [isGenerating, setIsGenerating] = useState(false);

    // Check for replay input from localStorage
    useEffect(() => {
        const replayInput = localStorage.getItem('replay-input');
        if (replayInput) {
            setPrompt(replayInput);
            localStorage.removeItem('replay-input');
        }
    }, []);

    const handleGenerate = useCallback(() => {
        if (!prompt.trim()) return;

        setIsGenerating(true);

        // Simulate AI generation delay
        setTimeout(() => {
            const newMindMap = generateMindMap(prompt);
            setMindMap(newMindMap);
            setIsGenerating(false);
        }, 800);
    }, [prompt]);

    const handleAddChild = useCallback((parentId: string) => {
        if (!mindMap) return;

        const addChildToNode = (node: MindMapNode): MindMapNode => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [
                        ...node.children,
                        {
                            id: generateId(),
                            text: 'New idea',
                            type: 'leaf',
                            color: 'from-gray-400 to-gray-500',
                            children: [],
                        },
                    ],
                };
            }
            return {
                ...node,
                children: node.children.map(addChildToNode),
            };
        };

        setMindMap(addChildToNode(mindMap));
    }, [mindMap]);

    const handleDelete = useCallback((nodeId: string) => {
        if (!mindMap) return;

        const deleteFromNode = (node: MindMapNode): MindMapNode => ({
            ...node,
            children: node.children
                .filter((child) => child.id !== nodeId)
                .map(deleteFromNode),
        });

        setMindMap(deleteFromNode(mindMap));
        setSelectedId(null);
    }, [mindMap]);

    const handleCopyPrompt = useCallback(() => {
        if (!mindMap) return;

        const buildPrompt = (node: MindMapNode, depth = 0): string => {
            const indent = '  '.repeat(depth);
            let result = `${indent}${node.text}\n`;
            node.children.forEach((child) => {
                result += buildPrompt(child, depth + 1);
            });
            return result;
        };

        const fullPrompt = buildPrompt(mindMap);
        navigator.clipboard.writeText(fullPrompt);
    }, [mindMap]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Premium gradient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold">Mind Map</h1>
                                    <p className="text-xs text-white/50">Visual Prompt Ideation</p>
                                </div>
                            </div>
                        </div>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setZoom(Math.max(50, zoom - 10))}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-white/50 w-12 text-center">{zoom}%</span>
                            <button
                                onClick={() => setZoom(Math.min(150, zoom + 10))}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Input Section */}
                <div className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="Enter your prompt idea and press Enter to generate mind map..."
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl
                text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50
                focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5
                bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl
                font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mind Map Canvas */}
                {mindMap ? (
                    <div className="relative">
                        {/* Action bar */}
                        <div className="flex items-center justify-end gap-2 mb-4">
                            <button
                                onClick={handleCopyPrompt}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10
                  rounded-xl transition-colors text-sm"
                            >
                                <Copy className="w-4 h-4" />
                                Copy as Text
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10
                  rounded-xl transition-colors text-sm"
                            >
                                <Save className="w-4 h-4" />
                                Save Map
                            </button>
                        </div>

                        {/* Canvas */}
                        <div
                            className="relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 min-h-[500px] overflow-auto"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                        >
                            <NodeComponent
                                node={mindMap}
                                onSelect={setSelectedId}
                                selectedId={selectedId}
                                onAddChild={handleAddChild}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 mb-6">
                            <Lightbulb className="w-12 h-12 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Start Your Mind Map</h2>
                        <p className="text-white/50 max-w-md mb-8">
                            Enter a prompt idea above and generate a visual mind map to explore
                            different angles, audiences, and formats for your prompt.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['Write a blog post about AI', 'Create a marketing strategy', 'Design a learning curriculum'].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setPrompt(example)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
