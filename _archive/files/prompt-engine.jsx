import React, { useState, useEffect, useRef } from 'react';

// Intent Analysis Engine
const analyzeIntent = (input) => {
  const lowered = input.toLowerCase();
  
  // Task type detection
  let taskType = 'general';
  let complexity = 'medium';
  let suggestedTools = [];
  let missingInfo = [];
  
  // App/Build detection
  if (lowered.match(/build|create|make|develop|app|website|platform|saas|tool|software/)) {
    taskType = 'app_build';
    suggestedTools = ['Lovable', 'v0', 'Cursor', 'Bolt'];
    
    if (lowered.match(/netflix|spotify|uber|airbnb|chatgpt|google|facebook|instagram|tiktok/)) {
      complexity = 'unrealistic_as_stated';
      missingInfo.push('scope_clarification');
    } else if (lowered.match(/mvp|simple|basic|prototype/)) {
      complexity = 'achievable';
    } else {
      complexity = 'needs_scoping';
      missingInfo.push('feature_scope');
    }
    
    if (!lowered.match(/user|account|login|auth/)) {
      missingInfo.push('user_management');
    }
    if (!lowered.match(/mobile|web|desktop/)) {
      missingInfo.push('platform');
    }
  }
  
  // Research detection
  else if (lowered.match(/research|find|search|learn|understand|explore|investigate/)) {
    taskType = 'research';
    suggestedTools = ['Claude', 'ChatGPT', 'Perplexity'];
    complexity = 'achievable';
    
    if (!lowered.match(/about|on|regarding|topic/)) {
      missingInfo.push('research_topic');
    }
    if (!lowered.match(/deep|comprehensive|quick|brief/)) {
      missingInfo.push('depth_level');
    }
  }
  
  // Writing detection
  else if (lowered.match(/write|draft|compose|create.*content|blog|article|email|copy/)) {
    taskType = 'writing';
    suggestedTools = ['Claude', 'ChatGPT'];
    complexity = 'achievable';
    
    if (!lowered.match(/tone|style|voice/)) {
      missingInfo.push('tone_style');
    }
    if (!lowered.match(/audience|for|reader/)) {
      missingInfo.push('target_audience');
    }
  }
  
  // Analysis detection
  else if (lowered.match(/analyze|summarize|extract|review|assess|evaluate/)) {
    taskType = 'analysis';
    suggestedTools = ['Claude', 'ChatGPT'];
    complexity = 'achievable';
    
    if (!lowered.match(/pdf|document|file|data|report/)) {
      missingInfo.push('source_material');
    }
  }
  
  // Automation detection
  else if (lowered.match(/automate|workflow|integrate|connect|bot|script/)) {
    taskType = 'automation';
    suggestedTools = ['Claude', 'ChatGPT', 'Zapier', 'Make'];
    complexity = 'needs_scoping';
    missingInfo.push('trigger_conditions', 'expected_output');
  }
  
  // Business/Strategy detection
  else if (lowered.match(/business|plan|strategy|market|launch|startup|monetize/)) {
    taskType = 'business_strategy';
    suggestedTools = ['Claude', 'ChatGPT'];
    complexity = 'achievable';
    
    if (!lowered.match(/industry|market|sector/)) {
      missingInfo.push('industry_context');
    }
  }
  
  return {
    taskType,
    complexity,
    suggestedTools,
    missingInfo,
    rawInput: input
  };
};

