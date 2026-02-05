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

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION PROMPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
//
// Transforms internal spec into a PREMIUM EXECUTION PROMPT.
// This is what gets shown to the user and sent to the LLM.
//
// REQUIRED SECTIONS (ALL MUST BE PRESENT):
//   A. ROLE — Explicit expert identity
//   B. AUDIENCE & LEVEL — Who the answer is for
//   C. TASK DEFINITION — Clear, multi-step instruction
//   D. CONSTRAINTS — Scope boundaries, what to avoid
//   E. QUALITY BAR — What makes a good answer
//   F. OUTPUT FORMAT — Structure, never freeform
//
// ═══════════════════════════════════════════════════════════════════════════

interface ExecutionPromptConfig {
    role: string;
    audience: string;
    skillLevel: string;
    taskSteps: string[];
    constraints: string[];
    qualityBar: string[];
    outputFormat: string[];
}

/**
 * Infers the expert role based on the objective and context
 */
function inferExpertRole(spec: CompiledSpec, lang: 'en' | 'sv'): string {
    const obj = spec.objective.toLowerCase();
    const raw = spec.rawInput.toLowerCase();

    // Fitness/health topics
    if (/chin|pull.?up|push.?up|träning|workout|exercise|gym|fitness|muscle|styrka|strength/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en certifierad styrke- och konditionscoach med 15 års erfarenhet av att träna nybörjare till avancerade atleter. Du kombinerar vetenskapligt bevisade metoder med praktisk erfarenhet.'
            : 'You are a certified strength and conditioning coach with 15 years of experience training beginners to advanced athletes. You combine evidence-based methods with practical experience.';
    }

    // Cooking/recipes
    if (/recept|recipe|cook|mat|food|bak|bake|ingredient|meal/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en professionell kock med utbildning från kulinariska institut och 12 års erfarenhet i restaurangkök. Du specialiserar dig på att göra avancerade tekniker tillgängliga för hemkockar.'
            : 'You are a professional chef with culinary institute training and 12 years of restaurant kitchen experience. You specialize in making advanced techniques accessible to home cooks.';
    }

    // Programming/code
    if (/code|kod|program|app|software|api|function|develop|bygg|build|implement/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en senior mjukvaruutvecklare med 10+ års erfarenhet av full-stack utveckling. Du prioriterar läsbar, underhållbar kod och följer branschens bästa praxis.'
            : 'You are a senior software developer with 10+ years of full-stack experience. You prioritize readable, maintainable code and follow industry best practices.';
    }

    // Writing/content
    if (/skriv|write|text|content|article|blog|copy|essay/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en erfaren copywriter och innehållsstrateg med bakgrund inom journalistik. Du behärskar konsten att kommunicera komplext innehåll på ett engagerande sätt.'
            : 'You are an experienced copywriter and content strategist with a journalism background. You master the art of communicating complex content in an engaging way.';
    }

    // Business/strategy
    if (/business|affär|strateg|plan|market|företag|startup|revenue|profit/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en affärsstrateg och managementkonsult med MBA och erfarenhet från Fortune 500-bolag. Du fokuserar på praktiska, genomförbara rekommendationer.'
            : 'You are a business strategist and management consultant with an MBA and Fortune 500 experience. You focus on practical, actionable recommendations.';
    }

    // Learning/education
    if (/lär|learn|förstå|understand|explain|förklara|study|studera|course|kurs/i.test(raw)) {
        return lang === 'sv'
            ? 'Du är en pedagogisk expert och lärare med specialisering i att bryta ner komplexa ämnen. Du använder analogier, exempel och stegvisa förklaringar för maximal förståelse.'
            : 'You are a pedagogical expert and educator specializing in breaking down complex topics. You use analogies, examples, and step-by-step explanations for maximum comprehension.';
    }

    // Default expert
    return lang === 'sv'
        ? 'Du är en senior expert och rådgivare med djup kunskap inom det aktuella området. Du kombinerar teoretisk förståelse med praktisk erfarenhet för att ge konkreta, användbara svar.'
        : 'You are a senior expert and advisor with deep knowledge in the relevant domain. You combine theoretical understanding with practical experience to provide concrete, actionable answers.';
}

/**
 * Infers audience and skill level from context
 */
