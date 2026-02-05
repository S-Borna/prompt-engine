import { NextRequest, NextResponse } from 'next/server';
import {
    executePipeline,
    legacyEnhance,
    compilePrompt,
    assemblePrompt,
    type PipelineInput,
    type TargetModel,
    type CompiledSpec,
} from '@/lib/prompt-engine';
import {
    rewritePrompt,
    validateRewriteQuality,
    type RewrittenPrompt,
} from '@/lib/prompt-rewriter';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS PROMPT ENGINE API
// ═══════════════════════════════════════════════════════════════════════════
//
// TWO-STAGE DETERMINISTIC PIPELINE:
//   Stage 1: PROMPT COMPILER — Extracts structure, surfaces unknowns
//   Stage 2: PROMPT ASSEMBLER — Mechanical assembly from spec + template
//
// ENDPOINTS:
//   POST /api/ai/enhance — Full pipeline (legacy compatible)
//   POST /api/ai/enhance?stage=compile — Stage 1 only
//   POST /api/ai/enhance?stage=assemble — Stage 2 only
//   GET /api/ai/enhance — Pipeline metadata
//
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map platform names to target models
 */
function mapPlatformToModel(platform: string): TargetModel {
    const mapping: Record<string, TargetModel> = {
        'chatgpt': 'gpt-4',
        'gpt': 'gpt-4',
        'gpt-5': 'gpt-5',
        'gpt-5.2': 'gpt-5',
        'gpt-5.1': 'gpt-5',
        'claude': 'claude-sonnet',
        'claude-sonnet': 'claude-sonnet',
        'claude-sonnet-4.5': 'claude-sonnet',
        'claude-opus': 'claude-opus',
        'claude-opus-4.1': 'claude-opus',
        'gemini': 'gemini',
        'gemini-3': 'gemini',
        'gemini-2.5': 'gemini',
        'grok': 'grok',
        'grok-3': 'grok',
        'grok-2': 'grok',
        'nano-banana-pro': 'general',
        'sora': 'general',
        'code': 'code-agent',
        'code-agent': 'code-agent',
        'general': 'general',
    };

    return mapping[platform.toLowerCase()] || 'general';
}

/**
 * Map output language parameter
 */
function mapOutputLanguage(lang: string | undefined): 'en' | 'sv' | 'auto' {
    if (!lang) return 'auto';

    const mapping: Record<string, 'en' | 'sv' | 'auto'> = {
        'auto': 'auto',
        'en': 'en',
        'english': 'en',
        'sv': 'sv',
        'swedish': 'sv',
        'svenska': 'sv',
        'sv-to-en': 'en', // Swedish input, English output
        'sv-en': 'en',
    };

    return mapping[lang.toLowerCase()] || 'auto';
}

