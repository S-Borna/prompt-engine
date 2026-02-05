// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS PROMPT REWRITER — AI-SYNTHESIZED PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════
//
// MISSION:
//   Transform user prompts into expert-level execution prompts using AI
//   NOT template-based, NOT form-filling
//   Output must feel written by a senior expert from scratch
//
// BEHAVIORAL LOCKS:
//   - MUST preserve user's original intent
//   - MUST make explicit decisions where vague
//   - MUST choose ONE interpretation (no hedging)
//   - MUST NOT ask questions or offer options
//   - MUST NOT use visible structure labels (ROLE:, TASK:, etc.)
//   - Output must be 3-5× more specific than input
//
// ═══════════════════════════════════════════════════════════════════════════

import OpenAI from 'openai';
import { CompiledSpec } from './prompt-engine';

/**
 * Lazy-initialized OpenAI client (for build compatibility)
 */
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required for prompt rewriting');
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

/**
 * Configuration for the Prompt Rewriter
 */
export interface PromptRewriterConfig {
    /** The compiled spec from Stage 1 analysis */
    spec: CompiledSpec;

    /** Target language for output */
    language: 'en' | 'sv';

    /** Model to use for rewriting (GPT-4 recommended) */
    model?: string;

    /** Temperature for creativity (0.3-0.5 recommended for consistency) */
    temperature?: number;
}

/**
 * Result of prompt rewriting
 */
export interface RewrittenPrompt {
    /** The synthesized prompt (natural language, no templates) */
    prompt: string;

    /** Quality score (0-100) based on specificity increase */
    qualityScore: number;

    /** Whether the rewrite meets quality bar */
    meetsQualityBar: boolean;

    /** Metadata about the rewrite */
    meta: {
        originalLength: number;
        rewrittenLength: number;
        specificityMultiplier: number;
        synthesizedAt: string;
    };
}

/**
 * CORE: AI-Powered Prompt Rewriter
 *
 * Takes the compiled spec and user's raw input, synthesizes a natural language
 * prompt that feels "thought-through" and "opinionated"
 *
 * NOT a template. NOT a form. This is AI-generated from scratch.
 */
