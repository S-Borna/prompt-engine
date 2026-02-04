import React, { useState, useEffect, useRef } from 'react';

// ============================================
// KODA — From Idea to App in Seconds
// ============================================
// A real alternative to Lovable/v0/Bolt
// 
// Core principle: 
// Take ANY idea → Optimize it internally → 
// Generate production code → Show live preview
//
// The user never sees the "prompt engineering"
// They just see their idea become real.
// ============================================

// ============================================
// PROMPT OPTIMIZATION ENGINE (Hidden from user)
// This is where the magic happens - we take
// a vague idea and turn it into a perfect prompt
// ============================================
const optimizePromptForAppGeneration = (userIdea, previousCode = null, iterationRequest = null) => {
  const isIteration = previousCode && iterationRequest;
  
  if (isIteration) {
    return `You are an expert React developer. You have previously generated this code:

\`\`\`jsx
${previousCode}
\`\`\`

The user wants you to modify it with this request: "${iterationRequest}"

Rules:
1. Return ONLY the complete, modified JSX code
2. Keep all existing functionality unless explicitly asked to remove it
3. Maintain the same coding style and structure
4. Use Tailwind CSS for all styling
5. The component must be a default export
6. Do not include any explanation, just the code
7. Do not wrap in markdown code blocks

Return the complete modified component:`;
  }
  
  return `You are an expert React developer building a production-quality web application.

USER'S IDEA: "${userIdea}"

YOUR TASK: Generate a complete, working React component that brings this idea to life.

TECHNICAL REQUIREMENTS:
1. Use React with hooks (useState, useEffect, useCallback as needed)
2. Use Tailwind CSS for ALL styling (no inline styles, no CSS files)
3. Make it visually polished — not a prototype, a real product
4. Include realistic sample data where appropriate
5. Add micro-interactions and hover states
6. Make it fully responsive
7. Use a cohesive color scheme (prefer dark themes with accent colors)
8. Include proper spacing, typography hierarchy, and visual balance

COMPONENT STRUCTURE:
- Must be a single file with a default export
- Can include multiple sub-components defined in the same file
- All state should be functional with hooks
- Include helpful comments for complex logic

UI/UX REQUIREMENTS:
- Professional, modern aesthetic
- Clear visual hierarchy
- Intuitive interactions
- Loading states where appropriate
- Empty states with helpful messaging
- Error handling with user-friendly messages

DO NOT:
- Use external images (use colored divs, emojis, or SVG placeholders)
- Import external libraries (only React)
- Include any explanation or markdown
- Wrap code in code blocks
- Add installation instructions

RETURN ONLY THE COMPLETE JSX CODE, NOTHING ELSE.`;
};

// ============================================
// API INTEGRATION STRUCTURE
// Replace simulateAIResponse with real Claude API
// ============================================
const generateAppCode = async (userIdea, previousCode = null, iterationRequest = null) => {
  // Simulate API delay for demo
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
  
  /* 
  ============================================
  PRODUCTION IMPLEMENTATION:
  ============================================
  
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt: optimizePromptForAppGeneration(userIdea, previousCode, iterationRequest),
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000
    })
  });
  
  const { code } = await response.json();
  return code;
  
  ============================================
  BACKEND (/api/generate):
  ============================================
  
  import Anthropic from '@anthropic-ai/sdk';
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  export async function POST(req) {
    const { prompt, model, max_tokens } = await req.json();
    
    const message = await anthropic.messages.create({
      model,
      max_tokens,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return Response.json({ code: message.content[0].text });
  }
  
  ============================================
  */
  
  // For demo: Return pre-built examples based on keywords
  const idea = userIdea.toLowerCase();
  
  if (idea.includes('habit') || idea.includes('tracker') || idea.includes('vana')) {
    return HABIT_TRACKER_CODE;
  } else if (idea.includes('todo') || idea.includes('task') || idea.includes('uppgift')) {
    return TODO_APP_CODE;
  } else if (idea.includes('dashboard') || idea.includes('analytics')) {
    return DASHBOARD_CODE;
  } else if (idea.includes('landing') || idea.includes('startup') || idea.includes('saas')) {
    return LANDING_PAGE_CODE;
  } else if (idea.includes('chat') || idea.includes('meddelande') || idea.includes('message')) {
    return CHAT_APP_CODE;
  } else if (idea.includes('portfolio') || idea.includes('cv') || idea.includes('resume')) {
    return PORTFOLIO_CODE;
  } else {
    return DEFAULT_APP_CODE;
  }
};