function inferAudience(spec: CompiledSpec, lang: 'en' | 'sv'): { audience: string; level: string } {
    const raw = spec.rawInput.toLowerCase();

    // Check for explicit skill indicators
    if (/nybörjare|beginner|första gången|first time|aldrig|never|ny till/i.test(raw)) {
        return {
            audience: lang === 'sv' ? 'En nybörjare som är ny inom området' : 'A beginner who is new to the field',
            level: lang === 'sv' ? 'Förklara grundläggande koncept, undvik jargong, inkludera definitioner' : 'Explain foundational concepts, avoid jargon, include definitions'
        };
    }

    if (/avancerad|advanced|erfaren|experienced|expert|professional/i.test(raw)) {
        return {
            audience: lang === 'sv' ? 'En erfaren utövare som söker optimering' : 'An experienced practitioner seeking optimization',
            level: lang === 'sv' ? 'Hoppa över grunderna, fokusera på avancerade tekniker och nyanser' : 'Skip basics, focus on advanced techniques and nuances'
        };
    }

    // Default: intermediate
    return {
        audience: lang === 'sv' ? 'Någon med grundläggande förståelse som vill fördjupa sina kunskaper' : 'Someone with basic understanding looking to deepen their knowledge',
        level: lang === 'sv' ? 'Anta viss förkunskap men förklara avancerade koncept vid behov' : 'Assume some prior knowledge but explain advanced concepts when needed'
    };
}

/**
 * Generates multi-step task definition from objective
 */
function generateTaskSteps(spec: CompiledSpec, lang: 'en' | 'sv'): string[] {
    const requestType = spec.assemblerNotes.find(n => n.startsWith('REQUEST_TYPE:'));
    const objective = spec.objective;

    if (requestType?.includes('BUILD/CREATE')) {
        return lang === 'sv' ? [
            `1. Analysera vad som behövs för: "${objective}"`,
            '2. Bryt ner i tydliga, numrerade steg',
            '3. Inkludera specifika detaljer och exempel för varje steg',
            '4. Förklara varför varje steg är viktigt',
            '5. Avsluta med vanliga misstag att undvika'
        ] : [
            `1. Analyze what is needed for: "${objective}"`,
            '2. Break down into clear, numbered steps',
            '3. Include specific details and examples for each step',
            '4. Explain why each step matters',
            '5. Conclude with common mistakes to avoid'
        ];
    }

    if (requestType?.includes('EXPLAIN')) {
        return lang === 'sv' ? [
            `1. Börja med en koncis sammanfattning av: "${objective}"`,
            '2. Förklara de underliggande principerna och mekanismerna',
            '3. Ge 2-3 konkreta exempel som illustrerar konceptet',
            '4. Beskriv praktiska tillämpningar',
            '5. Avsluta med vanliga missförstånd och hur man undviker dem'
        ] : [
            `1. Start with a concise summary of: "${objective}"`,
            '2. Explain the underlying principles and mechanisms',
            '3. Provide 2-3 concrete examples illustrating the concept',
            '4. Describe practical applications',
            '5. Conclude with common misconceptions and how to avoid them'
        ];
    }

    if (requestType?.includes('DEBUG/FIX')) {
        return lang === 'sv' ? [
            `1. Identifiera och diagnostisera problemet med: "${objective}"`,
            '2. Förklara grundorsaken tydligt',
            '3. Presentera lösningen steg för steg',
            '4. Visa före/efter om tillämpligt',
            '5. Ge tips för att förhindra problemet i framtiden'
        ] : [
            `1. Identify and diagnose the issue with: "${objective}"`,
            '2. Explain the root cause clearly',
            '3. Present the solution step by step',
            '4. Show before/after if applicable',
            '5. Provide tips to prevent the issue in the future'
        ];
    }

    if (requestType?.includes('COMPARE')) {
        return lang === 'sv' ? [
            `1. Definiera jämförelsekriterierna för: "${objective}"`,
            '2. Analysera varje alternativ systematiskt',
            '3. Presentera en tydlig jämförelsetabell',
            '4. Diskutera för- och nackdelar för varje alternativ',
            '5. Ge en konkret rekommendation baserad på olika användningsfall'
        ] : [
            `1. Define comparison criteria for: "${objective}"`,
            '2. Analyze each option systematically',
            '3. Present a clear comparison table',
            '4. Discuss pros and cons for each option',
            '5. Provide a concrete recommendation based on different use cases'
        ];
    }

    // Default general task
    return lang === 'sv' ? [
        `1. Adressera användarens fråga: "${objective}"`,
        '2. Ge en strukturerad och heltäckande förklaring',
        '3. Inkludera praktiska exempel eller tillämpningar',
        '4. Lyft fram viktiga punkter att komma ihåg',
        '5. Avsluta med nästa steg eller rekommendationer'
    ] : [
        `1. Address the user\'s question: "${objective}"`,
        '2. Provide a structured and comprehensive explanation',
        '3. Include practical examples or applications',
        '4. Highlight key points to remember',
        '5. Conclude with next steps or recommendations'
    ];
}

/**
 * Generates constraints including what to avoid
 */
