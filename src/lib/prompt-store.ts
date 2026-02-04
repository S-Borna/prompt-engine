import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Prompt Store - Complete State Management
// ═══════════════════════════════════════════════════════════════════════════

export interface SavedPrompt {
    id: string;
    title: string;
    content: string;
    enhancedContent?: string;
    tags: string[];
    folder: string;
    starred: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    tool: 'spark' | 'mindmap' | 'fusion' | 'personas' | 'code' | 'precision' | 'manual';
    metadata?: {
        model?: string;
        mode?: string;
        persona?: string;
        language?: string;
    };
}

export interface HistoryItem {
    id: string;
    tool: string;
    action: string;
    input: string;
    output: string;
    timestamp: string;
    metadata?: {
        scoreBefore?: number;
        scoreAfter?: number;
        platform?: string;
    };
}

export interface Persona {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    traits: string[];
    expertise: string[];
    tone: string;
    example: string;
    starred: boolean;
    isDefault?: boolean;
    createdAt: string;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    createdAt: string;
    lastRun?: string;
}

export interface WorkflowStep {
    id: string;
    type: 'input' | 'transform' | 'enhance' | 'review' | 'output';
    title: string;
    config: Record<string, unknown>;
    status: 'pending' | 'running' | 'complete' | 'error';
    result?: string;
}

interface PromptState {
    // Saved Prompts
    prompts: SavedPrompt[];
    folders: string[];

    // History
    history: HistoryItem[];

    // Personas
    personas: Persona[];

    // Workflows
    workflows: Workflow[];

    // User Preferences
    preferences: {
        defaultModel: string;
        defaultMode: string;
        autoSave: boolean;
        theme: 'light' | 'dark' | 'system';
    };

