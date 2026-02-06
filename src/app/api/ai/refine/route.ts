import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import {
    rewritePrompt,
    validateRewriteQuality,
} from '@/lib/prompt-rewriter';
import { compilePrompt } from '@/lib/prompt-engine';

// ═══════════════════════════════════════════════════════════════════════════
// REFINE API — AI-generated wizard questions + structured refinement
// ═══════════════════════════════════════════════════════════════════════════

let _openai: OpenAI | null = null;
function getClient(): OpenAI {
    if (!_openai) {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY required');
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

/**
 * POST /api/ai/refine
 *
 * Two modes:
 *   1. ?stage=questions — Generate 5 domain-specific questions from the prompt
 *   2. ?stage=generate  — Generate structured prompt from answers
 */
export async function POST(request: NextRequest) {
    const rateLimitResult = await rateLimit(request, RateLimitPresets.AI_CALLS);
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded', resetTime: rateLimitResult.resetTime },
            { status: 429 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage') || 'questions';
        const body = await request.json();

        // ── STAGE 1: Generate questions ─────────────────────────────────
        if (stage === 'questions') {
            const { prompt, platform } = body;
            if (!prompt?.trim()) {
                return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
            }

            const client = getClient();
            const completion = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                temperature: 0.4,
                max_tokens: 1500,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: `You are a prompt refinement assistant. Given a user's raw prompt, generate exactly 5 clarifying questions that will help create a much better, more specific prompt.

Each question must:
- Be directly relevant to the user's specific request (not generic)
- Have 4-5 predefined answer options + an "Other (I'll specify)" option
- Help narrow down scope, audience, constraints, or approach

OUTPUT FORMAT: Respond with a JSON object:
{
  "domain": "coding|business|cooking|fitness|writing|education|creative|data|general",
  "questions": [
    {
      "id": 1,
      "question": "The question text",
      "options": [
        { "id": "a", "label": "Option label", "description": "Brief clarification" },
        { "id": "b", "label": "Option label", "description": "Brief clarification" },
        { "id": "c", "label": "Option label", "description": "Brief clarification" },
        { "id": "d", "label": "Option label", "description": "Brief clarification" },
        { "id": "other", "label": "Other (I'll specify)", "description": "Custom answer" }
      ]
    }
  ]
}

RULES:
- Questions must be specific to the user's topic, not generic
- First question: about the CORE DELIVERABLE or feature set
- Second question: about the PLATFORM or medium
- Third question: about the TARGET AUDIENCE
- Fourth question: about STYLE or APPROACH
- Fifth question: about CONSTRAINTS or limitations
- Keep option labels concise (2-6 words)
- Keep descriptions to one short phrase`
                    },
                    {
                        role: 'user',
                        content: `Generate 5 clarifying questions for this prompt:\n\n"${prompt}"\n\nTarget platform: ${platform || 'ChatGPT'}`
                    }
                ],
            });

            const raw = completion.choices[0]?.message?.content?.trim() || '';
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                return NextResponse.json({ error: 'Failed to parse questions' }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                domain: parsed.domain || 'general',
                questions: parsed.questions || [],
                tokensUsed: completion.usage?.total_tokens,
            });
        }

        // ── STAGE 2: Generate refined prompt from answers ───────────────
        if (stage === 'generate') {
            const { prompt, platform, answers, domain } = body;
            if (!prompt?.trim() || !answers) {
                return NextResponse.json({ error: 'Prompt and answers required' }, { status: 400 });
            }

            // Build enriched prompt from original + answers
            const answerContext = Object.entries(answers as Record<string, string>)
                .map(([q, a]) => `- ${q}: ${a}`)
                .join('\n');

            const enrichedInput = `${prompt}\n\nAdditional context from user:\n${answerContext}`;

            // Use existing rewriter with the enriched prompt
            const spec = compilePrompt(enrichedInput);
            const resolvedLang = spec.language;

            const platformToLang: Record<string, 'en' | 'sv'> = {
                'chatgpt': 'en', 'claude': 'en', 'gemini': 'en',
                'grok': 'en', 'perplexity': 'en', 'general': 'en',
            };

            const startTime = Date.now();
            const result = await rewritePrompt({
                spec,
                language: platformToLang[platform?.toLowerCase() || 'chatgpt'] || resolvedLang,
                platform: platform || 'general',
                model: 'gpt-4o-mini',
                temperature: 0.5,
            });

            const elapsed = Date.now() - startTime;

            return NextResponse.json({
                success: true,
                enhanced: result.prompt,
                sections: result.sections,
                improvements: result.improvements,
                domain: result.meta.domain,
                quality: {
                    score: result.qualityScore,
                    meetsBar: result.meetsQualityBar,
                },
                meta: {
                    tokensIn: result.meta.tokensIn,
                    tokensOut: result.meta.tokensOut,
                    timeMs: elapsed,
                    model: platform || 'chatgpt',
                    domain: result.meta.domain,
                },
            });
        }

        return NextResponse.json({ error: 'Invalid stage. Use ?stage=questions or ?stage=generate' }, { status: 400 });

    } catch (error) {
        console.error('Refine API error:', error);
        return NextResponse.json(
            { error: 'Refinement failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
