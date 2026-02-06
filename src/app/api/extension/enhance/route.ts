import { NextRequest, NextResponse } from 'next/server';
import {
    executePipeline,
    compilePrompt,
    type TargetModel,
} from '@/lib/prompt-engine';
import {
    rewritePrompt,
    validateRewriteQuality,
    type RewrittenPrompt,
} from '@/lib/prompt-rewriter';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { isExecutiveEmail } from '@/lib/auth';
import { verifyExtensionToken } from '@/lib/extension-token';
import { getPromptUsage, incrementPromptUsage, hasExceededTrialLimit } from '@/lib/usage-tracker';

// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS — Extension Enhance Endpoint
// Bearer token auth for Chrome Extension.
//
// POST /api/extension/enhance
// Headers: Authorization: Bearer <token>
// Body: { prompt, platform }
// Returns: { enhanced, qualityScore, usage }
// ═══════════════════════════════════════════════════════════════════════════

function mapPlatformToModel(platform: string): TargetModel {
    const mapping: Record<string, TargetModel> = {
        'chatgpt': 'gpt-4',
        'gpt': 'gpt-4',
        'claude': 'claude-sonnet',
        'gemini': 'gemini',
        'grok': 'grok',
        'general': 'general',
        'code': 'code-agent',
    };
    return mapping[platform?.toLowerCase()] || 'general';
}

function corsHeaders(request: NextRequest): Record<string, string> {
    const origin = request.headers.get('origin') || '';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (origin.startsWith('chrome-extension://')) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    return headers;
}

export async function POST(request: NextRequest) {
    const headers = corsHeaders(request);

    // ─── AUTH: Verify Bearer Token ────────────────────────────
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Authentication required. Please sign in.' },
            { status: 401, headers }
        );
    }

    const token = authHeader.slice(7);
    const payload = await verifyExtensionToken(token);

    if (!payload) {
        return NextResponse.json(
            { error: 'Invalid or expired token. Please sign in again.' },
            { status: 401, headers }
        );
    }

    const email = payload.email as string;
    const tier = (payload.tier as string) || 'FREE';

    // ─── VERIFICATION CHECK ─────────────────────────────────
    if (!isExecutiveEmail(email)) {
        const { isEmailVerified } = await import('@/lib/auth');
        const verified = await isEmailVerified(email);
        if (!verified) {
            return NextResponse.json(
                { error: 'Email verification required. Check your inbox.' },
                { status: 403, headers }
            );
        }
    }

    // ─── TRIAL LIMIT CHECK ──────────────────────────────────
    if (
        tier === 'FREE' &&
        !isExecutiveEmail(email) &&
        await hasExceededTrialLimit(email, 100)
    ) {
        const currentUsage = await getPromptUsage(email);
        return NextResponse.json(
            {
                error: 'Trial limit reached',
                message: "You've used all 100 trial prompts. Upgrade to Pro for unlimited access.",
                promptsUsed: currentUsage,
                upgradeUrl: '/dashboard/billing',
            },
            { status: 403, headers }
        );
    }

    // ─── RATE LIMIT ─────────────────────────────────────────
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AI_CALLS);
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429, headers }
        );
    }

    // ─── PROCESS PROMPT ─────────────────────────────────────
    try {
        const body = await request.json();
        const { prompt, platform = 'general' } = body;

        if (!prompt || prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400, headers }
            );
        }

        const targetModel = mapPlatformToModel(platform);

        // Compile + AI rewrite
        const spec = compilePrompt(prompt);
        const resolvedLang = spec.language;

        let rewrittenResult: RewrittenPrompt | null = null;

        // Attempt AI synthesis
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const result = await rewritePrompt({
                    spec,
                    language: resolvedLang,
                    platform,
                    model: 'gpt-4o-mini',
                    temperature: attempt === 1 ? 0.5 : 0.65,
                });

                const validation = validateRewriteQuality(result);
                if (validation.valid) {
                    rewrittenResult = result;
                    break;
                }

                if (!rewrittenResult && result.prompt.length > 50) {
                    rewrittenResult = result;
                }
            } catch (err) {
                console.warn(`[extension/enhance] Attempt ${attempt} error:`, err);
            }
        }

        // Fallback to deterministic pipeline
        if (!rewrittenResult || !rewrittenResult.prompt) {
            const fallbackOutput = executePipeline({
                rawPrompt: prompt,
                targetModel,
                outputLanguage: 'auto',
            });

            return NextResponse.json({
                success: true,
                enhanced: fallbackOutput.assembledPrompt,
                qualityScore: 60,
                mode: 'deterministic-fallback',
                usage: !isExecutiveEmail(email) ? {
                    promptsUsed: await getPromptUsage(email),
                    limit: 100,
                    tier,
                } : undefined,
            }, { headers });
        }

        // Increment usage
        if (!isExecutiveEmail(email)) {
            await incrementPromptUsage(email);
        }

        // Save to DB
        try {
            const { getPrismaAsync } = await import('@/lib/prisma');
            const prisma = await getPrismaAsync();
            const dbUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: { id: true },
            });
            if (dbUser) {
                await prisma.prompt.create({
                    data: {
                        userId: dbUser.id,
                        originalPrompt: prompt,
                        fullPrompt: rewrittenResult.prompt,
                        task: rewrittenResult.sections?.mainObjective || prompt,
                        role: rewrittenResult.sections?.expertRole || null,
                        instructions: rewrittenResult.sections?.approachGuidelines || null,
                        output: rewrittenResult.sections?.outputFormat || null,
                        title: prompt.slice(0, 80),
                        tags: [platform, 'extension'],
                        tool: 'spark',
                        platform: platform || 'general',
                    },
                });

                await prisma.platformUsage.create({
                    data: {
                        userId: dbUser.id,
                        userEmail: email.toLowerCase(),
                        tool: 'spark-extension',
                        platform: platform || 'general',
                        originalPrompt: prompt,
                        enhancedPrompt: rewrittenResult.prompt,
                        domain: rewrittenResult.meta.domain || 'general',
                        qualityScore: rewrittenResult.qualityScore,
                        tokensIn: rewrittenResult.meta.tokensIn,
                        tokensOut: rewrittenResult.meta.tokensOut,
                        responseTimeMs: 0,
                        success: true,
                    },
                });
            }
        } catch (saveErr) {
            console.warn('[extension/enhance] DB save failed:', saveErr);
        }

        return NextResponse.json({
            success: true,
            enhanced: rewrittenResult.prompt,
            qualityScore: rewrittenResult.qualityScore,
            mode: 'ai-synthesized',
            usage: !isExecutiveEmail(email) ? {
                promptsUsed: await getPromptUsage(email),
                limit: 100,
                tier,
            } : undefined,
        }, { headers });

    } catch (error) {
        console.error('[extension/enhance] Error:', error);
        return NextResponse.json(
            { error: 'Failed to enhance prompt' },
            { status: 500, headers }
        );
    }
}

// ─── CORS Preflight ─────────────────────────────────────────
export async function OPTIONS(request: NextRequest) {
    const headers = corsHeaders(request);
    headers['Access-Control-Max-Age'] = '86400';
    return new NextResponse(null, { status: 204, headers });
}