    // Actions - Prompts
    addPrompt: (prompt: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => SavedPrompt;
    updatePrompt: (id: string, updates: Partial<SavedPrompt>) => void;
    deletePrompt: (id: string) => void;
    toggleStar: (id: string) => void;
    incrementUsage: (id: string) => void;

    // Actions - Folders
    addFolder: (name: string) => void;
    deleteFolder: (name: string) => void;

    // Actions - History
    addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;

    // Actions - Personas
    addPersona: (persona: Omit<Persona, 'id' | 'createdAt'>) => Persona;
    updatePersona: (id: string, updates: Partial<Persona>) => void;
    deletePersona: (id: string) => void;

    // Actions - Workflows
    addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => Workflow;
    updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
    deleteWorkflow: (id: string) => void;

    // Actions - Preferences
    updatePreferences: (updates: Partial<PromptState['preferences']>) => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format date
const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Default personas
const defaultPersonas: Persona[] = [
    {
        id: 'default-1',
        name: 'Dr. Debug',
        role: 'Senior Code Reviewer',
        avatar: '🔬',
        color: 'from-emerald-400 to-green-500',
        traits: ['Meticulous', 'Patient', 'Educational'],
        expertise: ['Code Review', 'Best Practices', 'Performance'],
        tone: 'Constructive and thorough',
        example: 'Let me walk you through this line by line...',
        starred: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-2',
        name: 'Captain Creative',
        role: 'Innovation Catalyst',
        avatar: '🚀',
        color: 'from-violet-400 to-purple-500',
        traits: ['Bold', 'Visionary', 'Encouraging'],
        expertise: ['Brainstorming', 'Design Thinking', 'Innovation'],
        tone: 'Energetic and inspiring',
        example: 'What if we completely reimagined this approach?',
        starred: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-3',
        name: 'Professor Precise',
        role: 'Technical Simplifier',
        avatar: '📚',
        color: 'from-blue-400 to-cyan-500',
        traits: ['Clear', 'Structured', 'Accessible'],
        expertise: ['Education', 'Documentation', 'Explanations'],
        tone: 'Simple and jargon-free',
        example: 'Think of it like this everyday example...',
        starred: false,
        isDefault: true,
        createdAt: new Date().toISOString(),
    },
];

export const usePromptStore = create<PromptState>()(
    persist(
        (set, get) => ({
            // Initial State
            prompts: [],
            folders: ['Work', 'Personal', 'Development', 'Templates'],
            history: [],
            personas: defaultPersonas,
            workflows: [],
            preferences: {
                defaultModel: 'gpt4',
                defaultMode: 'enhance',
                autoSave: true,
                theme: 'light',
            },

            // Prompt Actions
            addPrompt: (prompt) => {
                const newPrompt: SavedPrompt = {
                    ...prompt,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    usageCount: 0,
                };
                set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
                return newPrompt;
            },

            updatePrompt: (id, updates) => {
                set((state) => ({
                    prompts: state.prompts.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                    ),
                }));
            },

            deletePrompt: (id) => {
                set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
            },

            toggleStar: (id) => {
                set((state) => ({
                    prompts: state.prompts.map((p) =>
                        p.id === id ? { ...p, starred: !p.starred } : p
                    ),
                }));
            },

            incrementUsage: (id) => {
                set((state) => ({
                    prompts: state.prompts.map((p) =>
                        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
                    ),
                }));
            },

            // Folder Actions
            addFolder: (name) => {
                set((state) => {
                    if (state.folders.includes(name)) return state;
                    return { folders: [...state.folders, name] };
                });
            },

            deleteFolder: (name) => {
                set((state) => ({
                    folders: state.folders.filter((f) => f !== name),
                    prompts: state.prompts.map((p) =>
                        p.folder === name ? { ...p, folder: 'Personal' } : p
                    ),
                }));
            },

            // History Actions
            addToHistory: (item) => {
                const now = new Date();
                const newItem: HistoryItem = {
                    ...item,
                    id: generateId(),
                    timestamp: now.toISOString(),
                };
                set((state) => ({
                    history: [newItem, ...state.history].slice(0, 100), // Keep last 100 items
                }));
            },

            clearHistory: () => set({ history: [] }),

            // Persona Actions
            addPersona: (persona) => {
                const newPersona: Persona = {
                    ...persona,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ personas: [...state.personas, newPersona] }));
                return newPersona;
            },

            updatePersona: (id, updates) => {
                set((state) => ({
                    personas: state.personas.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                }));
            },

            deletePersona: (id) => {
                set((state) => ({
                    personas: state.personas.filter((p) => p.id !== id || p.isDefault),
                }));
            },

            // Workflow Actions
            addWorkflow: (workflow) => {
                const newWorkflow: Workflow = {
                    ...workflow,
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
                return newWorkflow;
            },

            updateWorkflow: (id, updates) => {
                set((state) => ({
                    workflows: state.workflows.map((w) =>
                        w.id === id ? { ...w, ...updates } : w
                    ),
                }));
            },

            deleteWorkflow: (id) => {
                set((state) => ({
                    workflows: state.workflows.filter((w) => w.id !== id),
                }));
            },

            // Preferences Actions
            updatePreferences: (updates) => {
                set((state) => ({
                    preferences: { ...state.preferences, ...updates },
                }));
            },
        }),
        {
            name: 'praxis-prompts',
            partialize: (state) => ({
                prompts: state.prompts,
                folders: state.folders,
                history: state.history,
                personas: state.personas.filter((p) => !p.isDefault),
                workflows: state.workflows,
                preferences: state.preferences,
            }),
        }
    )
);

// Selectors
export const selectStarredPrompts = (state: PromptState) =>
    state.prompts.filter((p) => p.starred);

export const selectPromptsByFolder = (folder: string) => (state: PromptState) =>
    folder === 'All' ? state.prompts : state.prompts.filter((p) => p.folder === folder);

export const selectRecentHistory = (limit: number) => (state: PromptState) =>
    state.history.slice(0, limit);

export const selectHistoryByTool = (tool: string) => (state: PromptState) =>
    state.history.filter((h) => h.tool === tool);
