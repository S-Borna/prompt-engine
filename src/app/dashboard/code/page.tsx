'use client';

import { useState } from 'react';
import {
    Code, Sparkles, Bug, TestTube, BookOpen, Terminal, GitBranch, FileCode,
    ChevronDown, Zap, Loader2
} from 'lucide-react';
import { EnhancedPromptOutput, EnhancedPromptResult } from '@/components/ui/EnhancedPromptOutput';

// ═══════════════════════════════════════════════════════════════════════════
// CODE WHISPER - Developer-Focused Prompt Generation
// Dark theme unified with landing page
// ═══════════════════════════════════════════════════════════════════════════

const modes = [
    { id: 'explain', name: 'Explain Code', icon: BookOpen, desc: 'Get clear explanations' },
    { id: 'debug', name: 'Debug', icon: Bug, desc: 'Find and fix issues' },
    { id: 'test', name: 'Write Tests', icon: TestTube, desc: 'Generate test cases' },
    { id: 'refactor', name: 'Refactor', icon: GitBranch, desc: 'Improve code quality' },
    { id: 'document', name: 'Document', icon: FileCode, desc: 'Add documentation' },
];

const languages = [
    'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'Ruby', 'PHP', 'Swift'
];

const frameworks = {
    TypeScript: ['React', 'Next.js', 'Node.js', 'Express', 'NestJS'],
    JavaScript: ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
    Python: ['Django', 'FastAPI', 'Flask', 'PyTorch', 'TensorFlow'],
};

export default function CodeWhisperPage() {
    const [mode, setMode] = useState('explain');
    const [language, setLanguage] = useState('TypeScript');
    const [code, setCode] = useState('');
    const [result, setResult] = useState<EnhancedPromptResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    const handleGenerate = () => {
        if (!code.trim()) return;
        setIsProcessing(true);
        setShouldAnimate(true);

        setTimeout(() => {
            // Generate CLEAN enhanced prompt - no system instructions
            let enhancedPrompt = '';
            let explanation: string[] = [];

            switch (mode) {
                case 'explain':
                    enhancedPrompt = `Explain this ${language} code clearly. Start with a high-level overview, then break down each significant section. Identify key patterns, potential issues, and how it aligns with best practices.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Added structure for explanation', 'Specified code context', 'Requested best practices review'];
                    break;
                case 'debug':
                    enhancedPrompt = `Debug this ${language} code. Identify syntax errors, logic bugs, unhandled edge cases, performance issues, and security vulnerabilities. For each issue, explain the problem, why it matters, and provide the corrected code.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Structured debugging approach', 'Requested fixes with explanations', 'Added security review'];
                    break;
                case 'test':
                    enhancedPrompt = `Generate a comprehensive test suite for this ${language} code. Include unit tests, edge cases, error handling, and integration tests using the appropriate framework.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Added test coverage scope', 'Specified framework usage', 'Included edge cases'];
                    break;
                case 'refactor':
                    enhancedPrompt = `Refactor this ${language} code to improve readability, performance, and maintainability. Apply SOLID principles, reduce complexity, and add clear documentation.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Added refactoring goals', 'Specified SOLID principles', 'Requested documentation'];
                    break;
                case 'document':
                    enhancedPrompt = `Add comprehensive documentation to this ${language} code. Include JSDoc/docstrings, inline comments for complex logic, and a README-style overview.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Specified documentation format', 'Requested inline comments', 'Added overview requirement'];
                    break;
                default:
                    enhancedPrompt = `Analyze this ${language} code and provide insights.\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
                    explanation = ['Added analysis context'];
            }

            setResult({
                originalPrompt: `${modes.find(m => m.id === mode)?.name}: ${code.slice(0, 50)}...`,
                enhancedPrompt,
                explanation,
                meta: { mode, model: language },
            });
            setIsProcessing(false);
        }, 800);
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Code Whisper</h1>
                        <p className="text-white/50">Developer-focused prompt generation</p>
                    </div>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="appearance-none px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        >
                            {languages.map((lang) => (
                                <option key={lang} className="bg-[#1a1a24] text-white">{lang}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-wrap gap-3">
                {modes.map((m) => {
                    const isActive = mode === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${isActive ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.05] hover:border-white/10'
                                }`}
                        >
                            <m.icon className="w-5 h-5" />
                            <span className="font-medium">{m.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Code Editor */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Input */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-white/50" />
                            <span className="font-semibold text-white">Your Code</span>
                        </div>
                        <span className="text-xs text-white/40">{language}</span>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={`// Paste your ${language} code here...

function example() {
  // Your code
}`}
                        className="w-full h-80 p-5 font-mono text-sm bg-[#0d0d14] text-emerald-400 placeholder-white/30 resize-none focus:outline-none"
                        style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                    />
                    <div className="px-5 py-4 bg-white/5 border-t border-white/10">
                        <button
                            onClick={handleGenerate}
                            disabled={!code.trim() || isProcessing}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate {modes.find(m => m.id === mode)?.name} Prompt
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output — Uses Global EnhancedPromptOutput */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="p-5">
                        <EnhancedPromptOutput
                            result={result}
                            animate={shouldAnimate}
                            onAnimationComplete={() => setShouldAnimate(false)}
                            showSave={false}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Bug, label: 'Debug Error', desc: 'Fix runtime errors' },
                    { icon: TestTube, label: 'Generate Tests', desc: 'Create test suite' },
                    { icon: BookOpen, label: 'Add Docs', desc: 'Document code' },
                    { icon: GitBranch, label: 'Review PR', desc: 'Code review prompt' },
                ].map((action) => (
                    <button
                        key={action.label}
                        onClick={() => setMode(action.label === 'Debug Error' ? 'debug' : action.label === 'Generate Tests' ? 'test' : 'document')}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
                    >
                        <action.icon className="w-6 h-6 text-emerald-400 mb-2" />
                        <div className="font-semibold text-white">{action.label}</div>
                        <div className="text-sm text-white/50">{action.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}