// ============================================
// PRE-BUILT APP TEMPLATES (For demo)
// In production, Claude generates these live
// ============================================

const HABIT_TRACKER_CODE = `export default function HabitTracker() {
  const [habits, setHabits] = React.useState([
    { id: 1, name: 'Morning meditation', streak: 12, completedToday: true, color: 'violet' },
    { id: 2, name: 'Read 30 minutes', streak: 8, completedToday: false, color: 'emerald' },
    { id: 3, name: 'Exercise', streak: 5, completedToday: true, color: 'amber' },
    { id: 4, name: 'No social media', streak: 3, completedToday: false, color: 'rose' },
  ]);
  const [newHabit, setNewHabit] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);

  const toggleHabit = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak - 1 } : h
    ));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const colors = ['violet', 'emerald', 'amber', 'rose', 'cyan', 'fuchsia'];
    setHabits([...habits, {
      id: Date.now(),
      name: newHabit,
      streak: 0,
      completedToday: false,
      color: colors[Math.floor(Math.random() * colors.length)]
    }]);
    setNewHabit('');
    setShowAdd(false);
  };

  const totalCompleted = habits.filter(h => h.completedToday).length;
  const progressPercent = habits.length > 0 ? (totalCompleted / habits.length) * 100 : 0;

  const colorClasses = {
    violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    rose: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Today's Habits</h1>
            <span className="text-sm text-zinc-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">{totalCompleted} of {habits.length} completed</span>
              <span className="text-violet-400 font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                style={{ width: progressPercent + '%' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={\`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] \${
                habit.completedToday 
                  ? colorClasses[habit.color]
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }\`}
            >
              <div className="flex items-center gap-4">
                <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all \${
                  habit.completedToday ? 'border-current bg-current/20' : 'border-zinc-600'
                }\`}>
                  {habit.completedToday && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={\`font-medium \${habit.completedToday ? '' : 'text-zinc-300'}\`}>
                    {habit.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-lg">🔥</span>
                  <span className={\`font-semibold \${habit.completedToday ? '' : 'text-zinc-500'}\`}>
                    {habit.streak}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showAdd ? (
          <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder="New habit name..."
              className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={addHabit} className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
                Add Habit
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-6 w-full py-4 border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-400 transition-all hover:scale-[1.02]"
          >
            + Add new habit
          </button>
        )}

        <div className="mt-8 text-center text-sm text-zinc-600">
          {progressPercent === 100 ? (
            <span className="text-emerald-400">🎉 Perfect day! All habits completed!</span>
          ) : progressPercent >= 50 ? (
            <span>You're doing great! Keep going 💪</span>
          ) : (
            <span>Small steps lead to big changes ✨</span>
          )}
        </div>
      </div>
    </div>
  );
}`;

const TODO_APP_CODE = `export default function TodoApp() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Design new landing page', completed: false, priority: 'high' },
    { id: 2, text: 'Review pull requests', completed: true, priority: 'medium' },
    { id: 3, text: 'Update documentation', completed: false, priority: 'low' },
    { id: 4, text: 'Team standup meeting', completed: true, priority: 'high' },
  ]);
  const [newTodo, setNewTodo] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false, priority: 'medium' }]);
    setNewTodo('');
  };

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityColors = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-slate-400">Focus on what matters</p>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
          />
          <button onClick={addTodo} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`flex-1 py-2 rounded-md text-sm font-medium transition-all \${filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}\`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={\`group flex items-center gap-3 p-4 rounded-xl border transition-all \${
                todo.completed ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }\`}
            >
              <div className={\`w-2 h-2 rounded-full \${priorityColors[todo.priority]}\`} />
              <button
                onClick={() => toggleTodo(todo.id)}
                className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all \${
                  todo.completed ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 hover:border-cyan-500'
                }\`}
              >
                {todo.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={\`flex-1 \${todo.completed ? 'line-through text-slate-500' : ''}\`}>{todo.text}</span>
              <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between text-sm text-slate-500">
          <span>{todos.filter(t => !t.completed).length} tasks remaining</span>
          {todos.some(t => t.completed) && (
            <button onClick={() => setTodos(todos.filter(t => !t.completed))} className="hover:text-rose-400 transition-colors">
              Clear completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}`;

