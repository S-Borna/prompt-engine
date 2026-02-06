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
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';
import { isExecutiveEmail } from '@/lib/auth';
import { getPromptUsage, incrementPromptUsage, hasExceededTrialLimit } from '@/lib/usage-tracker';

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
        'claude-opus-4.5': 'claude-opus',
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
    // ─── AUTHENTICATION & VERIFICATION ──────────────────────────────
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    // Check email verification (executives auto-verified)
    if (!session.user.isVerified && !isExecutiveEmail(session.user.email)) {
        return NextResponse.json(
            { error: 'Email verification required. Please check your inbox.' },
            { status: 403 }
        );
    }

    // Check 100-prompt trial limit (executives get unlimited)
    if (
        session.user.role === 'trial' &&
        !isExecutiveEmail(session.user.email) &&
        await hasExceededTrialLimit(session.user.email, 100)
    ) {
        const currentUsage = await getPromptUsage(session.user.email);
        return NextResponse.json(
            {
                error: 'Trial limit reached',
                message: "You've used all 100 trial prompts. Upgrade to Standard ($9.99/mo) for unlimited access.",
                promptsUsed: currentUsage,
                upgradeUrl: '/dashboard/billing',
            },
            { status: 403 }
        );
    }

    // ─── RATE LIMITING ──────────────────────────────────────────────
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AI_CALLS);

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                resetTime: rateLimitResult.resetTime,
                message: 'Too many requests. Please try again later.',
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': String(RateLimitPresets.AI_CALLS.maxRequests),
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                }
            }
        );
    }

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
        const resolvedLang = lang === 'auto' ? spec.language : lang;

        // Step 2: Use AI to synthesize — with retry and fallback
        const MAX_RETRIES = 2;
        let rewrittenResult: RewrittenPrompt | null = null;
        let lastError: string | null = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await rewritePrompt({
                    spec,
                    language: resolvedLang,
                    platform,
                    model: 'gpt-4o-mini',
                    // Slightly higher temperature on retry for variation
                    temperature: attempt === 1 ? 0.5 : 0.65,
                });

                const validation = validateRewriteQuality(result);
                if (validation.valid) {
                    rewrittenResult = result;
                    break;
                }

                lastError = validation.reason || 'Quality validation failed';
                console.warn(`[enhance] Attempt ${attempt} failed quality check: ${lastError}`);

                // If quality check fails but we have a result, keep it as fallback
                if (!rewrittenResult && result.prompt.length > 50) {
                    rewrittenResult = result;
                }
            } catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown error';
                console.error(`[enhance] Attempt ${attempt} error:`, lastError);
            }
        }

        // Step 3: Fallback to deterministic pipeline if AI fails completely
        if (!rewrittenResult || !rewrittenResult.prompt) {
            console.warn('[enhance] All AI attempts failed, falling back to deterministic pipeline');
            const fallbackOutput = executePipeline({
                rawPrompt: inputPrompt,
                targetModel,
                outputLanguage: lang,
            });

            return NextResponse.json({
                success: true,
                enhanced: fallbackOutput.assembledPrompt,
                original: inputPrompt,
                platform,
                mode: 'deterministic-fallback',
                outputLanguage: lang,
                quality: {
                    score: 60,
                    meetsBar: true,
                    specificityMultiplier: 2.0,
                },
                spec: fallbackOutput.spec,
                warnings: fallbackOutput.warnings,
                meta: {
                    pipelineVersion: '4.0.0',
                    fallbackReason: lastError,
                    synthesizedAt: new Date().toISOString(),
                    originalLength: inputPrompt.length,
                    enhancedLength: fallbackOutput.assembledPrompt.length,
                },
            });
        }

        // Step 4: Return the synthesized prompt
        // Increment usage counter (except for executives)
        if (!isExecutiveEmail(session.user.email)) {
            const newUsage = await incrementPromptUsage(session.user.email);
            console.log(`✓ Prompt usage incremented for ${session.user.email}: ${newUsage}/100`);
        }

        // Save prompt to database for user history
        try {
            const { getPrismaAsync } = await import('@/lib/prisma');
            const prisma = await getPrismaAsync();
            const dbUser = await prisma.user.findUnique({
                where: { email: session.user.email.toLowerCase() },
                select: { id: true },
            });
            if (dbUser) {
                await prisma.prompt.create({
                    data: {
                        userId: dbUser.id,
                        originalPrompt: inputPrompt,
                        fullPrompt: rewrittenResult.prompt,
                        task: rewrittenResult.sections?.mainObjective || inputPrompt,
                        role: rewrittenResult.sections?.expertRole || null,
                        instructions: rewrittenResult.sections?.approachGuidelines || null,
                        output: rewrittenResult.sections?.outputFormat || null,
                        title: inputPrompt.slice(0, 80),
                        tags: [platform],
                        tool: 'spark',
                        platform: platform || 'general',
                    },
                });

                // Log to platform analytics (site-owned, separate from user data)
                await prisma.platformUsage.create({
                    data: {
                        userId: dbUser.id,
                        userEmail: session.user.email.toLowerCase(),
                        tool: 'spark',
                        platform: platform || 'general',
                        originalPrompt: inputPrompt,
                        enhancedPrompt: rewrittenResult.prompt,
                        domain: rewrittenResult.meta.domain || 'general',
                        qualityScore: rewrittenResult.qualityScore,
                        tokensIn: rewrittenResult.meta.tokensIn,
                        tokensOut: rewrittenResult.meta.tokensOut,
                        responseTimeMs: Date.now() - (Date.now() - (rewrittenResult.meta.tokensIn ? 1 : 0)),
                        success: true,
                    },
                });
            }
        } catch (saveErr) {
            // Non-critical — log but don't fail the response
            console.warn('[enhance] Failed to save prompt to DB:', saveErr);
        }

        return NextResponse.json({
            success: true,
            enhanced: rewrittenResult.prompt,
            sections: rewrittenResult.sections,
            improvements: rewrittenResult.improvements,
            original: inputPrompt,
            platform,
            mode: 'ai-synthesized',
            outputLanguage: lang,
            quality: {
                score: rewrittenResult.qualityScore,
                meetsBar: rewrittenResult.meetsQualityBar,
                specificityMultiplier: rewrittenResult.meta.specificityMultiplier,
            },
            spec,
            meta: {
                pipelineVersion: '5.0.0',
                synthesizedAt: rewrittenResult.meta.synthesizedAt,
                originalLength: rewrittenResult.meta.originalLength,
                enhancedLength: rewrittenResult.meta.rewrittenLength,
                domain: rewrittenResult.meta.domain,
                tokensIn: rewrittenResult.meta.tokensIn,
                tokensOut: rewrittenResult.meta.tokensOut,
            },
            usage: !isExecutiveEmail(session.user.email)
                ? {
                    promptsUsed: await getPromptUsage(session.user.email),
                    promptsRemaining: Math.max(0, 100 - await getPromptUsage(session.user.email)),
                    isTrialUser: session.user.role === 'trial',
                }
                : undefined,
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
            version: '4.0.0',
            architecture: 'AI-Synthesized Prompt Generation with Retry & Fallback',
            model: 'gpt-4o-mini',
            stages: [
                {
                    name: 'compile',
                    description: 'Extracts structure, detects domain, surfaces unknowns (deterministic)',
                },
                {
                    name: 'synthesize',
                    description: 'AI rewrites using gpt-4o-mini with domain-adaptive meta-prompts',
                    retries: 2,
                    fallback: 'Deterministic assembler if AI fails',
                },
                {
                    name: 'validate',
                    description: 'Adaptive quality check based on input length',
                },
            ],
        },
        supportedLanguages: ['en', 'sv', 'auto'],
    });
}
