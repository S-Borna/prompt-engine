'use client';

import { useState } from 'react';
import {
    Target, ChevronRight, Sparkles, Check, ArrowRight,
    MessageSquare, Users, FileText, Lightbulb, Zap, Copy
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PRECISION - Goal-Driven Prompt Optimizer
// Dark theme unified with landing page
// ═══════════════════════════════════════════════════════════════════════════

const goals = [
    { id: 'persuade', name: 'Persuade', icon: MessageSquare, desc: 'Convince or influence', color: 'red' },
    { id: 'educate', name: 'Educate', icon: Lightbulb, desc: 'Teach or explain', color: 'blue' },
    { id: 'create', name: 'Create', icon: FileText, desc: 'Generate content', color: 'violet' },
    { id: 'solve', name: 'Solve', icon: Target, desc: 'Fix a problem', color: 'emerald' },
    { id: 'engage', name: 'Engage', icon: Users, desc: 'Start conversation', color: 'amber' },
];

const audiences = [
    'Technical experts', 'Business stakeholders', 'General public',
    'Students', 'Executives', 'Developers', 'Designers', 'Marketing team'
];

const formats = [
    'Detailed explanation', 'Bullet points', 'Step-by-step guide',
    'Comparison table', 'Executive summary', 'Code example', 'Story format'
];

const tones = [
    'Professional', 'Casual', 'Friendly', 'Authoritative',
    'Encouraging', 'Direct', 'Empathetic', 'Humorous'
];

export default function PrecisionPage() {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('');
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [format, setFormat] = useState('');
    const [tone, setTone] = useState('');
    const [constraints, setConstraints] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const goalColors: Record<string, string> = {
        red: 'border-red-500 bg-red-500/20 text-red-400',
        blue: 'border-blue-500 bg-blue-500/20 text-blue-400',
        violet: 'border-violet-500 bg-violet-500/20 text-violet-400',
        emerald: 'border-emerald-500 bg-emerald-500/20 text-emerald-400',
        amber: 'border-amber-500 bg-amber-500/20 text-amber-400',
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const prompt = `**Goal:** ${goals.find(g => g.id === goal)?.name} - ${topic}

**Persona:** You are an expert communicator specializing in ${goals.find(g => g.id === goal)?.desc.toLowerCase()}. Your audience is ${audience.toLowerCase()}.

**Communication Style:**
- Tone: ${tone}
- Format: ${format}
${constraints ? `- Additional requirements: ${constraints}` : ''}

**Your Task:**
${goal === 'persuade' ? `Craft a compelling argument that convinces ${audience.toLowerCase()} about ${topic}. Use evidence, emotional appeals, and clear logic.` : ''}
${goal === 'educate' ? `Create an educational piece that helps ${audience.toLowerCase()} understand ${topic}. Break down complex concepts and use relatable examples.` : ''}
${goal === 'create' ? `Generate original content about ${topic} that resonates with ${audience.toLowerCase()}. Be creative while maintaining relevance.` : ''}
${goal === 'solve' ? `Analyze the problem of ${topic} and provide actionable solutions for ${audience.toLowerCase()}. Be thorough and practical.` : ''}
${goal === 'engage' ? `Start an engaging dialogue about ${topic} with ${audience.toLowerCase()}. Ask thought-provoking questions and encourage interaction.` : ''}

**Success Criteria:**
- Message is clear and appropriate for the target audience
- Tone remains consistent throughout
- Key points are memorable and actionable
- Format enhances readability and engagement`;

            setGeneratedPrompt(prompt);
            setIsGenerating(false);
            setStep(5);
        }, 1500);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">What&apos;s your goal?</h2>
                            <p className="text-white/50">Choose the primary objective for your prompt</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {goals.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => { setGoal(g.id); setStep(2); }}
                                    className={`p-5 rounded-2xl border transition-all text-center ${goal === g.id ? goalColors[g.color] : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/10'
                                        }`}
                                >
                                    <g.icon className={`w-8 h-8 mx-auto mb-3 ${goal === g.id ? 'text-red-400' : 'text-white/40'}`} />
                                    <div className="font-semibold text-white">{g.name}</div>
                                    <div className="text-xs text-white/50 mt-1">{g.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">What&apos;s the topic?</h2>
                            <p className="text-white/50">Describe what you want to communicate about</p>
                        </div>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The benefits of TypeScript for large codebases"
                            className="w-full px-5 py-4 text-lg bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50"
                        />
                        <div className="flex justify-between">
                            <button onClick={() => setStep(1)} className="px-5 py-2 text-white/60 hover:bg-white/10 rounded-xl">
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!topic.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Who&apos;s your audience?</h2>
                            <p className="text-white/50">Select or describe your target audience</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {audiences.map((a) => (
                                <button
                                    key={a}
                                    onClick={() => setAudience(a)}
                                    className={`px-4 py-2 rounded-full border-2 transition-all ${audience === a
                                        ? 'border-red-500 bg-red-500/20 text-red-400'
                                        : 'border-white/10 text-white/60 hover:border-white/20'
                                        }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="Or type a custom audience..."
                            className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                        />
                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="px-5 py-2 text-white/60 hover:bg-white/10 rounded-xl">
                                Back
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={!audience.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Fine-tune your prompt</h2>
                            <p className="text-white/50">Customize format, tone, and any constraints</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Output Format</label>
                                <div className="flex flex-wrap gap-2">
                                    {formats.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFormat(f)}
                                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${format === f ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-white/10 text-white/60 hover:border-white/20'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Tone</label>
                                <div className="flex flex-wrap gap-2">
                                    {tones.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${tone === t ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-white/10 text-white/60 hover:border-white/20'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Additional Constraints (optional)</label>
                            <textarea
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                placeholder="e.g., Keep it under 500 words, include statistics, avoid jargon..."
                                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep(3)} className="px-5 py-2 text-white/60 hover:bg-white/10 rounded-xl">
                                Back
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={!format || !tone || isGenerating}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                Generate Prompt
                            </button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Your Precision Prompt</h2>
                                <p className="text-white/50">Optimized for your specific goals</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/15 text-white"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                            <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed font-sans">
                                {generatedPrompt}
                            </pre>
                        </div>

                        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20 p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-400">Optimization Summary</h3>
                                    <ul className="mt-2 space-y-1 text-sm text-white/60">
                                        <li>✓ Goal: {goals.find(g => g.id === goal)?.name}</li>
                                        <li>✓ Audience: {audience}</li>
                                        <li>✓ Format: {format}</li>
                                        <li>✓ Tone: {tone}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setStep(1); setGeneratedPrompt(''); }}
                            className="text-white/50 hover:text-white/70"
                        >
                            ← Start Over
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Precision</h1>
                    <p className="text-white/50">Goal-driven prompt optimization</p>
                </div>
            </div>

            {/* Progress Steps */}
            {step < 5 && (
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${s < step ? 'bg-red-500 text-white' :
                                s === step ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500' :
                                    'bg-white/10 text-white/40'
                                }`}>
                                {s < step ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 4 && (
                                <div className={`w-12 h-0.5 ${s < step ? 'bg-red-500' : 'bg-white/20'}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-8">
                {renderStep()}
            </div>
        </div>
    );
}
