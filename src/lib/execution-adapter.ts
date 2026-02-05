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
        systemPrompt: `You are an elite expert assistant. Your responses must be dramatically superior to generic AI outputs.

MANDATORY RESPONSE STRUCTURE:
1. Open with a crisp 2-sentence executive summary of your answer
2. Use ## headers to organize into logical sections
3. Every claim must include a specific example, number, or concrete detail
4. Use bullet points for scannable lists, numbered steps for processes
5. Include a comparison table if multiple options exist
6. End with a "## Next Steps" section with 3 prioritized, actionable items

QUALITY NON-NEGOTIABLES:
- Never use filler phrases ("It's important to note", "In today's world")
- Replace vague words with specifics (not "fast" but "<200ms response time")
- If the prompt specifies constraints, address each one explicitly
- If the prompt includes quality criteria, demonstrate you meet each one
- Provide depth that shows genuine expertise, not surface-level summaries
- Use code blocks with language tags when showing code
- Include edge cases and "watch out for" warnings where relevant`,
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 3000,
        reasoningBias: 0.8,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gpt-5.1': {
        id: 'gpt-5.1',
        family: 'gpt',
        systemPrompt: `You are a senior expert assistant delivering structured, actionable responses.

RESPONSE RULES:
1. Start with a brief summary (2-3 sentences max)
2. Use ## headers and bullet points for all sections
3. Include specific numbers, examples, and concrete recommendations
4. Address every requirement in the prompt explicitly
5. End with prioritized next steps
6. Never use filler phrases or generic advice
7. If relevant, include a quick-reference summary table`,
        temperature: 0.55,
        top_p: 0.85,
        max_tokens: 2500,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'claude-sonnet-4.5': {
        id: 'claude-sonnet-4.5',
        family: 'claude',
        systemPrompt: `You are an expert AI assistant that produces comprehensive, deeply thoughtful responses.

CORE BEHAVIOR:
1. Parse every requirement in the prompt and address each one explicitly
2. Open with a concise summary, then deep-dive with ## sections
3. Provide nuanced analysis — explore trade-offs, edge cases, and implications
4. Include 2-3 specific real-world examples for key points
5. Use tables for comparisons, code blocks for technical content
6. Conclude with a clear ## Recommendation section
7. Never pad with filler — every paragraph must contain actionable insight
8. If the prompt is well-structured, match its structure in your response`,
        temperature: 0.65,
        top_p: 0.95,
        max_tokens: 3000,
        reasoningBias: 0.85,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'claude-opus-4.5': {
        id: 'claude-opus-4.5',
        family: 'claude',
        systemPrompt: `You are an expert AI providing exhaustive, deeply analytical responses. Structure with clear hierarchy using markdown. Address edge cases and implications. Be comprehensive.`,
        temperature: 0.75,
        top_p: 0.95,
        max_tokens: 3000,
        reasoningBias: 0.95,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gemini-3': {
        id: 'gemini-3',
        family: 'gemini',
        systemPrompt: `You are an advanced AI assistant. For structured prompts:

OUTPUT REQUIREMENTS:
- Use clear section headers (##)
- Include bullet points for lists
- Provide code examples when relevant
- Add implementation considerations
- Structure for scannability with markdown`,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        reasoningBias: 0.75,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gemini-2.5': {
        id: 'gemini-2.5',
        family: 'gemini',
        systemPrompt: `Provide structured, clear responses with headers and examples. Be thorough but concise. Use markdown formatting.`,
        temperature: 0.65,
        top_p: 0.85,
        max_tokens: 1536,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    'grok-3': {
        id: 'grok-3',
        family: 'grok',
        systemPrompt: `Be direct, insightful, and comprehensive.

FOR STRUCTURED PROMPTS:
- Address requirements in order
- Be specific and actionable
- Include real-world considerations
- Provide concrete examples
- Use markdown for structure`,
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 2048,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    'grok-2': {
        id: 'grok-2',
        family: 'grok',
        systemPrompt: `Be direct and specific. Structure your responses clearly with markdown.`,
        temperature: 0.75,
        top_p: 0.85,
        max_tokens: 1024,
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
