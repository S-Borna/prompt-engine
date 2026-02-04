import React, { useState, useEffect, useRef } from 'react';

// ============================================
// KODA — From Idea to App in Seconds
// ============================================

// Simulated code generation (in production: Claude API)
const generateAppCode = async (userIdea) => {
  await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 1200));
  
  const idea = userIdea.toLowerCase();
  
  if (idea.includes('habit') || idea.includes('tracker') || idea.includes('vana')) {
    return { code: HABIT_TRACKER_CODE, type: 'habit' };
  } else if (idea.includes('todo') || idea.includes('task') || idea.includes('uppgift')) {
    return { code: TODO_APP_CODE, type: 'todo' };
  } else if (idea.includes('dashboard') || idea.includes('analytics')) {
    return { code: DASHBOARD_CODE, type: 'dashboard' };
  } else if (idea.includes('landing') || idea.includes('startup') || idea.includes('saas')) {
    return { code: LANDING_PAGE_CODE, type: 'landing' };
  } else if (idea.includes('chat') || idea.includes('meddelande') || idea.includes('message')) {
    return { code: CHAT_APP_CODE, type: 'chat' };
  } else {
    return { code: DEFAULT_APP_CODE, type: 'default' };
  }
};

// ============================================
// APP TEMPLATES
// ============================================

const HABIT_TRACKER_CODE = `// HabitTracker.jsx
import React, { useState } from 'react';

export default function HabitTracker() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning meditation', streak: 12, done: true },
    { id: 2, name: 'Read 30 minutes', streak: 8, done: false },
    { id: 3, name: 'Exercise', streak: 5, done: true },
  ]);

  const toggle = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, done: !h.done } : h
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Today's Habits</h1>
      {habits.map(h => (
        <div 
          key={h.id}
          onClick={() => toggle(h.id)}
          className={\`p-4 mb-3 rounded-xl cursor-pointer 
            \${h.done ? 'bg-violet-600/20' : 'bg-zinc-900'}\`}
        >
          <span>{h.done ? '✓' : '○'} {h.name}</span>
          <span className="float-right">🔥 {h.streak}</span>
        </div>
      ))}
    </div>
  );
}`;

const TODO_APP_CODE = `// TodoApp.jsx
import React, { useState } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Design new feature', done: false },
    { id: 2, text: 'Review PRs', done: true },
  ]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">TaskFlow</h1>
      <div className="flex gap-2 mb-6">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 rounded-lg"
          placeholder="New task..."
        />
        <button onClick={add} className="px-6 py-2 bg-cyan-500 rounded-lg">
          Add
        </button>
      </div>
      {todos.map(t => (
        <div key={t.id} className="p-4 mb-2 bg-slate-800 rounded-lg">
          {t.done ? '✓' : '○'} {t.text}
        </div>
      ))}
    </div>
  );
}`;

const DASHBOARD_CODE = `// Dashboard.jsx
import React from 'react';

export default function Dashboard() {
  const stats = [
    { label: 'Revenue', value: '$48,352', change: '+12%' },
    { label: 'Users', value: '2,847', change: '+8%' },
    { label: 'Conversion', value: '3.2%', change: '-0.4%' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-6 bg-zinc-900 rounded-2xl">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-zinc-500">{s.label}</div>
            <div className="text-emerald-400 text-sm">{s.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const LANDING_PAGE_CODE = `// LandingPage.jsx
