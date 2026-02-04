/**
 * PRAXIS Prompt Analyzer
 *
 * Intelligent prompt analysis based on TRIPOD methodology.
 * This is the core value proposition of PRAXIS.
 */

export interface TripodBreakdown {
    task: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
    role: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
    instructions: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
    parameters: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
    output: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
    danger: { present: boolean; quality: 'none' | 'weak' | 'good' | 'excellent'; content: string | null };
}

export interface PromptIssue {
    type: 'critical' | 'warning' | 'suggestion';
    category: keyof TripodBreakdown | 'general';
    message: string;
    impact: string;
}

export interface PromptSuggestion {
    category: keyof TripodBreakdown | 'general';
    current: string | null;
    suggested: string;
    reason: string;
}

export interface AnalysisResult {
    score: number; // 0-100
    grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'A+';
    tripod: TripodBreakdown;
    issues: PromptIssue[];
    suggestions: PromptSuggestion[];
    improvedPrompt: string | null;
    metrics: {
        wordCount: number;
        specificityScore: number;
        clarityScore: number;
        structureScore: number;
    };
}

// Pattern matching for TRIPOD components
const patterns = {
    role: [
        /du är (en |ett )?(.+?)(?:\.|,|som)/i,
        /agera som (en |ett )?(.+?)(?:\.|,)/i,
        /som (en |ett )?(expert|specialist|konsult|coach|rådgivare|utvecklare|designer)/i,
        /your role is/i,
        /act as/i,
    ],
    task: [
        /^(skriv|skapa|gör|generera|analysera|sammanfatta|förklara|jämför|lista|beskriv)/i,
        /^(write|create|make|generate|analyze|summarize|explain|compare|list|describe)/i,
        /jag vill (ha|att du)/i,
        /kan du (hjälpa|skriva|skapa)/i,
    ],
    instructions: [
        /\d+\.\s+/m, // numbered list
        /[-•]\s+/m, // bullet points
        /steg för steg/i,
        /instruktioner?:/i,
        /krav:/i,
        /ska innehålla/i,
    ],
    parameters: [
        /max(imalt)?\s+\d+/i,
        /minst\s+\d+/i,
        /mellan\s+\d+/i,
        /(kort|medel|lång|koncis|detaljerad)/i,
        /(formell|informell|professionell|casual)/i,
        /(svenska|engelska|english|swedish)/i,
        /ton:/i,
        /språk:/i,
    ],
    output: [
        /format:/i,
        /som (en |ett )?(lista|tabell|json|markdown|kod|bullet points)/i,
        /strukturera som/i,
        /returnera som/i,
        /output:/i,
    ],
    danger: [
        /undvik/i,
        /avoid/i,
        /inte (inkludera|nämna|använda)/i,
        /inga? (klichéer|klyschor|generiska)/i,
        /skippa/i,
        /utelämna/i,
    ],
};

// Quality indicators
const qualityIndicators = {
    excellent: {
        specificity: /\b(specifikt|exakt|precis|detaljerad)\b/i,
        numbers: /\b\d+\s*(ord|meningar|punkter|sidor|minuter)\b/i,
        examples: /\b(exempel|t\.ex\.|e\.g\.|som|såsom)\b/i,
        structure: /\n.*\n/,
    },
    weak: {
        vague: /\b(något|lite|bra|fin|trevlig|intressant)\b/i,
        short: (text: string) => text.split(' ').length < 10,
        noContext: (text: string) => !text.includes(':') && !text.includes('\n'),
    },
};

export function analyzePrompt(prompt: string): AnalysisResult {
    const trimmed = prompt.trim();

    if (!trimmed) {
        return getEmptyResult();
    }

    // Analyze TRIPOD breakdown
    const tripod = analyzeTripod(trimmed);

    // Calculate metrics
    const metrics = calculateMetrics(trimmed, tripod);

    // Identify issues
    const issues = identifyIssues(trimmed, tripod, metrics);

    // Generate suggestions
    const suggestions = generateSuggestions(trimmed, tripod, issues);

    // Calculate overall score
    const score = calculateScore(tripod, metrics, issues);

    // Generate improved prompt
    const improvedPrompt = generateImprovedPrompt(trimmed, tripod, suggestions);

    return {
        score,
        grade: getGrade(score),
        tripod,
        issues,
        suggestions,
        improvedPrompt,
        metrics,
    };
}

