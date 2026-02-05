// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS PROMPT ENGINE — TWO-STAGE DETERMINISTIC PIPELINE
// ═══════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE:
//   Stage 1: PROMPT COMPILER — Extracts structure, surfaces unknowns
//   Stage 2: PROMPT ASSEMBLER — Mechanical assembly from spec + template
//
// BEHAVIORAL LOCKS:
//   - NO creative enhancement
//   - NO guessing or assumption resolution
//   - NO model-specific optimizations in compiler
//   - ALL ambiguity marked as UNDECIDED
//
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The structured output of Stage 1: Prompt Compiler
 * Every field must be present. Missing information is marked UNDECIDED.
 */
export interface CompiledSpec {
    /** What the user wants to achieve - extracted verbatim or marked UNDECIDED */
    objective: string;

    /** Background information provided - extracted verbatim or marked UNDECIDED */
    context: string;

    /** Explicit limitations or boundaries mentioned */
    constraints: string[];

    /** Hard requirements that cannot be compromised */
    nonNegotiables: string[];

    /** Implicit assumptions detected in the input */
    assumptions: string[];

    /** Information that is missing or vague */
    missingInformation: string[];

    /** Detected conflicts or risks in the request */
    conflictsOrRisks: string[];

    /** Notes for the Prompt Assembler */
    assemblerNotes: string[];

    /** Raw input preserved for reference */
    rawInput: string;

    /** Detected language of input */
    language: 'en' | 'sv';
}

/**
 * Target model configuration for the Assembler
 */
export type TargetModel =
    | 'gpt-5' | 'gpt-4' | 'gpt-3.5'
    | 'claude-opus' | 'claude-sonnet' | 'claude-haiku'
    | 'gemini' | 'grok' | 'code-agent' | 'general';

/**
 * Input to the Prompt Assembler
 */
export interface AssemblerInput {
    spec: CompiledSpec;
    targetModel: TargetModel;
    outputLanguage: 'en' | 'sv' | 'auto';
}

/**
 * Final output of the pipeline
 */
export interface PipelineOutput {
    /** The final assembled prompt */
    assembledPrompt: string;

    /** The compiled specification (for transparency) */
    spec: CompiledSpec;

    /** Warnings about missing or undecided elements */
    warnings: string[];