function generateConstraints(spec: CompiledSpec, lang: 'en' | 'sv'): string[] {
    const constraints: string[] = [];

    // Add spec constraints
    for (const c of spec.constraints) {
        constraints.push(`• ${c}`);
    }

    // Add standard quality constraints
    if (lang === 'sv') {
        constraints.push('• Undvik vaga eller generiska svar som kan hittas överallt');
        constraints.push('• Hoppa över onödiga inledningar som "Det är en bra fråga..."');
        constraints.push('• Inga tomma fraser eller utfyllnad');
        constraints.push('• Var specifik — om du nämner ett koncept, förklara det');
    } else {
        constraints.push('• Avoid vague or generic answers that could be found anywhere');
        constraints.push('• Skip unnecessary preambles like "That\'s a great question..."');
        constraints.push('• No filler phrases or padding');
        constraints.push('• Be specific — if you mention a concept, explain it');
    }

    // Add non-negotiables
    for (const nn of spec.nonNegotiables) {
        constraints.push(`• KRAV: ${nn}`);
    }

    return constraints;
}

/**
 * Generates quality bar expectations
 */
function generateQualityBar(spec: CompiledSpec, lang: 'en' | 'sv'): string[] {
    const requestType = spec.assemblerNotes.find(n => n.startsWith('REQUEST_TYPE:'));

    if (lang === 'sv') {
        const base = [
            '✓ Svaret ska kännas skrivet av en människa med ämnesexpertis',
            '✓ Varje påstående ska stödjas av resonemang eller exempel',
            '✓ Läsaren ska kunna agera direkt på informationen'
        ];

        if (requestType?.includes('BUILD/CREATE')) {
            base.push('✓ Stegen ska vara tillräckligt detaljerade för att följa utan extern research');
        }
        if (requestType?.includes('EXPLAIN')) {
            base.push('✓ En nybörjare ska förstå efter att ha läst, en expert ska bekräfta noggrannheten');
        }

        return base;
    } else {
        const base = [
            '✓ Response should feel written by a human with domain expertise',
            '✓ Every claim should be supported by reasoning or examples',
            '✓ Reader should be able to act on the information immediately'
        ];

        if (requestType?.includes('BUILD/CREATE')) {
            base.push('✓ Steps should be detailed enough to follow without external research');
        }
        if (requestType?.includes('EXPLAIN')) {
            base.push('✓ A beginner should understand after reading, an expert should confirm accuracy');
        }

        return base;
    }
}

/**
 * Generates output format specification
 */
function generateOutputFormat(spec: CompiledSpec, lang: 'en' | 'sv'): string[] {
    const requestType = spec.assemblerNotes.find(n => n.startsWith('REQUEST_TYPE:'));

    if (lang === 'sv') {
        if (requestType?.includes('BUILD/CREATE')) {
            return [
                '📋 Format: Numrerade steg med underrubriker',
                '📏 Längd: Omfattande men koncis (500-1000 ord)',
                '📐 Struktur: Sammanfattning → Steg → Tips → Vanliga misstag'
            ];
        }
        if (requestType?.includes('EXPLAIN')) {
            return [
                '📋 Format: Förklarande prosa med rubriker',
                '📏 Längd: Så lång som behövs för klarhet (400-800 ord)',
                '📐 Struktur: Översikt → Principer → Exempel → Tillämpning'
            ];
        }
        if (requestType?.includes('COMPARE')) {
            return [
                '📋 Format: Strukturerad jämförelse med tabell',
                '📏 Längd: Medium (400-700 ord)',
                '📐 Struktur: Introduktion → Jämförelsetabell → Analys → Rekommendation'
            ];
        }
        // Default
        return [
            '📋 Format: Strukturerad med tydliga avsnitt',
            '📏 Längd: Anpassad efter komplexitet',
            '📐 Struktur: Tydlig början, utveckling och avslutning'
        ];
    } else {
        if (requestType?.includes('BUILD/CREATE')) {
            return [
                '📋 Format: Numbered steps with subheadings',
                '📏 Length: Comprehensive but concise (500-1000 words)',
                '📐 Structure: Summary → Steps → Tips → Common Mistakes'
            ];
        }
        if (requestType?.includes('EXPLAIN')) {
            return [
                '📋 Format: Explanatory prose with headers',
                '📏 Length: As long as needed for clarity (400-800 words)',
                '📐 Structure: Overview → Principles → Examples → Application'
            ];
        }
        if (requestType?.includes('COMPARE')) {
            return [
                '📋 Format: Structured comparison with table',
                '📏 Length: Medium (400-700 words)',
                '📐 Structure: Introduction → Comparison Table → Analysis → Recommendation'
            ];
        }
        // Default
        return [
            '📋 Format: Structured with clear sections',
            '📏 Length: Adapted to complexity',
            '📐 Structure: Clear beginning, development, and conclusion'
        ];
    }
}

/**
 * Assembles the final EXECUTION PROMPT from all components
 * This is what gets shown to the user AND sent to the LLM
 */
