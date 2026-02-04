'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Palette, Plus, User, MessageSquare, Settings2, Copy,
    Sparkles, Save, Trash2, Edit3, ChevronRight, Star,
    Briefcase, GraduationCap, Heart, Zap, Bot, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore, Persona } from '@/lib/prompt-store';

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA STUDIO - AI Character Builder
// Create custom AI personas with distinct voices and expertise
// ═══════════════════════════════════════════════════════════════════════════

const traitOptions = ['Friendly', 'Professional', 'Creative', 'Technical', 'Patient', 'Direct', 'Empathetic', 'Analytical', 'Meticulous', 'Bold', 'Visionary'];
const expertiseOptions = ['Coding', 'Writing', 'Marketing', 'Data', 'Design', 'Research', 'Teaching', 'Leadership', 'Code Review', 'Documentation', 'Innovation'];
const toneOptions = ['Casual', 'Formal', 'Playful', 'Serious', 'Encouraging', 'Challenging', 'Constructive', 'Energetic'];
const avatarOptions = ['🔬', '🚀', '📚', '💼', '🎯', '🧠', '⚡', '🎨', '🔧', '💡', '🎭', '🏆'];
const colorOptions = [
    'from-emerald-400 to-green-500',
    'from-violet-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-indigo-400 to-blue-500',
    'from-teal-400 to-emerald-500',
    'from-red-400 to-pink-500',
];

interface NewPersonaForm {
    name: string;
    role: string;
    avatar: string;
    color: string;
    traits: string[];
    expertise: string[];
    tone: string;
    example: string;
}

const defaultForm: NewPersonaForm = {
    name: '',
    role: '',
    avatar: '🎯',
    color: 'from-violet-400 to-purple-500',
    traits: [],
    expertise: [],
    tone: 'Professional',
    example: '',
};

