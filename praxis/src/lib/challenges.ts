import { Challenge, ChallengeCategory, Difficulty } from './store';

// =====================
// CHALLENGE DATA
// =====================

export const challenges: Challenge[] = [
    // === BEGINNER: BASICS ===
    {
        id: 'basics-001',
        title: 'Be Specific',
        titleSv: 'Var specifik',
        description: 'Learn why specific prompts get better results than vague ones.',
        descriptionSv: 'Lär dig varför specifika prompts ger bättre resultat än vaga.',
        category: 'basics',
        difficulty: 'beginner',
        objective: 'Write a prompt asking AI to explain photosynthesis. Make it specific about audience (5th graders) and format (simple bullet points).',
        objectiveSv: 'Skriv en prompt som ber AI förklara fotosyntes. Var specifik om målgrupp (5:e klassare) och format (enkla punktlistor).',
        hints: [
            'Include who the explanation is for',
            'Specify the format you want',
            'Mention the complexity level',
        ],
        hintsSv: [
            'Inkludera vem förklaringen är för',
            'Specificera vilket format du vill ha',
            'Nämn komplexitetsnivån',
        ],
        exampleGoodPrompt: 'Explain photosynthesis to 5th grade students using simple bullet points. Use everyday words and include a simple analogy.',
        exampleBadPrompt: 'Tell me about photosynthesis',
        evaluationCriteria: ['target audience', 'format specified', 'complexity level', 'clear request'],
        xpReward: 50,
        timeEstimate: 5,
    },
    {
        id: 'basics-002',
        title: 'Role Assignment',
        titleSv: 'Tilldela en roll',
        description: 'Discover how assigning a role to the AI improves responses.',
        descriptionSv: 'Upptäck hur att tilldela AI en roll förbättrar svaren.',
        category: 'basics',
        difficulty: 'beginner',
        objective: 'Write a prompt asking for fitness advice. Assign the AI the role of a personal trainer with 10 years experience.',
        objectiveSv: 'Skriv en prompt som ber om träningsråd. Ge AI rollen som personlig tränare med 10 års erfarenhet.',
        hints: [
            'Start by defining who the AI should be',
            'Include relevant expertise',
            'Make the role specific and credible',
        ],
        hintsSv: [
            'Börja med att definiera vem AI:n ska vara',
            'Inkludera relevant expertis',
            'Gör rollen specifik och trovärdig',
        ],
        exampleGoodPrompt: 'You are a certified personal trainer with 10 years of experience helping beginners. Create a simple 3-day workout plan for someone who has never exercised before.',
        exampleBadPrompt: 'Give me a workout plan',
        evaluationCriteria: ['role defined', 'expertise specified', 'context for advice', 'actionable request'],
        xpReward: 50,
        timeEstimate: 5,
    },
    {
        id: 'basics-003',
        title: 'Output Format',
        titleSv: 'Utdataformat',
        description: 'Control exactly how the AI structures its response.',
        descriptionSv: 'Kontrollera exakt hur AI:n strukturerar sitt svar.',
        category: 'basics',
        difficulty: 'beginner',
        objective: 'Ask for a comparison between electric and gas cars. Specify that you want a table format with pros and cons.',
        objectiveSv: 'Be om en jämförelse mellan el- och bensinbilar. Specificera att du vill ha tabellformat med för- och nackdelar.',
        hints: [
            'Explicitly state the format (table)',
            'Define the columns or structure',
            'Be clear about what categories to compare',
        ],
        hintsSv: [
            'Ange uttryckligen formatet (tabell)',
            'Definiera kolumner eller struktur',
            'Var tydlig med vilka kategorier som ska jämföras',
        ],
        exampleGoodPrompt: 'Compare electric cars vs gas cars in a table format. Include columns for: Category, Electric Car (Pros/Cons), Gas Car (Pros/Cons). Cover: cost, environment, maintenance, range.',
        exampleBadPrompt: 'What\'s better, electric or gas cars?',
        evaluationCriteria: ['format specified', 'structure defined', 'categories listed', 'comparison framework'],
        xpReward: 50,
        timeEstimate: 5,
    },

    // === BEGINNER: CLARITY ===
    {
        id: 'clarity-001',
        title: 'Break It Down',
        titleSv: 'Dela upp det',
        description: 'Learn to break complex requests into clear steps.',
        descriptionSv: 'Lär dig dela upp komplexa förfrågningar i tydliga steg.',
        category: 'clarity',
        difficulty: 'beginner',
        objective: 'Ask the AI to help you write a cover letter. Break it into steps: 1) understand the job, 2) highlight skills, 3) write the letter.',
        objectiveSv: 'Be AI:n hjälpa dig skriva ett personligt brev. Dela upp i steg: 1) förstå jobbet, 2) lyfta fram kompetenser, 3) skriv brevet.',
        hints: [
            'Number your steps clearly',
            'Each step should be one action',
            'Steps should be in logical order',
        ],
        hintsSv: [
            'Numrera dina steg tydligt',
            'Varje steg ska vara en handling',
            'Stegen ska vara i logisk ordning',
        ],
        evaluationCriteria: ['steps numbered', 'logical sequence', 'clear actions', 'complete process'],
        xpReward: 75,
        timeEstimate: 7,
    },
    {
        id: 'clarity-002',
        title: 'Avoid Ambiguity',
        titleSv: 'Undvik tvetydighet',
        description: 'Practice removing ambiguous words from your prompts.',
        descriptionSv: 'Öva på att ta bort tvetydiga ord från dina prompts.',
        category: 'clarity',
        difficulty: 'beginner',
        objective: 'Rewrite this vague prompt to be specific: "Make it better and more interesting"',
        objectiveSv: 'Skriv om denna vaga prompt till att bli specifik: "Gör det bättre och mer intressant"',
        hints: [
            'Define what "better" means',
            'Specify what "interesting" means',
            'Give measurable criteria',
        ],
        hintsSv: [
            'Definiera vad "bättre" betyder',
            'Specificera vad "intressant" betyder',
            'Ge mätbara kriterier',
        ],
        exampleGoodPrompt: 'Improve this text by: 1) Adding specific examples, 2) Using more vivid verbs, 3) Breaking long sentences into shorter ones, 4) Adding a hook in the opening line.',
        exampleBadPrompt: 'Make it better and more interesting',
        evaluationCriteria: ['specific improvements', 'measurable criteria', 'no vague words', 'actionable feedback'],
        xpReward: 75,
        timeEstimate: 7,
    },

    // === INTERMEDIATE: CONTEXT ===
    {
        id: 'context-001',
        title: 'Provide Background',
        titleSv: 'Ge bakgrund',
        description: 'Learn how context dramatically improves AI responses.',
        descriptionSv: 'Lär dig hur kontext dramatiskt förbättrar AI-svar.',
        category: 'context',
        difficulty: 'intermediate',
        objective: 'Ask for marketing advice for a small bakery. Include context: location (small town), budget (limited), target audience (families), unique selling point (organic ingredients).',
        objectiveSv: 'Be om marknadsföringsråd för ett litet bageri. Inkludera kontext: plats (liten stad), budget (begränsad), målgrupp (familjer), unik fördel (ekologiska ingredienser).',
        hints: [
            'Paint a complete picture',
            'Include constraints and limitations',
            'Mention what makes this situation unique',
        ],
        hintsSv: [
            'Måla upp en komplett bild',
            'Inkludera begränsningar',
            'Nämn vad som gör situationen unik',
        ],
        evaluationCriteria: ['business context', 'constraints mentioned', 'target audience', 'unique factors', 'actionable request'],
        xpReward: 100,
        timeEstimate: 10,
    },
    {
        id: 'context-002',
        title: 'The Before & After',
        titleSv: 'Före & Efter',
        description: 'Show the AI where you are and where you want to be.',
        descriptionSv: 'Visa AI:n var du är och vart du vill komma.',
        category: 'context',
        difficulty: 'intermediate',
        objective: 'Ask for help improving your morning routine. Describe current state (chaotic, rushed) and desired state (calm, productive). Ask for a bridge between them.',
        objectiveSv: 'Be om hjälp att förbättra din morgonrutin. Beskriv nuläge (kaotiskt, stressat) och önskat läge (lugnt, produktivt). Be om en bro mellan dem.',
        hints: [
            'Be honest about current state',
            'Be specific about desired outcome',
            'Ask for the path between them',
        ],
        hintsSv: [
            'Var ärlig om nuläget',
            'Var specifik om önskat resultat',
            'Be om vägen mellan dem',
        ],
        evaluationCriteria: ['current state described', 'desired state described', 'gap identified', 'actionable path requested'],
        xpReward: 100,
        timeEstimate: 10,
    },

    // === INTERMEDIATE: CONSTRAINTS ===
    {
        id: 'constraints-001',
        title: 'Set Boundaries',
        titleSv: 'Sätt gränser',
        description: 'Use constraints to focus the AI\'s response.',
        descriptionSv: 'Använd begränsningar för att fokusera AI:ns svar.',
        category: 'constraints',
        difficulty: 'intermediate',
        objective: 'Ask for a recipe. Add constraints: vegetarian, under 30 minutes, max 5 ingredients, no nuts (allergy).',
        objectiveSv: 'Be om ett recept. Lägg till begränsningar: vegetariskt, under 30 minuter, max 5 ingredienser, inga nötter (allergi).',
        hints: [
            'List constraints clearly',
            'Include time constraints',
            'Mention dietary restrictions',
            'Specify quantity limits',
        ],
        hintsSv: [
            'Lista begränsningar tydligt',
            'Inkludera tidsbegränsningar',
            'Nämn kostbegränsningar',
            'Specificera mängdgränser',
        ],
        evaluationCriteria: ['dietary constraint', 'time constraint', 'ingredient limit', 'allergy mentioned', 'all constraints clear'],
        xpReward: 100,
        timeEstimate: 8,
    },
    {
        id: 'constraints-002',
        title: 'Word Limits',
        titleSv: 'Ordgränser',
        description: 'Control response length precisely.',
        descriptionSv: 'Kontrollera svarslängd exakt.',
        category: 'constraints',
        difficulty: 'intermediate',
        objective: 'Ask for an elevator pitch for a mobile app idea. Constrain to exactly 50 words, must include problem and solution.',
        objectiveSv: 'Be om en hissnäsa för en mobilapp-idé. Begränsa till exakt 50 ord, måste inkludera problem och lösning.',
        hints: [
            'State exact word count',
            'Specify required elements',
            'Make the purpose clear',
        ],
        hintsSv: [
            'Ange exakt ordantal',
            'Specificera obligatoriska element',
            'Gör syftet tydligt',
        ],
        evaluationCriteria: ['word limit specified', 'required elements stated', 'purpose clear', 'format defined'],
        xpReward: 100,
        timeEstimate: 8,
    },

    // === ADVANCED: CREATIVITY ===
    {
        id: 'creativity-001',
        title: 'Unusual Perspectives',
        titleSv: 'Ovanliga perspektiv',
        description: 'Unlock creative responses by shifting perspectives.',
        descriptionSv: 'Lås upp kreativa svar genom att skifta perspektiv.',
        category: 'creativity',
        difficulty: 'advanced',
        objective: 'Ask the AI to explain the internet from the perspective of a medieval scholar who just time-traveled to today.',
        objectiveSv: 'Be AI:n förklara internet ur perspektivet av en medeltida lärd som just tidsrest till idag.',
        hints: [
            'Define the unique perspective clearly',
            'Give context for the perspective',
            'Let the creativity flow from the constraint',
        ],
        hintsSv: [
            'Definiera det unika perspektivet tydligt',
            'Ge kontext för perspektivet',
            'Låt kreativiteten flöda från begränsningen',
        ],
        evaluationCriteria: ['perspective defined', 'context given', 'creative constraint', 'clear request'],
        xpReward: 150,
        timeEstimate: 10,
    },
    {
        id: 'creativity-002',
        title: 'Combine Concepts',
        titleSv: 'Kombinera koncept',
        description: 'Create novel ideas by combining unrelated concepts.',
        descriptionSv: 'Skapa nya idéer genom att kombinera orelaterade koncept.',
        category: 'creativity',
        difficulty: 'advanced',
        objective: 'Ask the AI to generate a business idea that combines: gardening + gaming + elderly care. Request 3 unique concepts.',
        objectiveSv: 'Be AI:n generera en affärsidé som kombinerar: trädgårdsarbete + gaming + äldreomsorg. Be om 3 unika koncept.',
        hints: [
            'List the concepts to combine',
            'Ask for multiple options',
            'Request explanation of how concepts connect',
        ],
        hintsSv: [
            'Lista koncepten att kombinera',
            'Be om flera alternativ',
            'Begär förklaring av hur koncepten kopplas',
        ],
        evaluationCriteria: ['concepts listed', 'combination requested', 'multiple options', 'explanation requested'],
        xpReward: 150,
        timeEstimate: 12,
    },
];