export async function rewritePrompt(
    config: PromptRewriterConfig
): Promise<RewrittenPrompt> {
    const {
        spec,
        language,
        model = 'gpt-4o',
        temperature = 0.4
    } = config;

    const client = getOpenAIClient();

    // Build the meta-prompt that instructs GPT-4 how to rewrite
    const metaPrompt = buildRewriterMetaPrompt(spec, language);

    try {
        const completion = await client.chat.completions.create({
            model,
            temperature,
            messages: [
                {
                    role: 'system',
                    content: metaPrompt.systemPrompt
                },
                {
                    role: 'user',
                    content: metaPrompt.userPrompt
                }
            ],
        });

        const synthesizedPrompt = completion.choices[0]?.message?.content?.trim() || '';

        if (!synthesizedPrompt) {
            throw new Error('Rewriter produced empty output');
        }

        // Calculate quality metrics
        const originalLength = spec.rawInput.length;
        const rewrittenLength = synthesizedPrompt.length;
        const specificityMultiplier = rewrittenLength / originalLength;

        // Quality bar: must be 3-5× more specific
        const qualityScore = Math.min(100, Math.round((specificityMultiplier / 3) * 100));
        const meetsQualityBar = specificityMultiplier >= 3 && specificityMultiplier <= 10;

        return {
            prompt: synthesizedPrompt,
            qualityScore,
            meetsQualityBar,
            meta: {
                originalLength,
                rewrittenLength,
                specificityMultiplier: Math.round(specificityMultiplier * 10) / 10,
                synthesizedAt: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Prompt rewriter error:', error);
        throw new Error(`Failed to synthesize prompt: ${error}`);
    }
}

/**
 * Builds the meta-prompt that instructs the rewriter AI
 *
 * This is the critical logic that ensures quality output
 */
function buildRewriterMetaPrompt(
    spec: CompiledSpec,
    language: 'en' | 'sv'
): { systemPrompt: string; userPrompt: string } {

    const isSwedish = language === 'sv';

    const systemPrompt = isSwedish ? `
Du är en expert prompt-ingenjör med 15+ års erfarenhet.

Din uppgift: Ta användarens vaga prompt och omformulera den som en senior expert skulle ha skrivit den från början.

KRITISKA REGLER:
1. Skriv promten som EN sammanhängande text i naturligt språk
2. INGEN synlig struktur (inga "ROLL:", "UPPGIFT:", "CONSTRAINTS:" etc.)
3. GÖR EXPLICIT val där användaren är vag — gissa INTE, välj det mest rimliga
4. Var 3-5× mer specifik än originalet
5. Låt som att DU är experten som skriver detta, inte som att du förklarar för en AI
6. Inkludera implicit expertis, inte instruktioner OM expertis
7. Inga generiska fraser — varje mening måste tillföra värde
8. Inga frågor — endast decisiva uttalanden
9. Skriv som en genomtänkt brief till dig själv, inte som en mall

KVALITETSBAR:
Om någon läser din omskrivna prompt ska de tänka: "Det här är EXAKT vad jag menade — men skrivet bättre än jag någonsin kunde."

Output: Endast den omskrivna promten. Ingen förklaring, inga kommentarer, ingen metastruktur.
` : `
You are an expert prompt engineer with 15+ years of experience.

Your task: Take the user's vague prompt and rewrite it as a senior expert would have written it from scratch.

CRITICAL RULES:
1. Write the prompt as ONE coherent text in natural language
2. NO visible structure (no "ROLE:", "TASK:", "CONSTRAINTS:", etc.)
3. MAKE EXPLICIT choices where the user is vague — don't guess, choose the most reasonable
4. Be 3-5× more specific than the original
5. Write as if YOU are the expert writing this, not as if you're instructing an AI
6. Include implicit expertise, not instructions ABOUT expertise
7. No generic phrases — every sentence must add value
8. No questions — only decisive statements
9. Write like a thoughtful brief to yourself, not like a template

QUALITY BAR:
If someone reads your rewritten prompt, they should think: "This is EXACTLY what I meant — but written better than I ever could."

Output: Only the rewritten prompt. No explanation, no comments, no meta-structure.
`;

    // Build context from compiled spec
    const contextParts: string[] = [];

    if (isSwedish) {
        contextParts.push(`ANVÄNDARENS URSPRUNGLIGA PROMPT:`);
        contextParts.push(`"${spec.rawInput}"`);
        contextParts.push('');

        if (spec.objective && spec.objective !== 'UNDECIDED') {
            contextParts.push(`MÅL: ${spec.objective}`);
        }

        if (spec.context && spec.context !== 'UNDECIDED') {
            contextParts.push(`KONTEXT: ${spec.context}`);
        }

        if (spec.constraints.length > 0) {
            contextParts.push(`BEGRÄNSNINGAR: ${spec.constraints.join(', ')}`);
        }

        if (spec.assumptions.length > 0) {
            contextParts.push(`ANTAGANDEN: ${spec.assumptions.join(', ')}`);
        }

        contextParts.push('');
        contextParts.push('Omformulera nu denna prompt som en senior expert skulle skriva den.');

    } else {
        contextParts.push(`USER'S ORIGINAL PROMPT:`);
        contextParts.push(`"${spec.rawInput}"`);
        contextParts.push('');

        if (spec.objective && spec.objective !== 'UNDECIDED') {
            contextParts.push(`OBJECTIVE: ${spec.objective}`);
        }

        if (spec.context && spec.context !== 'UNDECIDED') {
            contextParts.push(`CONTEXT: ${spec.context}`);
        }

        if (spec.constraints.length > 0) {
            contextParts.push(`CONSTRAINTS: ${spec.constraints.join(', ')}`);
        }

        if (spec.assumptions.length > 0) {
            contextParts.push(`ASSUMPTIONS: ${spec.assumptions.join(', ')}`);
        }

        contextParts.push('');
        contextParts.push('Now rewrite this prompt as a senior expert would write it.');
    }

    const userPrompt = contextParts.join('\n');

    return { systemPrompt, userPrompt };
}

/**
 * Quality validation
 *
 * Checks if the rewritten prompt meets the quality bar
 * If not, the system should reject it and try again or fallback
 */
export function validateRewriteQuality(result: RewrittenPrompt): {
    valid: boolean;
    reason?: string;
} {
    // Must meet quality bar
    if (!result.meetsQualityBar) {
        return {
            valid: false,
            reason: `Specificity multiplier ${result.meta.specificityMultiplier}× does not meet 3-5× requirement`
        };
    }

    // Must not be too short (likely failed)
    if (result.prompt.length < 50) {
        return {
            valid: false,
            reason: 'Rewritten prompt is too short (< 50 characters)'
        };
    }

    // Must not contain template markers (failed to follow instructions)
    const templateMarkers = ['ROLE:', 'TASK:', 'CONSTRAINTS:', 'OBJECTIVE:', 'OUTPUT:', '##', '###'];
    const hasTemplateMarkers = templateMarkers.some(marker =>
        result.prompt.includes(marker)
    );

    if (hasTemplateMarkers) {
        return {
            valid: false,
            reason: 'Rewritten prompt contains template structure markers'
        };
    }

    return { valid: true };
}