const DASHBOARD_CODE = `export default function Dashboard() {
  const [timeRange, setTimeRange] = React.useState('7d');
  
  const stats = [
    { label: 'Total Revenue', value: '$48,352', change: '+12.5%', positive: true, icon: '💰' },
    { label: 'Active Users', value: '2,847', change: '+8.2%', positive: true, icon: '👥' },
    { label: 'Conversion Rate', value: '3.24%', change: '-0.4%', positive: false, icon: '📊' },
    { label: 'Avg. Session', value: '4m 32s', change: '+18.7%', positive: true, icon: '⏱️' },
  ];

  const chartData = [35, 45, 38, 52, 48, 65, 72];
  const maxValue = Math.max(...chartData);

  const recentActivity = [
    { user: 'Emma Wilson', action: 'Completed purchase', amount: '$299', time: '2 min ago', avatar: 'E' },
    { user: 'James Chen', action: 'Started trial', amount: null, time: '15 min ago', avatar: 'J' },
    { user: 'Sofia Rodriguez', action: 'Upgraded plan', amount: '$99/mo', time: '1 hour ago', avatar: 'S' },
    { user: 'Alex Thompson', action: 'Completed purchase', amount: '$149', time: '3 hours ago', avatar: 'A' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-500">Welcome back, here's what's happening</p>
          </div>
          <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={\`px-3 py-1.5 text-sm rounded-md transition-all \${timeRange === range ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}\`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={\`text-xs font-medium px-2 py-1 rounded-full \${stat.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}\`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Revenue Overview</h2>
              <span className="text-sm text-zinc-500">Last 7 days</span>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
              {chartData.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all hover:from-violet-500 hover:to-violet-300 cursor-pointer"
                    style={{ height: (value / maxValue) * 100 + '%' }}
                  />
                  <span className="text-xs text-zinc-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center font-semibold text-sm">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{activity.user}</div>
                    <div className="text-xs text-zinc-500">{activity.action}</div>
                  </div>
                  <div className="text-right">
                    {activity.amount && <div className="text-sm font-medium text-emerald-400">{activity.amount}</div>}
                    <div className="text-xs text-zinc-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

const LANDING_PAGE_CODE = `export default function LandingPage() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Built for speed. Every millisecond counts.' },
    { icon: '🔒', title: 'Secure by Default', desc: 'Enterprise-grade security out of the box.' },
    { icon: '🎨', title: 'Beautiful UI', desc: 'Stunning interfaces that users love.' },
    { icon: '📱', title: 'Mobile First', desc: 'Perfect on every device, every time.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-fuchsia-500 rounded-full opacity-20 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="text-2xl font-bold tracking-tight">Nova<span className="text-violet-400">.</span></div>
        <button className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors">
          Get Started
        </button>
      </nav>

      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm text-zinc-400 mb-8 border border-zinc-800">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Build faster.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Ship sooner.
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            The modern platform for building exceptional products. From idea to production in record time.
          </p>
          
          {submitted ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              ✓ You're on the list! We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-500"
                required
              />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Get Early Access
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="relative z-10 px-6 lg:px-12 py-24 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to ship</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`;

const CHAT_APP_CODE = `export default function ChatApp() {
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'other', name: 'Alice', text: 'Hey! How is the project going?', time: '10:30' },
    { id: 2, sender: 'me', name: 'You', text: 'Pretty good! Just finished the new design system.', time: '10:32' },
    { id: 3, sender: 'other', name: 'Alice', text: 'That sounds amazing! Can you share some screenshots?', time: '10:33' },
  ]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }]);
    setNewMessage('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'other',
        name: 'Alice',
        text: ['Awesome! 🎉', 'Looks great!', 'Nice work! 👏'][Math.floor(Math.random() * 3)],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
    }, 1500);
  };

  const contacts = [
    { name: 'Alice', status: 'online', active: true },
    { name: 'Bob', status: 'offline', active: false },
    { name: 'Charlie', status: 'online', active: false },
  ];

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex">
      <div className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact, i) => (
            <div key={i} className={\`flex items-center gap-3 p-4 cursor-pointer \${contact.active ? 'bg-violet-600/20 border-l-2 border-violet-500' : 'hover:bg-zinc-900'}\`}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center font-semibold">
                  {contact.name[0]}
                </div>
                <div className={\`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 \${contact.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-500'}\`} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-zinc-500">{contact.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center font-semibold">A</div>
          <div>
            <div className="font-medium">Alice</div>
            <div className="text-xs text-emerald-400">Online</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={\`flex \${msg.sender === 'me' ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`max-w-xs lg:max-w-md px-4 py-2.5 \${msg.sender === 'me' ? 'bg-violet-600 rounded-2xl rounded-br-sm' : 'bg-zinc-800 rounded-2xl rounded-bl-sm'}\`}>
                <p>{msg.text}</p>
                <p className={\`text-xs mt-1 \${msg.sender === 'me' ? 'text-violet-200' : 'text-zinc-500'}\`}>{msg.time}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 placeholder-zinc-500"
          />
          <button onClick={sendMessage} className="px-4 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}`;

const PORTFOLIO_CODE = `export default function Portfolio() {
  const projects = [
    { title: 'E-commerce Platform', category: 'Full Stack', color: 'from-violet-500 to-fuchsia-500' },
    { title: 'AI Dashboard', category: 'Frontend', color: 'from-cyan-500 to-blue-500' },
    { title: 'Mobile Banking App', category: 'UI/UX', color: 'from-emerald-500 to-teal-500' },
    { title: 'SaaS Analytics', category: 'Full Stack', color: 'from-amber-500 to-orange-500' },
  ];

  const skills = [
    { name: 'React / Next.js', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'UI/UX Design', level: 80 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="px-6 lg:px-12 py-6 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">JD<span className="text-violet-400">.</span></div>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Work</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      <section className="px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-violet-400 mb-4 font-medium">Hello, I'm</p>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">John Designer</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mb-8">
            A <span className="text-white">full-stack developer</span> crafting digital experiences that merge beautiful aesthetics with powerful functionality.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors">
              View Projects
            </button>
            <button className="px-6 py-3 border border-zinc-700 rounded-full font-medium hover:border-zinc-500 transition-colors">
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-24 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Selected Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer">
                <div className={\`absolute inset-0 bg-gradient-to-br \${project.color} opacity-80 group-hover:opacity-100 transition-opacity\`} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <span className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full w-fit mb-2">{project.category}</span>
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-24 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Skills</h2>
          <div className="max-w-md space-y-6">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{skill.name}</span>
                  <span className="text-zinc-500">{skill.level}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: skill.level + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-8 border-t border-zinc-900 text-center text-sm text-zinc-500">
        © 2024 John Designer
      </footer>
    </div>
  );
}`;

const DEFAULT_APP_CODE = `export default function App() {
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState([
    { id: 1, name: 'First item', status: 'active' },
    { id: 2, name: 'Second item', status: 'pending' },
    { id: 3, name: 'Third item', status: 'completed' },
  ]);
  const [newItem, setNewItem] = React.useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now(), name: newItem, status: 'active' }]);
    setNewItem('');
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Your App
          </h1>
          <p className="text-zinc-400">Built with KODA — describe your vision to customize</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-center">
            <div className="text-3xl font-bold text-violet-400">{items.length}</div>
            <div className="text-sm text-zinc-500">Items</div>
          </div>
          <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-center">
            <div className="text-3xl font-bold text-emerald-400">{items.filter(i => i.status === 'active').length}</div>
            <div className="text-sm text-zinc-500">Active</div>
          </div>
          <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-2xl text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{count}</div>
            <div className="text-sm text-zinc-500">Counter</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => setCount(c => c - 1)} className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xl font-bold transition-colors">-</button>
          <span className="text-4xl font-bold w-20 text-center">{count}</span>
          <button onClick={() => setCount(c => c + 1)} className="w-12 h-12 bg-violet-600 hover:bg-violet-500 rounded-xl text-xl font-bold transition-colors">+</button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-violet-500 placeholder-zinc-500"
          />
          <button onClick={addItem} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors">Add</button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <span className="font-medium">{item.name}</span>
              <span className={\`px-3 py-1 text-xs font-medium rounded-full border \${statusColors[item.status]}\`}>{item.status}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-sm mt-12">
          Describe what you want to build and watch it come to life ✨
        </p>
      </div>
    </div>
  );
}`;

// ============================================
// MAIN APPLICATION COMPONENT
// ============================================
export default function Koda() {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [iterationInput, setIterationInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const MAX_FREE_GENERATIONS = 20;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateApp = async () => {
    if (!idea.trim() || isGenerating || usageCount >= MAX_FREE_GENERATIONS) return;

    setHasStarted(true);
    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', content: idea }]);
    setMessages(prev => [...prev, { type: 'system', content: '⚡ Analyzing your idea and generating code...' }]);

    try {
      const code = await generateAppCode(idea);
      setGeneratedCode(code);
      setUsageCount(prev => prev + 1);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'assistant', content: '✓ Done! Your app is ready. Check the preview →' };
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'error', content: 'Something went wrong. Please try again.' };
        return updated;
      });
    }

    setIsGenerating(false);
    setIdea('');
  };

  const iterateApp = async () => {
    if (!iterationInput.trim() || isGenerating || usageCount >= MAX_FREE_GENERATIONS) return;

    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', content: iterationInput }]);
    setMessages(prev => [...prev, { type: 'system', content: '⚡ Updating your app...' }]);

    try {
      const code = await generateAppCode(idea, generatedCode, iterationInput);
      setGeneratedCode(code);
      setUsageCount(prev => prev + 1);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'assistant', content: '✓ Updated! Check the preview.' };
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'error', content: 'Something went wrong. Please try again.' };
        return updated;
      });
    }

    setIsGenerating(false);
    setIterationInput('');
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // LANDING STATE
  // ============================================
  if (!hasStarted) {
    return (
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', -apple-system, sans-serif; }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>

        {/* Background gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600 rounded-full opacity-10 blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-600 rounded-full opacity-10 blur-[150px]" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold">
              K
            </div>
            <span className="text-xl font-semibold tracking-tight">KODA</span>
          </div>
          <div className="text-sm text-emerald-400 font-medium">
            ✓ {MAX_FREE_GENERATIONS} free generations
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Idea → App
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400">
              Describe what you want to build. Watch it come to life.
              <br />
              No coding required. 95% cheaper than alternatives.
            </p>
          </div>

          {/* Input */}
          <div className="w-full max-w-2xl">
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateApp();
                  }
                }}
                placeholder="Describe your app... (e.g., 'A habit tracker with streaks and dark mode')"
                className="w-full px-6 py-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-base sm:text-lg focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-600 resize-none h-32"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={generateApp}
                disabled={!idea.trim() || isGenerating}
                className={`absolute bottom-4 right-4 px-5 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
                  idea.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate →</>
                )}
              </button>
            </div>

            {/* Examples */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                'Habit tracker with streaks',
                'SaaS landing page',
                'Analytics dashboard',
                'Chat application',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setIdea(example)}
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Value prop */}
          <div className="mt-16 grid grid-cols-3 gap-8 text-center max-w-lg">
            <div>
              <div className="text-2xl font-bold text-violet-400">~20 kr</div>
              <div className="text-sm text-zinc-500">per månad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">95%</div>
              <div className="text-sm text-zinc-500">billigare</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-fuchsia-400">∞</div>
              <div className="text-sm text-zinc-500">möjligheter</div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-8 py-6 text-center text-sm text-zinc-600">
          Built with ❤️ — Ett alternativ till dyra AI-builders
        </footer>
      </div>
    );
  }

  // ============================================
  // MAIN APP STATE
  // ============================================
  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }
        .code-font { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-sm">
            K
          </div>
          <span className="text-lg font-semibold hidden sm:block">KODA</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-zinc-500">
            {MAX_FREE_GENERATIONS - usageCount} left
          </span>
          {generatedCode && (
            <>
              <button
                onClick={copyCode}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadCode}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors font-medium"
              >
                Download
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-zinc-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-600 py-12">
                <div className="text-4xl mb-4">💬</div>
                <p>Describe changes or iterate on your app</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm sm:text-base ${
                    msg.type === 'user'
                      ? 'bg-violet-600 rounded-br-sm'
                      : msg.type === 'error'
                      ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                      : msg.type === 'system'
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-zinc-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={generatedCode ? iterationInput : idea}
                onChange={(e) => generatedCode ? setIterationInput(e.target.value) : setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    generatedCode ? iterateApp() : generateApp();
                  }
                }}
                placeholder={generatedCode ? "Describe changes..." : "Describe your app..."}
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-600 text-sm sm:text-base"
                disabled={usageCount >= MAX_FREE_GENERATIONS}
              />
              <button
                onClick={generatedCode ? iterateApp : generateApp}
                disabled={isGenerating || usageCount >= MAX_FREE_GENERATIONS}
                className="px-4 sm:px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                {isGenerating ? '...' : generatedCode ? 'Update' : 'Build'}
              </button>
            </div>
            {usageCount >= MAX_FREE_GENERATIONS && (
              <p className="text-sm text-rose-400 mt-2">
                Free limit reached. Upgrade for unlimited.
              </p>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="hidden lg:flex w-1/2 flex-col bg-zinc-900">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-zinc-800">
            <button
              onClick={() => setShowCode(false)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                !showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Code
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {generatedCode ? (
              showCode ? (
                <pre className="h-full overflow-auto p-4 text-xs sm:text-sm code-font text-zinc-300 bg-zinc-950 whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-lg font-medium mb-2">App Generated!</p>
                    <p className="text-sm text-zinc-600 max-w-sm">
                      In production, the live preview renders here using Sandpack. 
                      For now, click "Download" to get the code and run it locally or paste into v0/Lovable.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <p>Your app preview will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
