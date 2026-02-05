'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// ═══════════════════════════════════════════════════════════════════════════
// MARKDOWN RENDERER — Renders AI output as formatted, readable content
// Used in Spark output panels to visually differentiate enhanced vs original
// ═══════════════════════════════════════════════════════════════════════════

const markdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="text-lg font-bold text-white/95 mb-3 mt-4 first:mt-0 border-b border-white/[0.06] pb-2">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-base font-semibold text-white/90 mb-2 mt-4 first:mt-0">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-sm font-semibold text-white/85 mb-1.5 mt-3 first:mt-0">
            {children}
        </h3>
    ),
    p: ({ children }) => (
        <p className="text-sm leading-relaxed text-white/70 mb-3 last:mb-0">
            {children}
        </p>
    ),
    ul: ({ children }) => (
        <ul className="list-disc list-outside ml-5 mb-3 space-y-1 text-sm text-white/70">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-outside ml-5 mb-3 space-y-1 text-sm text-white/70">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="leading-relaxed">{children}</li>
    ),
    strong: ({ children }) => (
        <strong className="font-semibold text-white/90">{children}</strong>
    ),
    em: ({ children }) => (
        <em className="italic text-white/75">{children}</em>
    ),
    code: ({ children, className }) => {
        const isBlock = className?.includes('language-');
        if (isBlock) {
            return (
                <code className="block text-[13px] leading-relaxed font-mono text-emerald-300/90">
                    {children}
                </code>
            );
        }
        return (
            <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[13px] font-mono text-violet-300/90">
                {children}
            </code>
        );
    },
    pre: ({ children }) => (
        <pre className="mb-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-x-auto text-sm">
            {children}
        </pre>
    ),
    table: ({ children }) => (
        <div className="mb-3 overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-sm">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
    ),
    tr: ({ children }) => (
        <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
        <th className="px-3 py-2 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-3 py-2 text-sm text-white/65">{children}</td>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-violet-500/40 pl-3 mb-3 text-white/55 italic">
            {children}
        </blockquote>
    ),
    hr: () => (
        <hr className="my-4 border-white/[0.06]" />
    ),
    a: ({ children, href }) => (
        <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
            {children}
        </a>
    ),
};

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`markdown-output ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
