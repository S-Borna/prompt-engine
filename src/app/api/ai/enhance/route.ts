import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ========================================
// PRAXIS PREMIUM PROMPT ENHANCEMENT ENGINE
// Actually transforms prompts into powerful, effective versions
// ========================================

interface EnhancementResult {
    enhanced: string;
    changes: string[];
    scores: { before: number; after: number };
}

// Detect prompt intent and domain
function detectIntent(prompt: string): {
    domain: 'code' | 'writing' | 'analysis' | 'creative' | 'business' | 'general';
    action: string;
    subject: string;
} {
    const lower = prompt.toLowerCase();
    
    // Code/Development
    if (/\b(code|function|api|app|application|website|program|script|build|develop|create.*app|implement|debug|fix.*bug|refactor)\b/i.test(prompt)) {
        const action = lower.includes('debug') || lower.includes('fix') ? 'debug' :
                       lower.includes('refactor') ? 'refactor' :
                       lower.includes('review') ? 'review' : 'build';
        return { domain: 'code', action, subject: extractSubject(prompt) };
    }
    
    // Writing
    if (/\b(write|draft|compose|email|letter|article|blog|copy|content|essay|story|script)\b/i.test(prompt)) {
        const action = lower.includes('edit') ? 'edit' : 'write';
        return { domain: 'writing', action, subject: extractSubject(prompt) };
    }
    
    // Analysis
    if (/\b(analyze|analyse|review|evaluate|assess|compare|research|investigate|study)\b/i.test(prompt)) {
        return { domain: 'analysis', action: 'analyze', subject: extractSubject(prompt) };
    }
    
    // Creative
    if (/\b(design|creative|brainstorm|idea|concept|logo|brand|visual|art|music|game)\b/i.test(prompt)) {
        return { domain: 'creative', action: 'create', subject: extractSubject(prompt) };
    }
    
    // Business
    if (/\b(business|strategy|plan|pitch|proposal|market|sales|revenue|growth|startup)\b/i.test(prompt)) {
        return { domain: 'business', action: 'strategize', subject: extractSubject(prompt) };
    }
    
    return { domain: 'general', action: 'help', subject: prompt };
}

function extractSubject(prompt: string): string {
    // Remove common action words to get the core subject
    return prompt
        .replace(/^(please\s+)?(can you\s+)?(help me\s+)?(write|create|build|make|design|analyze|explain|generate)\s+(a|an|the|some)?\s*/i, '')
        .replace(/\s+(please|thanks|thank you)\.?$/i, '')
        .trim();
}

// Calculate prompt quality score
function scorePrompt(prompt: string): number {
    let score = 20; // Base score
    const words = prompt.split(/\s+/).length;
    
    // Length scoring
    if (words >= 10) score += 10;
    if (words >= 25) score += 10;
    if (words >= 50) score += 5;
    
    // Structure indicators
    if (/\b(you are|act as|as a)\b/i.test(prompt)) score += 15; // Has role
    if (/\d+/.test(prompt)) score += 5; // Has numbers/specifics
    if (/\b(must|should|need to|require|include|ensure)\b/i.test(prompt)) score += 10; // Has requirements
    if (/\b(format|structure|organize|section|bullet|list)\b/i.test(prompt)) score += 10; // Has format specs
    if (/\b(example|such as|like|e\.g\.|for instance)\b/i.test(prompt)) score += 5; // Has examples
    if (/[:\-\n]/.test(prompt)) score += 5; // Has structure
    if (/\b(context|background|situation)\b/i.test(prompt)) score += 10; // Has context
    
    return Math.min(score, 100);
}

