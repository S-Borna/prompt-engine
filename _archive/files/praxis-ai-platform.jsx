import React, { useState, useEffect, useRef } from 'react';

// ============================================
// PRAXIS — AI Fluency Platform
// ============================================
// A complete platform for learning AI prompting
// through practice, challenges, and certification.
// 
// Revenue Model:
// - Education B2B: Schools/Universities
// - Enterprise: Corporate AI upskilling
// - Government: Arbetsförmedlingen, Komvux
// - Certification: Paid certificates
// ============================================

// Simulated API call for prompt comparison
const simulateAIResponse = async (prompt, quality) => {
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
  
  const responses = {
    bad: {
      result: "Fotosyntesen är en process där växter använder solljus för att göra mat. De tar in koldioxid och vatten och producerar socker och syre. Det sker i kloroplasterna.",
      score: 34,
      issues: ["För tekniskt för målgruppen", "Saknar engagerande element", "Ingen struktur för förståelse"]
    },
    medium: {
      result: "Tänk dig att växter är som små fabriker! De använder solljus som energi, dricker vatten genom rötterna, och andas in luft genom bladen. Sedan blandar de ihop allt och gör sin egen mat - ett slags socker. Som bonus puffar de ut frisk luft (syre) som vi människor behöver för att andas!",
      score: 72,
      issues: ["Bra analogi", "Kan vara mer interaktiv", "Saknar minnesregler"]
    },
    good: {
      result: "🌱 **Växter är magiska kockar!**\n\nTänk dig att en växt är en kock som lagar mat på ett supercoolt sätt:\n\n**Ingredienserna:**\n- ☀️ Solljus (energin)\n- 💧 Vatten (från rötterna)\n- 💨 Luft (koldioxid från luften)\n\n**Receptet:**\nVäxten blandar ihop allt i sina gröna blad och *POFF* — det blir socker (växtens mat)!\n\n**Bonusen:**\nNär växten \"lagar mat\" puffar den ut syre — samma luft som DU andas! Så varje gång du ser en växt kan du säga \"Tack för luften!\" 🙏\n\n**Kom ihåg:** Sol + Vatten + Luft = Mat för växten + Luft för dig!",
      score: 94,
      issues: []
    }
  };
  
  return responses[quality] || responses.medium;
};

