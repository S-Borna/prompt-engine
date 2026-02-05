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

        // ─── FULL PIPELINE ──────────────────────────────────────────────
        if (!inputPrompt || inputPrompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Execute full pipeline with legacy compatibility
        const result = legacyEnhance(inputPrompt, platform, lang);

        return NextResponse.json({
            ...result,
            platform,
            mode: 'pipeline',
            outputLanguage: lang,
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
            version: '1.0.0',
            stages: [
                {
                    name: 'compile',
                    description: 'Transforms raw input into structured specification',
                    outputs: [
                        'OBJECTIVE',
                        'CONTEXT',
                        'CONSTRAINTS',
                        'NON-NEGOTIABLES',
                        'ASSUMPTIONS',
                        'MISSING INFORMATION',
                        'CONFLICTS OR RISKS',
                        'ASSEMBLER NOTES',
                    ],
                },
                {
                    name: 'assemble',
                    description: 'Generates final prompt from specification + template',
                    inputs: ['CompiledSpec', 'TargetModel', 'OutputLanguage'],
                },
            ],
        },
        endpoints: {
            fullPipeline: 'POST /api/ai/enhance',
            compileOnly: 'POST /api/ai/enhance?stage=compile',
            assembleOnly: 'POST /api/ai/enhance?stage=assemble',
        },
        supportedModels: [
            'gpt-5', 'gpt-4', 'gpt-3.5',
            'claude-opus', 'claude-sonnet', 'claude-haiku',
            'gemini', 'grok', 'code-agent', 'general',
        ],
        supportedLanguages: ['en', 'sv', 'auto'],
        behavioralLocks: [
            'NO creative enhancement',
            'NO guessing or assumption resolution',
            'ALL ambiguity marked as UNDECIDED',
            'Deterministic, reproducible output',
        ],
    });
}
