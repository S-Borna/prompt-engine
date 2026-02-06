// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS PROMPT REWRITER — AI-SYNTHESIZED PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════
//
// MISSION:
//   Transform user prompts into expert-level execution prompts using AI.
//   The rewritten prompt must be so good that any LLM produces dramatically
//   better output when given the enhanced version vs the original.
//
// DESIGN PRINCIPLES:
//   1. CONTENT-ADAPTIVE — Detect domain and tailor rewrite strategy
//   2. EXPERT-VOICE — Write as a domain expert would brief a colleague
//   3. SPECIFICITY INJECTION — Add concrete details, scope, format, criteria
//   4. CONSTRAINT-AWARE — Include what to do AND what to avoid
//   5. FORMAT-PRESCRIPTIVE — Tell the AI exactly how to structure output
//
// ═══════════════════════════════════════════════════════════════════════════

import OpenAI from 'openai';
import { CompiledSpec } from './prompt-engine';

// ═══════════════════════════════════════════════════════════════════════════
// OPENAI CLIENT
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PromptRewriterConfig {
    spec: CompiledSpec;
    language: 'en' | 'sv';
    platform?: string;
    model?: string;
    temperature?: number;
}

export interface RewrittenPrompt {
    prompt: string;
    sections: {
        expertRole: string;
        mainObjective: string;
        contextBackground: string;
        outputFormat: string;
        constraints: string;
        approachGuidelines: string;
    };
    improvements: string[];
    qualityScore: number;
    meetsQualityBar: boolean;
    meta: {
        originalLength: number;
        rewrittenLength: number;
        specificityMultiplier: number;
        synthesizedAt: string;
        domain: string;
        tokensIn?: number;
        tokensOut?: number;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN DETECTION — Adapts rewrite strategy to content
// ═══════════════════════════════════════════════════════════════════════════

type PromptDomain = 'code' | 'writing' | 'business' | 'education' | 'fitness' | 'cooking' | 'creative' | 'data' | 'general';

function detectDomain(rawInput: string): PromptDomain {
    const l = rawInput.toLowerCase();

    if (/\b(code|function|api|program|app|software|debug|typescript|javascript|python|react|component|database|sql|deploy|git|docker|server|backend|frontend|algorithm|class|interface|module|css|html|endpoint)\b/i.test(l)) return 'code';
    if (/\b(recept|recipe|cook|mat|food|bak|bake|ingredient|meal|dinner|lunch|kitchen|dish|sauce|spice)\b/i.test(l)) return 'cooking';
    if (/\b(träning|workout|exercise|gym|fitness|muscle|styrka|strength|chin|pull.?up|push.?up|cardio|diet|protein|bulk|cut|reps|sets)\b/i.test(l)) return 'fitness';
    if (/\b(write|article|blog|essay|copy|content|story|email|letter|press release|headline|caption|skriv|text|rubrik|brev)\b/i.test(l)) return 'writing';
    if (/\b(business|strategy|market|revenue|startup|pitch|roi|kpi|growth|sales|plan|affär|företag|strateg)\b/i.test(l)) return 'business';
    if (/\b(explain|learn|teach|understand|course|tutorial|concept|förklara|lär|förstå|studera|kurs)\b/i.test(l)) return 'education';
    if (/\b(data|analyze|chart|graph|statistics|csv|json|metrics|dashboard|report|analys|statistik|rapport)\b/i.test(l)) return 'data';
    if (/\b(design|creative|brand|logo|visual|image|art|video|animation|musik|song|poem|dikt)\b/i.test(l)) return 'creative';

    return 'general';
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN-SPECIFIC ENHANCEMENT INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getDomainInstructions(domain: PromptDomain, isSwedish: boolean): string {
    const instructions: Record<PromptDomain, { en: string; sv: string }> = {
        code: {
            en: `DOMAIN: SOFTWARE DEVELOPMENT
When rewriting this prompt, ensure you:
- Specify the programming language and framework (but NEVER invent specific version numbers the user didn't mention — say "latest stable" or "current" instead)
- Define the function signature, inputs, and expected outputs
- Mention error handling, edge cases, and validation requirements
- State whether tests, documentation, or usage examples are needed
- Include performance considerations and coding standards to follow
- Specify the architecture pattern if building something larger
- IMPORTANT: Only reference technologies the user mentioned or that are clearly implied — do not assume a specific tech stack if the user didn't specify one`,
            sv: `DOMÄN: MJUKVARUUTVECKLING
När du omformulerar denna prompt, säkerställ att du:
- Specificerar programmeringsspråk och ramverk (men hitta ALDRIG på specifika versionsnummer som användaren inte nämnde — skriv "senaste stabila" eller "aktuell" istället)
- Definierar funktionssignatur, indata och förväntad output
- Nämner felhantering, edge cases och valideringskrav
- Anger om tester, dokumentation eller användningsexempel behövs
- Inkluderar prestandaöverväganden och kodstandarder att följa
- VIKTIGT: Referera bara till teknologier som användaren nämnde eller som är tydligt underförstådda — anta inte en specifik tech stack om användaren inte angett en`,
        },
        cooking: {
            en: `DOMAIN: CULINARY / RECIPES
When rewriting this prompt, ensure you:
- Specify cuisine type, serving size, and difficulty level
- Mention dietary restrictions or preferences to accommodate
- Request exact measurements, cooking temperatures, and timing
- Ask for ingredient substitution options
- Include plating suggestions and serving recommendations
- Specify skill level assumptions (beginner-friendly vs advanced)`,
            sv: `DOMÄN: MATLAGNING / RECEPT
När du omformulerar denna prompt, säkerställ att du:
- Specificerar kökstyp, antal portioner och svårighetsgrad
- Nämner kostbegränsningar eller preferenser att ta hänsyn till
- Begär exakta mått, tillagningstemperaturer och tider
- Frågar efter alternativa ingredienser
- Inkluderar serveringsförslag och presentationstips`,
        },
        fitness: {
            en: `DOMAIN: FITNESS / TRAINING
When rewriting this prompt, ensure you:
- Specify the trainee's experience level and current fitness
- Define clear progression milestones and timeframes
- Include specific sets, reps, rest periods, and form cues
- Mention warm-up, cool-down, and injury prevention
- Address nutrition and recovery if relevant
- State equipment requirements or bodyweight alternatives`,
            sv: `DOMÄN: FITNESS / TRÄNING
När du omformulerar denna prompt, säkerställ att du:
- Specificerar träningsnivå och nuvarande fysik
- Definierar tydliga progressionsmål och tidsramar
- Inkluderar specifika set, repetitioner, vila och tekniktips
- Nämner uppvärmning, nedvarvning och skadeförebyggande
- Berör kost och återhämtning om relevant`,
        },
        writing: {
            en: `DOMAIN: CONTENT / WRITING
When rewriting this prompt, ensure you:
- Define the target audience and their knowledge level
- Specify tone (formal, conversational, persuasive, etc.)
- Set word count or length expectations
- Mention the purpose (inform, persuade, entertain, convert)
- Include structural requirements (sections, headers, CTA)
- Specify what to avoid (clichés, jargon, filler phrases)`,
            sv: `DOMÄN: INNEHÅLL / SKRIVANDE
När du omformulerar denna prompt, säkerställ att du:
- Definierar målgrupp och deras kunskapsnivå
- Specificerar ton (formell, konversation, övertygande etc.)
- Anger ordantal eller längdförväntningar
- Nämner syftet (informera, övertala, underhålla, konvertera)
- Inkluderar strukturkrav (sektioner, rubriker, CTA)
- Specificerar vad som bör undvikas (klichéer, jargong, utfyllnad)`,
        },
        business: {
            en: `DOMAIN: BUSINESS / STRATEGY
When rewriting this prompt, ensure you:
- Define the business context, industry, and company stage
- Specify the decision or deliverable expected
- Mention constraints (budget, timeline, team size)
- Request data-backed reasoning where possible
- Include competitive considerations
- Ask for actionable next steps with owners and deadlines`,
            sv: `DOMÄN: AFFÄR / STRATEGI
När du omformulerar denna prompt, säkerställ att du:
- Definierar affärskontext, bransch och företagets fas
- Specificerar det beslut eller leverabel som förväntas
- Nämner begränsningar (budget, tidslinje, teamstorlek)
- Begär datadriven argumentation där möjligt
- Inkluderar konkurrensöverväganden`,
        },
        education: {
            en: `DOMAIN: EDUCATION / LEARNING
When rewriting this prompt, ensure you:
- Specify the learner's current knowledge level
- Define learning objectives clearly
- Request analogies, examples, and visual explanations
- Ask for practice exercises or self-assessment questions
- Mention common misconceptions to address
- Structure from simple to complex (scaffolding)`,
            sv: `DOMÄN: UTBILDNING / LÄRANDE
När du omformulerar denna prompt, säkerställ att du:
- Specificerar elevens nuvarande kunskapsnivå
- Definierar lärandemål tydligt
- Begär analogier, exempel och visuella förklaringar
- Frågar efter övningsuppgifter eller självbedömningsfrågor
- Nämner vanliga missförstånd att adressera`,
        },
        data: {
            en: `DOMAIN: DATA / ANALYTICS
When rewriting this prompt, ensure you:
- Specify the data format, size, and source
- Define the analysis goal and key metrics
- Mention visualization preferences
- Request statistical methodology justification
- Include data quality and cleaning considerations
- Ask for interpretable insights, not just numbers`,
            sv: `DOMÄN: DATA / ANALYS
När du omformulerar denna prompt, säkerställ att du:
- Specificerar dataformat, storlek och källa
- Definierar analysmål och nyckeltal
- Nämner visualiseringspreferenser
- Begär statistisk metodjustifiering
- Inkluderar datakvalitet och rensningsöverväganden`,
        },
        creative: {
            en: `DOMAIN: CREATIVE / DESIGN
When rewriting this prompt, ensure you:
- Define the aesthetic direction and mood
- Specify the medium and format constraints
- Mention the target audience and context of use
- Include references or style inspirations
- Set technical specifications (resolution, dimensions, etc.)
- State what emotions or reactions to evoke`,
            sv: `DOMÄN: KREATIVT / DESIGN
När du omformulerar denna prompt, säkerställ att du:
- Definierar estetisk riktning och stämning
- Specificerar medium och formatbegränsningar
- Nämner målgrupp och användningskontext
- Inkluderar referenser eller stilinspireringar
- Anger tekniska specifikationer (upplösning, dimensioner etc.)`,
        },
        general: {
            en: `DOMAIN: GENERAL
When rewriting this prompt, ensure you:
- Clearly define what a successful response looks like
- Specify the format (paragraphs, bullets, table, step-by-step)
- Set the depth and level of detail expected
- Include evaluation criteria for the response
- Mention what to prioritize and what to skip
- Add scope boundaries so the response stays focused`,
            sv: `DOMÄN: GENERELLT
När du omformulerar denna prompt, säkerställ att du:
- Tydligt definierar hur ett framgångsrikt svar ser ut
- Specificerar formatet (stycken, punkter, tabell, steg-för-steg)
- Anger förväntad detaljnivå och djup
- Inkluderar utvärderingskriterier för svaret
- Nämner vad som ska prioriteras och vad som kan hoppas över`,
        },
    };

    return instructions[domain]?.[isSwedish ? 'sv' : 'en'] || instructions.general[isSwedish ? 'sv' : 'en'];
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE REWRITER
// ═══════════════════════════════════════════════════════════════════════════

export async function rewritePrompt(
    config: PromptRewriterConfig
): Promise<RewrittenPrompt> {
    const {
        spec,
        language,
        platform = 'general',
        model = 'gpt-4o-mini',
        temperature = 0.5
    } = config;

    const client = getOpenAIClient();
    const domain = detectDomain(spec.rawInput);
    const metaPrompt = buildRewriterMetaPrompt(spec, language, domain, platform);

    try {
        const completion = await client.chat.completions.create({
            model,
            temperature,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: metaPrompt.systemPrompt },
                { role: 'user', content: metaPrompt.userPrompt }
            ],
        });

        const raw = completion.choices[0]?.message?.content?.trim() || '';
        const tokensIn = completion.usage?.prompt_tokens;
        const tokensOut = completion.usage?.completion_tokens;

        if (!raw) {
            throw new Error('Rewriter produced empty output');
        }

        // Parse structured JSON response
        let parsed: {
            expertRole?: string;
            mainObjective?: string;
            contextBackground?: string;
            outputFormat?: string;
            constraints?: string;
            approachGuidelines?: string;
            improvements?: string[];
        };

        try {
            parsed = JSON.parse(raw);
        } catch {
            // Fallback: treat entire response as a single section
            parsed = {
                expertRole: '',
                mainObjective: raw,
                contextBackground: '',
                outputFormat: '',
                constraints: '',
                approachGuidelines: '',
                improvements: ['Enhanced prompt clarity and structure'],
            };
        }

        const sections = {
            expertRole: (parsed.expertRole || '').trim(),
            mainObjective: (parsed.mainObjective || '').trim(),
            contextBackground: (parsed.contextBackground || '').trim(),
            outputFormat: (parsed.outputFormat || '').trim(),
            constraints: (parsed.constraints || '').trim(),
            approachGuidelines: (parsed.approachGuidelines || '').trim(),
        };

        const improvements = parsed.improvements || [
            'Added expert context and role definition',
            'Specified clear objectives and deliverables',
            'Included relevant constraints and requirements',
        ];

        // Assemble flat prompt text from sections (for A/B testing and copying)
        const flatPrompt = [
            sections.expertRole,
            sections.mainObjective,
            sections.contextBackground,
            sections.outputFormat,
            sections.constraints,
            sections.approachGuidelines,
        ].filter(Boolean).join('\n\n');

        // Calculate quality metrics
        const originalLength = spec.rawInput.length;
        const rewrittenLength = flatPrompt.length;
        const specificityMultiplier = rewrittenLength / Math.max(1, originalLength);

        const minMultiplier = originalLength < 30 ? 2.0 : originalLength < 80 ? 2.5 : 3.0;
        const qualityScore = Math.min(100, Math.round((specificityMultiplier / minMultiplier) * 80));
        const meetsQualityBar = specificityMultiplier >= minMultiplier && rewrittenLength >= 100;

        return {
            prompt: flatPrompt,
            sections,
            improvements,
            qualityScore,
            meetsQualityBar,
            meta: {
                originalLength,
                rewrittenLength,
                specificityMultiplier: Math.round(specificityMultiplier * 10) / 10,
                synthesizedAt: new Date().toISOString(),
                domain,
                tokensIn,
                tokensOut,
            }
        };

    } catch (error) {
        console.error('Prompt rewriter error:', error);
        throw new Error(`Failed to synthesize prompt: ${error}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// META-PROMPT BUILDER — The brain of the rewriter
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC PROMPT FORMATTING
// Each AI model responds best to different prompt structures.
// This ensures the generated prompt is optimized for where the user
// will actually paste and use it.
// ═══════════════════════════════════════════════════════════════════════════

interface PlatformProfile {
    name: string;
    formattingRules: { en: string; sv: string };
}

const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
    chatgpt: {
        name: 'ChatGPT (OpenAI)',
        formattingRules: {
            en: `TARGET PLATFORM: ChatGPT (OpenAI GPT models)
Optimize the generated prompt for how GPT models work best:
- Use clear ## markdown headers to separate sections
- Structure with hierarchical bullet points for complex requirements
- Include explicit output format specifications ("Respond in X format")
- Add "Think step-by-step" cues for reasoning-heavy tasks
- GPT excels at following multi-part structured instructions
- Use numbered lists for sequential steps
- Be explicit about what to include AND what to exclude`,
            sv: `MÅLPLATTFORM: ChatGPT (OpenAI GPT-modeller)
Optimera den genererade prompten för hur GPT-modeller fungerar bäst:
- Använd tydliga ## markdown-rubriker för att separera sektioner
- Strukturera med hierarkiska punktlistor för komplexa krav
- Inkludera explicita outputformat-specifikationer ("Svara i X format")
- Lägg till "Tänk steg-för-steg" för resoneringstunga uppgifter
- GPT excellerar på att följa flerdelade strukturerade instruktioner
- Använd numrerade listor för sekventiella steg
- Var explicit om vad som ska inkluderas OCH exkluderas`,
        },
    },
    claude: {
        name: 'Claude (Anthropic)',
        formattingRules: {
            en: `TARGET PLATFORM: Claude (Anthropic)
Optimize the generated prompt for how Claude works best:
- Use natural, conversational language — Claude responds poorly to overly rigid formatting
- Frame tasks with context about WHY the task matters (Claude values intent)
- Structure output expectations as guidelines rather than strict commands
- Claude naturally considers edge cases — encourage this with "Consider potential issues"
- Use XML-style tags like <context>, <task>, <constraints> for clear section separation
- Include the reasoning behind constraints, not just the constraints themselves
- Claude excels at nuanced, thoughtful analysis — frame prompts to invite depth`,
            sv: `MÅLPLATTFORM: Claude (Anthropic)
Optimera den genererade prompten för hur Claude fungerar bäst:
- Använd naturligt, konversationellt språk — Claude svarar sämre på rigid formatering
- Rama in uppgifter med kontext om VARFÖR uppgiften är viktig (Claude värderar avsikt)
- Strukturera output-förväntningar som riktlinjer snarare än strikta kommandon
- Claude överväger naturligt edge cases — uppmuntra med "Överväg potentiella problem"
- Använd XML-liknande taggar som <context>, <task>, <constraints> för tydlig sektionsseparation
- Inkludera resonemanget bakom begränsningar, inte bara begränsningarna själva
- Claude excellerar på nyanserad, genomtänkt analys — rama in för djup`,
        },
    },
    gemini: {
        name: 'Gemini (Google)',
        formattingRules: {
            en: `TARGET PLATFORM: Gemini (Google)
Optimize the generated prompt for how Gemini works best:
- Use numbered steps for process-oriented tasks — Gemini follows sequential logic well
- Include explicit fact-checking instructions ("Verify claims", "Cite sources when possible")
- Structure prompts for cross-domain synthesis — Gemini excels at connecting ideas
- Use clear delimiters (---) between major prompt sections
- Be explicit about desired output length and format
- Gemini handles structured data well — leverage tables and lists
- For factual tasks, add "Base your response on verified information"`,
            sv: `MÅLPLATTFORM: Gemini (Google)
Optimera den genererade prompten för hur Gemini fungerar bäst:
- Använd numrerade steg för processorienterade uppgifter — Gemini följer sekventiell logik väl
- Inkludera explicita faktakontrollinstruktioner ("Verifiera påståenden", "Citera källor")
- Strukturera prompts för tvärdomänsyntes — Gemini excellerar på att koppla idéer
- Använd tydliga avgränsare (---) mellan sektioner
- Var explicit om önskad outputlängd och format
- Gemini hanterar strukturerad data väl — utnyttja tabeller och listor
- För faktauppgifter, lägg till "Basera ditt svar på verifierad information"`,
        },
    },
    grok: {
        name: 'Grok (xAI)',
        formattingRules: {
            en: `TARGET PLATFORM: Grok (xAI)
Optimize the generated prompt for how Grok works best:
- Keep prompts direct and action-oriented — Grok prefers no-nonsense framing
- Frame prompts to invite honest, unfiltered feedback
- Grok is comfortable challenging assumptions — encourage this where useful
- Use concise language — less preamble, more substance
- Structure for efficient, pointed answers rather than exhaustive coverage
- Include context about acceptable directness level
- Grok excels at contrarian analysis — leverage this for decision-making prompts`,
            sv: `MÅLPLATTFORM: Grok (xAI)
Optimera den genererade prompten för hur Grok fungerar bäst:
- Håll prompts direkta och handlingsorienterade — Grok föredrar ingen-nonsens-ramverk
- Rama in för ärlig, ofiltrerad feedback
- Grok utmanar gärna antaganden — uppmuntra detta där det är användbart
- Använd koncist språk — mindre inledning, mer substans
- Strukturera för effektiva, träffsäkra svar snarare än uttömmande täckning
- Inkludera kontext om acceptabel rakhetsgrad
- Grok excellerar på kontrarisk analys — utnyttja för beslutsprompts`,
        },
    },
    general: {
        name: 'General (any model)',
        formattingRules: {
            en: `TARGET PLATFORM: General (any AI model)
Create a universally effective prompt:
- Use clear section headers and structured formatting
- Be explicit about role, task, constraints, and output format
- Include both positive instructions (do this) and negative (avoid this)
- Add examples where they would help clarify expectations
- Keep language precise but not overly rigid`,
            sv: `MÅLPLATTFORM: Generell (valfri AI-modell)
Skapa en universellt effektiv prompt:
- Använd tydliga sektionsrubriker och strukturerad formatering
- Var explicit om roll, uppgift, begränsningar och outputformat
- Inkludera både positiva instruktioner (gör detta) och negativa (undvik detta)
- Lägg till exempel där de klargör förväntningar
- Håll språket precist men inte överdrivet rigid`,
        },
    },
};

function getPlatformInstructions(platform: string, isSwedish: boolean): string {
    // Normalize platform name
    const normalized = platform.toLowerCase();
    let key = 'general';
    if (normalized.includes('gpt') || normalized.includes('chatgpt') || normalized.includes('openai')) key = 'chatgpt';
    else if (normalized.includes('claude') || normalized.includes('anthropic')) key = 'claude';
    else if (normalized.includes('gemini') || normalized.includes('google')) key = 'gemini';
    else if (normalized.includes('grok') || normalized.includes('xai')) key = 'grok';

    const profile = PLATFORM_PROFILES[key] || PLATFORM_PROFILES.general;
    return profile.formattingRules[isSwedish ? 'sv' : 'en'];
}

function buildRewriterMetaPrompt(
    spec: CompiledSpec,
    language: 'en' | 'sv',
    domain: PromptDomain,
    platform: string = 'general'
): { systemPrompt: string; userPrompt: string } {

    const isSwedish = language === 'sv';
    const domainInstructions = getDomainInstructions(domain, isSwedish);
    const platformInstructions = getPlatformInstructions(platform, isSwedish);

    const systemPrompt = isSwedish ? `Du är en senior prompt-ingenjör som omvandlar vaga förfrågningar till expertformulerade, strukturerade prompts. Du tar användarens idé och bygger en komplett, specifik prompt som en domänexpert skulle skriva.

OUTPUTFORMAT: Du MÅSTE svara med ett JSON-objekt med exakt denna struktur:
{
  "expertRole": "En mening som definierar vilken expertroll AI:n ska anta. MÅSTE börja med 'Du är en/en erfaren/en senior...' — aldrig bara ett substantiv. Var specifik om erfarenhet och kompetensområde.",
  "mainObjective": "1-2 meningar som tydligt definierar uppgiften, vad som ska levereras och i vilken form.",
  "contextBackground": "2-4 meningar med relevant bakgrund: målgrupp, krav, begränsningar, tekniska förutsättningar.",
  "outputFormat": "1-3 meningar som specificerar exakt HUR svaret ska formateras: struktur, längd, format (punktlista, tabell, steg-för-steg, kod, etc.).",
  "constraints": "2-3 meningar med explicita begränsningar och vad AI:n INTE ska göra: vad att undvika, scope-gränser, antaganden att inte göra.",
  "approachGuidelines": "2-4 meningar med specifika riktlinjer för HUR uppgiften ska utföras: metod, ton, kvalitetskriterier.",
  "improvements": ["Förbättring 1", "Förbättring 2", "Förbättring 3", "Förbättring 4", "Förbättring 5"]
}

REGLER:
1. Varje sektion ska vara konkret och specifik — inte generisk
2. expertRole ska nämna relevant erfarenhet och domänkunskap
3. mainObjective ska vara handlingsbar och mätbar
4. contextBackground ska inkludera antaganden du gör baserat på domänen
5. outputFormat ska specificera konkret format, struktur och längd — inte vara vag
6. constraints ska innehålla minst 2 explicita "GÖR INTE"-instruktioner
7. approachGuidelines ska innehålla konkreta do's och kvalitetskriterier
8. improvements ska lista exakt 5 saker du förbättrade/lade till
9. ALDRIG hitta på versionsnummer, datum eller statistik
10. Referera bara till teknologier användaren nämnde eller tydligt antydde
11. Alla värden ska vara rena strängar utan markdown-formatering
12. expertRole MÅSTE börja med "Du är" — ALDRIG starta med bara "En" eller ett substantiv

${domainInstructions}

${platformInstructions}

Svara ENBART med JSON-objektet. Ingen annan text.` :

        `You are a senior prompt engineer who transforms vague requests into expert-crafted, structured prompts. You take the user's idea and build a complete, specific prompt that a domain expert would write.

OUTPUT FORMAT: You MUST respond with a JSON object with exactly this structure:
{
  "expertRole": "One sentence defining the expert role the AI should adopt. MUST start with 'You are a/an experienced/senior...' — never just a noun phrase. Be specific about experience and domain expertise.",
  "mainObjective": "1-2 sentences clearly defining the task, what should be delivered, and in what format.",
  "contextBackground": "2-4 sentences of relevant background: target audience, requirements, constraints, technical context.",
  "outputFormat": "1-3 sentences specifying exactly HOW the response should be formatted: structure, length, format (bullet list, table, step-by-step, code, etc.).",
  "constraints": "2-3 sentences with explicit constraints and what the AI must NOT do: things to avoid, scope boundaries, assumptions not to make.",
  "approachGuidelines": "2-4 sentences with specific guidelines for HOW to approach the task: methodology, tone, quality criteria.",
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3", "Improvement 4", "Improvement 5"]
}

RULES:
1. Every section must be concrete and specific — not generic
2. expertRole must mention relevant experience and domain knowledge
3. mainObjective must be actionable and measurable
4. contextBackground must include assumptions you make based on the domain
5. outputFormat must specify concrete format, structure, and length — not be vague
6. constraints must contain at least 2 explicit "DO NOT" instructions
7. approachGuidelines must contain concrete do's and quality criteria
8. improvements must list exactly 5 things you improved/added
9. NEVER invent version numbers, dates, or statistics
10. Only reference technologies the user mentioned or clearly implied
11. All values must be plain strings without markdown formatting
12. expertRole MUST start with "You are" — NEVER start with just "A" or a bare noun phrase

${domainInstructions}

${platformInstructions}

Respond ONLY with the JSON object. No other text.`;

    // Build rich context for the user prompt
    const parts: string[] = [];

    if (isSwedish) {
        parts.push(`ORIGINALROMPT SOM SKA OMFORMULERAS:`);
        parts.push(`"""${spec.rawInput}"""`);
        parts.push('');
        parts.push('ANALYS AV ORIGINALET:');

        if (spec.objective && spec.objective !== '[UNDECIDED]') {
            parts.push(`• Identifierat mål: ${spec.objective}`);
        } else {
            parts.push('• Mål: OTYDLIGT — du måste välja den mest rimliga tolkningen');
        }

        if (spec.context && spec.context !== '[UNDECIDED]') {
            parts.push(`• Kontext: ${spec.context}`);
        } else {
            parts.push('• Kontext: EJ ANGIVEN — fyll i med rimliga antaganden baserat på domänen');
        }

        if (spec.constraints.length > 0) {
            parts.push(`• Begränsningar: ${spec.constraints.join('; ')}`);
        }

        if (spec.assumptions.length > 0) {
            parts.push(`• Implicita antaganden att adressera: ${spec.assumptions.join('; ')}`);
        }

        if (spec.missingInformation.length > 0) {
            parts.push(`• Saknad info (gör smarta val istället): ${spec.missingInformation.join('; ')}`);
        }

        parts.push('');
        parts.push('Skriv nu den expertformulerade versionen av denna prompt.');
    } else {
        parts.push(`ORIGINAL PROMPT TO REWRITE:`);
        parts.push(`"""${spec.rawInput}"""`);
        parts.push('');
        parts.push('ANALYSIS OF ORIGINAL:');

        if (spec.objective && spec.objective !== '[UNDECIDED]') {
            parts.push(`• Identified goal: ${spec.objective}`);
        } else {
            parts.push('• Goal: UNCLEAR — you must choose the most reasonable interpretation');
        }

        if (spec.context && spec.context !== '[UNDECIDED]') {
            parts.push(`• Context: ${spec.context}`);
        } else {
            parts.push('• Context: NOT PROVIDED — fill in with reasonable assumptions based on domain');
        }

        if (spec.constraints.length > 0) {
            parts.push(`• Constraints: ${spec.constraints.join('; ')}`);
        }

        if (spec.assumptions.length > 0) {
            parts.push(`• Implicit assumptions to address: ${spec.assumptions.join('; ')}`);
        }

        if (spec.missingInformation.length > 0) {
            parts.push(`• Missing info (make smart choices instead): ${spec.missingInformation.join('; ')}`);
        }

        parts.push('');
        parts.push('Now write the expert-crafted version of this prompt.');
    }

    return { systemPrompt, userPrompt: parts.join('\n') };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export function validateRewriteQuality(result: RewrittenPrompt): {
    valid: boolean;
    reason?: string;
} {
    // Must not be too short
    if (result.prompt.length < 80) {
        return {
            valid: false,
            reason: 'Rewritten prompt is too short (< 80 characters)'
        };
    }

    // Must have at least 2 non-empty sections
    const filledSections = Object.values(result.sections).filter(s => s.length > 10).length;
    if (filledSections < 2) {
        return {
            valid: false,
            reason: `Only ${filledSections} sections filled — need at least 2`
        };
    }

    // Must meet adaptive quality bar
    if (!result.meetsQualityBar) {
        return {
            valid: false,
            reason: `Specificity multiplier ${result.meta.specificityMultiplier}× below minimum threshold`
        };
    }

    return { valid: true };
}