// =====================
// HELPER FUNCTIONS
// =====================

export function getChallengesByCategory(category: ChallengeCategory): Challenge[] {
    return challenges.filter(c => c.category === category);
}

export function getChallengesByDifficulty(difficulty: Difficulty): Challenge[] {
    return challenges.filter(c => c.difficulty === difficulty);
}

export function getChallengeById(id: string): Challenge | undefined {
    return challenges.find(c => c.id === id);
}

export function getNextChallenge(completedIds: string[]): Challenge | undefined {
    return challenges.find(c => !completedIds.includes(c.id));
}

export function getChallengeProgress(completedIds: string[]): { completed: number; total: number; percentage: number } {
    const completed = completedIds.length;
    const total = challenges.length;
    return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
    };
}

export const categoryInfo: Record<ChallengeCategory, { name: string; nameSv: string; icon: string; color: string }> = {
    basics: { name: 'Basics', nameSv: 'Grunder', icon: '📝', color: 'violet' },
    clarity: { name: 'Clarity', nameSv: 'Tydlighet', icon: '💎', color: 'blue' },
    context: { name: 'Context', nameSv: 'Kontext', icon: '🎯', color: 'emerald' },
    constraints: { name: 'Constraints', nameSv: 'Begränsningar', icon: '🔒', color: 'amber' },
    creativity: { name: 'Creativity', nameSv: 'Kreativitet', icon: '🎨', color: 'pink' },
    advanced: { name: 'Advanced', nameSv: 'Avancerat', icon: '🚀', color: 'red' },
};

export const difficultyInfo: Record<Difficulty, { name: string; nameSv: string; color: string; xpMultiplier: number }> = {
    beginner: { name: 'Beginner', nameSv: 'Nybörjare', color: 'emerald', xpMultiplier: 1 },
    intermediate: { name: 'Intermediate', nameSv: 'Medel', color: 'blue', xpMultiplier: 1.5 },
    advanced: { name: 'Advanced', nameSv: 'Avancerad', color: 'violet', xpMultiplier: 2 },
    expert: { name: 'Expert', nameSv: 'Expert', color: 'amber', xpMultiplier: 3 },
};
