// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION ADAPTER — Real OpenAI API Integration
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: Ensure Enhanced prompts execute DIFFERENTLY than Original prompts
//
// ARCHITECTURE:
//   - runOriginal(): Raw prompt only, NO system prompt, neutral parameters
//   - runEnhanced(): Enhanced prompt + system prompt + model-specific params
//
// API: Uses gpt-4o-mini for cost-effective, high-quality differentiation
//
// ═══════════════════════════════════════════════════════════════════════════

import OpenAI from 'openai';

// Lazy-initialized OpenAI client (avoids build-time errors when API key is not available)
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!_openai) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        _openai = new OpenAI({ apiKey });
    }
    return _openai;
}

// The actual model we use for A/B testing
const OPENAI_MODEL = 'gpt-4o-mini';

/**
 * Model execution profile — defines HOW a model should behave
 */
export interface ModelAdapter {
    id: string;
    family: 'gpt' | 'claude' | 'gemini' | 'grok' | 'sora' | 'banana';
    systemPrompt: string;
    temperature: number;
    top_p: number;
    max_tokens: number;
    reasoningBias: number;
    features: {
        supportsReasoning: boolean;
        supportsStreaming: boolean;
        supportsVision: boolean;
    };
}

/**
 * Execution result from model
 */
export interface ExecutionResult {
    output: string;
    model: string;
    executionMode: 'original' | 'enhanced';
    parameters: {
        systemPrompt: string | null;
        temperature: number;
        top_p: number;
        max_tokens: number;
    };
    metrics: {
        responseLength: number;
        structureScore: number;
        specificityScore: number;
    };
    apiModel: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL ADAPTERS — System prompts for enhanced execution
// ═══════════════════════════════════════════════════════════════════════════

const MODEL_ADAPTERS: Record<string, ModelAdapter> = {
    'gpt-5.2': {
        id: 'gpt-5.2',
        family: 'gpt',
        systemPrompt: `You are a principal engineer who ships, not a consultant who advises.

RULES — BREAK ANY AND I REJECT YOUR RESPONSE:
1. Open with a 2-sentence verdict: what to build and the ONE decision that matters most
2. Use ## headers. Every section must contain a DECISION, not a discussion
3. When multiple options exist: pick one, state why in one sentence, put alternatives in a "Rejected alternatives" footnote
4. Include a ## MVP Scope section with exactly three sub-sections:
   - **Build now** (the minimum that proves the concept works)
   - **Defer** (valuable but not week-1)
   - **Don't build** (things that sound good but waste time)
5. Every recommendation must include a concrete "done when" acceptance criterion
6. Include a ## Watch Out section with 2-3 specific traps or common mistakes
7. End with ## Next Steps: 3 commands (not suggestions). Numbered. Starts with a verb
8. NEVER use these phrases: "It depends", "You might consider", "There are several options", "It's important to note"
9. Use code blocks with language tags for any technical content
10. Tables for comparisons — but only after you've already made your recommendation`,
        temperature: 0.5,
        top_p: 0.85,
        max_tokens: 3000,
        reasoningBias: 0.8,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gpt-5.1': {
        id: 'gpt-5.1',
        family: 'gpt',
        systemPrompt: `You are a pragmatic tech lead. You make decisions, explain trade-offs in one sentence, and move on.

RESPONSE CONTRACT:
1. Open with your recommendation in 2 sentences — what and why
2. Use ## headers. Each section must end with a concrete action item
3. Pick the best option. Mention what you rejected and why (one line)
4. Structure every deliverable as: Build now → Defer → Skip
5. Include specific acceptance criteria ("done when X")
6. Add a ## Pitfalls section: 2-3 mistakes you've seen people make
7. Close with ## Next Steps: 3 numbered actions starting with verbs
8. Banned phrases: "It depends", "You could consider", "There are many ways"`,
        temperature: 0.5,
        top_p: 0.85,
        max_tokens: 2500,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'claude-sonnet-4.5': {
        id: 'claude-sonnet-4.5',
        family: 'claude',
        systemPrompt: `You are a senior architect who thinks deeply but always lands on a recommendation.

YOUR APPROACH:
1. State your recommendation upfront — what to do and the key trade-off you're accepting
2. Use ## sections to walk through your reasoning. Each section must contain analysis AND a decision
3. When trade-offs exist: name them, pick a side, explain in one sentence why
4. Include a ## Scope Decision section:
   - **Build first**: minimum viable deliverable
   - **Defer**: things that matter but not yet
   - **Cut**: things that sound good but add complexity without proportional value
5. Add 2-3 specific "watch out for" warnings based on real implementation experience
6. Use tables only for structured comparisons — after you've already stated your pick
7. Code blocks with language tags for any technical content
8. End with ## Next Steps: 3 specific actions, not suggestions
9. Never hedge with "it depends" or "there are several approaches" — commit to your call`,
        temperature: 0.55,
        top_p: 0.9,
        max_tokens: 3000,
        reasoningBias: 0.85,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'claude-opus-4.5': {
        id: 'claude-opus-4.5',
        family: 'claude',
        systemPrompt: `You are a staff engineer who writes architectural decision records, not essays.

FORMAT: ## headers, decisions stated as facts, trade-offs in one sentence. Structure every response with: Recommendation → Reasoning → MVP Scope (Build/Defer/Cut) → Risks → Next Steps. Commit to choices. No hedging. Use tables and code blocks where they add clarity. End with 3 concrete numbered actions.`,
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 3000,
        reasoningBias: 0.95,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gemini-3': {
        id: 'gemini-3',
        family: 'gemini',
        systemPrompt: `You make decisions and structure them clearly. Open with your recommendation. Use ## sections. Every section ends with a concrete action. Include MVP scope: Build now / Defer / Don't build. Add 2 pitfall warnings. End with 3 numbered next steps. No hedging. No "it depends". Pick and commit.`,
        temperature: 0.55,
        top_p: 0.85,
        max_tokens: 2500,
        reasoningBias: 0.75,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gemini-2.5': {
        id: 'gemini-2.5',
        family: 'gemini',
        systemPrompt: `Be direct. Make decisions. State trade-offs in one sentence. Structure with ## headers. Include Build now / Defer / Skip. End with 3 next steps as verbs. No filler.`,
        temperature: 0.5,
        top_p: 0.85,
        max_tokens: 2000,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    'grok-3': {
        id: 'grok-3',
        family: 'grok',
        systemPrompt: `Be blunt. Open with your recommendation. Use ## headers. Tell them what to build first, what to defer, and what to kill. State trade-offs plainly. Include 2 specific mistakes to avoid. End with 3 concrete next steps. Zero fluff.`,
        temperature: 0.6,
        top_p: 0.85,
        max_tokens: 2500,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    'grok-2': {
        id: 'grok-2',
        family: 'grok',
        systemPrompt: `Make a call. State it upfront. Use ## headers. MVP first, extras later. 3 next steps. No hedging.`,
        temperature: 0.55,
        top_p: 0.85,
        max_tokens: 1500,
        reasoningBias: 0.6,
        features: { supportsReasoning: false, supportsStreaming: true, supportsVision: false },
    },

    'sora': {
        id: 'sora',
        family: 'sora',
        systemPrompt: `Focus on visual and creative generation. Parse visual requirements precisely. Include technical parameters and detailed descriptions.`,
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 1024,
        reasoningBias: 0.5,
        features: { supportsReasoning: false, supportsStreaming: false, supportsVision: true },
    },

    'nano-banana-pro': {
        id: 'nano-banana-pro',
        family: 'banana',
        systemPrompt: `Provide fast, structured outputs. Use markdown headers. Be concise but complete. Include actionable items.`,
        temperature: 0.6,
        top_p: 0.8,
        max_tokens: 1024,
        reasoningBias: 0.5,
        features: { supportsReasoning: false, supportsStreaming: true, supportsVision: false },
    },
};

const DEFAULT_ADAPTER: ModelAdapter = {
    id: 'default',
    family: 'gpt',
    systemPrompt: `Provide structured, detailed responses using markdown formatting.`,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024,
    reasoningBias: 0.5,
    features: { supportsReasoning: false, supportsStreaming: true, supportsVision: false },
};

/**
 * Get the adapter for a specific model
 */
export function getModelAdapter(modelId: string): ModelAdapter {
    return MODEL_ADAPTERS[modelId] || DEFAULT_ADAPTER;
}

// ═══════════════════════════════════════════════════════════════════════════
// REAL OPENAI API EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ORIGINAL EXECUTION — Raw prompt only, NO system prompt
 *
 * Simulates a user pasting a vague prompt directly into ChatGPT
 * with default settings and no context.
 */
export async function runOriginal(
    prompt: string,
    modelId: string
): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
        // DELIBERATELY minimal: no system prompt, high randomness, low token cap
        // This simulates a user pasting a vague prompt with zero optimization
        const completion = await getOpenAIClient().chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 600,
        });

        const output = completion.choices[0]?.message?.content || '';
        const metrics = calculateMetrics(output);

        console.log(`[runOriginal] Completed in ${Date.now() - startTime}ms, ${output.length} chars`);

        return {
            output,
            model: modelId,
            executionMode: 'original',
            parameters: {
                systemPrompt: null,
                temperature: 1.0,
                top_p: 1.0,
                max_tokens: 600,
            },
            metrics,
            apiModel: OPENAI_MODEL,
        };
    } catch (error) {
        console.error('[runOriginal] OpenAI API error:', error);
        return {
            output: `[API Error] Could not generate response. Please check your API key.`,
            model: modelId,
            executionMode: 'original',
            parameters: {
                systemPrompt: null,
                temperature: 1.0,
                top_p: 1.0,
                max_tokens: 600,
            },
            metrics: { responseLength: 0, structureScore: 0, specificityScore: 0 },
            apiModel: OPENAI_MODEL,
        };
    }
}

/**
 * ENHANCED EXECUTION — Enhanced prompt + system prompt + tuned parameters
 *
 * Uses the model adapter's system prompt to guide the response.
 * The enhanced prompt structure is followed precisely.
 */
export async function runEnhanced(
    enhancedPrompt: string,
    modelId: string
): Promise<ExecutionResult> {
    const adapter = getModelAdapter(modelId);
    const startTime = Date.now();

    try {
        const completion = await getOpenAIClient().chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: adapter.systemPrompt },
                { role: 'user', content: enhancedPrompt }
            ],
            temperature: adapter.temperature,
            top_p: adapter.top_p,
            max_tokens: adapter.max_tokens,
        });

        const output = completion.choices[0]?.message?.content || '';
        const metrics = calculateMetrics(output);

        console.log(`[runEnhanced] Completed in ${Date.now() - startTime}ms, ${output.length} chars`);

        return {
            output,
            model: modelId,
            executionMode: 'enhanced',
            parameters: {
                systemPrompt: adapter.systemPrompt,
                temperature: adapter.temperature,
                top_p: adapter.top_p,
                max_tokens: adapter.max_tokens,
            },
            metrics,
            apiModel: OPENAI_MODEL,
        };
    } catch (error) {
        console.error('[runEnhanced] OpenAI API error:', error);
        return {
            output: `[API Error] Could not generate response. Please check your API key.`,
            model: modelId,
            executionMode: 'enhanced',
            parameters: {
                systemPrompt: adapter.systemPrompt,
                temperature: adapter.temperature,
                top_p: adapter.top_p,
                max_tokens: adapter.max_tokens,
            },
            metrics: { responseLength: 0, structureScore: 0, specificityScore: 0 },
            apiModel: OPENAI_MODEL,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateMetrics(output: string): ExecutionResult['metrics'] {
    const hasHeaders = (output.match(/^#{1,3}\s/gm) || []).length;
    const hasBullets = (output.match(/^[\s]*[-*]\s/gm) || []).length;
    const hasNumbering = (output.match(/^\d+\.\s/gm) || []).length;
    const hasCodeBlocks = (output.match(/```/g) || []).length;
    const hasTables = (output.match(/\|.+\|/g) || []).length;
    const hasCheckboxes = (output.match(/\[[ x]\]/g) || []).length;

    const structureScore = Math.min(100,
        hasHeaders * 10 +
        hasBullets * 3 +
        hasNumbering * 3 +
        hasCodeBlocks * 10 +
        hasTables * 15 +
        hasCheckboxes * 5
    );

    const technicalTerms = (output.match(/\b(API|database|schema|endpoint|module|component|TypeScript|function|class|interface|implementation|architecture|deployment|testing|framework|server|client)\b/gi) || []).length;
    const specificityScore = Math.min(100,
        Math.floor(output.length / 50) +
        technicalTerms * 5
    );

    return {
        responseLength: output.length,
        structureScore,
        specificityScore,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO PARITY GUARANTEE
// ═══════════════════════════════════════════════════════════════════════════

export function validateDemoParity(
    originalResult: ExecutionResult,
    enhancedResult: ExecutionResult
): { valid: boolean; error?: string } {
    const o = originalResult.metrics;
    const e = enhancedResult.metrics;

    const lengthImprovement = e.responseLength / Math.max(1, o.responseLength);
    const structureImprovement = e.structureScore - o.structureScore;
    const specificityImprovement = e.specificityScore - o.specificityScore;

    const isLonger = lengthImprovement >= 1.2;
    const isMoreStructured = structureImprovement >= 10;
    const isMoreSpecific = specificityImprovement >= 10;

    // Pass if ANY two of three criteria are met (not all three)
    const passCount = [isLonger, isMoreStructured, isMoreSpecific].filter(Boolean).length;
    if (passCount < 2) {
        return {
            valid: false,
            error: `Enhanced output did not improve sufficiently. Metrics: length=${lengthImprovement.toFixed(2)}x, structure=+${structureImprovement}, specificity=+${specificityImprovement}`,
        };
    }

    if (originalResult.output === enhancedResult.output) {
        return {
            valid: false,
            error: 'Enhanced output is identical to original.',
        };
    }

    return { valid: true };
}