// Challenge database
const CHALLENGES = [
  {
    id: 1,
    title: "Förklara för ett barn",
    difficulty: "Nybörjare",
    xp: 100,
    category: "Pedagogik",
    scenario: "En 8-åring frågar dig: 'Vad är fotosyntesen?'",
    task: "Skriv en prompt som får AI:n att förklara fotosyntesen så att ett barn förstår och blir nyfiken.",
    hints: [
      "Specificera målgruppens ålder",
      "Be om konkreta analogier",
      "Inkludera engagerande element"
    ],
    exampleBadPrompt: "Förklara fotosyntesen",
    exampleGoodPrompt: "Förklara fotosyntesen för ett 8-årigt barn. Använd en rolig analogi (t.ex. att växten är en kock). Inkludera emojis. Gör det interaktivt med en enkel fråga i slutet. Max 100 ord.",
    evaluationCriteria: ["Åldersanpassat språk", "Använder analogier", "Engagerande format", "Korrekt innehåll"]
  },
  {
    id: 2,
    title: "E-post till VD",
    difficulty: "Medel",
    xp: 200,
    category: "Affärskommunikation",
    scenario: "Du behöver skicka ett mail till företagets VD om att ditt projekt är 2 veckor försenat.",
    task: "Skriv en prompt som genererar ett professionellt mail som är ärligt men lösningsorienterat.",
    hints: [
      "Ange ton och formalitetsnivå",
      "Inkludera vad mailet ska uppnå",
      "Be om konkret struktur"
    ],
    exampleBadPrompt: "Skriv ett mail om att projektet är försenat",
    exampleGoodPrompt: "Skriv ett professionellt mail till en VD. Ämne: Projektuppdatering. Innehåll: Projektet är 2 veckor försenat pga tekniska problem. Ton: Ärlig, lösningsorienterad, inte ursäktande. Inkludera: 1) Kort bakgrund, 2) Orsak, 3) Konkret lösningsplan med nya datum, 4) Vad du behöver från VD:n. Max 150 ord.",
    evaluationCriteria: ["Professionell ton", "Strukturerat", "Lösningsfokuserat", "Tydlig ask"]
  },
  {
    id: 3,
    title: "Debug min kod",
    difficulty: "Medel",
    xp: 250,
    category: "Utveckling",
    scenario: "Din Python-kod kraschar med 'IndexError: list index out of range' men du ser inte var felet är.",
    task: "Skriv en prompt som hjälper dig få effektiv debugging-hjälp från AI:n.",
    hints: [
      "Inkludera felmeddelandet",
      "Beskriv vad koden ska göra",
      "Be om steg-för-steg analys"
    ],
    exampleBadPrompt: "Min kod funkar inte, fixa den",
    exampleGoodPrompt: "Debug denna Python-kod. Fel: 'IndexError: list index out of range' på rad 15. Koden ska: Loopa genom en lista och jämföra element parvis. Ge mig: 1) Var felet troligen är, 2) Varför det händer, 3) Fix med förklaring, 4) Hur jag undviker detta i framtiden. [KOD HÄR]",
    evaluationCriteria: ["Inkluderar felmeddelande", "Beskriver intention", "Ber om förklaring", "Framtidssäkring"]
  },
  {
    id: 4,
    title: "Bygg en app",
    difficulty: "Avancerad",
    xp: 400,
    category: "Produktutveckling",
    scenario: "Du vill bygga en app som hjälper människor spåra sina vanor.",
    task: "Skriv en prompt som genererar en komplett, byggbar specifikation för en MVP.",
    hints: [
      "Definiera scope tydligt",
      "Specificera tekniska begränsningar",
      "Inkludera vad som INTE ska byggas"
    ],
    exampleBadPrompt: "Bygg en habit tracker app",
    exampleGoodPrompt: "Skapa en teknisk specifikation för en Habit Tracker MVP.\n\nSCOPE:\n- Webb-app (React)\n- Max 3 kärnfunktioner\n- Enkel design, ingen auth i v1\n\nKRÄVS:\n- Lägg till/ta bort vanor\n- Daglig check-in\n- 7-dagars streak-visning\n\nEJ I MVP:\n- Användarkonton\n- Notifikationer\n- Statistik/grafer\n\nLEVERERA:\n1. Datamodell\n2. Komponentstruktur\n3. Körbar kod\n4. Setup-instruktioner",
    evaluationCriteria: ["Tydlig scope", "Konkreta krav", "Explicit exkludering", "Strukturerad output"]
  },
  {
    id: 5,
    title: "Marknadsanalys",
    difficulty: "Avancerad",
    xp: 350,
    category: "Research",
    scenario: "Du ska pitcha en startup-idé och behöver snabb marknadsresearch.",
    task: "Skriv en prompt som ger dig användbar marknadsanalys, inte generisk text.",
    hints: [
      "Specificera bransch och geografi",
      "Be om konkreta datapunkter",
      "Inkludera format för output"
    ],
    exampleBadPrompt: "Gör en marknadsanalys för min startup",
    exampleGoodPrompt: "Marknadsanalys för en B2B SaaS inom HR-tech i Norden.\n\nANALYSERA:\n1. Marknadsstorlek (TAM/SAM/SOM) med källor\n2. Top 5 konkurrenter + deras pricing\n3. Kundsegment som är underservade\n4. Entry barriers\n5. Timing: Varför nu?\n\nFORMAT:\n- Executive summary (3 meningar)\n- Bullet points, ej prosa\n- Inkludera osäkerheter och antaganden\n- Avsluta med 'röda flaggor' jag bör känna till",
    evaluationCriteria: ["Specifik kontext", "Konkreta frågor", "Begärt format", "Kritiskt tänkande"]
  }
];

// Leaderboard data (simulated)
const LEADERBOARD = [
  { rank: 1, name: "Emma S.", school: "Chas Academy", xp: 4850, level: 12, streak: 23 },
  { rank: 2, name: "Alex K.", school: "Hyper Island", xp: 4320, level: 11, streak: 18 },
  { rank: 3, name: "Johan L.", school: "Chas Academy", xp: 3980, level: 10, streak: 31 },
  { rank: 4, name: "Sara M.", school: "Nackademin", xp: 3650, level: 9, streak: 12 },
  { rank: 5, name: "Erik B.", school: "KTH", xp: 3200, level: 8, streak: 7 },
  { rank: 6, name: "Lisa A.", school: "Stockholms Universitet", xp: 2890, level: 8, streak: 15 },
  { rank: 7, name: "Oscar N.", school: "Chas Academy", xp: 2540, level: 7, streak: 9 },
  { rank: 8, name: "Maja P.", school: "Hyper Island", xp: 2100, level: 6, streak: 4 },
];