function analyzeTripod(prompt: string): TripodBreakdown {
    const breakdown: TripodBreakdown = {
        task: { present: false, quality: 'none', content: null },
        role: { present: false, quality: 'none', content: null },
        instructions: { present: false, quality: 'none', content: null },
        parameters: { present: false, quality: 'none', content: null },
        output: { present: false, quality: 'none', content: null },
        danger: { present: false, quality: 'none', content: null },
    };

    for (const [key, patternList] of Object.entries(patterns)) {
        const category = key as keyof TripodBreakdown;

        for (const pattern of patternList) {
            const match = prompt.match(pattern);
            if (match) {
                breakdown[category].present = true;
                breakdown[category].content = match[0];
                breakdown[category].quality = assessQuality(prompt, category);
                break;
            }
        }
    }

    return breakdown;
}

function assessQuality(prompt: string, category: keyof TripodBreakdown): 'weak' | 'good' | 'excellent' {
    const hasSpecificity = qualityIndicators.excellent.specificity.test(prompt);
    const hasNumbers = qualityIndicators.excellent.numbers.test(prompt);
    const hasExamples = qualityIndicators.excellent.examples.test(prompt);
    const hasStructure = qualityIndicators.excellent.structure.test(prompt);
    const isVague = qualityIndicators.weak.vague.test(prompt);
    const isShort = qualityIndicators.weak.short(prompt);

    const excellentCount = [hasSpecificity, hasNumbers, hasExamples, hasStructure].filter(Boolean).length;
    const weakCount = [isVague, isShort].filter(Boolean).length;

    if (excellentCount >= 2) return 'excellent';
    if (weakCount >= 2) return 'weak';
    return 'good';
}

function calculateMetrics(prompt: string, tripod: TripodBreakdown) {
    const words = prompt.split(/\s+/).filter(Boolean);
    const presentComponents = Object.values(tripod).filter(t => t.present).length;
    const excellentComponents = Object.values(tripod).filter(t => t.quality === 'excellent').length;

    return {
        wordCount: words.length,
        specificityScore: Math.min(100, (words.length / 50) * 100),
        clarityScore: hasStructure(prompt) ? 80 : 50,
        structureScore: (presentComponents / 6) * 100,
    };
}

function hasStructure(prompt: string): boolean {
    return prompt.includes('\n') || prompt.includes(':') || /\d+\./.test(prompt);
}

function identifyIssues(prompt: string, tripod: TripodBreakdown, metrics: ReturnType<typeof calculateMetrics>): PromptIssue[] {
    const issues: PromptIssue[] = [];

    // Critical: No task
    if (!tripod.task.present) {
        issues.push({
            type: 'critical',
            category: 'task',
            message: 'Ingen tydlig uppgift identifierad',
            impact: 'AI vet inte vad du vill att den ska göra',
        });
    }

    // Warning: No role
    if (!tripod.role.present) {
        issues.push({
            type: 'warning',
            category: 'role',
            message: 'Ingen roll angiven',
            impact: 'AI saknar perspektiv och expertis att utgå ifrån',
        });
    }

    // Warning: No parameters
    if (!tripod.parameters.present) {
        issues.push({
            type: 'warning',
            category: 'parameters',
            message: 'Inga parametrar (längd, ton, språk)',
            impact: 'AI gissar format och omfattning',
        });
    }

    // Warning: No output format
    if (!tripod.output.present) {
        issues.push({
            type: 'suggestion',
            category: 'output',
            message: 'Inget önskat format specificerat',
            impact: 'Resultatet kan komma i oväntat format',
        });
    }

    // Suggestion: No danger/avoid
    if (!tripod.danger.present) {
        issues.push({
            type: 'suggestion',
            category: 'danger',
            message: 'Inga begränsningar angivna',
            impact: 'AI kan inkludera oönskat innehåll',
        });
    }

    // Too short
    if (metrics.wordCount < 15) {
        issues.push({
            type: 'warning',
            category: 'general',
            message: 'Prompten är mycket kort',
            impact: 'Saknar troligen viktig kontext',
        });
    }

    // Vague language
    if (qualityIndicators.weak.vague.test(prompt)) {
        issues.push({
            type: 'suggestion',
            category: 'general',
            message: 'Innehåller vaga ord som "bra", "något", "lite"',
            impact: 'AI tolkar dessa subjektivt',
        });
    }

    return issues;
}