    /** Pipeline metadata */
    meta: {
        pipelineVersion: string;
        targetModel: TargetModel;
        hasUndecidedElements: boolean;
        compiledAt: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 1: PROMPT COMPILER
// ═══════════════════════════════════════════════════════════════════════════
//
// BEHAVIORAL RULES:
//   1. Extract ONLY what is explicitly stated
//   2. Mark anything unclear as UNDECIDED
//   3. NEVER add, improve, or suggest
//   4. NEVER resolve ambiguity
//   5. Surface all assumptions for user review
//
// ═══════════════════════════════════════════════════════════════════════════

const UNDECIDED = '[UNDECIDED]';

/**
 * Detects the language of the input text
 */
function detectLanguage(text: string): 'en' | 'sv' {
    const swedishIndicators = /\b(och|eller|för|att|det|är|jag|ska|kan|hur|vad|varför|som|med|på|av|till|från|om|inte|den|ett|en|har|vara|blir|skulle|finns|också|bara|alla|något|mycket|andra|vilken|genom|under|över|mellan|utan|inom|sedan|efter|före|mot|vid|så|än|nu|här|där|skriv|skapa|bygg|förklara|jämför|fixa|ge mig|hjälp mig|fungerar|recept|berätta|beskriv|gör|vill|behöver)\b/gi;
    const matches = text.match(swedishIndicators) || [];
    return matches.length >= 2 ? 'sv' : 'en';
}

/**
 * Extracts the primary objective from user input
 * Returns UNDECIDED if objective is unclear
 */
function extractObjective(input: string): string {
    const lower = input.toLowerCase();
    const trimmed = input.trim();

    // Check if there's any actionable content
    if (trimmed.length < 3) {
        return UNDECIDED;
    }

    // Look for explicit objective patterns
    const objectivePatterns = [
        // English patterns
        /(?:i want to|i need to|i'd like to|please|help me|can you)\s+(.+?)(?:\.|$)/i,
        /(?:build|create|make|write|develop|implement|design|generate|explain|fix|debug|compare)\s+(.+?)(?:\.|$)/i,
        // Swedish patterns
        /(?:jag vill|jag behöver|hjälp mig|kan du)\s+(.+?)(?:\.|$)/i,
        /(?:bygg|skapa|gör|skriv|utveckla|implementera|designa|förklara|fixa|jämför)\s+(.+?)(?:\.|$)/i,
    ];

    for (const pattern of objectivePatterns) {
        const match = input.match(pattern);
        if (match) {
            return trimmed; // Return the full input as the objective (no modification)
        }
    }

    // If no clear pattern, return the input as-is (it might be the objective)
    return trimmed;
}

/**
 * Extracts context from user input
 * Context = background information, situation, or environment
 */
function extractContext(input: string): string {
    const contextPatterns = [
        // English
        /(?:for|in|within|as part of|working on|building)\s+(?:a|an|the|my)?\s*([^.]+)/i,
        /(?:context|background|situation|scenario):\s*([^.]+)/i,
        // Swedish
        /(?:för|i|inom|som en del av|arbetar med|bygger)\s+(?:en|ett|min|mitt)?\s*([^.]+)/i,
    ];

    for (const pattern of contextPatterns) {
        const match = input.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return UNDECIDED;
}

/**
 * Extracts explicit constraints from user input
 */
function extractConstraints(input: string): string[] {
    const constraints: string[] = [];
    const lower = input.toLowerCase();

    // Constraint indicators (English + Swedish)
    const constraintPatterns = [
        /(?:must not|cannot|don't|no|without|except|excluding|limit|maximum|minimum|only)\s+([^.,]+)/gi,
        /(?:får inte|kan inte|inga|utan|förutom|exkludera|begränsa|max|min|endast|bara)\s+([^.,]+)/gi,
        /(?:constraint|requirement|rule|restriction):\s*([^.,]+)/gi,
        /(?:krav|regel|begränsning):\s*([^.,]+)/gi,
    ];

    for (const pattern of constraintPatterns) {
        let match;
        while ((match = pattern.exec(input)) !== null) {
            if (match[1] && match[1].trim().length > 2) {
                constraints.push(match[1].trim());
            }
        }
    }

    // Check for time/budget constraints
    if (/\b(urgent|asap|quickly|fast|deadline|budget|cost)\b/i.test(lower)) {
        constraints.push('Time or resource constraint detected but not specified');
    }
    if (/\b(brådskande|snabbt|deadline|budget|kostnad)\b/i.test(lower)) {
        constraints.push('Tids- eller resursbegränsning upptäckt men ej specificerad');
    }

    return constraints;
}

/**
 * Extracts non-negotiable requirements
 */
function extractNonNegotiables(input: string): string[] {
    const nonNegotiables: string[] = [];

    const patterns = [
        /(?:must|have to|need to|required|essential|critical|mandatory)\s+([^.,]+)/gi,
        /(?:måste|behöver|krävs|essentiellt|kritiskt|obligatoriskt)\s+([^.,]+)/gi,
        /(?:non-negotiable|absolute|definitely):\s*([^.,]+)/gi,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(input)) !== null) {
            if (match[1] && match[1].trim().length > 2) {
                nonNegotiables.push(match[1].trim());
            }
        }
    }

    return nonNegotiables;
}

/**
 * Surfaces implicit assumptions in the input
 */
function surfaceAssumptions(input: string, objective: string): string[] {
    const assumptions: string[] = [];
    const lower = input.toLowerCase();

    // Assumption: Target audience not specified
    if (!/\b(for|to|audience|user|reader|customer|target|för|till|målgrupp|användare|läsare|kund)\b/i.test(lower)) {
        assumptions.push('Target audience not specified');
    }

    // Assumption: Technical level not specified
    if (/\b(app|code|api|function|program|application|software|kod|applikation|mjukvara)\b/i.test(lower)) {
        if (!/\b(beginner|advanced|senior|junior|expert|nybörjare|avancerad|senior|junior|expert)\b/i.test(lower)) {
            assumptions.push('Technical complexity level not specified');
        }
    }

    // Assumption: Scope not defined
    if (/\b(build|create|make|develop|bygg|skapa|utveckla)\b/i.test(lower)) {
        if (!/\b(mvp|prototype|full|complete|basic|simple|advanced|production|mvp|prototyp|komplett|enkel|avancerad|produktion)\b/i.test(lower)) {
            assumptions.push('Project scope/scale not specified (MVP, prototype, production?)');
        }
    }

    // Assumption: Output format not specified
    if (!/\b(format|structure|output|response|length|sections|format|struktur|output|svar|längd|sektioner)\b/i.test(lower)) {
        assumptions.push('Desired output format not specified');
    }

    // Assumption: Success criteria not defined
    if (!/\b(success|done|complete|goal|criteria|framgång|klar|komplett|mål|kriterier)\b/i.test(lower)) {
        assumptions.push('Success criteria not defined');
    }

    return assumptions;
}

/**
 * Identifies missing information
 */
function identifyMissingInformation(input: string, objective: string, context: string): string[] {
    const missing: string[] = [];

    if (objective === UNDECIDED) {
        missing.push('Primary objective is unclear');
    }

    if (context === UNDECIDED) {
        missing.push('Context or background information not provided');
    }

    // Check for vague references
    if (/\b(it|this|that|these|those|the thing|det|detta|den|dessa)\b/i.test(input) && input.length < 100) {
        missing.push('Vague references detected without clear antecedents');
    }

    // Check for implicit "you know what I mean"
    if (/\b(etc|and so on|you know|like that|osv|och så vidare|du vet|liksom)\b/i.test(input)) {
        missing.push('Implicit expectations detected but not specified');
    }

    // Check word count - very short inputs likely missing info
    const wordCount = input.split(/\s+/).length;
    if (wordCount < 5) {
        missing.push('Input is very brief - likely missing important details');
    }

    return missing;
}

/**
 * Detects conflicts or risks in the request
 */
function detectConflictsOrRisks(input: string, constraints: string[], nonNegotiables: string[]): string[] {
    const conflicts: string[] = [];
    const lower = input.toLowerCase();

    // Check for contradictory requirements
    if (/\b(simple|easy|basic)\b/i.test(lower) && /\b(comprehensive|complete|full|advanced)\b/i.test(lower)) {
        conflicts.push('Potential conflict: Request mentions both simplicity and comprehensiveness');
    }
    if (/\b(enkel|lätt|basic)\b/i.test(lower) && /\b(omfattande|komplett|full|avancerad)\b/i.test(lower)) {
        conflicts.push('Potentiell konflikt: Begäran nämner både enkelhet och omfattning');
    }

    // Check for scope creep indicators
    if (/\b(also|and also|plus|additionally|furthermore|also|och även|plus|dessutom|vidare)\b/i.test(lower)) {
        const alsoCount = (lower.match(/\b(also|and also|plus|additionally|also|och även|plus|dessutom)\b/gi) || []).length;
        if (alsoCount >= 2) {
            conflicts.push('Scope creep risk: Multiple additions detected');
        }
    }

    // Check for time vs. quality conflicts
    if (/\b(quick|fast|urgent|asap)\b/i.test(lower) && /\b(quality|perfect|thorough|detailed)\b/i.test(lower)) {
        conflicts.push('Potential conflict: Speed vs. quality tension detected');
    }

    return conflicts;
}

/**
 * Generates notes for the Prompt Assembler
 */
function generateAssemblerNotes(input: string, spec: Partial<CompiledSpec>): string[] {
    const notes: string[] = [];
    const lower = input.toLowerCase();

    // Note about request type
    if (/\b(build|create|make|develop|implement|bygg|skapa|utveckla|implementera)\b/i.test(lower)) {
        notes.push('REQUEST_TYPE: BUILD/CREATE');
    } else if (/\b(explain|describe|what is|how does|förklara|beskriv|vad är|hur)\b/i.test(lower)) {
        notes.push('REQUEST_TYPE: EXPLAIN');
    } else if (/\b(fix|debug|error|bug|problem|fixa|fel|bugg|problem)\b/i.test(lower)) {
        notes.push('REQUEST_TYPE: DEBUG/FIX');
    } else if (/\b(compare|versus|vs|difference|jämför|skillnad)\b/i.test(lower)) {
        notes.push('REQUEST_TYPE: COMPARE');
    } else {
        notes.push('REQUEST_TYPE: GENERAL');
    }

    // Note about completeness
    const missingCount = spec.missingInformation?.length || 0;
    const undecidedCount = [spec.objective, spec.context].filter(v => v === UNDECIDED).length;

    if (missingCount + undecidedCount === 0) {
        notes.push('COMPLETENESS: HIGH - Input is well-specified');
    } else if (missingCount + undecidedCount <= 2) {
        notes.push('COMPLETENESS: MEDIUM - Some clarification may improve output');
    } else {
        notes.push('COMPLETENESS: LOW - Significant information missing');
    }

    // Note about output expectations
    if (spec.assumptions?.some(a => a.includes('output format'))) {
        notes.push('OUTPUT_FORMAT: UNDECIDED - Assembler should request clarification or use default');
    }

    return notes;
}

/**
 * STAGE 1: PROMPT COMPILER
 *
 * Transforms raw user input into a decision-complete specification.
 *
 * HARD RULES:
 * - Must NOT improve, rewrite, or enhance creatively
 * - Must NOT add ideas or features
 * - Must NOT resolve ambiguity
 * - Must mark missing information as UNDECIDED
 */
export function compilePrompt(rawInput: string): CompiledSpec {
    const input = rawInput.trim();
    const language = detectLanguage(input);

    // Extract components (no enhancement, no guessing)
    const objective = extractObjective(input);
    const context = extractContext(input);
    const constraints = extractConstraints(input);
    const nonNegotiables = extractNonNegotiables(input);
    const assumptions = surfaceAssumptions(input, objective);
    const missingInformation = identifyMissingInformation(input, objective, context);
    const conflictsOrRisks = detectConflictsOrRisks(input, constraints, nonNegotiables);

    // Build partial spec for assembler notes
    const partialSpec: Partial<CompiledSpec> = {
        objective,
        context,
        constraints,
        nonNegotiables,
        assumptions,
        missingInformation,
    };

    const assemblerNotes = generateAssemblerNotes(input, partialSpec);

    return {
        objective,
        context,
        constraints,
        nonNegotiables,
        assumptions,
        missingInformation,
        conflictsOrRisks,
        assemblerNotes,
        rawInput: input,
        language,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 2: PROMPT ASSEMBLER
// ═══════════════════════════════════════════════════════════════════════════
//
// BEHAVIORAL RULES:
//   1. Mechanical assembly ONLY
//   2. NO free-form creativity
//   3. Use fixed templates
//   4. Model-specific formatting only (not content)
//
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Model-specific prompt templates
 * These define STRUCTURE only, not content
 */
const PROMPT_TEMPLATES: Record<TargetModel, { prefix: string; structure: string; suffix: string }> = {
    'gpt-5': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'gpt-4': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'gpt-3.5': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: 'Be concise.',
    },
    'claude-opus': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'claude-sonnet': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'claude-haiku': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: 'Be direct and concise.',
    },
    'gemini': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'grok': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
    'code-agent': {
        prefix: 'You are implementing code.',
        structure: 'OBJECTIVE → TECHNICAL_CONTEXT → CONSTRAINTS → CODE_REQUIREMENTS',
        suffix: 'Provide working, tested code.',
    },
    'general': {
        prefix: '',
        structure: 'OBJECTIVE → CONTEXT → CONSTRAINTS → OUTPUT_REQUIREMENTS',
        suffix: '',
    },
};

/**
 * Formats the compiled spec into a section-based prompt
 */
function formatSpecAsPrompt(spec: CompiledSpec, lang: 'en' | 'sv'): string {
    const sections: string[] = [];

    // OBJECTIVE section
    if (spec.objective !== UNDECIDED) {
        sections.push(`## OBJECTIVE\n${spec.objective}`);
    } else {
        sections.push(`## OBJECTIVE\n[UNDECIDED - User must clarify primary goal]`);
    }

    // CONTEXT section
    if (spec.context !== UNDECIDED) {
        sections.push(`## CONTEXT\n${spec.context}`);
    }

    // CONSTRAINTS section (if any)
    if (spec.constraints.length > 0) {
        const constraintList = spec.constraints.map(c => `- ${c}`).join('\n');
        sections.push(`## CONSTRAINTS\n${constraintList}`);
    }

    // NON-NEGOTIABLES section (if any)
    if (spec.nonNegotiables.length > 0) {
        const nnList = spec.nonNegotiables.map(nn => `- ${nn}`).join('\n');
        sections.push(`## NON-NEGOTIABLES\n${nnList}`);
    }

    // OUTPUT REQUIREMENTS
    // Derive from request type in assembler notes
    const requestType = spec.assemblerNotes.find(n => n.startsWith('REQUEST_TYPE:'));
    let outputReq = '';

    if (requestType?.includes('BUILD/CREATE')) {
        if (lang === 'sv') {
            outputReq = 'Ge en strukturerad lösning med tydliga steg och implementeringsdetaljer.';
        } else {
            outputReq = 'Provide a structured solution with clear steps and implementation details.';
        }
    } else if (requestType?.includes('EXPLAIN')) {
        if (lang === 'sv') {
            outputReq = 'Ge en tydlig förklaring med exempel.';
        } else {
            outputReq = 'Provide a clear explanation with examples.';
        }
    } else if (requestType?.includes('DEBUG/FIX')) {
        if (lang === 'sv') {
            outputReq = 'Identifiera problemet och ge en lösning med förklaring.';
        } else {
            outputReq = 'Identify the issue and provide a fix with explanation.';
        }
    } else if (requestType?.includes('COMPARE')) {
        if (lang === 'sv') {
            outputReq = 'Ge en strukturerad jämförelse med tydlig rekommendation.';
        } else {
            outputReq = 'Provide a structured comparison with clear recommendation.';
        }
    } else {
        if (lang === 'sv') {
            outputReq = 'Ge ett direkt och strukturerat svar.';
        } else {
            outputReq = 'Provide a direct and structured response.';
        }
    }

    sections.push(`## OUTPUT REQUIREMENTS\n${outputReq}`);

    return sections.join('\n\n');
}

/**
 * Generates warnings for undecided/missing elements
 */
function generateWarnings(spec: CompiledSpec, lang: 'en' | 'sv'): string[] {
    const warnings: string[] = [];

    if (spec.objective === UNDECIDED) {
        warnings.push(lang === 'sv'
            ? 'VARNING: Primärt mål är oklart'
            : 'WARNING: Primary objective is unclear');
    }

    if (spec.context === UNDECIDED) {
        warnings.push(lang === 'sv'
            ? 'OBS: Ingen kontext angiven'
            : 'NOTE: No context provided');
    }

    for (const missing of spec.missingInformation) {
        warnings.push(lang === 'sv'
            ? `SAKNAS: ${missing}`
            : `MISSING: ${missing}`);
    }

    for (const conflict of spec.conflictsOrRisks) {
        warnings.push(lang === 'sv'
            ? `RISK: ${conflict}`
            : `RISK: ${conflict}`);
    }

    return warnings;
}

/**
 * STAGE 2: PROMPT ASSEMBLER
 *
 * Generates a final prompt from the compiled specification.
 *
 * HARD RULES:
 * - Mechanical assembly ONLY
 * - NO creative additions
 * - Template-based structure
 */
export function assemblePrompt(input: AssemblerInput): PipelineOutput {
    const { spec, targetModel, outputLanguage } = input;
    const lang = outputLanguage === 'auto' ? spec.language : outputLanguage;

    const template = PROMPT_TEMPLATES[targetModel] || PROMPT_TEMPLATES.general;

    // Build the assembled prompt
    const parts: string[] = [];

    // Add model-specific prefix (if any)
    if (template.prefix) {
        parts.push(template.prefix);
    }

    // Add the formatted specification
    parts.push(formatSpecAsPrompt(spec, lang));

    // Add model-specific suffix (if any)
    if (template.suffix) {
        parts.push(template.suffix);
    }

    const assembledPrompt = parts.join('\n\n');
    const warnings = generateWarnings(spec, lang);

    // Determine if there are undecided elements
    const hasUndecidedElements =
        spec.objective === UNDECIDED ||
        spec.context === UNDECIDED ||
        spec.missingInformation.length > 0;

    return {
        assembledPrompt,
        spec,
        warnings,
        meta: {
            pipelineVersion: '1.0.0',
            targetModel,
            hasUndecidedElements,
            compiledAt: new Date().toISOString(),
        },
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED PIPELINE EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════

export interface PipelineInput {
    rawPrompt: string;
    targetModel?: TargetModel;
    outputLanguage?: 'en' | 'sv' | 'auto';
}

/**
 * Executes the full two-stage pipeline
 *
 * Stage 1: Compile raw input → structured specification
 * Stage 2: Assemble specification → final prompt
 */
export function executePipeline(input: PipelineInput): PipelineOutput {
    const { rawPrompt, targetModel = 'general', outputLanguage = 'auto' } = input;

    // STAGE 1: Compile
    const spec = compilePrompt(rawPrompt);

    // STAGE 2: Assemble
    const output = assemblePrompt({
        spec,
        targetModel,
        outputLanguage,
    });

    return output;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY LAYER
// Maps old API structure to new pipeline
// ═══════════════════════════════════════════════════════════════════════════

export interface LegacyEnhanceResult {
    success: boolean;
    enhanced: string;
    changes: string[];
    scores: { before: number; after: number };
    spec?: CompiledSpec;
    warnings?: string[];
}

/**
 * Maps the old enhance API format to the new pipeline
 * Maintains backward compatibility with existing UI
 */
export function legacyEnhance(
    rawPrompt: string,
    platform: string = 'general',
    outputLanguage: 'en' | 'sv' | 'auto' = 'auto'
): LegacyEnhanceResult {
    // Map platform to target model
    const modelMap: Record<string, TargetModel> = {
        'chatgpt': 'gpt-4',
        'claude': 'claude-sonnet',
        'gemini': 'gemini',
        'grok': 'grok',
        'general': 'general',
    };

    const targetModel = modelMap[platform] || 'general';

    // Execute pipeline
    const output = executePipeline({
        rawPrompt,
        targetModel,
        outputLanguage,
    });

    // Generate change descriptions based on what was extracted
    const changes: string[] = [];

    if (output.spec.objective !== UNDECIDED) {
        changes.push('Extracted objective');
    }
    if (output.spec.context !== UNDECIDED) {
        changes.push('Identified context');
    }
    if (output.spec.constraints.length > 0) {
        changes.push(`Found ${output.spec.constraints.length} constraint(s)`);
    }
    if (output.spec.assumptions.length > 0) {
        changes.push(`Surfaced ${output.spec.assumptions.length} assumption(s)`);
    }
    if (output.spec.missingInformation.length > 0) {
        changes.push(`Identified ${output.spec.missingInformation.length} missing element(s)`);
    }
    if (output.warnings.length > 0) {
        changes.push(`Generated ${output.warnings.length} warning(s)`);
    }

    // Calculate scores based on completeness
    const beforeScore = 20; // Raw input always starts low
    const completenessNote = output.spec.assemblerNotes.find(n => n.startsWith('COMPLETENESS:'));
    let afterScore = 60;

    if (completenessNote?.includes('HIGH')) {
        afterScore = 90;
    } else if (completenessNote?.includes('MEDIUM')) {
        afterScore = 75;
    } else {
        afterScore = 55;
    }

    return {
        success: true,
        enhanced: output.assembledPrompt,
        changes,
        scores: { before: beforeScore, after: afterScore },
        spec: output.spec,
        warnings: output.warnings,
    };
}
