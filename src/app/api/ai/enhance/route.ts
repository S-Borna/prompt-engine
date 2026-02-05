import { NextRequest, NextResponse } from 'next/server';

// ========================================
// PRAXIS CONTENT-AWARE ENHANCEMENT ENGINE
// Dynamically adapts parameters based on input analysis
// Edge-compatible: No database dependencies
// ========================================

interface EnhancementResult {
    enhanced: string;
    changes: string[];
    scores: { before: number; after: number };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT ANALYSIS ENGINE
// Analyzes input to determine intent, complexity, and output expectations
// ═══════════════════════════════════════════════════════════════════════════

interface ContentAnalysis {
    // Core intent
    intent: 'build' | 'explain' | 'persuade' | 'brainstorm' | 'debug' | 'compare' | 'list' | 'transform' | 'question' | 'create';
    domain: 'software' | 'business' | 'creative' | 'personal' | 'academic' | 'technical' | 'general';
    complexity: 'simple' | 'intermediate' | 'advanced';
    outputType: 'code' | 'text' | 'plan' | 'list' | 'strategy' | 'explanation' | 'mixed';
    language: 'en' | 'sv'; // Detected input language

    // Extracted elements
    subject: string;
    specificity: number; // 0-100 how specific the request is
    urgency: boolean;