// Generate clarifying questions based on analysis
const generateQuestions = (analysis) => {
  const questions = [];
  const { taskType, missingInfo, complexity } = analysis;
  
  if (complexity === 'unrealistic_as_stated') {
    questions.push({
      id: 'scope',
      question: "That's an ambitious vision. What specific piece would you like to build first?",
      options: ['Core MVP with 1-2 features', 'A prototype/demo', 'Full feature clone', 'Just the concept/design'],
      type: 'select'
    });
  }
  
  if (missingInfo.includes('feature_scope')) {
    questions.push({
      id: 'features',
      question: "What are the 1-3 most important features?",
      type: 'text',
      placeholder: "e.g., User profiles, search functionality, payment processing"
    });
  }
  
  if (missingInfo.includes('user_management') && taskType === 'app_build') {
    questions.push({
      id: 'auth',
      question: "Do users need to create accounts?",
      options: ['Yes, with full auth', 'Simple login only', 'No accounts needed'],
      type: 'select'
    });
  }
  
  if (missingInfo.includes('platform')) {
    questions.push({
      id: 'platform',
      question: "What platform should this run on?",
      options: ['Web (browser)', 'Mobile app', 'Desktop app', 'All platforms'],
      type: 'select'
    });
  }
  
  if (missingInfo.includes('research_topic')) {
    questions.push({
      id: 'topic',
      question: "What specific topic or question do you want to research?",
      type: 'text',
      placeholder: "Be as specific as possible"
    });
  }
  
  if (missingInfo.includes('depth_level')) {
    questions.push({
      id: 'depth',
      question: "How deep should this research go?",
      options: ['Quick overview (5 min read)', 'Comprehensive analysis', 'Expert-level deep dive'],
      type: 'select'
    });
  }
  
  if (missingInfo.includes('tone_style')) {
    questions.push({
      id: 'tone',
      question: "What tone should the writing have?",
      options: ['Professional/Formal', 'Casual/Conversational', 'Technical/Expert', 'Persuasive/Sales'],
      type: 'select'
    });
  }
  
  if (missingInfo.includes('target_audience')) {
    questions.push({
      id: 'audience',
      question: "Who is the intended audience?",
      type: 'text',
      placeholder: "e.g., Technical developers, C-suite executives, general consumers"
    });
  }
  
  // Limit to 5 questions max
  return questions.slice(0, 5);
};

// Generate constraints and criteria
const generateCriteria = (analysis, answers) => {
  const { taskType, complexity, suggestedTools } = analysis;
  
  let scope = 'MVP';
  let timeEstimate = '2-4 hours';
  let costEstimate = 'Free - $50';
  let nonGoals = [];
  
  if (taskType === 'app_build') {
    if (answers.scope === 'Full feature clone') {
      scope = 'Full Product';
      timeEstimate = '40-200+ hours';
      costEstimate = '$500 - $50,000+';
      nonGoals = ['Production-grade security', 'Scalability for millions of users', 'Complete feature parity'];
    } else if (answers.scope === 'Core MVP with 1-2 features') {
      scope = 'Focused MVP';
      timeEstimate = '4-16 hours';
      costEstimate = '$0 - $100';
      nonGoals = ['Advanced features', 'Mobile optimization', 'Analytics integration'];
    } else {
      scope = 'Prototype';
      timeEstimate = '1-4 hours';
      costEstimate = 'Free';
      nonGoals = ['Backend functionality', 'Data persistence', 'User authentication'];
    }
  } else if (taskType === 'research') {
    if (answers.depth === 'Expert-level deep dive') {
      scope = 'Comprehensive Research';
      timeEstimate = '30-60 minutes';
    } else {
      scope = 'Quick Research';
      timeEstimate = '5-15 minutes';
    }
    nonGoals = ['Original primary research', 'Real-time data', 'Guaranteed accuracy'];
  } else if (taskType === 'writing') {
    scope = 'Content Draft';
    timeEstimate = '5-20 minutes';
    costEstimate = 'Free';
    nonGoals = ['SEO optimization', 'Graphic design', 'Publishing'];
  }
  
  return {
    scope,
    timeEstimate,
    costEstimate,
    suggestedTools,
    nonGoals,
    taskType
  };
};

