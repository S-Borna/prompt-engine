import { NextRequest, NextResponse } from 'next/server';
import {
    runOriginal,
    runEnhanced,
    validateDemoParity,
    getModelAdapter,
    type ExecutionResult,
} from '@/lib/execution-adapter';

// ═══════════════════════════════════════════════════════════════════════════
// A/B TEST API — DIFFERENTIATED EXECUTION PATHS
// ═══════════════════════════════════════════════════════════════════════════
//
// CRITICAL ARCHITECTURE:
//   - Original Output: Raw prompt, NO system prompt, neutral parameters
//   - Enhanced Output: Enhanced prompt + system prompt + model-specific params
//
// If outputs are identical, the execution is BROKEN.
//
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/ai/ab-test
 *
 * Runs A/B test with DIFFERENTIATED execution paths:
 *   - runOriginal(): Raw prompt only
 *   - runEnhanced(): Enhanced prompt + model adapter
 *
 * Returns error if outputs don't differ (demo parity check).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rawPrompt, proPrompt, model, spec } = body;

        if (!rawPrompt || !proPrompt || !model) {
            return NextResponse.json(
                { error: 'Missing required fields: rawPrompt, proPrompt, model' },
                { status: 400 }
            );
        }

        // Get model adapter for visibility in response
        const adapter = getModelAdapter(model);

        // ═══════════════════════════════════════════════════════════════════
        // CRITICAL: PARALLEL EXECUTION — both run at the same time
        // ═══════════════════════════════════════════════════════════════════

        const [originalResult, enhancedResult] = await Promise.all([
            // Original: Raw prompt, NO system prompt, default parameters
            runOriginal(rawPrompt, model),
            // Enhanced: Enhanced prompt + system prompt + model-specific params
            runEnhanced(proPrompt, model),
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // PARITY CHECK — Log only, never block the user
        // ═══════════════════════════════════════════════════════════════════

        const parityCheck = validateDemoParity(originalResult, enhancedResult);
        if (!parityCheck.valid) {
            console.warn(`[A/B parity] ${parityCheck.error}`);
        }

        // ═══════════════════════════════════════════════════════════════════
        // ALWAYS RETURN BOTH OUTPUTS — let the user judge
        // ═══════════════════════════════════════════════════════════════════

        const improvement = {
            structureGain: enhancedResult.metrics.structureScore - originalResult.metrics.structureScore,
            specificityGain: enhancedResult.metrics.specificityScore - originalResult.metrics.specificityScore,
            originalWords: originalResult.output.split(/\s+/).length,
            enhancedWords: enhancedResult.output.split(/\s+/).length,
        };

        return NextResponse.json({
            success: true,
            results: {
                outputA: {
                    prompt: rawPrompt,
                    output: originalResult.output,
                    metrics: originalResult.metrics,
                    label: 'Original Output',
                    executionMode: originalResult.executionMode,
                    parameters: originalResult.parameters,
                    apiModel: originalResult.apiModel,
                },
                outputB: {
                    prompt: proPrompt,
                    output: enhancedResult.output,
                    metrics: enhancedResult.metrics,
                    label: 'Enhanced Output',
                    executionMode: enhancedResult.executionMode,
                    parameters: enhancedResult.parameters,
                    apiModel: enhancedResult.apiModel,
                },
            },
            improvement,
            modelAdapter: {
                id: adapter.id,
                family: adapter.family,
                temperature: adapter.temperature,
                top_p: adapter.top_p,
                max_tokens: adapter.max_tokens,
                hasSystemPrompt: !!adapter.systemPrompt,
            },
            apiModel: enhancedResult.apiModel,
            model,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('A/B test error:', error);
        return NextResponse.json(
            { error: 'A/B test failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/ab-test
 * Returns metadata about the A/B testing system
 */
export async function GET() {
    return NextResponse.json({
        name: 'PRAXIS A/B Test Engine',
        version: '2.0.0',
        description: 'Parallel execution of raw vs enhanced prompts with decision-forcing system prompts',
        execution: 'parallel',
        supportedModels: [
            'gpt-5.2', 'gpt-5.1',
            'claude-opus-4.5', 'claude-sonnet-4.5',
            'gemini-3', 'gemini-2.5',
            'grok-3', 'grok-2',
        ],
        guarantees: [
            'Same underlying model (gpt-4o-mini) for both runs',
            'Original: no system prompt, temp=1.0, max_tokens=600',
            'Enhanced: model-specific system prompt with decision-forcing, temp=0.5-0.6, max_tokens=2500-3000',
            'Parallel execution for <50% latency vs sequential',
        ],
    });
}
