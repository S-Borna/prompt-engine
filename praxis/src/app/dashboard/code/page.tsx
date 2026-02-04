'use client';

import { useState } from 'react';
import {
    Code, Play, Copy, Check, Settings2, Sparkles,
    FileCode, Bug, TestTube, BookOpen, Terminal, GitBranch,
    ChevronDown, Zap, Download, Share2
} from 'lucide-react';
import { EnhancedPromptRenderer } from '@/components/ui/TypeWriter';

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
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    const handleGenerate = () => {
        if (!code.trim()) return;
        setIsProcessing(true);

        setTimeout(() => {
            let prompt = '';
            switch (mode) {
                case 'explain':
                    prompt = `You are a senior ${language} developer and technical educator. Analyze and explain the following code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Provide a comprehensive explanation including:**

1. **Overview** - What this code does at a high level
2. **Line-by-Line Breakdown** - Explain each significant section
3. **Key Concepts** - Important patterns or techniques used
4. **Potential Issues** - Any bugs, edge cases, or improvements
5. **Best Practices** - How this code follows or deviates from standards

Use clear, beginner-friendly language while being technically accurate. Include code comments where helpful.`;
                    break;
                case 'debug':
                    prompt = `You are an expert debugger specializing in ${language}. Analyze this code for bugs and issues:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Perform a thorough debugging analysis:**

1. **Syntax Errors** - Any syntax issues preventing compilation/execution
2. **Logic Bugs** - Flawed logic that produces incorrect results
3. **Edge Cases** - Unhandled scenarios that could cause failures
4. **Performance Issues** - Inefficient code patterns
5. **Security Vulnerabilities** - Potential security risks

For each issue found:
- Describe the problem clearly
- Explain why it's problematic
- Provide the corrected code
- Suggest preventive measures`;
                    break;
                case 'test':
                    prompt = `You are a test-driven development expert for ${language}. Generate comprehensive tests for:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

**Generate a complete test suite including:**

1. **Unit Tests** - Test each function/method in isolation
2. **Edge Cases** - Boundary conditions and unusual inputs
3. **Error Handling** - Verify proper error responses
4. **Integration Points** - Test interactions between components

Use the appropriate testing framework (Jest/Mocha for JS/TS, pytest for Python, etc.)
Include setup/teardown, mocking, and clear test descriptions.`;
                    break;
                default:
                    prompt = `Analyze this ${language} code:\n\`\`\`\n${code}\n\`\`\``;
            }

            setShouldAnimate(true);
            setOutput(prompt);
            setIsProcessing(false);
        }, 1200);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

                {/* Output */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-white">Generated Prompt</span>
                        </div>
                        {output && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="h-80 p-5 overflow-y-auto">
                        {output ? (
                            <EnhancedPromptRenderer
                                content={output}
                                animate={shouldAnimate}
                                onAnimationComplete={() => setShouldAnimate(false)}
                                className="text-white/80 text-sm leading-relaxed"
                                speed={60}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <Code className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-white/60 mb-2">Your optimized prompt will appear here</p>
                                <p className="text-sm text-white/40">Paste code and select a mode to get started</p>
                            </div>
                        )}
                    </div>
                    {output && (
                        <div className="px-5 py-4 bg-white/5 border-t border-white/10">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <Zap className="w-4 h-4" />
                                    Optimized for {language}
                                </span>
                            </div>
                        </div>
                    )}
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
