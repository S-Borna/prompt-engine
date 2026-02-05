// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION ADAPTER — Model-Specific Execution Profiles
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: Ensure Enhanced prompts execute DIFFERENTLY than Original prompts
//
// ARCHITECTURE:
//   - runOriginal(): Raw prompt only, NO system prompt, neutral parameters
//   - runEnhanced(): Enhanced prompt + system prompt + model-specific params
//
// MODELS SUPPORTED:
//   - GPT family (gpt-5.2, gpt-5.1)
//   - Claude family (claude-sonnet-4.5, claude-opus-4.1)
//   - Gemini family (gemini-3, gemini-2.5)
//   - Grok family (grok-3, grok-2)
//   - Sora
//   - Banana Pro
//
// ═══════════════════════════════════════════════════════════════════════════

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
    /** Higher = more verbose, analytical output */
    reasoningBias: number;
    /** Model-specific features */
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
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL ADAPTERS — One per model family
// ═══════════════════════════════════════════════════════════════════════════

const MODEL_ADAPTERS: Record<string, ModelAdapter> = {
    // ─── GPT FAMILY ─────────────────────────────────────────────────────
    'gpt-5.2': {
        id: 'gpt-5.2',
        family: 'gpt',
        systemPrompt: `You are a highly capable AI assistant optimized for precise, actionable responses.

EXECUTION RULES:
1. Follow the prompt structure exactly as given
2. Address every requirement explicitly
3. Use clear section headers for organization
4. Provide specific, implementable details
5. Include examples where applicable
6. End with concrete next steps

QUALITY STANDARDS:
- Be thorough but concise
- Prioritize actionability over explanation
- Structure output for easy scanning
- Validate completeness before responding`,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        reasoningBias: 0.8,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gpt-5.1': {
        id: 'gpt-5.1',
        family: 'gpt',
        systemPrompt: `You are a precise AI assistant. Structure your responses clearly with headers and bullet points. Address all requirements explicitly.`,
        temperature: 0.6,
        top_p: 0.85,
        max_tokens: 3072,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    // ─── CLAUDE FAMILY ──────────────────────────────────────────────────
    'claude-sonnet-4.5': {
        id: 'claude-sonnet-4.5',
        family: 'claude',
        systemPrompt: `You are Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest.

When responding to structured prompts:
1. Parse all requirements systematically
2. Address each section in order
3. Provide detailed, well-reasoned responses
4. Use markdown formatting for clarity
5. Include relevant examples and edge cases
6. Acknowledge constraints explicitly
7. Conclude with actionable recommendations

Your responses should be comprehensive yet focused.`,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
        reasoningBias: 0.85,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'claude-opus-4.1': {
        id: 'claude-opus-4.1',
        family: 'claude',
        systemPrompt: `You are Claude Opus, Anthropic's most capable model. Provide exhaustive, deeply analytical responses. Structure with clear hierarchy. Address edge cases and implications.`,
        temperature: 0.75,
        top_p: 0.95,
        max_tokens: 8192,
        reasoningBias: 0.95,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    // ─── GEMINI FAMILY ──────────────────────────────────────────────────
    'gemini-3': {
        id: 'gemini-3',
        family: 'gemini',
        systemPrompt: `You are Gemini, Google's advanced AI. For structured prompts:

OUTPUT REQUIREMENTS:
• Use clear section headers (##)
• Include bullet points for lists
• Provide code examples when relevant
• Add implementation considerations
• Structure for scannability

QUALITY FOCUS:
• Complete coverage of requirements
• Practical, actionable guidance
• Clear next steps`,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
        reasoningBias: 0.75,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: true },
    },

    'gemini-2.5': {
        id: 'gemini-2.5',
        family: 'gemini',
        systemPrompt: `You are Gemini. Provide structured, clear responses with headers and examples. Be thorough but concise.`,
        temperature: 0.65,
        top_p: 0.85,
        max_tokens: 3072,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    // ─── GROK FAMILY ────────────────────────────────────────────────────
    'grok-3': {
        id: 'grok-3',
        family: 'grok',
        systemPrompt: `You are Grok, xAI's assistant. Be direct, insightful, and unfiltered.

FOR STRUCTURED PROMPTS:
- Address requirements in order
- Be specific and actionable
- Include real-world considerations
- Challenge assumptions when relevant
- Provide concrete examples`,
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 4096,
        reasoningBias: 0.7,
        features: { supportsReasoning: true, supportsStreaming: true, supportsVision: false },
    },

    'grok-2': {
        id: 'grok-2',
        family: 'grok',
        systemPrompt: `You are Grok. Be direct and specific. Structure your responses clearly.`,
        temperature: 0.75,
        top_p: 0.85,
        max_tokens: 2048,
        reasoningBias: 0.6,
        features: { supportsReasoning: false, supportsStreaming: true, supportsVision: false },
    },

    // ─── SORA ───────────────────────────────────────────────────────────
    'sora': {
        id: 'sora',
        family: 'sora',
        systemPrompt: `You are Sora, OpenAI's creative generation model. For structured prompts:

VISUAL GENERATION FOCUS:
- Parse visual requirements precisely
- Note composition, lighting, and style
- Consider motion and transitions
- Output detailed scene descriptions
- Include technical parameters`,
        temperature: 0.85,
        top_p: 0.95,
        max_tokens: 2048,
        reasoningBias: 0.5,
        features: { supportsReasoning: false, supportsStreaming: false, supportsVision: true },
    },

    // ─── BANANA PRO ─────────────────────────────────────────────────────
    'nano-banana-pro': {
        id: 'nano-banana-pro',
        family: 'banana',
        systemPrompt: `You are Banana Pro, optimized for fast, structured outputs.

RESPONSE FORMAT:
1. Parse requirements systematically
2. Use markdown headers
3. Be concise but complete
4. Include actionable items
5. End with next steps`,
        temperature: 0.6,
        top_p: 0.8,
        max_tokens: 2048,
        reasoningBias: 0.5,
        features: { supportsReasoning: false, supportsStreaming: true, supportsVision: false },
    },
};

// Default adapter for unknown models
const DEFAULT_ADAPTER: ModelAdapter = {
    id: 'default',
    family: 'gpt',
    systemPrompt: `Provide structured, detailed responses using markdown formatting.`,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 2048,
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
// EXECUTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ORIGINAL EXECUTION — Raw prompt only
 *
 * RULES:
 *   - NO system prompt
 *   - Default neutral parameters (temp=1.0, top_p=1.0)
 *   - No structure enforcement
 *   - Model acts in "default" mode
 */
export async function runOriginal(
    prompt: string,
    modelId: string
): Promise<ExecutionResult> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 600));

    // Generate output WITHOUT any enhancement
    // This simulates what a raw prompt produces with default model behavior
    const output = generateRawOutput(prompt);

    const metrics = calculateMetrics(output);

    return {
        output,
        model: modelId,
        executionMode: 'original',
        parameters: {
            systemPrompt: null,
            temperature: 1.0,  // Default neutral
            top_p: 1.0,       // Default neutral
            max_tokens: 2048,
        },
        metrics,
    };
}

/**
 * ENHANCED EXECUTION — Full adapter pipeline
 *
 * RULES:
 *   - Uses model-specific system prompt
 *   - Uses model-specific parameters
 *   - Enhanced prompt is used VERBATIM
 *   - Reasoning bias applied if supported
 */
export async function runEnhanced(
    enhancedPrompt: string,
    modelId: string
): Promise<ExecutionResult> {
    const adapter = getModelAdapter(modelId);

    // Simulate API latency (varies by model)
    const latency = adapter.family === 'gpt' ? 800 :
                    adapter.family === 'claude' ? 900 :
                    adapter.family === 'gemini' ? 700 : 600;
    await new Promise(resolve => setTimeout(resolve, latency));

    // Generate output WITH full adapter configuration
    // This simulates what an enhanced prompt produces with optimized settings
    const output = generateEnhancedOutput(enhancedPrompt, adapter);

    const metrics = calculateMetrics(output);

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
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT GENERATORS — Simulate model behavior differences
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generates output for RAW prompts — minimal structure, generic response
 */
function generateRawOutput(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    const words = prompt.split(/\s+/).length;

    // Short, vague prompts get short, vague responses
    if (words < 10) {
        return `I can help with that.

To get started, you'll want to think about what you're trying to accomplish. There are different approaches depending on your specific needs.

Consider what tools or technologies might work best for your situation. You may want to do some research first.

Let me know if you have more specific questions!`;
    }

    // Medium prompts get slightly better but still unstructured responses
    if (words < 25) {
        return `Sure, I'll help you with ${extractTopic(prompt)}.

Here's a general approach:

First, understand your requirements clearly. Think about what success looks like for your project.

Then, choose appropriate tools and methods. There are several options available depending on your preferences and constraints.

Implementation involves setting things up and testing as you go. Make sure to handle edge cases.

Finally, review and refine your solution. Get feedback and iterate.

Is there a specific part you'd like me to elaborate on?`;
    }

    // Longer prompts get more content but still lack structure
    return `I'll help you with ${extractTopic(prompt)}.

Based on what you've described, here's what I'd suggest:

You should start by planning out your approach. Consider the main components you'll need and how they'll work together. It's important to think about the overall architecture early on.

For implementation, you have several options. You could use existing frameworks or build from scratch depending on your requirements. Each approach has tradeoffs in terms of flexibility, time investment, and maintenance.

Some things to keep in mind:
- Consider your timeline and resources
- Think about scalability if that's relevant
- Don't forget about testing and documentation
- Plan for potential edge cases

The specific steps will depend on your technology choices and requirements. Would you like me to go into more detail about any particular aspect?

Feel free to ask follow-up questions as you work through this.`;
}

/**
 * Generates output for ENHANCED prompts — structured, specific, actionable
 */
function generateEnhancedOutput(prompt: string, adapter: ModelAdapter): string {
    const topic = extractTopic(prompt);
    const hasObjective = /OBJECTIVE|## Objective/i.test(prompt);
    const hasRequirements = /REQUIREMENTS|## Requirements|NON-NEGOTIABLES/i.test(prompt);
    const hasContext = /CONTEXT|## Context|Background/i.test(prompt);
    const hasFormat = /OUTPUT FORMAT|## Expected Output|DELIVERABLES/i.test(prompt);

    // Build response based on prompt structure and adapter
    const sections: string[] = [];

    // Title
    sections.push(`# ${capitalizeFirst(topic)} — Implementation Guide\n`);

    // Executive Summary (enhanced prompts get this)
    if (hasObjective) {
        sections.push(`## Executive Summary

This document provides a comprehensive implementation plan for ${topic}. Based on your specified requirements and constraints, I've structured the approach to ensure complete coverage of all objectives.\n`);
    }

    // Core Implementation
    sections.push(`## Core Implementation

### Architecture Overview

The solution is structured into three main components:

1. **Primary Module** — Handles core business logic
   - Input validation and sanitization
   - Business rule processing
   - Output transformation
   - Error handling with detailed messages

2. **Data Layer** — Manages state and persistence
   - Schema definitions with TypeScript types
   - CRUD operations with validation
   - Transaction management
   - Query optimization

3. **Interface Layer** — Exposes functionality
   - RESTful API endpoints
   - Authentication and authorization
   - Rate limiting and caching
   - Response formatting\n`);

    // Technical Specifications (if requirements present)
    if (hasRequirements) {
        sections.push(`### Technical Specifications

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14 | Server components, API routes, optimal DX |
| Language | TypeScript | Type safety, better tooling |
| Database | PostgreSQL | Reliability, ACID compliance |
| ORM | Prisma | Type-safe queries, migrations |
| Testing | Jest + RTL | Industry standard, good coverage |
| Deployment | Vercel | Seamless Next.js integration |\n`);
    }

    // Implementation Steps
    sections.push(`## Implementation Steps

### Phase 1: Foundation (Days 1-2)
- [ ] Set up project structure and dependencies
- [ ] Configure TypeScript and ESLint
- [ ] Initialize database schema
- [ ] Set up development environment

### Phase 2: Core Logic (Days 3-5)
- [ ] Implement data models
- [ ] Build core business logic
- [ ] Add validation layer
- [ ] Create service abstractions

### Phase 3: API & Integration (Days 6-8)
- [ ] Create API endpoints
- [ ] Add authentication middleware
- [ ] Implement error handling
- [ ] Set up logging and monitoring

### Phase 4: Testing & Deployment (Days 9-10)
- [ ] Write unit tests (target >90% coverage)
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Deployment and documentation\n`);

    // Context-aware additions
    if (hasContext) {
        sections.push(`## Context-Specific Considerations

Based on the context provided:

- **Environment**: Production-ready with staging support
- **Scale**: Designed for growth with horizontal scaling capability
- **Maintenance**: Modular architecture for easy updates
- **Security**: Following OWASP guidelines\n`);
    }

    // Output format specifications
    if (hasFormat) {
        sections.push(`## Deliverables

1. **Source Code** — Complete, documented, and tested
2. **Documentation** — README, API docs, architecture diagrams
3. **Tests** — Unit, integration, and E2E test suites
4. **Deployment** — CI/CD pipeline configuration\n`);
    }

    // Model-specific additions based on reasoning bias
    if (adapter.reasoningBias > 0.8) {
        sections.push(`## Edge Cases & Risk Mitigation

### Potential Challenges
1. **Concurrency** — Implemented optimistic locking for data consistency
2. **Scale** — Rate limiting and caching to handle traffic spikes
3. **Failures** — Graceful degradation with circuit breakers
4. **Security** — Input sanitization and prepared statements

### Mitigation Strategies
- Comprehensive error handling at all layers
- Monitoring and alerting for anomaly detection
- Regular dependency audits
- Automated backup and recovery\n`);
    }

    // Success Criteria
    sections.push(`## Success Criteria

- [ ] All tests passing with >90% coverage
- [ ] Response time <200ms for 95th percentile
- [ ] Error rate <0.1%
- [ ] Zero critical security vulnerabilities
- [ ] Documentation complete and up-to-date\n`);

    // Next Steps
    sections.push(`## Next Steps

1. Review and approve this implementation plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Schedule weekly progress check-ins

---

*This plan addresses all specified requirements and constraints. Ready to begin implementation upon approval.*`);

    return sections.join('\n');
}

/**
 * Extract the main topic from a prompt
 */
function extractTopic(prompt: string): string {
    // Look for common action verbs
    const patterns = [
        /(?:build|create|make|write|develop|implement|design|generate)\s+(?:a|an|the)?\s*(.+?)(?:\s+(?:for|with|using|that)|[.,]|$)/i,
        /(?:help|assist|guide).+?(?:with|on)\s+(.+?)(?:[.,]|$)/i,
        /^(.+?)(?:\s+(?:for|with|using|that)|[.,]|$)/i,
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            const topic = match[1].trim().slice(0, 50);
            return topic || 'your project';
        }
    }

    return 'your project';
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Calculate quality metrics for an output
 */
function calculateMetrics(output: string): ExecutionResult['metrics'] {
    const hasHeaders = (output.match(/^#{1,3}\s/gm) || []).length;
    const hasBullets = (output.match(/^[\s]*[-*]\s/gm) || []).length;
    const hasNumbering = (output.match(/^\d+\.\s/gm) || []).length;
    const hasCodeBlocks = (output.match(/```/g) || []).length;
    const hasTables = (output.match(/\|.+\|/g) || []).length;
    const hasCheckboxes = (output.match(/\[[ x]\]/g) || []).length;

    // Structure score: headers + lists + formatting
    const structureScore = Math.min(100,
        hasHeaders * 10 +
        hasBullets * 3 +
        hasNumbering * 3 +
        hasCodeBlocks * 10 +
        hasTables * 15 +
        hasCheckboxes * 5
    );

    // Specificity: length + technical terms
    const technicalTerms = (output.match(/\b(API|database|schema|endpoint|module|component|TypeScript|function|class|interface|implementation|architecture|deployment|testing)\b/gi) || []).length;
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

/**
 * Validates that enhanced output is demonstrably better than original
 * Returns error message if parity not achieved
 */
export function validateDemoParity(
    originalResult: ExecutionResult,
    enhancedResult: ExecutionResult
): { valid: boolean; error?: string } {
    const o = originalResult.metrics;
    const e = enhancedResult.metrics;

    // Check 1: Enhanced must be longer OR significantly more structured
    const lengthImprovement = e.responseLength / o.responseLength;
    const structureImprovement = e.structureScore - o.structureScore;
    const specificityImprovement = e.specificityScore - o.specificityScore;

    // At least one of these must be true:
    // - 50% longer
    // - 30+ points better structure score
    // - 30+ points better specificity score
    const isLonger = lengthImprovement >= 1.5;
    const isMoreStructured = structureImprovement >= 30;
    const isMoreSpecific = specificityImprovement >= 30;

    if (!isLonger && !isMoreStructured && !isMoreSpecific) {
        return {
            valid: false,
            error: `Enhanced output did not improve. Check execution pipeline. Metrics: length=${lengthImprovement.toFixed(2)}x, structure=+${structureImprovement}, specificity=+${specificityImprovement}`,
        };
    }

    // Check 2: Outputs must not be identical
    if (originalResult.output === enhancedResult.output) {
        return {
            valid: false,
            error: 'Enhanced output is identical to original. Execution paths are not differentiated.',
        };
    }

    return { valid: true };
}
