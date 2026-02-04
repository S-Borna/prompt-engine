'use client';

import { useState } from 'react';
import {
    Layers, Plus, Play, Pause, Trash2, GripVertical, Check,
    ChevronRight, Save, Clock, Zap, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════
// FUSION - Multi-Step Prompt Workflows
// Dark theme unified with landing page
// ═══════════════════════════════════════════════════════════════════════════

interface Step {
    id: string;
    name: string;
    prompt: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    output?: string;
}

const sampleWorkflows = [
    { id: 'blog', name: 'Blog Writer', steps: 4, icon: '📝' },
    { id: 'code', name: 'Code Review Pipeline', steps: 3, icon: '💻' },
    { id: 'research', name: 'Research Assistant', steps: 5, icon: '🔬' },
];

export default function FusionPage() {
    const [steps, setSteps] = useState<Step[]>([
        { id: '1', name: 'Step 1', prompt: '', status: 'pending' },
    ]);
    const [activeStep, setActiveStep] = useState('1');

    const addStep = () => {
        const newStep: Step = {
            id: Date.now().toString(),
            name: `Step ${steps.length + 1}`,
            prompt: '',
            status: 'pending'
        };
        setSteps([...steps, newStep]);
    };

    const deleteStep = (id: string) => {
        if (steps.length <= 1) {
            toast.error('Need at least one step');
            return;
        }
        setSteps(steps.filter(s => s.id !== id));
    };

    const handleRunAll = () => {
        toast('Workflow execution coming soon!', { icon: '⚡' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Fusion</h1>
                        <p className="text-white/50">Build multi-step prompt workflows</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRunAll}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-[10px] font-medium hover:bg-blue-500/15 transition-colors border border-blue-500/20"
                    >
                        <Play className="w-4 h-4" />
                        Run All
                    </button>
                    <button
                        onClick={() => toast('Workflow saved (demo)', { icon: '💾' })}
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white/70 rounded-[10px] font-medium hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
                    >
                        <Save className="w-4 h-4" />
                        Save Workflow
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-center gap-3 p-4 bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-white/70">
                    Design your workflow by adding steps below. Workflow execution is coming soon.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Workflow Steps */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">Workflow Steps</h2>
                        <span className="text-sm text-white/50">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`bg-white/5 rounded-xl border-2 transition-all cursor-pointer ${activeStep === step.id
                                    ? 'border-blue-500/50'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-center gap-4">
                                        {/* Drag Handle */}
                                        <div className="cursor-grab text-white/30 hover:text-white/50">
                                            <GripVertical className="w-5 h-5" />
                                        </div>

                                        {/* Step Number */}
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-white/70">
                                            {index + 1}
                                        </div>

                                        {/* Step Info */}
                                        <div className="flex-1">
                                            <div className="font-semibold text-white">{step.name}</div>
                                            <div className="text-sm text-white/50 truncate">{step.prompt || 'Click to add prompt'}</div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Connector Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="flex justify-center -mb-1">
                                        <div className="w-0.5 h-4 bg-white/10" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Step Button */}
                    <button
                        onClick={addStep}
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl text-white/50 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Step
                    </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Step Editor */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                        <h3 className="font-semibold text-white mb-4">Edit Step</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Step Name</label>
                                <input
                                    type="text"
                                    value={steps.find(s => s.id === activeStep)?.name || ''}
                                    onChange={(e) => setSteps(steps.map(s => s.id === activeStep ? { ...s, name: e.target.value } : s))}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-1">Prompt Template</label>
                                <textarea
                                    rows={4}
                                    value={steps.find(s => s.id === activeStep)?.prompt || ''}
                                    onChange={(e) => setSteps(steps.map(s => s.id === activeStep ? { ...s, prompt: e.target.value } : s))}
                                    placeholder="Enter the prompt for this step..."
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                                />
                            </div>
                            <div className="text-xs text-white/40">
                                Use <code className="px-1 py-0.5 bg-white/10 rounded">{'{previous}'}</code> to reference output from the previous step
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                        <h3 className="font-semibold text-white mb-4">Workflow Templates</h3>
                        <div className="space-y-2">
                            {sampleWorkflows.map((wf) => (
                                <button
                                    key={wf.id}
                                    onClick={() => toast('Templates coming soon', { icon: '📋' })}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left"
                                >
                                    <span className="text-2xl">{wf.icon}</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{wf.name}</div>
                                        <div className="text-sm text-white/50">{wf.steps} steps</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