// Class/Team data for teacher dashboard
const CLASS_DATA = {
  name: "DOE25 — DevOps",
  school: "Chas Academy",
  students: 38,
  activeToday: 24,
  avgScore: 73,
  completedChallenges: 156,
  topSkill: "Produktutveckling",
  weakestSkill: "Research",
  recentActivity: [
    { student: "Emma S.", action: "Completed 'Bygg en app'", score: 92, time: "12 min sedan" },
    { student: "Johan L.", action: "Started 'Marknadsanalys'", score: null, time: "34 min sedan" },
    { student: "Oscar N.", action: "Completed 'E-post till VD'", score: 78, time: "1 timme sedan" },
    { student: "Alex K.", action: "Achieved Level 11", score: null, time: "2 timmar sedan" },
  ],
  skillDistribution: [
    { skill: "Pedagogik", avg: 82 },
    { skill: "Affärskommunikation", avg: 75 },
    { skill: "Utveckling", avg: 71 },
    { skill: "Produktutveckling", avg: 68 },
    { skill: "Research", avg: 61 },
  ]
};

// User state (simulated logged in user)
const CURRENT_USER = {
  name: "Said A.",
  school: "Chas Academy",
  xp: 1850,
  level: 5,
  streak: 7,
  completedChallenges: 12,
  rank: 15,
  badges: ["🔥 7-Day Streak", "🎯 First Perfect Score", "🚀 Fast Learner"],
  skills: {
    "Pedagogik": 78,
    "Affärskommunikation": 65,
    "Utveckling": 82,
    "Produktutveckling": 71,
    "Research": 58
  }
};

// ============================================
// MAIN APPLICATION COMPONENT
// ============================================