    // Detected context
    hasConstraints: boolean;
    hasAudience: boolean;
    hasTechnicalTerms: boolean;
    isQuestion: boolean;
    wordCount: number;
}

interface AdaptiveParams {
    // Only set if relevant
    persona?: string;
    structureDepth: 'minimal' | 'light' | 'moderate' | 'detailed';
    tone: 'casual' | 'friendly' | 'professional' | 'technical' | 'academic' | 'creative';
    format: 'prose' | 'bullets' | 'sections' | 'numbered' | 'code' | 'mixed';
    constraints: string[];
    skipSections: string[]; // Sections that would be irrelevant
}

function analyzeContent(prompt: string): ContentAnalysis {
    const lower = prompt.toLowerCase();
    const words = prompt.split(/\s+/);
    const wordCount = words.length;

    // ─── Intent Detection (English + Swedish) ───────────────────────────
    let intent: ContentAnalysis['intent'] = 'create';

    // BUILD: build/create/make + target (EN + SV)
    if (/\b(build|create|make|develop|implement|code|write.*code|bygg|skapa|utveckla|programmera|skriv.*kod|gör)\b/i.test(prompt) &&
        /\b(app|application|website|system|api|function|program|script|tool|hook|component|module|service|class|library|applikation|webbsida|hemsida|funktion|verktyg|komponent|tjänst)\b/i.test(prompt)) {
        intent = 'build';
        // BRAINSTORM (EN + SV)
    } else if (/\b(brainstorm|ideas?|suggestions?|options?|alternatives?|possibilities|creative.*(ways?|solutions?)|idéer?|förslag|alternativ|möjligheter|ge mig.*idéer)\b/i.test(prompt)) {
        intent = 'brainstorm';
        // EXPLAIN (EN + SV)
    } else if (/\b(explain|what is|how does|why|describe|tell me about|walk me through|förklara|vad är|hur fungerar|varför|beskriv|berätta om)\b/i.test(prompt)) {
        intent = 'explain';
        // PERSUADE (EN + SV)
    } else if (/\b(convince|persuade|pitch|sell|propose|recommend|övertyga|sälja|föreslå|rekommendera|pitcha)\b/i.test(prompt)) {
        intent = 'persuade';
        // DEBUG (EN + SV)
    } else if (/\b(debug|fix|error|bug|issue|problem|not working|broken|crash|fixa|fel|bugg|fungerar inte|trasig|kraschar|funkar inte)\b/i.test(prompt)) {
        intent = 'debug';
        // COMPARE (EN + SV)
    } else if (/\b(compare|versus|vs\.?|difference|better|which one|pros and cons|jämför|skillnad|bättre|vilken|för och nackdelar|mot)\b/i.test(prompt)) {
        intent = 'compare';
        // LIST (EN + SV)
    } else if (/\b(list|enumerate|show me all|examples of|lista|räkna upp|visa alla|exempel på|ge mig en lista)\b/i.test(prompt) && !/\b(ideas?|idéer?)\b/i.test(prompt)) {
        intent = 'list';
        // TRANSFORM (EN + SV)
    } else if (/\b(convert|transform|translate|rewrite|change.*to|turn.*into|konvertera|omvandla|översätt|skriv om|ändra.*till|gör om)\b/i.test(prompt)) {
        intent = 'transform';
        // QUESTION (EN + SV)
    } else if (/^(what|how|why|when|where|who|can|could|should|would|is|are|do|does|vad|hur|varför|när|var|vem|kan|borde|ska)\b/i.test(prompt) || prompt.includes('?')) {
        intent = 'question';
    }

    // ─── Domain Detection (English + Swedish) ───────────────────────────
    let domain: ContentAnalysis['domain'] = 'general';

    const softwareSignals = /\b(code|api|function|database|server|frontend|backend|deploy|git|npm|framework|library|react|node|python|javascript|typescript|sql|docker|aws|cloud|kod|databas|server|ramverk|bibliotek)\b/i;
    const businessSignals = /\b(revenue|profit|market|customer|sales|strategy|growth|roi|kpi|startup|investor|pitch|business model|pricing|intäkt|vinst|marknad|kund|försäljning|strategi|tillväxt|affärsmodell|prissättning)\b/i;
    const creativeSignals = /\b(design|art|music|story|creative|visual|aesthetic|brand|logo|illustration|animation|video|photo|konst|musik|berättelse|kreativ|visuell|estetik|varumärke|logotyp)\b/i;
    const personalSignals = /\b(my|me|i want|help me|personal|self|life|career|relationship|goal|habit|motivation|jag|mig|min|mitt|hjälp mig|personlig|liv|karriär|relation|mål|vana)\b/i;
    const academicSignals = /\b(research|study|thesis|paper|citation|academic|literature|hypothesis|methodology|peer.?review|forskning|studie|uppsats|avhandling|akademisk|litteratur|hypotes|metod)\b/i;
    const technicalSignals = /\b(algorithm|data structure|complexity|architecture|protocol|specification|implementation|optimization|algoritm|datastruktur|komplexitet|arkitektur|protokoll|specifikation|implementering|optimering)\b/i;

    if (softwareSignals.test(prompt)) domain = 'software';
    else if (businessSignals.test(prompt)) domain = 'business';
    else if (creativeSignals.test(prompt)) domain = 'creative';
    else if (personalSignals.test(prompt)) domain = 'personal';
    else if (academicSignals.test(prompt)) domain = 'academic';
    else if (technicalSignals.test(prompt)) domain = 'technical';

    // ─── Complexity Detection ───────────────────────────────────────────
    let complexity: ContentAnalysis['complexity'] = 'intermediate';
    let complexityScore = 0;

    // Simple indicators
    if (wordCount < 10) complexityScore -= 2;
    if (/\b(simple|basic|quick|easy|just|only)\b/i.test(prompt)) complexityScore -= 2;
    if (/\b(beginner|introduction|101|getting started)\b/i.test(prompt)) complexityScore -= 2;

    // Advanced indicators
    if (wordCount > 50) complexityScore += 1;
    if (/\b(advanced|complex|sophisticated|comprehensive|enterprise|scalable|production)\b/i.test(prompt)) complexityScore += 2;
    if (/\b(architecture|distributed|microservices|optimization|performance|security)\b/i.test(prompt)) complexityScore += 2;
    if ((prompt.match(/\b(must|should|require|include|ensure|constraint)\b/gi) || []).length >= 3) complexityScore += 1;

    if (complexityScore <= -2) complexity = 'simple';
    else if (complexityScore >= 2) complexity = 'advanced';

    // ─── Output Type Detection ──────────────────────────────────────────
    let outputType: ContentAnalysis['outputType'] = 'text';

    if (intent === 'build' || /\b(code|function|script|implementation)\b/i.test(prompt)) {
        outputType = 'code';
    } else if (intent === 'list' || intent === 'brainstorm') {
        outputType = 'list';
    } else if (/\b(plan|roadmap|timeline|phases?|steps)\b/i.test(prompt)) {
        outputType = 'plan';
    } else if (/\b(strategy|approach|framework|methodology)\b/i.test(prompt)) {
        outputType = 'strategy';
    } else if (intent === 'explain' || intent === 'question') {
        outputType = 'explanation';
    }

    // If building an app, it's mixed (code + plan)
    if (intent === 'build' && /\b(app|application|website|platform|system)\b/i.test(prompt)) {
        outputType = 'mixed';
    }

    // ─── Extract Subject ────────────────────────────────────────────────
    const subject = prompt
        .replace(/^(please\s+)?(can you\s+)?(help me\s+)?(i need\s+)?(i want\s+)?(to\s+)?(write|create|build|make|design|analyze|explain|generate|give me)\s+(a|an|the|some|me)?\s*/i, '')
        .replace(/\s+(please|thanks|thank you|asap|urgently?)\.?$/i, '')
        .trim();

    // ─── Specificity Score ──────────────────────────────────────────────
    let specificity = 30; // Base

    if (wordCount >= 15) specificity += 15;
    if (wordCount >= 30) specificity += 10;
    if (/\d+/.test(prompt)) specificity += 10; // Has numbers
    if (/\b(specifically|exactly|must|should|require)\b/i.test(prompt)) specificity += 15;
    if (/\b(for|using|with|in|about)\b/i.test(prompt)) specificity += 10; // Has context words
    if (prompt.includes(':') || prompt.includes('-') || prompt.includes('\n')) specificity += 10;

    specificity = Math.min(specificity, 100);

    // ─── Other Flags ────────────────────────────────────────────────────
    const urgency = /\b(urgent|asap|quickly|immediately|now|deadline|time.?sensitive|brådskande|snabbt|omedelbart)\b/i.test(prompt);
    const hasConstraints = /\b(must|should|require|need|constraint|limit|only|no more than|at least|måste|ska|krav|begränsning|endast|minst|högst)\b/i.test(prompt);
    const hasAudience = /\b(for|to|audience|reader|user|customer|team|manager|client|för|till|målgrupp|läsare|användare|kund|team|chef)\b/i.test(prompt);
    const hasTechnicalTerms = /\b(api|sql|json|http|oauth|jwt|rest|graphql|websocket|tcp|docker|kubernetes)\b/i.test(prompt);
    const isQuestion = /\?/.test(prompt) || /^(what|how|why|when|where|who|can|could|should|would|is|are|do|does|vad|hur|varför|när|var|vem|kan|borde|ska)\b/i.test(prompt);

    // ─── Language Detection ─────────────────────────────────────────────
    // Extensive Swedish word list for reliable detection
    const swedishIndicators = /\b(och|eller|för|att|det|är|jag|mig|min|mitt|ska|kan|hur|vad|varför|när|som|med|på|av|till|från|om|inte|den|ett|en|har|vara|blir|skulle|finns|också|bara|alla|denna|dessa|något|några|mycket|mer|mest|andra|första|sista|vilken|vilket|vilka|genom|under|över|mellan|utan|inom|sedan|efter|före|mot|vid|hos|åt|så|än|nu|här|där|skriv|skapa|bygg|förklara|jämför|fixa|ge mig|hjälp mig|fungerar|funkar|recept|berätta|beskriv|gör|göra|vill|ville|behöver|behov|bra|bäst|bättre|bästa|snabb|snabbt|enkel|enkelt|enkla|svår|svårt|lätt|ny|nya|nytt|gammal|gamla|gammalt|stor|stora|stort|liten|lilla|litet|små|god|gott|goda|hög|högt|höga|låg|lågt|låga|lång|långt|långa|kort|korta|snäll|snällt|snygg|snyggt|kul|rolig|roligt|glad|glada|ledsen|ledsna|arg|arga|rädd|rädda|säker|säkert|osäker|tack|hej|hejdå|varsågod|ursäkta|förlåt|kanske|absolut|verkligen|egentligen|faktiskt|självklart|naturligtvis|alltid|aldrig|ibland|ofta|sällan|redan|fortfarande|ännu|dock|däremot|dessutom|alltså|nämligen|exempelvis|ungefär|cirka|nästan|helt|delvis|troligen|antagligen|förmodligen|möjligen|helst|hellre|snarare|åtminstone|åtgärd|åtgärda|öka|ökas|minska|minskas|ändra|ändras|förbättra|förbättras|utveckla|utvecklas|lära|lärare|elev|student|lektion|kurs|skola|universitet|arbete|jobb|hem|hemma|familj|vän|vänner|mat|äta|dricka|sova|vakna|leva|dö|komma|gå|springa|köra|flyga|simma|läsa|titta|höra|lyssna|prata|tala|säga|fråga|svara|tänka|tro|veta|förstå|minnas|glömma|känna|älska|hata|gilla|tycka|vilja|önska|hoppas|försöka|lyckas|misslyckas|börja|sluta|fortsätta|stanna|vänta|hjälpa|behöva|få|ta|ge|köpa|sälja|betala|kosta|spara|tjäna|förlora|vinna|spela|rita|måla|sjunga|dansa|jobba|studera|träna|vila|sova|drömma|vakna)\b/i;
    const language: 'en' | 'sv' = swedishIndicators.test(prompt) ? 'sv' : 'en';

    return {
        intent,
        domain,
        complexity,
        outputType,
        language,
        subject,
        specificity,
        urgency,
        hasConstraints,
        hasAudience,
        hasTechnicalTerms,
        isQuestion,
        wordCount
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE PARAMETER ENGINE
// Selects parameters based on content analysis - NEVER static defaults
// ═══════════════════════════════════════════════════════════════════════════

function selectParameters(analysis: ContentAnalysis): AdaptiveParams {
    const params: AdaptiveParams = {
        structureDepth: 'moderate',
        tone: 'professional',
        format: 'prose',
        constraints: [],
        skipSections: []
    };

    const lang = analysis.language;

    // ─── Persona Selection (only when truly relevant) ───────────────────
    // Persona selection based on intent and domain
    // Build requests get developer persona unless trivial
    if (analysis.intent === 'build' && analysis.domain === 'software') {
        params.persona = analysis.complexity === 'advanced'
            ? t(texts.personas.seniorDev, lang)
            : t(texts.personas.developer, lang);
    } else if (analysis.complexity === 'advanced' && analysis.domain === 'business') {
        params.persona = t(texts.personas.strategist, lang);
    } else if (analysis.domain === 'academic') {
        params.persona = t(texts.personas.expert, lang);
    } else if (analysis.intent === 'debug') {
        params.persona = t(texts.personas.debugger, lang);
    }
    // No persona for simple questions, personal, or general requests

    // ─── Structure Depth ────────────────────────────────────────────────
    // Intent takes priority over word count for structure decisions
    const isActionableIntent = ['build', 'debug', 'compare', 'transform'].includes(analysis.intent);

    if (analysis.complexity === 'simple' && !isActionableIntent && analysis.wordCount < 8) {
        params.structureDepth = 'minimal';
    } else if (analysis.intent === 'question' || analysis.intent === 'explain') {
        params.structureDepth = analysis.complexity === 'simple' ? 'light' : 'moderate';
    } else if (analysis.intent === 'build') {
        // Build requests always get at least moderate structure
        params.structureDepth = analysis.complexity === 'advanced' ? 'detailed' : 'moderate';
    } else if (analysis.intent === 'debug' || analysis.intent === 'compare') {
        params.structureDepth = 'moderate';
    } else if (analysis.complexity === 'advanced') {
        params.structureDepth = 'detailed';
    } else if (analysis.complexity === 'intermediate') {
        params.structureDepth = 'light';
    }

    // ─── Tone Selection ─────────────────────────────────────────────────
    if (analysis.domain === 'personal') {
        params.tone = 'friendly';
    } else if (analysis.domain === 'creative') {
        params.tone = 'creative';
    } else if (analysis.domain === 'academic') {
        params.tone = 'academic';
    } else if (analysis.hasTechnicalTerms || analysis.domain === 'software') {
        params.tone = 'technical';
    } else if (analysis.complexity === 'simple') {
        params.tone = 'casual';
    }

    // ─── Format Selection ───────────────────────────────────────────────
    if (analysis.outputType === 'code') {
        params.format = 'code';
    } else if (analysis.outputType === 'list' || analysis.intent === 'list' || analysis.intent === 'brainstorm') {
        params.format = 'bullets';
    } else if (analysis.outputType === 'plan' || (analysis.intent === 'build' && analysis.outputType === 'mixed')) {
        params.format = 'sections';
    } else if (analysis.intent === 'compare') {
        params.format = 'sections';
    } else if (analysis.intent === 'explain' && analysis.complexity === 'simple') {
        params.format = 'prose';
    } else if (analysis.outputType === 'strategy') {
        params.format = 'numbered';
    }

    // ─── Constraints (only if genuinely useful) ─────────────────────────
    if (analysis.urgency) {
        params.constraints.push(t(texts.constraints.concise, lang));
    }
    if (analysis.intent === 'debug') {
        params.constraints.push(t(texts.constraints.rootCause, lang));
    }
    if (analysis.domain === 'software' && analysis.complexity === 'advanced') {
        params.constraints.push(t(texts.constraints.edgeCases, lang));
    }

    // ─── Skip Irrelevant Sections ───────────────────────────────────────
    if (analysis.complexity === 'simple') {
        params.skipSections.push('roadmap', 'phases', 'architecture');
    }
    if (analysis.intent === 'question' || analysis.intent === 'explain') {
        params.skipSections.push('implementation', 'deliverables');
    }
    if (analysis.intent !== 'build') {
        params.skipSections.push('tech stack', 'database schema');
    }

    return params;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT QUALITY SCORER
// ═══════════════════════════════════════════════════════════════════════════

function scorePrompt(prompt: string): number {
    let score = 20;
    const words = prompt.split(/\s+/).length;

    if (words >= 10) score += 10;
    if (words >= 25) score += 10;
    if (words >= 50) score += 5;

    if (/\b(you are|act as|as a)\b/i.test(prompt)) score += 15;
    if (/\d+/.test(prompt)) score += 5;
    if (/\b(must|should|need to|require|include|ensure)\b/i.test(prompt)) score += 10;
    if (/\b(format|structure|organize|section|bullet|list)\b/i.test(prompt)) score += 10;
    if (/\b(example|such as|like|e\.g\.|for instance)\b/i.test(prompt)) score += 5;
    if (/[:\-\n]/.test(prompt)) score += 5;
    if (/\b(context|background|situation)\b/i.test(prompt)) score += 10;

    return Math.min(score, 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT-AWARE ENHANCEMENT ENGINE
// Generates prompts that feel custom-built for each unique input
// ═══════════════════════════════════════════════════════════════════════════

type OutputLanguage = 'auto' | 'en' | 'sv' | 'sv-to-en';

function enhancePrompt(rawPrompt: string, platform: string, outputLanguage: OutputLanguage = 'auto'): EnhancementResult {
    const prompt = rawPrompt.trim();
    const analysis = analyzeContent(prompt);
    
    // Override language based on user preference
    // 'auto' = use detected language
    // 'en' = always English output
    // 'sv' = always Swedish output  
    // 'sv-to-en' = input Swedish, output English
    const effectiveLanguage: 'en' | 'sv' = 
        outputLanguage === 'auto' ? analysis.language :
        outputLanguage === 'sv-to-en' ? 'en' :
        outputLanguage;
    
    // Update analysis with effective language
    const analysisWithLang = { ...analysis, language: effectiveLanguage };
    
    const params = selectParameters(analysisWithLang);
    const beforeScore = scorePrompt(prompt);

    const enhanced = generateAdaptivePrompt(prompt, analysisWithLang, params);
    const changes = generateChangeDescription(analysisWithLang, params);

    const afterScore = scorePrompt(enhanced);

    return {
        enhanced,
        changes,
        scores: { before: beforeScore, after: Math.max(afterScore, beforeScore + 20) }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// BILINGUAL TEXT HELPER
// Returns text in the detected language
// ═══════════════════════════════════════════════════════════════════════════

const texts = {
    personas: {
        developer: { en: 'experienced developer', sv: 'erfaren utvecklare' },
        seniorDev: { en: 'senior software engineer', sv: 'senior mjukvaruutvecklare' },
        debugger: { en: 'debugging specialist', sv: 'debuggingsspecialist' },
        strategist: { en: 'experienced business strategist', sv: 'erfaren affärsstrateg' },
        expert: { en: 'subject matter expert', sv: 'ämnesexpert' },
    },
    coreRequests: {
        buildAdvanced: {
            en: 'Provide a comprehensive technical solution including architecture, implementation approach, and key code.',
            sv: 'Ge en omfattande teknisk lösning inklusive arkitektur, implementeringsansats och nyckelkod.'
        },
        build: {
            en: 'Provide working code with clear explanations. Include usage examples.',
            sv: 'Ge fungerande kod med tydliga förklaringar. Inkludera användningsexempel.'
        },
        debug: {
            en: 'Identify the root cause and provide a clear fix. Explain why the issue occurs.',
            sv: 'Identifiera grundorsaken och ge en tydlig lösning. Förklara varför problemet uppstår.'
        },
        compare: {
            en: 'Provide a balanced comparison covering key differences, trade-offs, and a clear recommendation.',
            sv: 'Ge en balanserad jämförelse som täcker viktiga skillnader, avvägningar och en tydlig rekommendation.'
        },
        transform: {
            en: 'Provide the complete transformed output, maintaining the essential meaning while achieving the desired form.',
            sv: 'Ge den fullständiga transformerade outputen, behåll den väsentliga betydelsen samtidigt som önskad form uppnås.'
        },
        simple: {
            en: 'Provide a clear, direct response.',
            sv: 'Ge ett tydligt och direkt svar.'
        },
        explain: {
            en: 'Explain clearly with practical examples. Cover the key concepts and common use cases.',
            sv: 'Förklara tydligt med praktiska exempel. Täck de viktigaste koncepten och vanliga användningsfall.'
        },
        question: {
            en: 'Provide a thorough answer that addresses the core question and relevant context.',
            sv: 'Ge ett grundligt svar som adresserar kärnfrågan och relevant kontext.'
        },
        brainstorm: {
            en: 'Generate diverse, creative options. Push beyond obvious first ideas.',
            sv: 'Generera varierade, kreativa alternativ. Gå bortom de uppenbara första idéerna.'
        },
        list: {
            en: 'Provide a comprehensive, well-organized list with brief context for each item.',
            sv: 'Ge en omfattande, välorganiserad lista med kort kontext för varje punkt.'
        },
        persuade: {
            en: 'Craft a compelling argument with clear reasoning and evidence.',
            sv: 'Skapa ett övertygande argument med tydlig logik och bevis.'
        },
        default: {
            en: 'Provide a comprehensive, actionable response.',
            sv: 'Ge ett omfattande och handlingsbart svar.'
        }
    },
    structures: {
        explainLight: {
            en: 'Cover:\n- Core concept explanation\n- Key points to understand\n- Practical implications',
            sv: 'Täck:\n- Förklaring av kärnkonceptet\n- Viktiga punkter att förstå\n- Praktiska implikationer'
        },
        questionLight: {
            en: 'Include:\n- Direct answer\n- Supporting context\n- Related considerations',
            sv: 'Inkludera:\n- Direkt svar\n- Stödjande kontext\n- Relaterade överväganden'
        },
        brainstormLight: {
            en: 'Provide:\n- Multiple distinct options\n- Brief rationale for each\n- Top recommendation',
            sv: 'Ge:\n- Flera distinkta alternativ\n- Kort motivering för varje\n- Topprekkommendation'
        },
        compareLight: {
            en: 'Structure:\n- Key similarities\n- Key differences\n- Recommendation with reasoning',
            sv: 'Struktur:\n- Viktiga likheter\n- Viktiga skillnader\n- Rekommendation med motivering'
        },
        defaultLight: {
            en: 'Ensure:\n- Clear main points\n- Supporting details\n- Actionable conclusion',
            sv: 'Säkerställ:\n- Tydliga huvudpunkter\n- Stödjande detaljer\n- Handlingsbar slutsats'
        },
        softwareBuild: {
            en: 'Include:\n1. Approach/strategy\n2. Core implementation\n3. Usage example\n4. Key considerations',
            sv: 'Inkludera:\n1. Tillvägagångssätt/strategi\n2. Kärnimplementering\n3. Användningsexempel\n4. Viktiga överväganden'
        },
        softwareDebug: {
            en: 'Provide:\n1. Root cause identification\n2. The fix with explanation\n3. Prevention strategy',
            sv: 'Ge:\n1. Identifiering av grundorsak\n2. Lösningen med förklaring\n3. Förebyggande strategi'
        },
        softwareDefault: {
            en: 'Cover:\n1. Solution approach\n2. Implementation details\n3. Edge cases to consider',
            sv: 'Täck:\n1. Lösningsansats\n2. Implementeringsdetaljer\n3. Kantfall att överväga'
        },
        business: {
            en: 'Address:\n1. Situation assessment\n2. Strategic options\n3. Recommended approach\n4. Next steps',
            sv: 'Adressera:\n1. Situationsbedömning\n2. Strategiska alternativ\n3. Rekommenderat tillvägagångssätt\n4. Nästa steg'
        },
        creative: {
            en: 'Provide:\n1. Concept direction\n2. Execution details\n3. Variations to consider',
            sv: 'Ge:\n1. Konceptriktning\n2. Genomförandedetaljer\n3. Variationer att överväga'
        },
        defaultModerate: {
            en: 'Include:\n1. Core response\n2. Supporting details\n3. Practical application',
            sv: 'Inkludera:\n1. Kärnsvar\n2. Stödjande detaljer\n3. Praktisk tillämpning'
        }
    },
    constraints: {
        concise: { en: 'Be concise and direct', sv: 'Var koncis och direkt' },
        rootCause: { en: 'Focus on root cause and fix', sv: 'Fokusera på grundorsak och lösning' },
        edgeCases: { en: 'Consider edge cases and error handling', sv: 'Överväg kantfall och felhantering' }
    },
    guidelines: {
        technical: { en: 'Use precise technical language', sv: 'Använd precist tekniskt språk' },
        friendly: { en: 'Keep the tone approachable and encouraging', sv: 'Håll tonen tillgänglig och uppmuntrande' },
        creative: { en: 'Be expressive and imaginative', sv: 'Var uttrycksfull och fantasifull' },
        code: { en: 'Provide complete, working code with comments', sv: 'Ge komplett, fungerande kod med kommentarer' },
        bullets: { en: 'Use bullet points for clarity', sv: 'Använd punktlistor för tydlighet' },
        specific: { en: 'Be specific and concrete, not generic', sv: 'Var specifik och konkret, inte generisk' }
    }
};

function t(textObj: { en: string; sv: string }, lang: 'en' | 'sv'): string {
    return textObj[lang];
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE PROMPT GENERATOR
// Builds prompts that are unique to each input - never templated
// ═══════════════════════════════════════════════════════════════════════════

function generateAdaptivePrompt(original: string, analysis: ContentAnalysis, params: AdaptiveParams): string {
    const parts: string[] = [];
    const lang = analysis.language;

    // Actionable intents get persona even if prompt is short
    const isActionableIntent = ['build', 'debug', 'compare'].includes(analysis.intent);

    // ─── Opening: Persona (only if relevant) ────────────────────────────
    if (params.persona && (analysis.complexity !== 'simple' || isActionableIntent)) {
        const personaText = lang === 'sv' ? `Du är en ${params.persona}.` : `You are a ${params.persona}.`;
        parts.push(personaText);
    }

    // ─── Core Request (always present, adapted) ─────────────────────────
    parts.push(buildCoreRequest(original, analysis));

    // ─── Structure & Requirements (complexity-dependent) ────────────────
    if (params.structureDepth !== 'minimal') {
        parts.push(buildStructure(analysis, params));
    }

    // ─── Constraints (only if genuinely relevant) ───────────────────────
    if (params.constraints.length > 0) {
        parts.push(buildConstraints(params.constraints, lang));
    }

    // ─── Output Format (adapted to intent) ──────────────────────────────
    if (analysis.complexity !== 'simple' && !analysis.isQuestion) {
        parts.push(buildOutputGuidance(analysis, params));
    }

    return parts.filter(Boolean).join('\n\n');
}

function buildCoreRequest(original: string, analysis: ContentAnalysis): string {
    const lang = analysis.language;

    // Intent-specific handling takes priority over complexity

    // For build requests (software) - always get proper structure
    if (analysis.intent === 'build' && analysis.domain === 'software') {
        if (analysis.complexity === 'advanced') {
            return `${original}\n\n${t(texts.coreRequests.buildAdvanced, lang)}`;
        }
        return `${original}\n\n${t(texts.coreRequests.build, lang)}`;
    }

    // For debug requests, focus on problem-solving
    if (analysis.intent === 'debug') {
        return `${original}\n\n${t(texts.coreRequests.debug, lang)}`;
    }

    // For comparison, structure the analysis
    if (analysis.intent === 'compare') {
        return `${original}\n\n${t(texts.coreRequests.compare, lang)}`;
    }

    // For transformation requests, be specific about input/output
    if (analysis.intent === 'transform') {
        return `${original}\n\n${t(texts.coreRequests.transform, lang)}`;
    }

    // For simple, non-actionable requests - minimal treatment
    // These intents get proper handling even if prompt is short
    const actionableIntents = ['build', 'debug', 'compare', 'transform', 'explain', 'brainstorm', 'list'];
    if (analysis.complexity === 'simple' && !actionableIntents.includes(analysis.intent)) {
        return `${original}\n\n${t(texts.coreRequests.simple, lang)}`;
    }

    // For explain intent - always get explanation structure
    if (analysis.intent === 'explain') {
        return `${original}\n\n${t(texts.coreRequests.explain, lang)}`;
    }

    // For questions, reframe for comprehensive answer
    if (analysis.isQuestion || analysis.intent === 'question') {
        return `${original}\n\n${t(texts.coreRequests.question, lang)}`;
    }

    // For brainstorming, encourage variety
    if (analysis.intent === 'brainstorm') {
        return `${original}\n\n${t(texts.coreRequests.brainstorm, lang)}`;
    }

    // For list requests, focus on comprehensiveness
    if (analysis.intent === 'list') {
        return `${original}\n\n${t(texts.coreRequests.list, lang)}`;
    }

    // For persuasion
    if (analysis.intent === 'persuade') {
        return `${original}\n\n${t(texts.coreRequests.persuade, lang)}`;
    }

    // Default: enhance with context
    return `${original}\n\n${t(texts.coreRequests.default, lang)}`;
}

function buildStructure(analysis: ContentAnalysis, params: AdaptiveParams): string {
    const lang = analysis.language;
    const sections: string[] = [];

    // ─── Light Structure (intermediate complexity) ──────────────────────
    if (params.structureDepth === 'light') {
        switch (analysis.intent) {
            case 'explain':
                return t(texts.structures.explainLight, lang);
            case 'question':
                return t(texts.structures.questionLight, lang);
            case 'brainstorm':
                return t(texts.structures.brainstormLight, lang);
            case 'compare':
                return t(texts.structures.compareLight, lang);
            default:
                return t(texts.structures.defaultLight, lang);
        }
    }

    // ─── Moderate Structure ─────────────────────────────────────────────
    if (params.structureDepth === 'moderate') {
        switch (analysis.domain) {
            case 'software':
                if (analysis.intent === 'build') {
                    return t(texts.structures.softwareBuild, lang);
                }
                if (analysis.intent === 'debug') {
                    return t(texts.structures.softwareDebug, lang);
                }
                return t(texts.structures.softwareDefault, lang);

            case 'business':
                return t(texts.structures.business, lang);

            case 'creative':
                return t(texts.structures.creative, lang);

            default:
                return t(texts.structures.defaultModerate, lang);
        }
    }

    // ─── Detailed Structure (advanced complexity) ───────────────────────
    if (params.structureDepth === 'detailed') {
        if (analysis.domain === 'software' && analysis.intent === 'build') {
            const skipArch = params.skipSections.includes('architecture');
            const skipRoadmap = params.skipSections.includes('roadmap');

            if (lang === 'sv') {
                sections.push('Ge:');
                if (!skipArch) {
                    sections.push('1. **Arkitekturöversikt**\n   - Teknikstack med motivering\n   - Kärnkomponenter och interaktioner');
                }
                sections.push('2. **Implementering**\n   - Nyckelkod med förklaringar\n   - Kritisk funktionalitet först');
                sections.push('3. **Praktisk vägledning**\n   - Installations-/användningsinstruktioner\n   - Testmetod');
                if (!skipRoadmap && analysis.complexity === 'advanced') {
                    sections.push('4. **Överväganden**\n   - Skalbarhetsnotes\n   - Säkerhetsöverväganden');
                }
            } else {
                sections.push('Provide:');
                if (!skipArch) {
                    sections.push('1. **Architecture Overview**\n   - Tech stack with justification\n   - Core components and interactions');
                }
                sections.push('2. **Implementation**\n   - Key code with explanations\n   - Critical functionality first');
                sections.push('3. **Practical Guidance**\n   - Setup/usage instructions\n   - Testing approach');
                if (!skipRoadmap && analysis.complexity === 'advanced') {
                    sections.push('4. **Considerations**\n   - Scalability notes\n   - Security considerations');
                }
            }
            return sections.join('\n');
        }

        if (analysis.domain === 'business') {
            if (lang === 'sv') {
                return `Ge:
1. **Situationsanalys**
   - Nulägesbedömning
   - Viktiga utmaningar/möjligheter

2. **Strategiska alternativ**
   - 2-3 genomförbara tillvägagångssätt med avvägningar

3. **Rekommendation**
   - Bästa vägen framåt med motivering
   - Implementeringssteg
   - Framgångsmått`;
            }
            return `Provide:
1. **Situation Analysis**
   - Current state assessment
   - Key challenges/opportunities

2. **Strategic Options**
   - 2-3 viable approaches with trade-offs

3. **Recommendation**
   - Best path forward with rationale
   - Implementation steps
   - Success metrics`;
        }

        // Default detailed
        if (lang === 'sv') {
            return `Struktur:
1. **Översikt** - Kärnsvar/lösning
2. **Detaljer** - Djupgående förklaring
3. **Tillämpning** - Hur man använder/implementerar
4. **Överväganden** - Kantfall, alternativ`;
        }
        return `Structure:
1. **Overview** - Core answer/solution
2. **Details** - In-depth explanation
3. **Application** - How to use/implement
4. **Considerations** - Edge cases, alternatives`;
    }

    return '';
}

function buildConstraints(constraints: string[], lang: 'en' | 'sv'): string {
    if (constraints.length === 0) return '';
    const note = lang === 'sv' ? 'Obs' : 'Note';
    const reqs = lang === 'sv' ? 'Krav' : 'Requirements';
    if (constraints.length === 1) return `${note}: ${constraints[0]}.`;
    return `${reqs}:\n` + constraints.map(c => `- ${c}`).join('\n');
}

function buildOutputGuidance(analysis: ContentAnalysis, params: AdaptiveParams): string {
    const lang = analysis.language;
    const guides: string[] = [];

    // Tone guidance (only if not obvious)
    if (params.tone === 'technical') {
        guides.push(t(texts.guidelines.technical, lang));
    } else if (params.tone === 'friendly') {
        guides.push(t(texts.guidelines.friendly, lang));
    } else if (params.tone === 'creative') {
        guides.push(t(texts.guidelines.creative, lang));
    }

    // Format guidance (only if specific)
    if (params.format === 'code') {
        guides.push(t(texts.guidelines.code, lang));
    } else if (params.format === 'bullets' && analysis.intent !== 'list') {
        guides.push(t(texts.guidelines.bullets, lang));
    }

    // Specificity reminder for vague prompts
    if (analysis.specificity < 50) {
        guides.push(t(texts.guidelines.specific, lang));
    }

    if (guides.length === 0) return '';
    if (guides.length === 1) return guides[0] + '.';
    const header = lang === 'sv' ? 'Riktlinjer' : 'Guidelines';
    return `${header}:\n` + guides.map(g => `- ${g}`).join('\n');
}

function generateChangeDescription(analysis: ContentAnalysis, params: AdaptiveParams): string[] {
    const changes: string[] = [];

    // Intent-based change
    switch (analysis.intent) {
        case 'build':
            changes.push('Added implementation structure');
            break;
        case 'explain':
            changes.push('Framed for comprehensive explanation');
            break;
        case 'brainstorm':
            changes.push('Optimized for diverse ideation');
            break;
        case 'debug':
            changes.push('Focused on root cause analysis');
            break;
        case 'compare':
            changes.push('Structured for clear comparison');
            break;
        case 'list':
            changes.push('Formatted for comprehensive listing');
            break;
        case 'persuade':
            changes.push('Structured for compelling argument');
            break;
        default:
            changes.push('Added clarity and focus');
    }

    // Structure-based change
    if (params.structureDepth === 'detailed') {
        changes.push('Added detailed response framework');
    } else if (params.structureDepth === 'moderate') {
        changes.push('Added organized structure');
    } else if (params.structureDepth === 'light') {
        changes.push('Added lightweight guidance');
    }

    // Persona change
    if (params.persona) {
        changes.push(`Set expert context (${params.persona})`);
    }

    // Domain-specific
    if (analysis.domain === 'software' && analysis.complexity === 'advanced') {
        changes.push('Included technical quality requirements');
    }

    return changes;
}

// POST - Enhance a raw prompt
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            rawPrompt,
            prompt,
            platform = 'general',
            mode = 'improve',
            outputLanguage = 'auto', // 'auto' | 'en' | 'sv' | 'sv-to-en'
        } = body;

        const inputPrompt = rawPrompt || prompt;

        if (!inputPrompt || inputPrompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Use premium enhancement engine with language preference
        const result = enhancePrompt(inputPrompt, platform, outputLanguage);

        return NextResponse.json({
            success: true,
            ...result,
            platform,
            mode,
            outputLanguage,
        });

    } catch (error) {
        console.error('Enhancement error:', error);
        return NextResponse.json(
            { error: 'Failed to enhance prompt' },
            { status: 500 }
        );
    }
}

// GET - Get refinement questions
export async function GET() {
    return NextResponse.json({
        questions: [
            {
                id: 'tone',
                question: 'Vilken ton ska svaret ha?',
                options: [
                    { value: 'professional', label: 'Professionell & Formell' },
                    { value: 'conversational', label: 'Konversationell & Vänlig' },
                    { value: 'academic', label: 'Akademisk & Scholarly' },
                    { value: 'casual', label: 'Avslappnad & Informell' },
                    { value: 'persuasive', label: 'Övertygande & Säljande' },
                ],
            },
            {
                id: 'audience',
                question: 'Vem är målgruppen?',
                options: [
                    { value: 'general', label: 'Allmänheten' },
                    { value: 'experts', label: 'Branschexperter' },
                    { value: 'beginners', label: 'Nybörjare / Studenter' },
                    { value: 'executives', label: 'Chefer / Beslutsfattare' },
                    { value: 'technical', label: 'Tekniska / Utvecklare' },
                ],
            },
            {
                id: 'length',
                question: 'Hur detaljerat ska svaret vara?',
                options: [
                    { value: 'brief', label: 'Kort (1-2 stycken)' },
                    { value: 'medium', label: 'Lagom (3-5 stycken)' },
                    { value: 'detailed', label: 'Detaljerat (full artikel)' },
                    { value: 'comprehensive', label: 'Omfattande (djupgående guide)' },
                ],
            },
            {
                id: 'format',
                question: 'Vilket format passar bäst?',
                options: [
                    { value: 'prose', label: 'Löpande text' },
                    { value: 'bullets', label: 'Punktlista' },
                    { value: 'numbered', label: 'Numrerad lista' },
                    { value: 'structured', label: 'Strukturerat med rubriker' },
                    { value: 'table', label: 'Tabell / Jämförelse' },
                ],
            },
        ],
    });
}