// Generate the final execution prompt
const generatePrompts = (analysis, answers, criteria) => {
  const { taskType, rawInput } = analysis;
  const { scope, nonGoals } = criteria;
  
  let safePrompt = '';
  let ambitiousPrompt = '';
  
  if (taskType === 'app_build') {
    const features = answers.features || 'core functionality';
    const platform = answers.platform || 'Web (browser)';
    const auth = answers.auth || 'No accounts needed';
    
    safePrompt = `# EXECUTION PROMPT: ${scope} Build

## OBJECTIVE
Build a working ${platform.toLowerCase()} application based on this concept: "${rawInput}"

## SCOPE: ${scope}
This is a focused build. Do NOT attempt to create a full-scale production application.

## CORE REQUIREMENTS
1. Platform: ${platform}
2. Authentication: ${auth}
3. Priority Features: ${features}

## TECHNICAL CONSTRAINTS
- Use modern, well-supported frameworks only
- Prioritize code simplicity over optimization
- All UI must be functional, not placeholder
- Include basic error handling
- Mobile-responsive design required

## NON-GOALS (Do NOT build these)
${nonGoals.map(ng => `- ${ng}`).join('\n')}

## EXECUTION STEPS
1. Create project structure and dependencies
2. Build core data model/schema
3. Implement primary user flow
4. Add basic styling and responsiveness
5. Test all interactive elements
6. Document any setup requirements

## OUTPUT FORMAT
Deliver:
- Complete, runnable code
- Brief setup instructions (max 5 steps)
- List of any external services needed

## SUCCESS CRITERIA
The application must:
- Load without errors
- Complete the primary user flow
- Look presentable (not polished, but clean)
- Work on the specified platform`;

    ambitiousPrompt = `# EXECUTION PROMPT: Ambitious ${rawInput} Build

## OBJECTIVE
Build a feature-rich application that demonstrates the full vision: "${rawInput}"

## SCOPE: Extended MVP
Push beyond basics while maintaining deliverability.

## CORE REQUIREMENTS
1. Platform: ${platform} with mobile optimization
2. Authentication: Full user system with profiles
3. Features: ${features} + secondary features
4. Data: Real persistence layer
5. Polish: Production-quality UI/UX

## TECHNICAL STACK (Recommended)
- Frontend: React/Next.js or Vue
- Backend: Node.js or Supabase
- Database: PostgreSQL or Firebase
- Styling: Tailwind CSS
- Deployment: Vercel or Netlify

## FEATURE EXPANSION
Beyond core features, include:
- User onboarding flow
- Settings/preferences
- Basic analytics tracking
- Email notifications (optional)
- Social sharing capability

## NON-GOALS (Still excluded)
- Enterprise-grade security audit
- Multi-region deployment
- 99.9% uptime guarantee
- Complete accessibility compliance

## EXECUTION STEPS
1. Architecture planning (data model, API design)
2. Authentication and user management
3. Core feature implementation
4. Secondary features
5. UI polish and animations
6. Testing and bug fixes
7. Deployment configuration
8. Documentation

## OUTPUT FORMAT
Deliver:
- Complete source code with clear structure
- Database schema
- API documentation
- Deployment guide
- Known limitations list

## TRADEOFFS ACKNOWLEDGED
This ambitious scope means:
- Longer development time (3-5x the safe version)
- More potential points of failure
- May require iteration after initial build
- Some features may need simplification

## SUCCESS CRITERIA
- All listed features functional
- Professional appearance
- Smooth user experience
- Deployable to production environment`;
  }
  
  else if (taskType === 'research') {
    const topic = answers.topic || rawInput;
    const depth = answers.depth || 'Comprehensive analysis';
    
    safePrompt = `# EXECUTION PROMPT: Research Task

## OBJECTIVE
Research and synthesize information on: "${topic}"

## DEPTH LEVEL: ${depth}

## RESEARCH PARAMETERS
- Focus on factual, verifiable information
- Cite sources where possible
- Distinguish between established facts and opinions
- Note any significant controversies or debates

## STRUCTURE REQUIREMENTS
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Detailed Analysis (organized by subtopic)
4. Limitations and Gaps
5. Recommended Next Steps

## NON-GOALS
${nonGoals.map(ng => `- ${ng}`).join('\n')}

## OUTPUT FORMAT
- Use clear headers and subheaders
- Include specific examples and data points
- Maximum length: 1500 words for comprehensive, 500 for quick
- End with actionable takeaways

## SUCCESS CRITERIA
- Directly answers the core question
- Provides specific, useful information
- Acknowledges uncertainty where appropriate
- Reader can take action based on findings`;

    ambitiousPrompt = `# EXECUTION PROMPT: Deep Research Analysis

## OBJECTIVE
Conduct expert-level research synthesis on: "${topic}"

## DEPTH LEVEL: Comprehensive Expert Analysis

## RESEARCH SCOPE
- Primary analysis of the core topic
- Secondary analysis of related factors
- Historical context and evolution
- Future trends and predictions
- Multiple perspectives and frameworks

## ENHANCED STRUCTURE
1. Executive Summary
2. Background and Context
3. Current State Analysis
4. Key Stakeholders and Perspectives
5. Data and Evidence Review
6. Competing Theories/Approaches
7. Case Studies (2-3 relevant examples)
8. Future Outlook
9. Recommendations by Audience Type
10. Further Reading and Resources

## ANALYTICAL FRAMEWORKS
Apply relevant frameworks such as:
- SWOT Analysis (if applicable)
- First Principles Thinking
- Comparative Analysis
- Trend Extrapolation

## OUTPUT FORMAT
- Structured document with clear navigation
- Data visualizations described where helpful
- Source quality ratings
- Confidence levels for predictions
- Maximum length: 3000-5000 words

## TRADEOFFS
- Takes significantly longer to produce
- May surface complexity that requires further research
- Some sections may have limited available information`;
  }
  
  else if (taskType === 'writing') {
    const tone = answers.tone || 'Professional/Formal';
    const audience = answers.audience || 'general audience';
    
    safePrompt = `# EXECUTION PROMPT: Content Writing

## OBJECTIVE
Write content based on: "${rawInput}"

## PARAMETERS
- Tone: ${tone}
- Target Audience: ${audience}
- Length: Appropriate to format (specify if needed)

## WRITING REQUIREMENTS
1. Clear, engaging opening
2. Logical structure and flow
3. Specific examples and details
4. Strong conclusion with takeaway

## STYLE GUIDELINES
- Active voice preferred
- Vary sentence length
- Avoid jargon unless audience-appropriate
- Include transitions between sections

## NON-GOALS
- SEO keyword stuffing
- Clickbait tactics
- Unsubstantiated claims

## OUTPUT FORMAT
- Ready-to-use content
- Suggested headlines/titles (3 options)
- Brief note on recommended edits

## SUCCESS CRITERIA
- Matches requested tone
- Appropriate for target audience
- Achieves stated purpose
- Reads naturally`;

    ambitiousPrompt = `# EXECUTION PROMPT: Premium Content Creation

## OBJECTIVE
Create exceptional content: "${rawInput}"

## PARAMETERS
- Tone: ${tone} with distinctive voice
- Target Audience: ${audience}
- Length: Comprehensive treatment

## CONTENT ELEVATION
Beyond basic requirements:
- Unique angle or perspective
- Memorable opening hook
- Data or research integration
- Expert quotes (suggested)
- Visual content recommendations
- Social media snippets included

## STRUCTURE
1. Attention-grabbing headline
2. Hook paragraph
3. Problem/context establishment
4. Core content (multiple sections)
5. Supporting evidence
6. Counter-arguments addressed
7. Actionable conclusion
8. Call-to-action

## DELIVERABLES
- Main content piece
- 5 headline variations
- 3 social media posts (Twitter, LinkedIn, other)
- Meta description
- Suggested imagery descriptions
- Email subject lines (if applicable)

## TRADEOFFS
- Longer production time
- May require subject matter verification
- Some suggestions may need customization`;
  }
  
  else {
    // General/catch-all prompt
    safePrompt = `# EXECUTION PROMPT: Task Completion

## OBJECTIVE
${rawInput}

## APPROACH
1. Understand the core request
2. Break into actionable steps
3. Execute systematically
4. Verify output quality

## CONSTRAINTS
- Focus on the stated objective
- Ask clarifying questions if blocked
- Provide practical, actionable output

## OUTPUT FORMAT
- Clear, organized response
- Step-by-step if applicable
- Summary of what was delivered

## SUCCESS CRITERIA
- Directly addresses the request
- Provides useful, actionable output
- Acknowledges any limitations`;

    ambitiousPrompt = `# EXECUTION PROMPT: Comprehensive Task Execution

## OBJECTIVE
${rawInput}

## ENHANCED APPROACH
1. Analyze request from multiple angles
2. Identify implicit requirements
3. Plan comprehensive solution
4. Execute with attention to detail
5. Provide extended value

## SCOPE EXPANSION
Beyond the stated request:
- Anticipate follow-up needs
- Provide context and background
- Suggest related improvements
- Include implementation guidance

## OUTPUT FORMAT
- Detailed, thorough response
- Multiple options where applicable
- Supporting documentation
- Next steps recommendation

## SUCCESS CRITERIA
- Exceeds basic requirements
- Provides lasting value
- Enables independent follow-up`;
  }
  
  return { safePrompt, ambitiousPrompt };
};