export default function Praxis() {
  const [currentView, setCurrentView] = useState('landing'); // landing, challenges, challenge-active, dashboard, profile, pricing
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [user, setUser] = useState(CURRENT_USER);
  const promptInputRef = useRef(null);

  // Start a challenge
  const startChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setUserPrompt('');
    setComparisonResult(null);
    setShowHints(false);
    setCurrentView('challenge-active');
  };

  // Submit prompt for evaluation
  const submitPrompt = async () => {
    if (!userPrompt.trim()) return;
    
    setIsProcessing(true);
    
    // Determine quality based on prompt characteristics
    let quality = 'bad';
    const promptLower = userPrompt.toLowerCase();
    
    // Simple heuristic scoring
    let score = 0;
    if (userPrompt.length > 50) score += 1;
    if (userPrompt.length > 150) score += 1;
    if (promptLower.includes('format') || promptLower.includes('struktur')) score += 1;
    if (promptLower.includes('exempel') || promptLower.includes('analogi')) score += 1;
    if (promptLower.includes('max') || promptLower.includes('begränsa')) score += 1;
    if (promptLower.includes('ton') || promptLower.includes('stil')) score += 1;
    if (promptLower.includes('inkludera') || promptLower.includes('undvik')) score += 1;
    if (userPrompt.includes('\n')) score += 1;
    if (userPrompt.includes(':') || userPrompt.includes('-')) score += 1;
    
    if (score >= 6) quality = 'good';
    else if (score >= 3) quality = 'medium';
    
    // Get AI responses for comparison
    const [badResponse, userResponse] = await Promise.all([
      simulateAIResponse(selectedChallenge.exampleBadPrompt, 'bad'),
      simulateAIResponse(userPrompt, quality)
    ]);
    
    setComparisonResult({
      userPrompt,
      userResponse,
      badPrompt: selectedChallenge.exampleBadPrompt,
      badResponse,
      goodPrompt: selectedChallenge.exampleGoodPrompt,
      quality,
      xpEarned: quality === 'good' ? selectedChallenge.xp : quality === 'medium' ? Math.floor(selectedChallenge.xp * 0.6) : Math.floor(selectedChallenge.xp * 0.3)
    });
    
    // Update user XP
    setUser(prev => ({
      ...prev,
      xp: prev.xp + (quality === 'good' ? selectedChallenge.xp : quality === 'medium' ? Math.floor(selectedChallenge.xp * 0.6) : Math.floor(selectedChallenge.xp * 0.3))
    }));
    
    setIsProcessing(false);
  };

  // Calculate level from XP
  const getLevel = (xp) => Math.floor(xp / 400) + 1;
  const getXpForNextLevel = (xp) => {
    const currentLevel = getLevel(xp);
    return currentLevel * 400;
  };
  const getXpProgress = (xp) => {
    const currentLevelXp = (getLevel(xp) - 1) * 400;
    const nextLevelXp = getLevel(xp) * 400;
    return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      color: '#fafafa',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        ::selection {
          background: #8b5cf6;
          color: white;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .slide-up { animation: slideUp 0.7s ease-out forwards; }
        
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-border {
          position: relative;
          background: #18181b;
          border-radius: 16px;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        
        .card {
          background: linear-gradient(180deg, #18181b 0%, #131316 100%);
          border: 1px solid #27272a;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .card:hover {
          border-color: #3f3f46;
          transform: translateY(-2px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 15px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
        }
        
        .btn-secondary {
          background: transparent;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          color: #a1a1aa;
          font-weight: 500;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 15px;
        }
        .btn-secondary:hover {
          border-color: #8b5cf6;
          color: #e4e4e7;
        }
        
        .nav-item {
          padding: 10px 20px;
          color: #71717a;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
        }
        .nav-item:hover {
          color: #e4e4e7;
          background: rgba(255,255,255,0.05);
        }
        .nav-item.active {
          color: #a78bfa;
          background: rgba(139, 92, 246, 0.1);
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 20px;
        }
        
        .code-block {
          background: #0c0c0f;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        
        .progress-bar {
          height: 8px;
          background: #27272a;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .difficulty-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .difficulty-beginner { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
        .difficulty-medium { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
        .difficulty-advanced { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 700;
          position: relative;
        }
        .score-circle::before {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: #18181b;
        }
        .score-circle span {
          position: relative;
          z-index: 1;
        }
        .score-good { background: conic-gradient(#22c55e 0% 94%, #27272a 94% 100%); }
        .score-medium { background: conic-gradient(#fbbf24 0% 72%, #27272a 72% 100%); }
        .score-bad { background: conic-gradient(#ef4444 0% 34%, #27272a 34% 100%); }
        
        textarea:focus, input:focus { outline: none; }
        
        .hero-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #18181b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {/* Logo */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => setCurrentView('landing')}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              ◈
            </div>
            <span style={{ 
              fontFamily: "'Instrument Serif', serif",
              fontSize: '24px',
              fontWeight: '400',
              letterSpacing: '-0.02em'
            }}>
              Praxis
            </span>
          </div>
          
          {/* Nav Items */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div 
              className={`nav-item ${currentView === 'challenges' ? 'active' : ''}`}
              onClick={() => setCurrentView('challenges')}
            >
              Challenges
            </div>
            <div 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </div>
            <div 
              className={`nav-item ${currentView === 'pricing' ? 'active' : ''}`}
              onClick={() => setCurrentView('pricing')}
            >
              Pricing
            </div>
          </div>
        </div>
        
        {/* User Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* XP & Level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px 14px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>⚡ {user.xp.toLocaleString()}</span>
              <span style={{ color: '#71717a', fontSize: '13px' }}>XP</span>
            </div>
            <div style={{
              padding: '6px 14px',
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#fbbf24' }}>🔥</span>
              <span style={{ color: '#fbbf24', fontWeight: '600' }}>{user.streak}</span>
            </div>
          </div>
          
          {/* Avatar */}
          <div 
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentView('profile')}
          >
            {user.name.charAt(0)}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
        
        {/* ============================================ */}
        {/* LANDING PAGE */}
        {/* ============================================ */}
        {currentView === 'landing' && (
          <div className="fade-in">
            {/* Hero Section */}
            <section style={{
              minHeight: 'calc(100vh - 72px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px 20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background glow */}
              <div className="hero-glow" style={{ top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
              
              {/* Badge */}
              <div style={{
                padding: '8px 20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '30px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: '#22c55e', 
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ color: '#a1a1aa', fontSize: '14px' }}>
                  Över 2,400 studenter lär sig redan
                </span>
              </div>
              
              {/* Headline */}
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(48px, 8vw, 80px)',
                fontWeight: '400',
                lineHeight: '1.1',
                marginBottom: '24px',
                maxWidth: '900px'
              }}>
                Lär dig <span className="gradient-text">prompta</span> genom att{' '}
                <span style={{ fontStyle: 'italic' }}>göra</span>
              </h1>
              
              {/* Subheadline */}
              <p style={{
                fontSize: '20px',
                color: '#71717a',
                maxWidth: '600px',
                lineHeight: '1.6',
                marginBottom: '48px'
              }}>
                Praktiska challenges. Live feedback. Mätbara resultat.<br />
                Den snabbaste vägen från AI-nybörjare till expert.
              </p>
              
              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  className="btn-primary"
                  onClick={() => setCurrentView('challenges')}
                  style={{ fontSize: '17px', padding: '18px 36px' }}
                >
                  Starta gratis →
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setCurrentView('pricing')}
                  style={{ fontSize: '17px', padding: '18px 36px' }}
                >
                  Se pricing
                </button>
              </div>
              
              {/* Social Proof */}
              <div style={{ 
                marginTop: '80px', 
                display: 'flex', 
                gap: '48px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {[
                  { label: 'Aktiva användare', value: '2,400+' },
                  { label: 'Challenges avklarade', value: '18,000+' },
                  { label: 'Genomsnittlig förbättring', value: '+340%' },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#52525b' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* How It Works */}
            <section style={{
              padding: '120px 40px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '48px',
                textAlign: 'center',
                marginBottom: '80px'
              }}>
                Så fungerar det
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px'
              }}>
                {[
                  {
                    icon: '🎯',
                    title: 'Välj en challenge',
                    description: 'Verkliga scenarion från olika domäner: kod, affär, research, kreativt.'
                  },
                  {
                    icon: '✍️',
                    title: 'Skriv din prompt',
                    description: 'Formulera en prompt som du tror löser uppgiften effektivt.'
                  },
                  {
                    icon: '⚡',
                    title: 'Se jämförelsen live',
                    description: 'Din prompt vs. en dålig prompt — se skillnaden i realtid.'
                  },
                  {
                    icon: '📈',
                    title: 'Lär och levla upp',
                    description: 'Få feedback, tjäna XP, och bygg verklig AI-kompetens.'
                  }
                ].map((step, i) => (
                  <div 
                    key={i} 
                    className="card"
                    style={{ padding: '32px' }}
                  >
                    <div style={{ 
                      fontSize: '40px', 
                      marginBottom: '20px',
                      animation: 'float 3s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`
                    }}>
                      {step.icon}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: '#71717a', lineHeight: '1.6' }}>
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* For Organizations */}
            <section style={{
              padding: '120px 40px',
              background: 'linear-gradient(180deg, #0c0c0f 0%, #09090b 100%)'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '20px',
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '20px'
                  }}>
                    För organisationer
                  </div>
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '48px',
                    marginBottom: '20px'
                  }}>
                    AI-utbildning som faktiskt fungerar
                  </h2>
                  <p style={{ color: '#71717a', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                    Skolor, företag och myndigheter använder Praxis för att mätbart öka AI-kompetensen.
                  </p>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {[
                    {
                      type: 'Education',
                      title: 'Skolor & Universitet',
                      price: '49 kr',
                      per: '/elev/termin',
                      features: ['Obegränsade challenges', 'Lärardashboard', 'Klassrapporter', 'LMS-integration']
                    },
                    {
                      type: 'Business',
                      title: 'Företag',
                      price: '199 kr',
                      per: '/användare/månad',
                      features: ['Custom challenges', 'Team analytics', 'SSO & Admin', 'Certifiering'],
                      highlighted: true
                    },
                    {
                      type: 'Government',
                      title: 'Myndigheter',
                      price: 'Offert',
                      per: '',
                      features: ['Volymavtal', 'Compliance-ready', 'Dedikerad support', 'On-prem option']
                    }
                  ].map((plan, i) => (
                    <div 
                      key={i}
                      className={plan.highlighted ? 'gradient-border' : 'card'}
                      style={{ 
                        padding: '32px',
                        background: plan.highlighted ? '#18181b' : undefined
                      }}
                    >
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#8b5cf6', 
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '12px'
                      }}>
                        {plan.type}
                      </div>
                      <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                        {plan.title}
                      </h3>
                      <div style={{ marginBottom: '24px' }}>
                        <span style={{ fontSize: '40px', fontWeight: '700' }}>{plan.price}</span>
                        <span style={{ color: '#71717a' }}>{plan.per}</span>
                      </div>
                      <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                        {plan.features.map((feature, j) => (
                          <li key={j} style={{ 
                            padding: '8px 0', 
                            color: '#a1a1aa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <span style={{ color: '#22c55e' }}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button 
                        className={plan.highlighted ? 'btn-primary' : 'btn-secondary'}
                        style={{ width: '100%' }}
                      >
                        Kontakta oss
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================ */}
        {/* CHALLENGES LIST */}
        {/* ============================================ */}
        {currentView === 'challenges' && (
          <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ 
                fontFamily: "'Instrument Serif', serif",
                fontSize: '36px',
                marginBottom: '12px'
              }}>
                Challenges
              </h1>
              <p style={{ color: '#71717a' }}>
                Välj en challenge och testa dina prompt-skills i realtid.
              </p>
            </div>
            
            {/* User Progress */}
            <div className="stat-card" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Din progress</span>
                  <div style={{ fontSize: '24px', fontWeight: '600' }}>
                    Level {getLevel(user.xp)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#a78bfa', fontWeight: '600' }}>{user.xp} XP</span>
                  <span style={{ color: '#52525b' }}> / {getXpForNextLevel(user.xp)} XP</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${getXpProgress(user.xp)}%` }}
                />
              </div>
            </div>
            
            {/* Challenge Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {CHALLENGES.map((challenge, i) => (
                <div 
                  key={challenge.id}
                  className="card"
                  style={{ 
                    padding: '24px',
                    cursor: 'pointer',
                    animationDelay: `${i * 0.1}s`
                  }}
                  onClick={() => startChallenge(challenge)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{challenge.title}</h3>
                        <span className={`difficulty-badge difficulty-${challenge.difficulty === 'Nybörjare' ? 'beginner' : challenge.difficulty === 'Medel' ? 'medium' : 'advanced'}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <p style={{ color: '#71717a', marginBottom: '12px' }}>{challenge.scenario}</p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ color: '#52525b', fontSize: '13px' }}>
                          📁 {challenge.category}
                        </span>
                        <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '500' }}>
                          +{challenge.xp} XP
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8b5cf6',
                      fontSize: '20px'
                    }}>
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ACTIVE CHALLENGE */}
        {/* ============================================ */}
        {currentView === 'challenge-active' && selectedChallenge && (
          <div className="fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <button 
                onClick={() => setCurrentView('challenges')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Tillbaka till challenges
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '32px' }}>
                  {selectedChallenge.title}
                </h1>
                <span className={`difficulty-badge difficulty-${selectedChallenge.difficulty === 'Nybörjare' ? 'beginner' : selectedChallenge.difficulty === 'Medel' ? 'medium' : 'advanced'}`}>
                  {selectedChallenge.difficulty}
                </span>
                <span style={{ 
                  padding: '4px 12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '20px',
                  color: '#a78bfa',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  +{selectedChallenge.xp} XP
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: comparisonResult ? '1fr 1fr' : '1fr', gap: '24px' }}>
              {/* Left: Input Section */}
              <div>
                {/* Scenario */}
                <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8b5cf6', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px'
                  }}>
                    Scenario
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{selectedChallenge.scenario}</p>
                </div>

                {/* Task */}
                <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#fbbf24', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px'
                  }}>
                    Din uppgift
                  </div>
                  <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{selectedChallenge.task}</p>
                </div>

                {/* Hints Toggle */}
                <button
                  onClick={() => setShowHints(!showHints)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717a',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  💡 {showHints ? 'Dölj tips' : 'Visa tips'}
                </button>
                
                {showHints && (
                  <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(251, 191, 36, 0.05)', borderColor: 'rgba(251, 191, 36, 0.2)' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedChallenge.hints.map((hint, i) => (
                        <li key={i} style={{ color: '#fbbf24', fontSize: '14px' }}>
                          💡 {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prompt Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#52525b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '12px'
                  }}>
                    Din prompt
                  </label>
                  <textarea
                    ref={promptInputRef}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Skriv din prompt här..."
                    disabled={isProcessing || comparisonResult}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      background: '#0c0c0f',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      padding: '20px',
                      color: '#fafafa',
                      fontSize: '15px',
                      fontFamily: "'JetBrains Mono', monospace",
                      lineHeight: '1.7',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Button */}
                {!comparisonResult && (
                  <button
                    className="btn-primary"
                    onClick={submitPrompt}
                    disabled={!userPrompt.trim() || isProcessing}
                    style={{
                      width: '100%',
                      opacity: !userPrompt.trim() || isProcessing ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                        Kör AI-jämförelse...
                      </>
                    ) : (
                      <>
                        Testa min prompt ⚡
                      </>
                    )}
                  </button>
                )}

                {/* Try Again */}
                {comparisonResult && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setComparisonResult(null);
                        setUserPrompt('');
                      }}
                      style={{ flex: 1 }}
                    >
                      Försök igen
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => setCurrentView('challenges')}
                      style={{ flex: 1 }}
                    >
                      Nästa challenge →
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Results Section */}
              {comparisonResult && (
                <div className="slide-up">
                  {/* Score */}
                  <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                    <div 
                      className={`score-circle score-${comparisonResult.quality}`}
                      style={{ margin: '0 auto 20px' }}
                    >
                      <span>{comparisonResult.userResponse.score}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                      {comparisonResult.quality === 'good' ? '🎉 Utmärkt!' : comparisonResult.quality === 'medium' ? '👍 Bra jobbat!' : '💪 Fortsätt öva!'}
                    </div>
                    <div style={{ color: '#a78bfa', fontWeight: '600' }}>
                      +{comparisonResult.xpEarned} XP
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#ef4444', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '12px'
                    }}>
                      ❌ Dålig prompt → Dåligt resultat
                    </div>
                    <div className="code-block" style={{ marginBottom: '16px', fontSize: '12px', color: '#71717a' }}>
                      {comparisonResult.badPrompt}
                    </div>
                    <div style={{ 
                      background: '#0c0c0f', 
                      borderRadius: '8px', 
                      padding: '16px',
                      fontSize: '14px',
                      color: '#a1a1aa',
                      lineHeight: '1.6'
                    }}>
                      {comparisonResult.badResponse.result}
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      {comparisonResult.badResponse.issues.map((issue, i) => (
                        <span key={i} style={{ 
                          display: 'inline-block',
                          padding: '4px 10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          borderRadius: '4px',
                          fontSize: '12px',
                          marginRight: '8px',
                          marginBottom: '8px'
                        }}>
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#22c55e', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '12px'
                    }}>
                      ✓ Din prompt → Ditt resultat
                    </div>
                    <div className="code-block" style={{ marginBottom: '16px', fontSize: '12px', color: '#a78bfa' }}>
                      {comparisonResult.userPrompt}
                    </div>
                    <div style={{ 
                      background: '#0c0c0f', 
                      borderRadius: '8px', 
                      padding: '16px',
                      fontSize: '14px',
                      color: '#e4e4e7',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {comparisonResult.userResponse.result}
                    </div>
                    {comparisonResult.userResponse.issues.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>
                          Förbättringsförslag:
                        </div>
                        {comparisonResult.userResponse.issues.map((issue, i) => (
                          <span key={i} style={{ 
                            display: 'inline-block',
                            padding: '4px 10px',
                            background: 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginRight: '8px',
                            marginBottom: '8px'
                          }}>
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* TEACHER DASHBOARD */}
        {/* ============================================ */}
        {currentView === 'dashboard' && (
          <div className="fade-in" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'inline-block',
                padding: '6px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '6px',
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                LÄRARDASHBOARD
              </div>
              <h1 style={{ 
                fontFamily: "'Instrument Serif', serif",
                fontSize: '36px',
                marginBottom: '8px'
              }}>
                {CLASS_DATA.name}
              </h1>
              <p style={{ color: '#71717a' }}>{CLASS_DATA.school}</p>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {[
                { label: 'Elever', value: CLASS_DATA.students, icon: '👥' },
                { label: 'Aktiva idag', value: CLASS_DATA.activeToday, icon: '🟢' },
                { label: 'Snittpoäng', value: CLASS_DATA.avgScore + '%', icon: '📊' },
                { label: 'Avklarade challenges', value: CLASS_DATA.completedChallenges, icon: '✅' },
              ].map((stat, i) => (
                <div key={i} className="stat-card">
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{stat.value}</div>
                  <div style={{ color: '#71717a', fontSize: '14px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Left Column */}
              <div>
                {/* Recent Activity */}
                <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                    Senaste aktivitet
                  </h3>
                  {CLASS_DATA.recentActivity.map((activity, i) => (
                    <div 
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: i < CLASS_DATA.recentActivity.length - 1 ? '1px solid #27272a' : 'none'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '500' }}>{activity.student}</span>
                        <span style={{ color: '#71717a' }}> — {activity.action}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {activity.score && (
                          <span style={{ 
                            color: activity.score >= 80 ? '#4ade80' : activity.score >= 60 ? '#fbbf24' : '#f87171',
                            fontWeight: '600'
                          }}>
                            {activity.score}%
                          </span>
                        )}
                        <span style={{ color: '#52525b', fontSize: '13px' }}>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skill Distribution */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                    Kompetensfördelning
                  </h3>
                  {CLASS_DATA.skillDistribution.map((skill, i) => (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#a1a1aa' }}>{skill.skill}</span>
                        <span style={{ fontWeight: '600' }}>{skill.avg}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${skill.avg}%`,
                            background: skill.avg >= 75 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 
                                       skill.avg >= 65 ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                                       'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Leaderboard */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  🏆 Topplista
                </h3>
                {LEADERBOARD.slice(0, 8).map((student, i) => (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: i < 7 ? '1px solid #27272a' : 'none'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                 i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                                 i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                                 '#27272a',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {student.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#52525b' }}>{student.school}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#a78bfa', fontWeight: '600', fontSize: '14px' }}>{student.xp.toLocaleString()} XP</div>
                      <div style={{ fontSize: '11px', color: '#52525b' }}>Level {student.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PRICING */}
        {/* ============================================ */}
        {currentView === 'pricing' && (
          <div className="fade-in" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h1 style={{ 
                fontFamily: "'Instrument Serif', serif",
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                Enkel, transparent pricing
              </h1>
              <p style={{ color: '#71717a', fontSize: '18px' }}>
                Gratis för individer. Kraftfulla verktyg för organisationer.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {[
                {
                  name: 'Free',
                  price: '0',
                  period: 'för alltid',
                  description: 'Perfekt för att komma igång',
                  features: [
                    '5 challenges / månad',
                    'Grundläggande feedback',
                    'Personlig statistik',
                    'Community access'
                  ],
                  cta: 'Kom igång',
                  highlighted: false
                },
                {
                  name: 'Pro',
                  price: '99',
                  period: '/månad',
                  description: 'För seriösa AI-användare',
                  features: [
                    'Obegränsade challenges',
                    'Avancerad AI-feedback',
                    'Certifiering',
                    'Prioriterad support',
                    'Custom challenges'
                  ],
                  cta: 'Uppgradera',
                  highlighted: true
                },
                {
                  name: 'Team',
                  price: '499',
                  period: '/månad',
                  description: 'För team och småföretag',
                  features: [
                    'Allt i Pro',
                    'Upp till 10 användare',
                    'Team dashboard',
                    'Admin-verktyg',
                    'Slack-integration'
                  ],
                  cta: 'Kontakta oss',
                  highlighted: false
                }
              ].map((plan, i) => (
                <div 
                  key={i}
                  className={plan.highlighted ? 'gradient-border' : 'card'}
                  style={{ 
                    padding: '40px 32px',
                    background: plan.highlighted ? '#18181b' : undefined,
                    position: 'relative'
                  }}
                >
                  {plan.highlighted && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 16px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      POPULÄRAST
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                      {plan.name}
                    </h3>
                    <p style={{ color: '#71717a', fontSize: '14px' }}>{plan.description}</p>
                  </div>
                  
                  <div style={{ marginBottom: '32px' }}>
                    <span style={{ fontSize: '48px', fontWeight: '700' }}>{plan.price} kr</span>
                    <span style={{ color: '#71717a' }}>{plan.period}</span>
                  </div>
                  
                  <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                    {plan.features.map((feature, j) => (
                      <li key={j} style={{
                        padding: '10px 0',
                        borderBottom: '1px solid #27272a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#a1a1aa'
                      }}>
                        <span style={{ color: '#22c55e' }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={plan.highlighted ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%' }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Enterprise Section */}
            <div 
              className="card" 
              style={{ 
                marginTop: '48px', 
                padding: '48px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '40px',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '6px',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  ENTERPRISE
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px' }}>
                  Skräddarsytt för din organisation
                </h3>
                <p style={{ color: '#71717a', fontSize: '16px', lineHeight: '1.6' }}>
                  Skolor, universitet, myndigheter och stora företag får specialanpassade lösningar med 
                  volympriser, SSO, LMS-integration, compliance-dokumentation och dedikerad support.
                </p>
              </div>
              <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Boka demo →
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