export default function PersonasPage() {
    const router = useRouter();
    const { personas, addPersona, updatePersona, deletePersona } = usePromptStore();
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(personas[0] || null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<NewPersonaForm>(defaultForm);

    const starredPersonas = useMemo(() => personas.filter(p => p.starred), [personas]);

    const toggleTrait = (trait: string) => {
        setForm(prev => ({
            ...prev,
            traits: prev.traits.includes(trait)
                ? prev.traits.filter(t => t !== trait)
                : [...prev.traits, trait]
        }));
    };

    const toggleExpertise = (exp: string) => {
        setForm(prev => ({
            ...prev,
            expertise: prev.expertise.includes(exp)
                ? prev.expertise.filter(e => e !== exp)
                : [...prev.expertise, exp]
        }));
    };

    const handleCreatePersona = () => {
        if (!form.name.trim()) {
            toast.error('Please enter a name');
            return;
        }
        if (!form.role.trim()) {
            toast.error('Please enter a role');
            return;
        }
        if (form.traits.length === 0) {
            toast.error('Please select at least one trait');
            return;
        }

        addPersona({
            name: form.name,
            role: form.role,
            avatar: form.avatar,
            color: form.color,
            traits: form.traits,
            expertise: form.expertise,
            tone: form.tone,
            example: form.example || `Hello, I'm ${form.name}. How can I help?`,
            starred: false,
        });

        toast.success(`${form.name} created!`);
        setIsCreating(false);
        setForm(defaultForm);
    };

    const handleUpdatePersona = () => {
        if (!selectedPersona) return;

        updatePersona(selectedPersona.id, {
            name: form.name,
            role: form.role,
            avatar: form.avatar,
            color: form.color,
            traits: form.traits,
            expertise: form.expertise,
            tone: form.tone,
            example: form.example,
        });

        // Update local selection
        setSelectedPersona({
            ...selectedPersona,
            name: form.name,
            role: form.role,
            avatar: form.avatar,
            color: form.color,
            traits: form.traits,
            expertise: form.expertise,
            tone: form.tone,
            example: form.example,
        });

        toast.success('Persona updated!');
        setIsEditing(false);
    };

    const handleDeletePersona = (id: string) => {
        if (confirm('Are you sure you want to delete this persona?')) {
            deletePersona(id);
            if (selectedPersona?.id === id) {
                setSelectedPersona(personas.find(p => p.id !== id) || null);
            }
            toast.success('Persona deleted');
        }
    };

    const handleToggleStar = (id: string) => {
        const persona = personas.find(p => p.id === id);
        if (persona) {
            updatePersona(id, { starred: !persona.starred });
            if (selectedPersona?.id === id) {
                setSelectedPersona({ ...selectedPersona, starred: !selectedPersona.starred });
            }
        }
    };

    const handleCopyPrompt = (persona: Persona) => {
        const prompt = `You are ${persona.name}, a ${persona.role}.
Your personality traits: ${persona.traits.join(', ')}.
Your areas of expertise: ${persona.expertise.join(', ')}.
Your communication style: ${persona.tone}.
Example of how you speak: "${persona.example}"

Respond in character as ${persona.name}.`;

        navigator.clipboard.writeText(prompt);
        toast.success('Prompt copied to clipboard!');
    };

    const handleUseInSpark = (persona: Persona) => {
        sessionStorage.setItem('spark-persona', JSON.stringify(persona));
        router.push('/dashboard/spark');
        toast.success('Loading persona in Spark...');
    };

    const openEditModal = () => {
        if (selectedPersona) {
            setForm({
                name: selectedPersona.name,
                role: selectedPersona.role,
                avatar: selectedPersona.avatar,
                color: selectedPersona.color,
                traits: selectedPersona.traits,
                expertise: selectedPersona.expertise,
                tone: selectedPersona.tone,
                example: selectedPersona.example,
            });
            setIsEditing(true);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">Persona Studio</h1>
                        </div>
                        <p className="text-white/50">{personas.length} personas created</p>
                    </div>
                </div>

                <button
                    onClick={() => { setForm(defaultForm); setIsCreating(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-[10px] hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Create Persona
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Personas List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">Your Personas</h2>
                        <span className="text-sm text-white/50">{personas.length} total</span>
                    </div>

                    {personas.length === 0 ? (
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-8 text-center">
                            <div className="w-12 h-12 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bot className="w-6 h-6 text-white/40" />
                            </div>
                            <p className="text-white/50 text-sm">No personas yet</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="mt-3 text-orange-400 text-sm font-medium hover:underline"
                            >
                                Create your first persona
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {personas.map((persona) => (
                                <button
                                    key={persona.id}
                                    onClick={() => setSelectedPersona(persona)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedPersona?.id === persona.id
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl`}>
                                            {persona.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">{persona.name}</span>
                                                {persona.starred && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                                            </div>
                                            <div className="text-sm text-white/50 truncate">{persona.role}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Persona Detail */}
                {selectedPersona ? (
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                            <div className={`h-24 bg-gradient-to-r ${selectedPersona.color}`} />
                            <div className="p-6 -mt-10">
                                <div className="flex items-end justify-between">
                                    <div className="flex items-end gap-4">
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedPersona.color} flex items-center justify-center text-4xl border-4 border-[#1a1a24] shadow-lg`}>
                                            {selectedPersona.avatar}
                                        </div>
                                        <div className="mb-1">
                                            <h2 className="text-2xl font-bold text-white">{selectedPersona.name}</h2>
                                            <p className="text-white/50">{selectedPersona.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleStar(selectedPersona.id)}
                                            className={`p-2 rounded-lg transition-colors ${selectedPersona.starred ? 'text-amber-500 bg-amber-500/20' : 'text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            <Star className={`w-5 h-5 ${selectedPersona.starred ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                            onClick={openEditModal}
                                            className="p-2 text-white/40 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePersona(selectedPersona.id)}
                                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Traits & Expertise */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-pink-400" />
                                    Personality Traits
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPersona.traits.map((trait) => (
                                        <span key={trait} className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm font-medium">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                    Areas of Expertise
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPersona.expertise.map((exp) => (
                                        <span key={exp} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tone & Example */}
                        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-violet-400" />
                                Communication Style
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-white/50">Tone:</span>
                                    <span className="ml-2 font-medium text-white">{selectedPersona.tone}</span>
                                </div>
                                <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                                    <div className="text-sm text-violet-400 mb-1">Example response:</div>
                                    <p className="text-white/80 italic">&ldquo;{selectedPersona.example}&rdquo;</p>
                                </div>
                            </div>
                        </div>

                        {/* Use Persona */}
                        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-orange-400">Use This Persona</h3>
                                    <p className="text-sm text-white/60">Add this persona to your prompts automatically</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleCopyPrompt(selectedPersona)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-orange-500/30 text-orange-400 rounded-xl hover:bg-white/15 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Prompt
                                    </button>
                                    <button
                                        onClick={() => handleUseInSpark(selectedPersona)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Use in Spark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-2 flex items-center justify-center">
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-white/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-white/70 mb-2">Select a persona</h3>
                            <p className="text-white/50">Choose from the list or create a new one</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Persona Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a24] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10">
                        <div className="p-6 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    {isEditing ? 'Edit Persona' : 'Create New Persona'}
                                </h2>
                                <button
                                    onClick={() => { setIsCreating(false); setIsEditing(false); }}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Dr. Debug"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">Role *</label>
                                    <input
                                        type="text"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        placeholder="Code Reviewer"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Avatar</label>
                                <div className="flex flex-wrap gap-2">
                                    {avatarOptions.map((avatar) => (
                                        <button
                                            key={avatar}
                                            onClick={() => setForm({ ...form, avatar })}
                                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${form.avatar === avatar
                                                ? 'bg-orange-500/30 ring-2 ring-orange-500'
                                                : 'bg-white/10 hover:bg-white/20'
                                                }`}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setForm({ ...form, color })}
                                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-offset-[#1a1a24] ring-white/40' : ''
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Personality Traits *</label>
                                <div className="flex flex-wrap gap-2">
                                    {traitOptions.map((trait) => (
                                        <button
                                            key={trait}
                                            onClick={() => toggleTrait(trait)}
                                            className={`px-3 py-1 border rounded-full text-sm transition-colors ${form.traits.includes(trait)
                                                ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                                                : 'border-white/10 text-white/60 hover:border-orange-500/30 hover:bg-orange-500/10'
                                                }`}
                                        >
                                            {trait}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Expertise Areas</label>
                                <div className="flex flex-wrap gap-2">
                                    {expertiseOptions.map((exp) => (
                                        <button
                                            key={exp}
                                            onClick={() => toggleExpertise(exp)}
                                            className={`px-3 py-1 border rounded-full text-sm transition-colors ${form.expertise.includes(exp)
                                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                                : 'border-white/10 text-white/60 hover:border-blue-500/30 hover:bg-blue-500/10'
                                                }`}
                                        >
                                            {exp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Tone</label>
                                <select
                                    value={form.tone}
                                    onChange={(e) => setForm({ ...form, tone: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                                >
                                    {toneOptions.map((tone) => (
                                        <option key={tone} className="bg-[#1a1a24]">{tone}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Example Response</label>
                                <textarea
                                    value={form.example}
                                    onChange={(e) => setForm({ ...form, example: e.target.value })}
                                    placeholder="How would this persona typically respond?"
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                                className="px-4 py-2 text-white/60 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isEditing ? handleUpdatePersona : handleCreatePersona}
                                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                            >
                                {isEditing ? 'Save Changes' : 'Create Persona'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
