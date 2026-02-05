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
    model?: string;
    temperature?: number;
}

export interface RewrittenPrompt {
    prompt: string;
    qualityScore: number;
    meetsQualityBar: boolean;
    meta: {
        originalLength: number;
        rewrittenLength: number;
        specificityMultiplier: number;
        synthesizedAt: string;
        domain: string;
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
- Specify the programming language, framework, and version
- Define the function signature, inputs, and expected outputs
- Mention error handling, edge cases, and validation requirements
- State whether tests, documentation, or usage examples are needed
- Include performance considerations and coding standards to follow
- Specify the architecture pattern if building something larger`,
            sv: `DOMÄN: MJUKVARUUTVECKLING
När du omformulerar denna prompt, säkerställ att du:
- Specificerar programmeringsspråk, ramverk och version
- Definierar funktionssignatur, indata och förväntad output
- Nämner felhantering, edge cases och valideringskrav
- Anger om tester, dokumentation eller användningsexempel behövs
- Inkluderar prestandaöverväganden och kodstandarder att följa`,
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
        model = 'gpt-4o-mini',
        temperature = 0.5
    } = config;

    const client = getOpenAIClient();
    const domain = detectDomain(spec.rawInput);
    const metaPrompt = buildRewriterMetaPrompt(spec, language, domain);

    try {
        const completion = await client.chat.completions.create({
            model,
            temperature,
            max_tokens: 1500,
            messages: [
                { role: 'system', content: metaPrompt.systemPrompt },
                { role: 'user', content: metaPrompt.userPrompt }
            ],
        });

        const synthesizedPrompt = completion.choices[0]?.message?.content?.trim() || '';

        if (!synthesizedPrompt) {
            throw new Error('Rewriter produced empty output');
        }

        // Calculate quality metrics
        const originalLength = spec.rawInput.length;
        const rewrittenLength = synthesizedPrompt.length;
        const specificityMultiplier = rewrittenLength / Math.max(1, originalLength);

        // Adaptive quality bar — short inputs naturally get higher multipliers
        const minMultiplier = originalLength < 30 ? 2.0 : originalLength < 80 ? 2.5 : 3.0;
        const qualityScore = Math.min(100, Math.round((specificityMultiplier / minMultiplier) * 80));
        const meetsQualityBar = specificityMultiplier >= minMultiplier && rewrittenLength >= 100;

        return {
            prompt: synthesizedPrompt,
            qualityScore,
            meetsQualityBar,
            meta: {
                originalLength,
                rewrittenLength,
                specificityMultiplier: Math.round(specificityMultiplier * 10) / 10,
                synthesizedAt: new Date().toISOString(),
                domain,
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

function buildRewriterMetaPrompt(
    spec: CompiledSpec,
    language: 'en' | 'sv',
    domain: PromptDomain
): { systemPrompt: string; userPrompt: string } {

    const isSwedish = language === 'sv';
    const domainInstructions = getDomainInstructions(domain, isSwedish);

    const systemPrompt = isSwedish ? `Du är världens bästa prompt-ingenjör. Du tar amatörers vaga, ofullständiga promptar och transformerar dem till expertformulerade instruktioner som får AI-modeller att leverera 10× bättre resultat.

DIN UPPGIFT:
Ta den råa prompten nedan och skriv om den från grunden som en senior domänexpert med 15+ års erfarenhet.

RESULTATET MÅSTE:
1. Vara en enda sammanhängande, naturligt skriven text — INGA synliga rubriker, etiketter eller mallstrukturer (inga "ROLL:", "##", "UPPGIFT:" etc.)
2. Definiera en tydlig expertroll implicit ("Som en erfaren..." eller liknande naturlig inledning)
3. Specificera exakt vad som ska levereras, i vilken ordning och i vilket format
4. Inkludera tydliga kvalitetskriterier och framgångsmått
5. Ange vad som ska UNDVIKAS (klichéer, ytlighet, irrelevant innehåll)
6. Vara kontextmedveten — gör smarta val där användaren är vag istället för att fråga
7. Vara minst 150 ord lång oavsett hur kort originalet är
8. Använda konkreta, specifika formuleringar — aldrig vaga ord som "bra", "intressant", "relevant"

${domainInstructions}

KRITISKT KVALITETSKRAV:
När någon jämför din omskrivna prompt med originalet ska reaktionen vara: "Wow, den här prompten vet exakt vad den vill ha — jag hade aldrig kunnat formulera det så bra."

SVARA ENBART med den omskrivna prompten. Ingen förklaring, inget "Här är den förbättrade prompten:", ingen kommentar.` :

        `You are the world's best prompt engineer. You take amateurs' vague, incomplete prompts and transform them into expert-crafted instructions that make AI models deliver 10× better results.

YOUR TASK:
Take the raw prompt below and rewrite it from scratch as a senior domain expert with 15+ years of experience would.

THE RESULT MUST:
1. Be a single coherent, naturally written text — NO visible headers, labels, or template structures (no "ROLE:", "##", "TASK:" etc.)
2. Define a clear expert role implicitly ("As an experienced..." or similar natural opening)
3. Specify exactly what should be delivered, in what order, and in what format
4. Include clear quality criteria and success metrics
5. State what to AVOID (clichés, superficiality, irrelevant content)
6. Be context-aware — make smart choices where the user is vague instead of asking
7. Be at least 150 words long regardless of how short the original is
8. Use concrete, specific language — never vague words like "good", "interesting", "relevant"

${domainInstructions}

CRITICAL QUALITY REQUIREMENT:
When someone compares your rewritten prompt to the original, the reaction should be: "Wow, this prompt knows exactly what it wants — I could never have phrased it this well."

RESPOND ONLY with the rewritten prompt. No explanation, no "Here's the improved prompt:", no commentary.`;

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

    // Must meet adaptive quality bar
    if (!result.meetsQualityBar) {
        return {
            valid: false,
            reason: `Specificity multiplier ${result.meta.specificityMultiplier}× below minimum threshold`
        };
    }

    // Must not contain template markers (AI failed to follow instructions)
    const templateMarkers = ['ROLE:', 'TASK:', 'CONSTRAINTS:', 'OBJECTIVE:', 'OUTPUT FORMAT:'];
    const hasTemplateMarkers = templateMarkers.some(marker =>
        result.prompt.toUpperCase().includes(marker)
    );

    if (hasTemplateMarkers) {
        return {
            valid: false,
            reason: 'Rewritten prompt contains template structure markers'
        };
    }

    return { valid: true };
}
