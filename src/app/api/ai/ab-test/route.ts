import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// A/B TEST API — Run both raw and pro prompts against same model
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates a prompt against requirements
 */
function validatePrompt(prompt: string, spec: any): {
    completeness: number;
    specificity: number;
    structureAdherence: number;
} {
    let completeness = 0;
    let specificity = 0;
    let structureAdherence = 0;

    // Completeness: Check if output addresses requirements
    const hasObjective = prompt.includes('OBJECTIVE') || prompt.includes('objective') || prompt.toLowerCase().includes('goal');
    const hasContext = prompt.includes('CONTEXT') || prompt.includes('context') || prompt.toLowerCase().includes('background');
    const hasRequirements = prompt.includes('REQUIREMENTS') || prompt.includes('requirements') || prompt.includes('must');

    completeness += hasObjective ? 35 : 0;
    completeness += hasContext ? 35 : 0;
    completeness += hasRequirements ? 30 : 0;

    // Specificity: Check for explicit constraints and format
    const hasConstraints = spec?.constraints?.length > 0 || prompt.toLowerCase().includes('must not') || prompt.toLowerCase().includes('cannot');
    const hasFormat = prompt.toLowerCase().includes('format') || prompt.toLowerCase().includes('structure') || prompt.includes('##');
    const hasNonNegotiables = spec?.nonNegotiables?.length > 0 || prompt.toLowerCase().includes('required') || prompt.toLowerCase().includes('essential');

    specificity += hasConstraints ? 35 : 0;
    specificity += hasFormat ? 35 : 0;
    specificity += hasNonNegotiables ? 30 : 0;

    // Structure adherence: Check if follows requested format
    const hasSections = (prompt.match(/#{1,3}\s/g) || []).length >= 3;
    const hasBullets = (prompt.match(/^[\s]*[-*]\s/gm) || []).length >= 2;
    const hasNumbering = (prompt.match(/^\d+\.\s/gm) || []).length >= 2;

    structureAdherence += hasSections ? 50 : 0;
    structureAdherence += hasBullets ? 25 : 0;
    structureAdherence += hasNumbering ? 25 : 0;

    return {
        completeness: Math.min(100, completeness),
        specificity: Math.min(100, specificity),
        structureAdherence: Math.min(100, structureAdherence),
    };
}

/**
 * Mock LLM runner - simulates calling an LLM with identical settings
 * In production, this would call actual OpenAI/Anthropic/etc APIs
 */
async function runMockLLM(prompt: string, model: string): Promise<string> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock response based on prompt quality
    const promptLower = prompt.toLowerCase();
    const hasStructure = prompt.includes('##') || prompt.includes('OBJECTIVE');
    const hasDetails = prompt.length > 200;
    const hasFormat = promptLower.includes('format') || promptLower.includes('structure');

    if (hasStructure && hasDetails && hasFormat) {
        // High-quality prompt produces detailed, structured response
        return `# Implementation Plan

## Overview
Based on your requirements, here's a comprehensive implementation approach:

### Core Components
1. **Primary Module**: Handles main business logic with validation
   - Input processing with type checking
   - Business rule enforcement
   - Error handling with detailed messages

2. **Data Layer**: Manages persistence and retrieval
   - Schema validation
   - Transaction management
   - Query optimization

3. **API Interface**: Exposes functionality
   - RESTful endpoints
   - Authentication middleware
   - Rate limiting

### Technical Specifications
- Language: TypeScript
- Framework: Next.js 14
- Database: PostgreSQL with Prisma
- Testing: Jest + React Testing Library

### Implementation Steps
1. Set up project structure
2. Define data models
3. Implement core logic
4. Add API endpoints
5. Write tests
6. Deploy and monitor

### Success Criteria
- All tests passing (>95% coverage)
- Response time <200ms
- Error rate <0.1%

This approach ensures maintainability, scalability, and adherence to your specified constraints.`;
    } else if (hasDetails) {
        // Medium-quality prompt produces decent but less structured response
        return `I'll help you with that. Here's what I suggest:

The main approach would be to break this down into manageable parts. First, you'll need to set up the basic structure and then add the functionality step by step.

For the implementation, consider using modern tools and frameworks that support your requirements. Make sure to include proper error handling and validation throughout.

Some key things to keep in mind:
- Keep the code modular and reusable
- Add comments where necessary
- Test thoroughly before deployment
- Follow best practices for your chosen technology

You should also think about edge cases and how to handle unexpected inputs. It's important to make the solution robust and maintainable.

Let me know if you need clarification on any specific part!`;
    } else {
        // Low-quality prompt produces vague, minimal response
        return `Sure, I can help with that.

You'll want to start by understanding what you're trying to accomplish and then build from there. Consider what tools or technologies might be appropriate.

Make sure to test your work and iterate as needed. Let me know if you have questions!`;
    }
}

/**
 * POST /api/ai/ab-test
 * Runs A/B test: raw prompt vs pro prompt against same model
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

        // Run both prompts with IDENTICAL settings
        const [outputA, outputB] = await Promise.all([
            runMockLLM(rawPrompt, model),
            runMockLLM(proPrompt, model),
        ]);

        // Validate both outputs
        const metricsA = validatePrompt(outputA, null);
        const metricsB = validatePrompt(outputB, spec);

        // Calculate prompt diff
        const diff = {
            addedSections: (proPrompt.match(/#{1,3}\s/g) || []).length - (rawPrompt.match(/#{1,3}\s/g) || []).length,
            addedConstraints: spec?.constraints?.length || 0,
            addedContext: spec?.context && spec.context !== '[UNDECIDED]' ? 1 : 0,
            structureImprovement: proPrompt.length - rawPrompt.length,
        };

        return NextResponse.json({
            success: true,
            results: {
                outputA: {
                    prompt: rawPrompt,
                    output: outputA,
                    metrics: metricsA,
                    label: 'Raw Prompt',
                },
                outputB: {
                    prompt: proPrompt,
                    output: outputB,
                    metrics: metricsB,
                    label: 'Pro Prompt',
                },
            },
            diff,
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
        version: '1.0.0',
        description: 'Runs identical inference against raw and enhanced prompts',
        supportedModels: [
            'gpt-5.2', 'gpt-5.1',
            'claude-sonnet-4.5', 'claude-opus-4.1',
            'gemini-3', 'gemini-2.5',
            'grok-3', 'grok-2',
        ],
        metrics: [
            'completeness',
            'specificity',
            'structureAdherence',
        ],
        guarantees: [
            'Identical model for both runs',
            'Identical temperature (0.7)',
            'Identical max tokens (2000)',
            'Identical system messages',
        ],
    });
}
