'use client';

import { useState, useMemo } from 'react';
import {
    Folder, Search, Star, Clock, Plus, Copy, Edit2, Trash2,
    FileText, Grid, List, Filter, Sparkles, MoreVertical,
    ChevronRight, X, Save, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore, SavedPrompt } from '@/lib/prompt-store';

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY - Prompt Collection & Organization
// Dark theme unified with landing page
// ═══════════════════════════════════════════════════════════════════════════

export default function LibraryPage() {
    const { prompts, folders, addFolder, deleteFolder, deletePrompt, toggleStar, updatePrompt, addPrompt } = usePromptStore();

    const [selectedFolder, setSelectedFolder] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);

    // Filter prompts
    const filteredPrompts = useMemo(() => {
        return prompts.filter(p => {
            const matchesFolder = selectedFolder === 'All' || p.folder === selectedFolder;
            const matchesSearch = searchQuery === '' ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFolder && matchesSearch;
        });
    }, [prompts, selectedFolder, searchQuery]);

    const starredCount = prompts.filter(p => p.starred).length;

    const handleCopyPrompt = (prompt: SavedPrompt) => {
        const textToCopy = prompt.enhancedContent || prompt.content;
        navigator.clipboard.writeText(textToCopy);
        toast.success('Copied to clipboard!');
    };

    const handleDeletePrompt = (id: string) => {
        if (confirm('Are you sure you want to delete this prompt?')) {
            deletePrompt(id);
            setSelectedPrompt(null);
            toast.success('Prompt deleted');
        }
    };

    const handleAddFolder = () => {
        if (newFolderName.trim()) {
            addFolder(newFolderName.trim());
            setNewFolderName('');
            setShowNewFolderModal(false);
            toast.success(`Folder "${newFolderName}" created`);
        }
    };

    const handleSaveEdit = () => {
        if (editingPrompt) {
            updatePrompt(editingPrompt.id, editingPrompt);
            setShowEditModal(false);
            setEditingPrompt(null);
            toast.success('Prompt updated');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Library</h1>
                        <p className="text-white/50">{prompts.length} saved prompts</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        addPrompt({
                            title: 'New Prompt',
                            content: '',
                            tags: [],
                            folder: selectedFolder === 'All' ? 'Personal' : selectedFolder,
                            starred: false,
                            tool: 'manual',
                        });
                        toast.success('New prompt created');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-[10px] hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Prompt
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search prompts by title, content, or tags..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:bg-white/5'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:bg-white/5'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Sidebar - Folders */}
                <div className="w-56 flex-shrink-0">
                    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
                        <h3 className="text-sm font-semibold text-white/50 uppercase mb-3">Folders</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedFolder('All')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedFolder === 'All' ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/5 text-white/70'
                                    }`}
                            >
                                <Folder className="w-4 h-4" />
                                <span className="font-medium">All</span>
                                <span className="ml-auto text-xs text-white/40">{prompts.length}</span>
                            </button>
                            {folders.map((folder) => (
                                <button
                                    key={folder}
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedFolder === folder ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/5 text-white/70'
                                        }`}
                                >
                                    <Folder className="w-4 h-4" />
                                    <span className="font-medium">{folder}</span>
                                    <span className="ml-auto text-xs text-white/40">
                                        {prompts.filter(p => p.folder === folder).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <hr className="my-4 border-white/10" />
                        <button
                            onClick={() => setShowNewFolderModal(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-amber-400 hover:bg-amber-500/10 rounded-xl"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium">New Folder</span>
                        </button>
                    </div>

                    <div className="mt-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-amber-400">Starred</span>
                        </div>
                        <p className="text-sm text-white/60">
                            {starredCount} starred prompt{starredCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Prompts Grid/List */}
                <div className="flex-1">
                    {filteredPrompts.length === 0 ? (
                        <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-white/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {searchQuery ? 'No prompts found' : 'No prompts yet'}
                            </h3>
                            <p className="text-white/50">
                                {searchQuery ? 'Try adjusting your search' : 'Create your first prompt or save one from Spark'}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4">
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    onClick={() => setSelectedPrompt(prompt)}
                                    className={`bg-white/5 rounded-2xl border-2 p-5 cursor-pointer transition-all hover:bg-white/[0.08] ${selectedPrompt?.id === prompt.id ? 'border-amber-500' : 'border-white/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleStar(prompt.id); }}
                                                className={`transition-colors ${prompt.starred ? 'text-amber-400' : 'text-white/30 hover:text-amber-400'}`}
                                            >
                                                <Star className={`w-4 h-4 ${prompt.starred ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt); }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg"
                                            >
                                                <Copy className="w-4 h-4 text-white/40" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingPrompt(prompt); setShowEditModal(true); }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg"
                                            >
                                                <Edit2 className="w-4 h-4 text-white/40" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{prompt.title}</h3>
                                    <p className="text-sm text-white/50 mb-3 line-clamp-2">{prompt.content || 'No content'}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {prompt.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(prompt.updatedAt)}
                                        </span>
                                        <span>{prompt.usageCount} uses</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    onClick={() => setSelectedPrompt(prompt)}
                                    className={`bg-white/5 rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-white/[0.08] flex items-center gap-4 ${selectedPrompt?.id === prompt.id ? 'border-amber-500' : 'border-white/10'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white truncate">{prompt.title}</h3>
                                            {prompt.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />}
                                        </div>
                                        <p className="text-sm text-white/50 truncate">{prompt.content || 'No content'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {prompt.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-sm text-white/40 flex-shrink-0 w-20 text-right">
                                        {formatDate(prompt.updatedAt)}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt); }}
                                            className="p-2 hover:bg-amber-500/10 rounded-lg text-white/40 hover:text-amber-400"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingPrompt(prompt); setShowEditModal(true); }}
                                            className="p-2 hover:bg-amber-500/10 rounded-lg text-white/40 hover:text-amber-400"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id); }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">New Folder</h2>
                            <button onClick={() => setShowNewFolderModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/30 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNewFolderModal(false)}
                                className="flex-1 px-4 py-2.5 border border-white/10 text-white/70 rounded-xl hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFolder}
                                disabled={!newFolderName.trim()}
                                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Prompt Modal */}
            {showEditModal && editingPrompt && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Edit Prompt</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingPrompt(null); }} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editingPrompt.title}
                                    onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Content</label>
                                <textarea
                                    value={editingPrompt.content}
                                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                                />
                            </div>

                            {editingPrompt.enhancedContent && (
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">Enhanced Content</label>
                                    <textarea
                                        value={editingPrompt.enhancedContent}
                                        onChange={(e) => setEditingPrompt({ ...editingPrompt, enhancedContent: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Folder</label>
                                <select
                                    value={editingPrompt.folder}
                                    onChange={(e) => setEditingPrompt({ ...editingPrompt, folder: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                >
                                    {folders.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={editingPrompt.tags.join(', ')}
                                    onChange={(e) => setEditingPrompt({
                                        ...editingPrompt,
                                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                    })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => handleDeletePrompt(editingPrompt.id)}
                                className="px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex-1" />
                            <button
                                onClick={() => { setShowEditModal(false); setEditingPrompt(null); }}
                                className="px-4 py-2.5 border border-white/10 text-white/70 rounded-xl hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
