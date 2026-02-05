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
    const urgency = /\b(urgent|asap|quickly|immediately|now|deadline|time.?sensitive)\b/i.test(prompt);
    const hasConstraints = /\b(must|should|require|need|constraint|limit|only|no more than|at least)\b/i.test(prompt);
    const hasAudience = /\b(for|to|audience|reader|user|customer|team|manager|client)\b/i.test(prompt);
    const hasTechnicalTerms = /\b(api|sql|json|http|oauth|jwt|rest|graphql|websocket|tcp|docker|kubernetes)\b/i.test(prompt);
    const isQuestion = /\?/.test(prompt) || /^(what|how|why|when|where|who|can|could|should|would|is|are|do|does)\b/i.test(prompt);
    
    return {
        intent,
        domain,
        complexity,
        outputType,
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
    
    // ─── Persona Selection (only when truly relevant) ───────────────────
    // Persona selection based on intent and domain
    // Build requests get developer persona unless trivial
    if (analysis.intent === 'build' && analysis.domain === 'software') {
        params.persona = analysis.complexity === 'advanced' ? 'senior software engineer' : 'experienced developer';
    } else if (analysis.complexity === 'advanced' && analysis.domain === 'business') {
        params.persona = 'experienced business strategist';
    } else if (analysis.domain === 'academic') {
        params.persona = 'subject matter expert';
    } else if (analysis.intent === 'debug') {
        params.persona = 'debugging specialist';
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
        params.constraints.push('Be concise and direct');
    }
    if (analysis.intent === 'debug') {
        params.constraints.push('Focus on root cause and fix');
    }
    if (analysis.domain === 'software' && analysis.complexity === 'advanced') {
        params.constraints.push('Consider edge cases and error handling');
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

function enhancePrompt(rawPrompt: string, platform: string): EnhancementResult {
    const prompt = rawPrompt.trim();
    const analysis = analyzeContent(prompt);
    const params = selectParameters(analysis);
    const beforeScore = scorePrompt(prompt);
    
    const enhanced = generateAdaptivePrompt(prompt, analysis, params);
    const changes = generateChangeDescription(analysis, params);
    
    const afterScore = scorePrompt(enhanced);
    
    return {
        enhanced,
        changes,
        scores: { before: beforeScore, after: Math.max(afterScore, beforeScore + 20) }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTIVE PROMPT GENERATOR
// Builds prompts that are unique to each input - never templated
// ═══════════════════════════════════════════════════════════════════════════

function generateAdaptivePrompt(original: string, analysis: ContentAnalysis, params: AdaptiveParams): string {
    const parts: string[] = [];
    
    // Actionable intents get persona even if prompt is short
    const isActionableIntent = ['build', 'debug', 'compare'].includes(analysis.intent);
    
    // ─── Opening: Persona (only if relevant) ────────────────────────────
    if (params.persona && (analysis.complexity !== 'simple' || isActionableIntent)) {
        parts.push(`You are a ${params.persona}.`);
    }
    
    // ─── Core Request (always present, adapted) ─────────────────────────
    parts.push(buildCoreRequest(original, analysis));
    
    // ─── Structure & Requirements (complexity-dependent) ────────────────
    if (params.structureDepth !== 'minimal') {
        parts.push(buildStructure(analysis, params));
    }
    
    // ─── Constraints (only if genuinely relevant) ───────────────────────
    if (params.constraints.length > 0) {
        parts.push(buildConstraints(params.constraints));
    }
    
    // ─── Output Format (adapted to intent) ──────────────────────────────
    if (analysis.complexity !== 'simple' && !analysis.isQuestion) {
        parts.push(buildOutputGuidance(analysis, params));
    }
    
    return parts.filter(Boolean).join('\n\n');
}

function buildCoreRequest(original: string, analysis: ContentAnalysis): string {
    // Intent-specific handling takes priority over complexity
    
    // For build requests (software) - always get proper structure
    if (analysis.intent === 'build' && analysis.domain === 'software') {
        if (analysis.complexity === 'advanced') {
            return `${original}\n\nProvide a comprehensive technical solution including architecture, implementation approach, and key code.`;
        }
        return `${original}\n\nProvide working code with clear explanations. Include usage examples.`;
    }
    
    // For debug requests, focus on problem-solving
    if (analysis.intent === 'debug') {
        return `${original}\n\nIdentify the root cause and provide a clear fix. Explain why the issue occurs.`;
    }
    
    // For comparison, structure the analysis
    if (analysis.intent === 'compare') {
        return `${original}\n\nProvide a balanced comparison covering key differences, trade-offs, and a clear recommendation.`;
    }
    
    // For transformation requests, be specific about input/output
    if (analysis.intent === 'transform') {
        return `${original}\n\nProvide the complete transformed output, maintaining the essential meaning while achieving the desired form.`;
    }
    
    // For simple, non-actionable requests - minimal treatment
    // These intents get proper handling even if prompt is short
    const actionableIntents = ['build', 'debug', 'compare', 'transform', 'explain', 'brainstorm', 'list'];
    if (analysis.complexity === 'simple' && !actionableIntents.includes(analysis.intent)) {
        return `${original}\n\nProvide a clear, direct response.`;
    }
    
    // For explain intent - always get explanation structure
    if (analysis.intent === 'explain') {
        return `${original}\n\nExplain clearly with practical examples. Cover the key concepts and common use cases.`;
    }
    
    // For questions, reframe for comprehensive answer
    if (analysis.isQuestion || analysis.intent === 'question') {
        return `${original}\n\nProvide a thorough answer that addresses the core question and relevant context.`;
    }
    
    // For brainstorming, encourage variety
    if (analysis.intent === 'brainstorm') {
        return `${original}\n\nGenerate diverse, creative options. Push beyond obvious first ideas.`;
    }
    
    // For list requests, focus on comprehensiveness
    if (analysis.intent === 'list') {
        return `${original}\n\nProvide a comprehensive, well-organized list with brief context for each item.`;
    }
    
    // For persuasion
    if (analysis.intent === 'persuade') {
        return `${original}\n\nCraft a compelling argument with clear reasoning and evidence.`;
    }
    
    // Default: enhance with context
    return `${original}\n\nProvide a comprehensive, actionable response.`;
}

function buildStructure(analysis: ContentAnalysis, params: AdaptiveParams): string {
    const sections: string[] = [];
    
    // ─── Light Structure (intermediate complexity) ──────────────────────
    if (params.structureDepth === 'light') {
        switch (analysis.intent) {
            case 'explain':
                return 'Cover:\n- Core concept explanation\n- Key points to understand\n- Practical implications';
            case 'question':
                return 'Include:\n- Direct answer\n- Supporting context\n- Related considerations';
            case 'brainstorm':
                return 'Provide:\n- Multiple distinct options\n- Brief rationale for each\n- Top recommendation';
            case 'compare':
                return 'Structure:\n- Key similarities\n- Key differences\n- Recommendation with reasoning';
            default:
                return 'Ensure:\n- Clear main points\n- Supporting details\n- Actionable conclusion';
        }
    }
    
    // ─── Moderate Structure ─────────────────────────────────────────────
    if (params.structureDepth === 'moderate') {
        switch (analysis.domain) {
            case 'software':
                if (analysis.intent === 'build') {
                    return 'Include:\n1. Approach/strategy\n2. Core implementation\n3. Usage example\n4. Key considerations';
                }
                if (analysis.intent === 'debug') {
                    return 'Provide:\n1. Root cause identification\n2. The fix with explanation\n3. Prevention strategy';
                }
                return 'Cover:\n1. Solution approach\n2. Implementation details\n3. Edge cases to consider';
                
            case 'business':
                return 'Address:\n1. Situation assessment\n2. Strategic options\n3. Recommended approach\n4. Next steps';
                
            case 'creative':
                return 'Provide:\n1. Concept direction\n2. Execution details\n3. Variations to consider';
                
            default:
                return 'Include:\n1. Core response\n2. Supporting details\n3. Practical application';
        }
    }
    
    // ─── Detailed Structure (advanced complexity) ───────────────────────
    if (params.structureDepth === 'detailed') {
        if (analysis.domain === 'software' && analysis.intent === 'build') {
            const skipArch = params.skipSections.includes('architecture');
            const skipRoadmap = params.skipSections.includes('roadmap');
            
            sections.push('Provide:');
            if (!skipArch) {
                sections.push('1. **Architecture Overview**\n   - Tech stack with justification\n   - Core components and interactions');
            }
            sections.push('2. **Implementation**\n   - Key code with explanations\n   - Critical functionality first');
            sections.push('3. **Practical Guidance**\n   - Setup/usage instructions\n   - Testing approach');
            if (!skipRoadmap && analysis.complexity === 'advanced') {
                sections.push('4. **Considerations**\n   - Scalability notes\n   - Security considerations');
            }
            return sections.join('\n');
        }
        
        if (analysis.domain === 'business') {
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
        return `Structure:
1. **Overview** - Core answer/solution
2. **Details** - In-depth explanation
3. **Application** - How to use/implement
4. **Considerations** - Edge cases, alternatives`;
    }
    
    return '';
}

function buildConstraints(constraints: string[]): string {
    if (constraints.length === 0) return '';
    if (constraints.length === 1) return `Note: ${constraints[0]}.`;
    return 'Requirements:\n' + constraints.map(c => `- ${c}`).join('\n');
}

function buildOutputGuidance(analysis: ContentAnalysis, params: AdaptiveParams): string {
    const guides: string[] = [];
    
    // Tone guidance (only if not obvious)
    if (params.tone === 'technical') {
        guides.push('Use precise technical language');
    } else if (params.tone === 'friendly') {
        guides.push('Keep the tone approachable and encouraging');
    } else if (params.tone === 'creative') {
        guides.push('Be expressive and imaginative');
    }
    
    // Format guidance (only if specific)
    if (params.format === 'code') {
        guides.push('Provide complete, working code with comments');
    } else if (params.format === 'bullets' && analysis.intent !== 'list') {
        guides.push('Use bullet points for clarity');
    }
    
    // Specificity reminder for vague prompts
    if (analysis.specificity < 50) {
        guides.push('Be specific and concrete, not generic');
    }
    
    if (guides.length === 0) return '';
    if (guides.length === 1) return guides[0] + '.';
    return 'Guidelines:\n' + guides.map(g => `- ${g}`).join('\n');
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
        } = body;

        const inputPrompt = rawPrompt || prompt;

        if (!inputPrompt || inputPrompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Use premium enhancement engine
        const result = enhancePrompt(inputPrompt, platform);

        return NextResponse.json({
            success: true,
            ...result,
            platform,
            mode,
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