/**
 * POST /api/ai/enhance
 *
 * Main endpoint for prompt processing.
 *
 * Query params:
 *   stage=compile   — Run Stage 1 only, return compiled spec
 *   stage=assemble  — Run Stage 2 only, requires spec in body
 *   (none)          — Run full pipeline
 *
 * Body:
 *   rawPrompt / prompt — The user's raw input
 *   platform           — Target model platform
 *   outputLanguage     — Output language preference
 *   spec               — (For stage=assemble) Compiled spec from Stage 1
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage');

        const body = await request.json();
        const {
            rawPrompt,
            prompt,
            platform = 'general',
            outputLanguage,
            spec: providedSpec,
        } = body;

        const inputPrompt = rawPrompt || prompt;
        const targetModel = mapPlatformToModel(platform);
        const lang = mapOutputLanguage(outputLanguage);

        // ─── STAGE 1 ONLY: Compile ──────────────────────────────────────
        if (stage === 'compile') {
            if (!inputPrompt || inputPrompt.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Prompt is required for compilation' },
                    { status: 400 }
                );
            }

            const spec = compilePrompt(inputPrompt);

            return NextResponse.json({
                success: true,
                stage: 'compile',
                spec,
                meta: {
                    pipelineVersion: '1.0.0',
                    compiledAt: new Date().toISOString(),
                },
            });
        }

        // ─── STAGE 2 ONLY: Assemble ─────────────────────────────────────
        if (stage === 'assemble') {
            if (!providedSpec) {
                return NextResponse.json(
                    { error: 'Compiled spec is required for assembly' },
                    { status: 400 }
                );
            }

            const output = assemblePrompt({
                spec: providedSpec as CompiledSpec,
                targetModel,
                outputLanguage: lang,
            });

            return NextResponse.json({
                success: true,
                stage: 'assemble',
                assembledPrompt: output.assembledPrompt,
                warnings: output.warnings,
                meta: output.meta,
            });
        }

        // ─── FULL PIPELINE: AI-SYNTHESIZED PROMPTS ──────────────────────
        if (!inputPrompt || inputPrompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Step 1: Compile the prompt to extract structure
        const spec = compilePrompt(inputPrompt);

        // Step 2: Add synthesis delay (400-700ms) so users perceive "thinking"
        const synthesisDelayMs = 400 + Math.random() * 300; // 400-700ms
        await new Promise(resolve => setTimeout(resolve, synthesisDelayMs));

        // Step 3: Use AI to synthesize a natural language prompt
        let rewrittenResult: RewrittenPrompt;
        try {
            rewrittenResult = await rewritePrompt({
                spec,
                language: lang === 'auto' ? spec.language : lang,
                model: 'gpt-4o',
                temperature: 0.4
            });
        } catch (error) {
            console.error('Rewriter failed:', error);
            return NextResponse.json(
                { error: 'Failed to synthesize enhanced prompt' },
                { status: 500 }
            );
        }

        // Step 4: Validate quality
        const validation = validateRewriteQuality(rewrittenResult);
        if (!validation.valid) {
            return NextResponse.json({
                error: 'Enhanced prompt did not meet quality bar',
                reason: validation.reason,
                qualityScore: rewrittenResult.qualityScore,
            }, { status: 400 });
        }

        // Step 5: Return the synthesized prompt
        return NextResponse.json({
            success: true,
            enhanced: rewrittenResult.prompt,
            original: inputPrompt,
            platform,
            mode: 'ai-synthesized',
            outputLanguage: lang,
            quality: {
                score: rewrittenResult.qualityScore,
                meetsBar: rewrittenResult.meetsQualityBar,
                specificityMultiplier: rewrittenResult.meta.specificityMultiplier,
            },
            meta: {
                pipelineVersion: '3.0.0-ai',
                synthesizedAt: rewrittenResult.meta.synthesizedAt,
                originalLength: rewrittenResult.meta.originalLength,
                enhancedLength: rewrittenResult.meta.rewrittenLength,
            },
        });

    } catch (error) {
        console.error('Pipeline error:', error);
        return NextResponse.json(
            { error: 'Failed to process prompt' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/enhance
 *
 * Returns pipeline metadata and configuration
 */
export async function GET() {
    return NextResponse.json({
        pipeline: {
            version: '3.0.0-ai',
            architecture: 'AI-Synthesized Prompt Generation',
            stages: [
                {
                    name: 'compile',
                    description: 'Transforms raw input into structured specification (deterministic)',
                    outputs: [
                        'OBJECTIVE',
                        'CONTEXT',
                        'CONSTRAINTS',
                        'NON-NEGOTIABLES',
                        'ASSUMPTIONS',
                        'MISSING INFORMATION',
                        'CONFLICTS OR RISKS',
                    ],
                },
                {
                    name: 'synthesize',
                    description: 'AI rewrites the prompt using GPT-4 (non-deterministic, quality-driven)',
                    inputs: ['CompiledSpec', 'Language'],
                    outputs: ['Natural language prompt (no templates, no structure labels)'],
                    model: 'gpt-4o',
                    temperature: 0.4,
                },
                {
                    name: 'validate',
                    description: 'Quality check: ensures 3-5× specificity, no template markers',
                    requirements: [
                        'Specificity multiplier >= 3×',
                        'Length >= 50 characters',
                        'No template structure markers (ROLE:, TASK:, etc.)',
                    ],
                },
            ],
        },
        endpoints: {
            fullPipeline: 'POST /api/ai/enhance',
            compileOnly: 'POST /api/ai/enhance?stage=compile',
            assembleOnly: 'POST /api/ai/enhance?stage=assemble (DEPRECATED - use full pipeline)',
        },
        supportedModels: [
            'gpt-5', 'gpt-4', 'gpt-3.5',
            'claude-opus', 'claude-sonnet', 'claude-haiku',
            'gemini', 'grok', 'code-agent', 'general',
        ],
        supportedLanguages: ['en', 'sv', 'auto'],
        qualityGuarantees: [
            'Enhanced prompt is 3-5× more specific than original',
            'Natural language output (no visible structure)',
            'AI-synthesized from scratch (not template-based)',
            'Validated quality before delivery',
            '400-700ms synthesis delay for perceived thinking',
        ],
    });
}