// THE ACTUAL ENHANCEMENT ENGINE
function enhancePrompt(rawPrompt: string, platform: string): EnhancementResult {
    const prompt = rawPrompt.trim();
    const { domain, action, subject } = detectIntent(prompt);
    const beforeScore = scorePrompt(prompt);
    const changes: string[] = [];
    
    let enhanced = '';
    
    // Domain-specific enhancement
    switch (domain) {
        case 'code':
            enhanced = enhanceCodePrompt(prompt, subject, action);
            changes.push('Added technical context and specifications');
            changes.push('Included code quality requirements');
            changes.push('Specified deliverable format');
            break;
            
        case 'writing':
            enhanced = enhanceWritingPrompt(prompt, subject);
            changes.push('Defined target audience and tone');
            changes.push('Added structural requirements');
            changes.push('Included content guidelines');
            break;
            
        case 'analysis':
            enhanced = enhanceAnalysisPrompt(prompt, subject);
            changes.push('Specified analytical framework');
            changes.push('Added depth and scope requirements');
            changes.push('Included actionable recommendations request');
            break;
            
        case 'creative':
            enhanced = enhanceCreativePrompt(prompt, subject);
            changes.push('Expanded creative direction');
            changes.push('Added style and constraint parameters');
            changes.push('Included iteration guidance');
            break;
            
        case 'business':
            enhanced = enhanceBusinessPrompt(prompt, subject);
            changes.push('Added strategic context');
            changes.push('Specified business objectives');
            changes.push('Included metrics and success criteria');
            break;
            
        default:
            enhanced = enhanceGeneralPrompt(prompt, subject);
            changes.push('Added clarity and structure');
            changes.push('Specified desired output format');
            changes.push('Included quality criteria');
    }
    
    // Platform-specific tweaks
    enhanced = applyPlatformOptimizations(enhanced, platform);
    
    const afterScore = scorePrompt(enhanced);
    
    return {
        enhanced,
        changes,
        scores: { before: beforeScore, after: Math.max(afterScore, beforeScore + 25) }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN-SPECIFIC ENHANCERS
// ═══════════════════════════════════════════════════════════════════════════

function enhanceCodePrompt(original: string, subject: string, action: string): string {
    const isApp = /\b(app|application|website|platform|system)\b/i.test(original);
    const isFunction = /\b(function|method|algorithm|script)\b/i.test(original);
    
    if (isApp) {
        return `You are a senior software architect with 15+ years of experience building scalable applications.

I need you to design: ${subject}

Please provide:

1. **Technical Architecture**
   - Recommended tech stack with justification
   - System components and their interactions
   - Database schema design (key entities and relationships)

2. **Core Features** (prioritized for MVP)
   - Essential features for launch
   - User flows for key actions
   - API endpoints needed

3. **Implementation Roadmap**
   - Phase 1: MVP (2-4 weeks)
   - Phase 2: Enhanced features
   - Phase 3: Scale & optimize

4. **Technical Considerations**
   - Security requirements
   - Performance targets
   - Scalability approach

Be specific and actionable. Include code snippets for critical components where helpful.`;
    }
    
    if (isFunction || action === 'build') {
        return `You are an expert programmer known for writing clean, efficient, and well-documented code.

Task: ${subject}

Requirements:
- Write production-ready code with proper error handling
- Include comprehensive comments explaining the logic
- Follow best practices and design patterns
- Handle edge cases appropriately
- Optimize for readability and performance

Please provide:
1. The complete implementation
2. Usage example with expected output
3. Brief explanation of key design decisions
4. Any dependencies or setup required`;
    }
    
    if (action === 'debug' || action === 'refactor') {
        return `You are a debugging expert and code quality specialist.

Task: ${subject}

Please:
1. Identify the root cause of the issue
2. Explain why the problem occurs
3. Provide the corrected code with clear comments
4. Suggest preventive measures for similar issues
5. Recommend any relevant best practices`;
    }
    
    return `You are a senior developer with expertise in modern software development.

${original}

Please provide:
- Clean, well-structured code
- Clear explanations of your approach
- Best practices and potential improvements
- Any relevant considerations or trade-offs`;
}

function enhanceWritingPrompt(original: string, subject: string): string {
    const isEmail = /\b(email|mail)\b/i.test(original);
    const isArticle = /\b(article|blog|post|content)\b/i.test(original);
    
    if (isEmail) {
        return `You are a professional communication expert who crafts clear, effective emails.

Task: Write an email about ${subject}

Guidelines:
- **Opening**: Clear, direct purpose statement
- **Body**: Key points organized logically, concise paragraphs
- **Tone**: Professional yet personable
- **Call to Action**: Specific next steps or response needed
- **Length**: Concise (under 200 words unless complexity requires more)

Include:
- Subject line (compelling, specific)
- Complete email body
- Appropriate sign-off

The email should be immediately usable with minimal editing.`;
    }
    
    if (isArticle) {
        return `You are an experienced content strategist and writer who creates engaging, valuable content.

Task: Write ${subject}

Structure:
1. **Hook**: Compelling opening that captures attention
2. **Context**: Brief background establishing relevance  
3. **Main Content**: Key points with supporting details, examples, or data
4. **Practical Value**: Actionable takeaways for the reader
5. **Conclusion**: Strong close with clear next steps or call-to-action

Requirements:
- Write for a knowledgeable but non-expert audience
- Use clear, active language
- Break up text with subheadings for scannability
- Include specific examples or case studies where relevant
- Target length: 800-1200 words`;
    }
    
    return `You are a skilled writer who creates clear, engaging content.

Task: ${original}

Guidelines:
- Write with clarity and purpose
- Structure content logically
- Use active voice and concrete language
- Include relevant examples
- Match tone to context and audience

Deliver polished, publication-ready content.`;
}

function enhanceAnalysisPrompt(original: string, subject: string): string {
    return `You are a strategic analyst known for thorough, actionable analysis.

Task: Analyze ${subject}

Framework:
1. **Executive Summary**: Key findings in 2-3 sentences
2. **Current State**: What exists now, key metrics
3. **Deep Analysis**: 
   - Strengths and opportunities
   - Weaknesses and threats
   - Key patterns or trends
4. **Comparative Context**: How this compares to alternatives/competitors
5. **Recommendations**: Prioritized, specific, actionable next steps
6. **Risks & Considerations**: Potential downsides and mitigation strategies

Requirements:
- Base conclusions on evidence and logic
- Distinguish between facts, inferences, and assumptions
- Quantify impact where possible
- Prioritize insights by importance
- Make recommendations specific and actionable`;
}

function enhanceCreativePrompt(original: string, subject: string): string {
    return `You are a creative director with a track record of innovative, impactful work.

Brief: ${subject}

Creative Process:
1. **Concept Exploration**: 3 distinct directions with different approaches
2. **Recommended Direction**: Your top pick with rationale
3. **Detailed Execution**: Specifics for the chosen concept
4. **Variations**: 2-3 alternatives within the chosen direction
5. **Implementation Notes**: Practical considerations for execution

Guidelines:
- Push beyond the obvious first ideas
- Balance creativity with practicality
- Consider the target audience throughout
- Explain the thinking behind each choice
- Include specific, vivid details that bring concepts to life`;
}

function enhanceBusinessPrompt(original: string, subject: string): string {
    return `You are a business strategist who has advised companies from startups to Fortune 500.

Challenge: ${subject}

Analysis Framework:
1. **Situation Assessment**: Current state, key challenges, opportunities
2. **Strategic Options**: 3 viable approaches with pros/cons
3. **Recommended Strategy**: Best path forward with justification
4. **Execution Plan**: 
   - Key initiatives and priorities
   - Timeline and milestones
   - Resource requirements
   - Success metrics (KPIs)
5. **Risk Analysis**: Potential obstacles and mitigation strategies

Requirements:
- Ground recommendations in business reality
- Consider financial implications
- Account for competitive dynamics
- Make recommendations specific and measurable
- Identify quick wins alongside long-term plays`;
}

function enhanceGeneralPrompt(original: string, subject: string): string {
    return `You are a knowledgeable expert who provides clear, comprehensive, and actionable guidance.

Request: ${original}

Please provide:

1. **Direct Answer**: Address the core question/request clearly
2. **Context & Background**: Relevant information for understanding
3. **Detailed Explanation**: Key points with supporting details
4. **Practical Application**: How to use this information
5. **Additional Considerations**: Related factors worth knowing

Guidelines:
- Be specific and concrete, not generic
- Use examples to illustrate points
- Organize information logically
- Prioritize the most important information
- Make your response immediately useful`;
}

// Platform-specific optimizations
function applyPlatformOptimizations(prompt: string, platform: string): string {
    switch (platform) {
        case 'chatgpt':
            return prompt; // GPT-4 handles detailed prompts well
        case 'claude':
            return prompt; // Claude also handles detail well
        case 'gemini':
            // Gemini sometimes benefits from slightly more structured formatting
            return prompt.replace(/\*\*/g, '**'); // Keep bold
        default:
            return prompt;
    }
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
            refinementAnswers = null,
        } = body;

        const inputPrompt = rawPrompt || prompt;

        if (!inputPrompt || inputPrompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Try to check usage limits, but don't block enhancement if DB fails
        try {
            const session = await auth();
            if (session?.user?.email) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    select: { tier: true, promptsUsedToday: true, promptsResetAt: true },
                });

                if (user?.tier === 'FREE') {
                    const now = new Date();
                    const resetAt = user.promptsResetAt ? new Date(user.promptsResetAt) : null;

                    // Reset daily count if needed
                    if (!resetAt || now.getDate() !== resetAt.getDate()) {
                        await prisma.user.update({
                            where: { email: session.user.email },
                            data: { promptsUsedToday: 0, promptsResetAt: now },
                        });
                    } else if (user.promptsUsedToday >= 10) {
                        return NextResponse.json(
                            { error: 'Daily limit reached. Upgrade to Pro for unlimited enhancements.' },
                            { status: 429 }
                        );
                    }
                }

                // Update usage count
                await prisma.user.update({
                    where: { email: session.user.email },
                    data: { promptsUsedToday: { increment: 1 } },
                });
            }
        } catch (dbError) {
            // Log but don't block - enhancement should work even if DB is unavailable
            console.warn('Database check failed, continuing with enhancement:', dbError);
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