function assembleExecutionPrompt(config: ExecutionPromptConfig, lang: 'en' | 'sv'): string {
    const sections: string[] = [];

    // A. ROLE
    sections.push(`**ROLE**\n${config.role}`);

    // B. AUDIENCE & LEVEL
    sections.push(`**AUDIENCE & LEVEL**\n${config.audience}\n${config.skillLevel}`);

    // C. TASK DEFINITION
    const taskHeader = lang === 'sv' ? '**DIN UPPGIFT**' : '**YOUR TASK**';
    sections.push(`${taskHeader}\n${config.taskSteps.join('\n')}`);

    // D. CONSTRAINTS
    const constraintHeader = lang === 'sv' ? '**BEGRÄNSNINGAR**' : '**CONSTRAINTS**';
    sections.push(`${constraintHeader}\n${config.constraints.join('\n')}`);

    // E. QUALITY BAR
    const qualityHeader = lang === 'sv' ? '**KVALITETSKRAV**' : '**QUALITY BAR**';
    sections.push(`${qualityHeader}\n${config.qualityBar.join('\n')}`);

    // F. OUTPUT FORMAT
    const formatHeader = lang === 'sv' ? '**SVARFORMAT**' : '**OUTPUT FORMAT**';
    sections.push(`${formatHeader}\n${config.outputFormat.join('\n')}`);

    return sections.join('\n\n');
}

/**
 * MAIN TRANSFORMER: Internal Spec → Premium Execution Prompt
 *
 * This function takes the compiler output and transforms it into
 * a premium execution-grade prompt that:
 * - Is visibly superior to any raw input
 * - Forces the LLM into deeper reasoning
 * - Makes A/B difference impossible to miss
 */
function transformSpecToExecutionPrompt(spec: CompiledSpec, lang: 'en' | 'sv'): string {
    // Validate: objective is required
    if (spec.objective === UNDECIDED || !spec.objective.trim()) {
        return lang === 'sv'
            ? '[FEL: Kan inte generera körbar prompt utan tydligt mål. Vänligen specificera vad du vill uppnå.]'
            : '[ERROR: Cannot generate execution prompt without clear objective. Please specify what you want to achieve.]';
    }

    // Build config from spec analysis
    const role = inferExpertRole(spec, lang);
    const { audience, level } = inferAudience(spec, lang);
    const taskSteps = generateTaskSteps(spec, lang);
    const constraints = generateConstraints(spec, lang);
    const qualityBar = generateQualityBar(spec, lang);
    const outputFormat = generateOutputFormat(spec, lang);

    const config: ExecutionPromptConfig = {
        role,
        audience,
        skillLevel: level,
        taskSteps,
        constraints,
        qualityBar,
        outputFormat
    };

    return assembleExecutionPrompt(config, lang);
}

/**
 * LEGACY: Formats spec as internal metadata (kept for debugging only)
 * This should NEVER be shown to users or sent to LLMs
 */
function formatSpecAsInternalMetadata(spec: CompiledSpec, lang: 'en' | 'sv'): string {
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
    const requestType = spec.assemblerNotes.find(n => n.startsWith('REQUEST_TYPE:'));
    let outputReq = '';

    if (requestType?.includes('BUILD/CREATE')) {
        outputReq = lang === 'sv'
            ? 'Ge en strukturerad lösning med tydliga steg och implementeringsdetaljer.'
            : 'Provide a structured solution with clear steps and implementation details.';
    } else if (requestType?.includes('EXPLAIN')) {
        outputReq = lang === 'sv'
            ? 'Ge en tydlig förklaring med exempel.'
            : 'Provide a clear explanation with examples.';
    } else if (requestType?.includes('DEBUG/FIX')) {
        outputReq = lang === 'sv'
            ? 'Identifiera problemet och ge en lösning med förklaring.'
            : 'Identify the issue and provide a fix with explanation.';
    } else if (requestType?.includes('COMPARE')) {
        outputReq = lang === 'sv'
            ? 'Ge en strukturerad jämförelse med tydlig rekommendation.'
            : 'Provide a structured comparison with clear recommendation.';
    } else {
        outputReq = lang === 'sv'
            ? 'Ge ett direkt och strukturerat svar.'
            : 'Provide a direct and structured response.';
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
 * Generates a PREMIUM EXECUTION PROMPT from the compiled specification.
 *
 * This is what gets shown to users and sent to the LLM.
 * The internal spec is NEVER exposed — only the execution prompt.
 */
export function assemblePrompt(input: AssemblerInput): PipelineOutput {
    const { spec, targetModel, outputLanguage } = input;
    const lang = outputLanguage === 'auto' ? spec.language : outputLanguage;

    // Transform internal spec into premium execution prompt
    // This is the ONLY output — internal metadata is never shown
    const assembledPrompt = transformSpecToExecutionPrompt(spec, lang);

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
            pipelineVersion: '2.0.0', // Upgraded to execution prompt format
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