import React, { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 flex justify-between">
        <span className="text-2xl font-bold">Nova.</span>
        <button className="px-4 py-2 bg-white text-black rounded-full">
          Get Started
        </button>
      </nav>
      <main className="text-center py-24 px-6">
        <h1 className="text-6xl font-bold mb-6">
          Build faster.<br/>
          <span className="text-violet-400">Ship sooner.</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          The modern platform for exceptional products.
        </p>
        <input 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
          className="px-6 py-4 bg-zinc-900 rounded-xl mr-2"
        />
        <button className="px-8 py-4 bg-violet-600 rounded-xl">
          Get Access
        </button>
      </main>
    </div>
  );
}`;

const CHAT_APP_CODE = `// ChatApp.jsx
import React, { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: 'Hey! How is it going?' },
    { id: 2, from: 'me', text: 'Great! Just finished the project.' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), from: 'me', text: input }]);
    setInput('');
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      <div className="p-4 border-b border-zinc-800">Chat</div>
      <div className="flex-1 p-4 overflow-auto">
        {messages.map(m => (
          <div key={m.id} className={\`mb-3 \${m.from === 'me' ? 'text-right' : ''}\`}>
            <span className={\`inline-block px-4 py-2 rounded-2xl 
              \${m.from === 'me' ? 'bg-violet-600' : 'bg-zinc-800'}\`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-zinc-900 rounded-xl"
          placeholder="Message..."
        />
        <button onClick={send} className="px-6 bg-violet-600 rounded-xl">
          Send
        </button>
      </div>
    </div>
  );
}`;

const DEFAULT_APP_CODE = `// App.jsx
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setItems([...items, input]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <h1 className="text-4xl font-bold text-violet-400 mb-8">Your App</h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={() => setCount(c => c - 1)} 
          className="w-12 h-12 bg-zinc-800 rounded-xl text-xl">-</button>
        <span className="text-4xl w-20 text-center">{count}</span>
        <button onClick={() => setCount(c => c + 1)}
          className="w-12 h-12 bg-violet-600 rounded-xl text-xl">+</button>
      </div>

      <div className="flex gap-2 mb-4">
        <input value={input} onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl"
          placeholder="Add item..." />
        <button onClick={add} className="px-6 bg-violet-600 rounded-xl">Add</button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="p-4 mb-2 bg-zinc-800 rounded-xl">{item}</div>
      ))}
    </div>
  );
}`;

// ============================================
// LIVE PREVIEW COMPONENTS
// ============================================

function HabitTrackerPreview() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning meditation', streak: 12, done: true },
    { id: 2, name: 'Read 30 minutes', streak: 8, done: false },
    { id: 3, name: 'Exercise', streak: 5, done: true },
    { id: 4, name: 'No social media', streak: 3, done: false },
  ]);

  const toggle = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 } : h));
  };

  const progress = (habits.filter(h => h.done).length / habits.length) * 100;

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-xl font-bold mb-1">Today's Habits</h1>
        <p className="text-xs text-zinc-500 mb-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">{habits.filter(h => h.done).length}/{habits.length}</span>
            <span className="text-violet-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          {habits.map(h => (
            <div
              key={h.id}
              onClick={() => toggle(h.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${h.done ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-zinc-900 border border-zinc-800'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${h.done ? 'border-violet-400 text-violet-400' : 'border-zinc-600'}`}>
                  {h.done && '✓'}
                </div>
                <span className={`flex-1 text-sm ${h.done ? 'text-violet-300' : 'text-zinc-300'}`}>{h.name}</span>
                <span className="text-sm">🔥 {h.streak}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-zinc-600">
          {progress === 100 ? '🎉 Perfect day!' : 'Tap to complete'}
        </div>
      </div>
    </div>
  );
}

function TodoPreview() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Design new feature', done: false },
    { id: 2, text: 'Review pull requests', done: true },
    { id: 3, text: 'Update docs', done: false },
  ]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TaskFlow</h1>
        <p className="text-center text-slate-400 text-xs mb-4">Focus on what matters</p>

        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="New task..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
          />
          <button onClick={add} className="px-4 py-2 bg-cyan-500 rounded-lg text-sm font-medium">Add</button>
        </div>

        <div className="space-y-2">
          {todos.map(t => (
            <div key={t.id} onClick={() => toggle(t.id)} className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${t.done ? 'bg-slate-800/50' : 'bg-slate-800'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${t.done ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'}`}>
                {t.done && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${t.done ? 'line-through text-slate-500' : ''}`}>{t.text}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">{todos.filter(t => !t.done).length} remaining</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const stats = [
    { label: 'Revenue', value: '$48.3K', change: '+12%', positive: true },
    { label: 'Users', value: '2,847', change: '+8%', positive: true },
    { label: 'Conv.', value: '3.2%', change: '-0.4%', positive: false },
  ];
  const chart = [35, 45, 38, 52, 48, 65, 72];

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-1">Dashboard</h1>
        <p className="text-xs text-zinc-500 mb-4">Welcome back</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {stats.map((s, i) => (
            <div key={i} className="p-3 bg-zinc-900 rounded-xl">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500">{s.label}</div>
              <div className={`text-xs ${s.positive ? 'text-emerald-400' : 'text-rose-400'}`}>{s.change}</div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-900 rounded-xl">
          <div className="text-sm font-medium mb-3">Revenue</div>
          <div className="flex items-end justify-between h-24 gap-1">
            {chart.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-sm" style={{ height: `${(v / 80) * 100}%` }} />
                <span className="text-xs text-zinc-600">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPreview() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-full bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500 rounded-full opacity-20 blur-3xl" />

      <nav className="relative z-10 p-4 flex justify-between items-center">
        <span className="text-lg font-bold">Nova<span className="text-violet-400">.</span></span>
        <button className="px-3 py-1.5 bg-white text-black rounded-full text-xs font-medium">Start</button>
      </nav>

      <main className="relative z-10 text-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-3">
          Build faster.<br />
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Ship sooner.</span>
        </h1>
        <p className="text-sm text-zinc-400 mb-6">The modern platform for building products.</p>

        {submitted ? (
          <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            ✓ You're on the list!
          </div>
        ) : (
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none"
            />
            <button onClick={() => email && setSubmitted(true)} className="px-4 py-2 bg-violet-600 rounded-lg text-sm font-medium">
              Join
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ChatPreview() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: 'Hey! How is it going?' },
    { id: 2, from: 'me', text: 'Great! Just shipped the update 🚀' },
    { id: 3, from: 'them', text: 'Amazing work!' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), from: 'me', text: input }]);
    setInput('');
  };

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col">
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs font-bold">A</div>
        <div>
          <div className="text-sm font-medium">Alice</div>
          <div className="text-xs text-emerald-400">Online</div>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-auto space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === 'me' ? 'bg-violet-600 rounded-br-sm' : 'bg-zinc-800 rounded-bl-sm'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message..."
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none"
        />
        <button onClick={send} className="px-4 py-2 bg-violet-600 rounded-xl text-sm">Send</button>
      </div>
    </div>
  );
}

function DefaultPreview() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-4">
      <div className="max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Your App</h1>
        <p className="text-xs text-zinc-400 mb-6">Built with KODA</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => setCount(c => c - 1)} className="w-10 h-10 bg-zinc-800 rounded-lg text-lg font-bold">-</button>
          <span className="text-3xl font-bold w-16">{count}</span>
          <button onClick={() => setCount(c => c + 1)} className="w-10 h-10 bg-violet-600 rounded-lg text-lg font-bold">+</button>
        </div>

        <div className="space-y-2 text-left">
          {['Feature one', 'Feature two', 'Feature three'].map((item, i) => (
            <div key={i} className="p-3 bg-zinc-800 rounded-lg text-sm">{item}</div>
          ))}
        </div>

        <p className="mt-6 text-xs text-zinc-600">Describe your vision to customize</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN APPLICATION
// ============================================
export default function Koda() {
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [iterationInput, setIterationInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const MAX_FREE = 20;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generate = async () => {
    if (!idea.trim() || isGenerating || usageCount >= MAX_FREE) return;

    setHasStarted(true);
    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', content: idea }]);
    setMessages(prev => [...prev, { type: 'system', content: '⚡ Generating your app...' }]);

    try {
      const data = await generateAppCode(idea);
      setResult(data);
      setUsageCount(prev => prev + 1);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'assistant', content: '✓ Done! Check the live preview →' };
        return updated;
      });
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'error', content: 'Something went wrong.' };
        return updated;
      });
    }

    setIsGenerating(false);
    setIdea('');
  };

  const iterate = async () => {
    if (!iterationInput.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', content: iterationInput }]);
    setMessages(prev => [...prev, { type: 'system', content: '⚡ Updating...' }]);

    await new Promise(r => setTimeout(r, 1500));

    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { type: 'assistant', content: '✓ In production, your app would update live. Download the code to customize!' };
      return updated;
    });

    setIsGenerating(false);
    setIterationInput('');
    setUsageCount(prev => prev + 1);
  };

  const download = () => {
    if (!result?.code) return;
    const blob = new Blob([result.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPreview = () => {
    if (!result) return <DefaultPreview />;
    switch (result.type) {
      case 'habit': return <HabitTrackerPreview />;
      case 'todo': return <TodoPreview />;
      case 'dashboard': return <DashboardPreview />;
      case 'landing': return <LandingPreview />;
      case 'chat': return <ChatPreview />;
      default: return <DefaultPreview />;
    }
  };

  // ============================================
  // LANDING
  // ============================================
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full opacity-10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full opacity-10 blur-[120px]" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold">K</div>
            <span className="text-xl font-semibold tracking-tight">KODA</span>
          </div>
          <span className="text-sm text-emerald-400">✓ {MAX_FREE} free builds</span>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="text-center max-w-2xl mb-10">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">
              Idea → App
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            <p className="text-lg text-zinc-400">
              Describe what you want. Watch it come to life.
              <br />
              <span className="text-zinc-500">95% cheaper than Lovable.</span>
            </p>
          </div>

          <div className="w-full max-w-xl">
            <div className="relative">
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }}}
                placeholder="Describe your app... (e.g., 'A habit tracker with streaks')"
                className="w-full px-5 py-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-base focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-600 resize-none h-28"
              />
              <button
                onClick={generate}
                disabled={!idea.trim() || isGenerating}
                className={`absolute bottom-3 right-3 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm ${
                  idea.trim() ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Building...</>
                ) : (
                  <>Generate →</>
                )}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {['Habit tracker', 'Todo app', 'Dashboard', 'Landing page', 'Chat app'].map(ex => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-2xl font-bold text-violet-400">~20 kr</div>
              <div className="text-sm text-zinc-500">per månad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">95%</div>
              <div className="text-sm text-zinc-500">billigare</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-fuchsia-400">&lt;3s</div>
              <div className="text-sm text-zinc-500">per app</div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 text-center text-sm text-zinc-600">
          Built with ❤️ — Ditt alternativ till dyra AI-builders
        </footer>
      </div>
    );
  }

  // ============================================
  // MAIN BUILDER
  // ============================================
  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
          <span className="text-lg font-semibold hidden sm:block">KODA</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden sm:block">{MAX_FREE - usageCount} left</span>
          {result && (
            <>
              <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={download} className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors font-medium">
                Download
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-600 py-10">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm">Describe changes to iterate</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.type === 'user' ? 'bg-violet-600 rounded-br-sm' :
                  msg.type === 'error' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300' :
                  msg.type === 'system' ? 'bg-zinc-800 text-zinc-400' :
                  'bg-zinc-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                value={result ? iterationInput : idea}
                onChange={e => result ? setIterationInput(e.target.value) : setIdea(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { result ? iterate() : generate(); }}}
                placeholder={result ? "Describe changes..." : "Describe your app..."}
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 transition-colors placeholder-zinc-600 text-sm"
              />
              <button
                onClick={result ? iterate : generate}
                disabled={isGenerating}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium transition-colors text-sm"
              >
                {isGenerating ? '...' : result ? 'Update' : 'Build'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="hidden md:flex w-1/2 flex-col bg-zinc-900">
          <div className="flex items-center gap-1 p-2 border-b border-zinc-800">
            <button
              onClick={() => setShowCode(false)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${!showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {showCode ? (
              <pre className="h-full overflow-auto p-4 text-xs text-zinc-300 bg-zinc-950 whitespace-pre-wrap font-mono">
                {result?.code || '// Your generated code will appear here'}
              </pre>
            ) : (
              <div className="h-full overflow-auto">
                {renderPreview()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