function generateSuggestions(prompt: string, tripod: TripodBreakdown, issues: PromptIssue[]): PromptSuggestion[] {
    const suggestions: PromptSuggestion[] = [];

    if (!tripod.role.present) {
        suggestions.push({
            category: 'role',
            current: null,
            suggested: 'Du är en erfaren [expert inom området].',
            reason: 'Ger AI ett perspektiv att utgå ifrån',
        });
    }

    if (!tripod.parameters.present) {
        suggestions.push({
            category: 'parameters',
            current: null,
            suggested: 'Max [antal] ord, [ton] ton, på svenska.',
            reason: 'Styr längd och stil på svaret',
        });
    }

    if (!tripod.output.present) {
        suggestions.push({
            category: 'output',
            current: null,
            suggested: 'Format: [lista/tabell/punkter/löpande text].',
            reason: 'Säkerställer rätt struktur på svaret',
        });
    }

    if (!tripod.danger.present) {
        suggestions.push({
            category: 'danger',
            current: null,
            suggested: 'Undvik: [klichéer/generiska svar/teknisk jargong].',
            reason: 'Filtrerar bort oönskat innehåll',
        });
    }

    if (!tripod.instructions.present && prompt.length > 30) {
        suggestions.push({
            category: 'instructions',
            current: null,
            suggested: 'Instruktioner:\n1. [Steg ett]\n2. [Steg två]\n3. [Steg tre]',
            reason: 'Numrerade steg ger tydligare resultat',
        });
    }

    return suggestions;
}

function calculateScore(tripod: TripodBreakdown, metrics: ReturnType<typeof calculateMetrics>, issues: PromptIssue[]): number {
    let score = 30; // Base score for having any prompt

    // TRIPOD component scores (max 60 points)
    const componentScores = {
        task: 15,
        role: 10,
        instructions: 10,
        parameters: 10,
        output: 8,
        danger: 7,
    };

    for (const [key, value] of Object.entries(tripod)) {
        const component = key as keyof TripodBreakdown;
        if (value.present) {
            const baseScore = componentScores[component];
            const qualityMultiplier =
                value.quality === 'excellent' ? 1 :
                    value.quality === 'good' ? 0.7 :
                        0.4;
            score += baseScore * qualityMultiplier;
        }
    }

    // Deductions for issues (max -20 points)
    const issueDeductions = {
        critical: 10,
        warning: 5,
        suggestion: 2,
    };

    for (const issue of issues) {
        score -= issueDeductions[issue.type];
    }

    // Bonus for structure (max 10 points)
    if (metrics.structureScore > 50) {
        score += 5;
    }
    if (metrics.wordCount > 30 && metrics.wordCount < 200) {
        score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function getGrade(score: number): 'F' | 'D' | 'C' | 'B' | 'A' | 'A+' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'F';
}

function generateImprovedPrompt(original: string, tripod: TripodBreakdown, suggestions: PromptSuggestion[]): string | null {
    if (suggestions.length === 0) return null;

    const parts: string[] = [];

    // Add role if missing
    if (!tripod.role.present) {
        parts.push('Du är en erfaren expert inom området.');
    }

    // Keep original prompt (cleaned up)
    parts.push(original.trim());

    // Add missing components
    if (!tripod.parameters.present) {
        parts.push('\nHåll svaret koncist och professionellt.');
    }

    if (!tripod.output.present) {
        parts.push('\nStrukturera svaret tydligt med rubriker om tillämpligt.');
    }

    if (!tripod.danger.present) {
        parts.push('\nUndvik generiska fraser och klichéer.');
    }

    return parts.join(' ').replace(/\s+/g, ' ').replace(/\s+\n/g, '\n').trim();
}

function getEmptyResult(): AnalysisResult {
    return {
        score: 0,
        grade: 'F',
        tripod: {
            task: { present: false, quality: 'none', content: null },
            role: { present: false, quality: 'none', content: null },
            instructions: { present: false, quality: 'none', content: null },
            parameters: { present: false, quality: 'none', content: null },
            output: { present: false, quality: 'none', content: null },
            danger: { present: false, quality: 'none', content: null },
        },
        issues: [{
            type: 'critical',
            category: 'general',
            message: 'Ingen prompt angiven',
            impact: 'Skriv en prompt för att få analys',
        }],
        suggestions: [],
        improvedPrompt: null,
        metrics: {
            wordCount: 0,
            specificityScore: 0,
            clarityScore: 0,
            structureScore: 0,
        },
    };
}