// Tool-specific adaptations
const adaptForTool = (prompt, tool) => {
  const toolPrefixes = {
    'Lovable': `You are building in Lovable. Generate a complete, deployable web application.\n\n`,
    'v0': `Generate a React component with Tailwind CSS styling.\n\n`,
    'Cursor': `You are working in Cursor IDE. Generate complete, production-ready code with proper file structure.\n\n`,
    'Claude': ``,
    'ChatGPT': ``,
    'Bolt': `You are building in Bolt. Create a full-stack application with the following specifications:\n\n`
  };
  
  return (toolPrefixes[tool] || '') + prompt;
};

// Main Application Component
export default function PromptEngine() {
  const [stage, setStage] = useState('input'); // input, clarifying, reality_check, output
  const [userInput, setUserInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [criteria, setCriteria] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [selectedTool, setSelectedTool] = useState('Claude');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (stage === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stage]);

  const handleSubmitIdea = () => {
    if (!userInput.trim()) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const result = analyzeIntent(userInput);
      setAnalysis(result);
      
      const qs = generateQuestions(result);
      setQuestions(qs);
      
      if (qs.length > 0) {
        setStage('clarifying');
      } else {
        const crit = generateCriteria(result, {});
        setCriteria(crit);
        setStage('reality_check');
      }
      
      setIsProcessing(false);
    }, 800);
  };

  const handleAnswerQuestion = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswers = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const crit = generateCriteria(analysis, answers);
      setCriteria(crit);
      setStage('reality_check');
      setIsProcessing(false);
    }, 600);
  };

  const handleConfirmUnderstanding = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const generated = generatePrompts(analysis, answers, criteria);
      setPrompts(generated);
      setStage('output');
      setIsProcessing(false);
    }, 800);
  };

  const handleRevise = () => {
    if (questions.length > 0) {
      setStage('clarifying');
    } else {
      setStage('input');
    }
  };

  const handleStartOver = () => {
    setStage('input');
    setUserInput('');
    setAnalysis(null);
    setQuestions([]);
    setAnswers({});
    setCriteria(null);
    setPrompts(null);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(adaptForTool(text, selectedTool));
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTaskTypeLabel = (type) => {
    const labels = {
      'app_build': 'Application Build',
      'research': 'Research Task',
      'writing': 'Content Writing',
      'analysis': 'Analysis Task',
      'automation': 'Automation Setup',
      'business_strategy': 'Business Strategy',
      'general': 'General Task'
    };
    return labels[type] || 'Task';
  };

  const getComplexityBadge = (complexity) => {
    const styles = {
      'achievable': { bg: '#0a2f1f', color: '#34d399', label: 'Achievable' },
      'needs_scoping': { bg: '#2a2000', color: '#fbbf24', label: 'Needs Scoping' },
      'unrealistic_as_stated': { bg: '#2a0a0a', color: '#f87171', label: 'Needs Refinement' },
      'medium': { bg: '#1a1a2e', color: '#818cf8', label: 'Medium Complexity' }
    };
    return styles[complexity] || styles.medium;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
      color: '#e4e4e7',
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Fraunces:wght@600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        ::selection {
          background: #6366f1;
          color: white;
        }
        
        textarea:focus, input:focus, button:focus {
          outline: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .processing-dot {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .prompt-box {
          background: linear-gradient(135deg, #12121a 0%, #0d0d14 100%);
          border: 1px solid #1f1f2e;
          border-radius: 12px;
          padding: 24px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
          max-height: 500px;
          overflow-y: auto;
          color: #a1a1aa;
        }
        
        .prompt-box::-webkit-scrollbar {
          width: 6px;
        }
        
        .prompt-box::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .prompt-box::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        
        .tool-button {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #27272a;
          background: transparent;
          color: #71717a;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tool-button:hover {
          border-color: #3f3f46;
          color: #a1a1aa;
        }
        
        .tool-button.active {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
        }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '60px', textAlign: 'center' }} className="fade-in">
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ⚡
            </div>
            <h1 style={{ 
              fontFamily: "'Fraunces', serif",
              fontSize: '32px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Prompt Engine
            </h1>
          </div>
          <p style={{ 
            color: '#71717a', 
            fontSize: '15px',
            margin: 0,
            fontWeight: '300'
          }}>
            Transform raw ideas into execution-ready AI prompts
          </p>
        </header>

        {/* Stage: Input */}
        {stage === 'input' && (
          <div className="fade-in">
            <div style={{
              background: 'linear-gradient(135deg, #12121a 0%, #0d0d14 100%)',
              border: '1px solid #1f1f2e',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#52525b',
                marginBottom: '16px'
              }}>
                What do you want to create?
              </label>
              
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your idea, no matter how vague or ambitious..."
                style={{
                  width: '100%',
                  minHeight: '140px',
                  background: '#0a0a0f',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  padding: '20px',
                  color: '#e4e4e7',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3f3f46'}
                onBlur={(e) => e.target.style.borderColor = '#27272a'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleSubmitIdea();
                  }
                }}
              />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px'
              }}>
                <span style={{ fontSize: '13px', color: '#52525b' }}>
                  Press ⌘ + Enter to continue
                </span>
                
                <button
                  onClick={handleSubmitIdea}
                  disabled={!userInput.trim() || isProcessing}
                  style={{
                    padding: '12px 28px',
                    background: userInput.trim() 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : '#27272a',
                    border: 'none',
                    borderRadius: '10px',
                    color: userInput.trim() ? 'white' : '#52525b',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span className="processing-dot">●</span>
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze Intent
                      <span style={{ opacity: 0.7 }}>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Example prompts */}
            <div style={{ marginTop: '32px' }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#52525b', 
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Try an example
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Build a habit tracking app',
                  'Create the next Netflix',
                  'Research AI trends in 2025',
                  'Write a product launch email'
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setUserInput(example)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #27272a',
                      borderRadius: '20px',
                      color: '#71717a',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3f3f46';
                      e.target.style.color = '#a1a1aa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#27272a';
                      e.target.style.color = '#71717a';
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage: Clarifying Questions */}
        {stage === 'clarifying' && (
          <div className="fade-in">
            <div style={{
              background: 'linear-gradient(135deg, #12121a 0%, #0d0d14 100%)',
              border: '1px solid #1f1f2e',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  💡
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
                    A few quick questions
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#71717a' }}>
                    To generate the best prompt for your "{analysis?.rawInput}"
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className="slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#e4e4e7',
                      marginBottom: '12px'
                    }}>
                      <span style={{ 
                        color: '#6366f1', 
                        fontWeight: '500',
                        marginRight: '8px'
                      }}>
                        {index + 1}.
                      </span>
                      {q.question}
                    </label>
                    
                    {q.type === 'select' ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {q.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleAnswerQuestion(q.id, option)}
                            style={{
                              padding: '10px 18px',
                              background: answers[q.id] === option 
                                ? 'rgba(99, 102, 241, 0.15)' 
                                : 'transparent',
                              border: `1px solid ${answers[q.id] === option ? '#6366f1' : '#27272a'}`,
                              borderRadius: '8px',
                              color: answers[q.id] === option ? '#a5b4fc' : '#71717a',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerQuestion(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: '#0a0a0f',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          color: '#e4e4e7',
                          fontSize: '14px',
                          fontFamily: 'inherit'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid #1f1f2e'
              }}>
                <button
                  onClick={() => setStage('input')}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#71717a',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                
                <button
                  onClick={handleSubmitAnswers}
                  disabled={isProcessing}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span className="processing-dot">●</span>
                      Processing
                    </>
                  ) : (
                    <>
                      Continue
                      <span style={{ opacity: 0.7 }}>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage: Reality Check */}
        {stage === 'reality_check' && criteria && (
          <div className="fade-in">
            <div style={{
              background: 'linear-gradient(135deg, #12121a 0%, #0d0d14 100%)',
              border: '1px solid #1f1f2e',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '28px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  ✓
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
                    Have I understood you correctly?
                  </h2>
                </div>
              </div>

              {/* Interpreted Intent */}
              <div style={{
                background: '#0a0a0f',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#52525b',
                  marginTop: 0,
                  marginBottom: '16px'
                }}>
                  Interpreted Intent
                </h3>
                
                <p style={{ 
                  fontSize: '16px', 
                  color: '#e4e4e7',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  You want to <strong style={{ color: '#a5b4fc' }}>
                    {getTaskTypeLabel(criteria.taskType).toLowerCase()}
                  </strong> based on: <em>"{analysis?.rawInput}"</em>
                </p>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '8px', 
                  marginTop: '16px' 
                }}>
                  <span style={{
                    padding: '6px 12px',
                    background: getComplexityBadge(analysis?.complexity).bg,
                    color: getComplexityBadge(analysis?.complexity).color,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getComplexityBadge(analysis?.complexity).label}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: '#1a1a2e',
                    color: '#818cf8',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {criteria.scope}
                  </span>
                </div>
              </div>

              {/* Criteria Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: '#0a0a0f',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '6px' }}>
                    Estimated Time
                  </div>
                  <div style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: '500' }}>
                    {criteria.timeEstimate}
                  </div>
                </div>
                
                <div style={{
                  background: '#0a0a0f',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '6px' }}>
                    Estimated Cost
                  </div>
                  <div style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: '500' }}>
                    {criteria.costEstimate}
                  </div>
                </div>
                
                <div style={{
                  background: '#0a0a0f',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '6px' }}>
                    Recommended Tools
                  </div>
                  <div style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: '500' }}>
                    {criteria.suggestedTools.slice(0, 3).join(', ')}
                  </div>
                </div>
                
                <div style={{
                  background: '#0a0a0f',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '6px' }}>
                    Task Type
                  </div>
                  <div style={{ fontSize: '15px', color: '#e4e4e7', fontWeight: '500' }}>
                    {getTaskTypeLabel(criteria.taskType)}
                  </div>
                </div>
              </div>

              {/* Non-Goals */}
              {criteria.nonGoals.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#f87171', 
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    NOT INCLUDED IN SCOPE
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '18px',
                    color: '#a1a1aa',
                    fontSize: '13px',
                    lineHeight: '1.8'
                  }}>
                    {criteria.nonGoals.map((ng, i) => (
                      <li key={i}>{ng}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '24px',
                borderTop: '1px solid #1f1f2e'
              }}>
                <button
                  onClick={handleRevise}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#71717a',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ← Revise
                </button>
                
                <button
                  onClick={handleConfirmUnderstanding}
                  disabled={isProcessing}
                  style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <span className="processing-dot">●</span>
                      Generating
                    </>
                  ) : (
                    <>
                      Yes, generate prompts
                      <span style={{ opacity: 0.7 }}>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage: Output */}
        {stage === 'output' && prompts && (
          <div className="fade-in">
            {/* Tool Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '13px', color: '#52525b', marginRight: '8px' }}>
                Optimize for:
              </span>
              {criteria.suggestedTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  className={`tool-button ${selectedTool === tool ? 'active' : ''}`}
                >
                  {tool}
                </button>
              ))}
            </div>

            {/* Safe/MVP Prompt */}
            <div style={{
              background: 'linear-gradient(135deg, #12121a 0%, #0d0d14 100%)',
              border: '1px solid #1f1f2e',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#4ade80',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Safe / MVP
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {selectedTool}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    Low Risk, High Success Rate
                  </h3>
                </div>
                
                <button
                  onClick={() => copyToClipboard(prompts.safePrompt, 'safe')}
                  style={{
                    padding: '10px 20px',
                    background: copied === 'safe' ? '#22c55e' : '#27272a',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied === 'safe' ? '✓ Copied!' : '📋 Copy Prompt'}
                </button>
              </div>
              
              <div className="prompt-box">
                {adaptForTool(prompts.safePrompt, selectedTool)}
              </div>
            </div>

            {/* Ambitious Prompt */}
            <div style={{
              background: 'linear-gradient(135deg, #12121a 0%, #0d0d14 100%)',
              border: '1px solid #1f1f2e',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: '#fbbf24',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Ambitious
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '500'
                    }}>
                      {selectedTool}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                    Larger Scope, Clear Tradeoffs
                  </h3>
                </div>
                
                <button
                  onClick={() => copyToClipboard(prompts.ambitiousPrompt, 'ambitious')}
                  style={{
                    padding: '10px 20px',
                    background: copied === 'ambitious' ? '#22c55e' : '#27272a',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied === 'ambitious' ? '✓ Copied!' : '📋 Copy Prompt'}
                </button>
              </div>
              
              <div className="prompt-box">
                {adaptForTool(prompts.ambitiousPrompt, selectedTool)}
              </div>
            </div>

            {/* Start Over */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginTop: '32px'
            }}>
              <button
                onClick={handleStartOver}
                style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  color: '#71717a',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3f3f46';
                  e.target.style.color = '#a1a1aa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#27272a';
                  e.target.style.color = '#71717a';
                }}
              >
                ← Start a new prompt
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          marginTop: '80px',
          paddingTop: '24px',
          borderTop: '1px solid #1f1f2e',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#3f3f46',
            margin: 0
          }}>
            Prompt Engine · Transform ideas into execution-ready AI prompts
          </p>
        </footer>
      </div>
    </div>
  );
}
