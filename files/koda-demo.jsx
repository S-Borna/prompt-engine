import React, { useState, useEffect, useRef } from 'react';

// ============================================
// KODA — Honest Demo Version
// ============================================
// This demo has 6 working templates.
// Production version uses Claude API to generate
// ANY app from ANY description.
// ============================================

export default function Koda() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customIdea, setCustomIdea] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState('home'); // home, builder

  const templates = [
    { id: 'habit', name: 'Habit Tracker', desc: 'Track daily habits with streaks', icon: '🔥', color: 'from-violet-500 to-fuchsia-500' },
    { id: 'todo', name: 'Todo App', desc: 'Manage tasks with filters', icon: '✓', color: 'from-cyan-500 to-blue-500' },
    { id: 'dashboard', name: 'Analytics Dashboard', desc: 'Stats, charts, metrics', icon: '📊', color: 'from-emerald-500 to-teal-500' },
    { id: 'landing', name: 'Landing Page', desc: 'SaaS/startup homepage', icon: '🚀', color: 'from-amber-500 to-orange-500' },
    { id: 'chat', name: 'Chat App', desc: 'Real-time messaging UI', icon: '💬', color: 'from-pink-500 to-rose-500' },
    { id: 'portfolio', name: 'Portfolio', desc: 'Developer/designer showcase', icon: '👤', color: 'from-indigo-500 to-purple-500' },
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setView('builder');
  };

  const handleCustomSubmit = () => {
    // In production: send to Claude API
    // For demo: show explanation
    setView('builder');
    setSelectedTemplate({ 
      id: 'custom', 
      name: customIdea, 
      desc: 'Custom app',
      icon: '✨',
      color: 'from-violet-500 to-fuchsia-500'
    });
  };

  const copy = () => {
    if (!selectedTemplate) return;
    const code = CODE_TEMPLATES[selectedTemplate.id] || CODE_TEMPLATES.custom;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!selectedTemplate) return;
    const code = CODE_TEMPLATES[selectedTemplate.id] || CODE_TEMPLATES.custom;
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}-app.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // HOME VIEW
  // ============================================
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full opacity-10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full opacity-10 blur-[120px]" />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold">K</div>
            <span className="text-xl font-semibold tracking-tight">KODA</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium">
            Demo Version
          </div>
        </nav>

        {/* Hero */}
        <main className="relative z-10 px-6 pt-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Välj en app att bygga
              </h1>
              <p className="text-lg text-zinc-400">
                Demo: 6 templates. Produktion: Claude genererar vad som helst.
              </p>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className="group p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-left hover:border-zinc-700 hover:bg-zinc-900 transition-all hover:scale-[1.02]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {t.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{t.name}</h3>
                  <p className="text-sm text-zinc-500">{t.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="max-w-xl mx-auto">
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <h3 className="font-semibold mb-1">Eller beskriv din egen idé</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  I produktion genererar Claude riktig kod. Demo visar bara strukturen.
                </p>
                <div className="flex gap-2">
                  <input
                    value={customIdea}
                    onChange={(e) => setCustomIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && customIdea.trim() && handleCustomSubmit()}
                    placeholder="Ex: A recipe app with meal planning..."
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-violet-500 transition-colors text-sm"
                  />
                  <button
                    onClick={handleCustomSubmit}
                    disabled={!customIdea.trim()}
                    className={`px-5 py-3 rounded-xl font-medium transition-all text-sm ${
                      customIdea.trim() 
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    Visa →
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-12 p-6 bg-violet-500/10 border border-violet-500/20 rounded-2xl max-w-2xl mx-auto">
              <h3 className="font-semibold text-violet-300 mb-2">💡 Hur fungerar KODA i produktion?</h3>
              <ul className="text-sm text-violet-200/70 space-y-1">
                <li>1. Du beskriver din app-idé med vanliga ord</li>
                <li>2. KODA optimerar din prompt automatiskt (gömt för dig)</li>
                <li>3. Claude API genererar riktig, fungerande React-kod</li>
                <li>4. Du ser live preview + kan iterera med ändringar</li>
                <li>5. Ladda ner koden och bygg vidare</li>
              </ul>
              <p className="mt-3 text-xs text-violet-300/50">
                Kostnad: ~$0.01 per generation = 95% billigare än Lovable
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // BUILDER VIEW
  // ============================================
  const PreviewComponent = selectedTemplate?.id === 'custom' 
    ? CustomPreview 
    : PREVIEW_COMPONENTS[selectedTemplate?.id] || CustomPreview;

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setView('home'); setSelectedTemplate(null); }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-xs">K</div>
          </button>
          <div className="h-5 w-px bg-zinc-700" />
          <span className="text-sm font-medium">{selectedTemplate?.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copy} className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
            {copied ? '✓ Kopierat' : 'Kopiera kod'}
          </button>
          <button onClick={download} className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors font-medium">
            Ladda ner
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900">
            <button
              onClick={() => setShowCode(false)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${!showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${showCode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Kod
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-zinc-900">
            {showCode ? (
              <pre className="h-full overflow-auto p-4 text-xs text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-950">
                {CODE_TEMPLATES[selectedTemplate?.id] || CODE_TEMPLATES.custom}
              </pre>
            ) : (
              <div className="h-full overflow-auto">
                <PreviewComponent idea={selectedTemplate?.name} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-zinc-800 flex flex-col bg-zinc-900/50">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold mb-1">Iterera på din app</h3>
            <p className="text-xs text-zinc-500">Beskriv ändringar du vill göra</p>
          </div>

          <div className="flex-1 p-4">
            {selectedTemplate?.id === 'custom' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-200/80">
                  <strong>Demo-läge:</strong> I produktion skulle Claude generera en riktig "{selectedTemplate.name}" app baserat på din beskrivning.
                </p>
                <p className="text-xs text-amber-200/50 mt-2">
                  Just nu visas en placeholder. Välj en av de 6 templates för att se fungerande exempel.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  'Lägg till dark mode toggle',
                  'Ändra färgschema till blått',
                  'Lägg till animationer',
                  'Gör det mer minimalistiskt',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    className="w-full p-3 text-left text-sm bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-zinc-600 hover:bg-zinc-800 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
                <p className="text-xs text-zinc-600 mt-4">
                  I produktion skickas dessa till Claude för live-uppdatering av koden.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800">
            <input
              placeholder="Beskriv en ändring..."
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-violet-500"
            />
            <button className="w-full mt-2 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors">
              Uppdatera app
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PREVIEW COMPONENTS
// ============================================

function HabitPreview() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning meditation', streak: 12, done: true },
    { id: 2, name: 'Read 30 minutes', streak: 8, done: false },
    { id: 3, name: 'Exercise', streak: 5, done: true },
    { id: 4, name: 'No social media', streak: 3, done: false },
  ]);
  const [newHabit, setNewHabit] = useState('');

  const toggle = (id) => setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : Math.max(0, h.streak - 1) } : h));
  const add = () => { if (newHabit.trim()) { setHabits([...habits, { id: Date.now(), name: newHabit, streak: 0, done: false }]); setNewHabit(''); }};
  const progress = habits.length > 0 ? (habits.filter(h => h.done).length / habits.length) * 100 : 0;

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Today's Habits</h1>
          <span className="text-sm text-zinc-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">{habits.filter(h => h.done).length} of {habits.length}</span>
            <span className="text-violet-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {habits.map(h => (
            <div
              key={h.id}
              onClick={() => toggle(h.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${h.done ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${h.done ? 'border-violet-400 bg-violet-400/20 text-violet-400' : 'border-zinc-600'}`}>
                  {h.done && <span className="text-sm">✓</span>}
                </div>
                <span className={`flex-1 ${h.done ? 'text-violet-300' : 'text-zinc-200'}`}>{h.name}</span>
                <span className="text-sm flex items-center gap-1">🔥 <span className={h.done ? 'text-violet-300' : 'text-zinc-400'}>{h.streak}</span></span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add new habit..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 text-sm"
          />
          <button onClick={add} className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium text-sm transition-colors">Add</button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          {progress === 100 ? '🎉 Perfect day!' : 'Tap habits to complete them'}
        </p>
      </div>
    </div>
  );
}

function TodoPreview() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Design new landing page', done: false, priority: 'high' },
    { id: 2, text: 'Review pull requests', done: true, priority: 'medium' },
    { id: 3, text: 'Update documentation', done: false, priority: 'low' },
    { id: 4, text: 'Team standup', done: true, priority: 'high' },
  ]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  const add = () => { if (input.trim()) { setTodos([...todos, { id: Date.now(), text: input, done: false, priority: 'medium' }]); setInput(''); }};
  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(todos.filter(t => t.id !== id));
  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done);
  const priorityColors = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TaskFlow</h1>
        <p className="text-center text-slate-400 text-sm mb-6">Focus on what matters</p>

        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 text-sm"
          />
          <button onClick={add} className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-sm">Add</button>
        </div>

        <div className="flex gap-1 mb-4 p-1 bg-slate-800/50 rounded-lg">
          {['all', 'active', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${t.done ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full ${priorityColors[t.priority]}`} />
              <button onClick={() => toggle(t.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${t.done ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 hover:border-cyan-500'}`}>
                {t.done && <span className="text-xs text-white">✓</span>}
              </button>
              <span className={`flex-1 text-sm ${t.done ? 'line-through text-slate-500' : ''}`}>{t.text}</span>
              <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all text-sm">✕</button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">{todos.filter(t => !t.done).length} tasks remaining</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const stats = [
    { label: 'Revenue', value: '$48,352', change: '+12.5%', positive: true, icon: '💰' },
    { label: 'Users', value: '2,847', change: '+8.2%', positive: true, icon: '👥' },
    { label: 'Conversion', value: '3.24%', change: '-0.4%', positive: false, icon: '📊' },
    { label: 'Avg. Session', value: '4m 32s', change: '+18.7%', positive: true, icon: '⏱️' },
  ];
  const chart = [35, 45, 38, 52, 48, 65, 72];

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm">Welcome back, here's what's happening</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{s.change}</span>
              </div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Revenue Overview</h2>
            <span className="text-sm text-zinc-500">Last 7 days</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {chart.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md hover:from-violet-500 hover:to-violet-300 cursor-pointer transition-all" style={{ height: `${(v / 80) * 100}%` }} />
                <span className="text-xs text-zinc-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
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

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Built for speed.' },
    { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade.' },
    { icon: '🎨', title: 'Beautiful', desc: 'Stunning UI.' },
    { icon: '📱', title: 'Responsive', desc: 'Works everywhere.' },
  ];

  return (
    <div className="min-h-full bg-black text-white relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-violet-500 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-fuchsia-500 rounded-full opacity-20 blur-3xl" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <span className="text-xl font-bold">Nova<span className="text-violet-400">.</span></span>
        <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">Get Started</button>
      </nav>

      <section className="relative z-10 px-6 pt-16 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 rounded-full text-sm text-zinc-400 mb-6 border border-zinc-800">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Build faster.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Ship sooner.</span>
          </h1>
          <p className="text-lg text-zinc-400 mb-8">The modern platform for building exceptional products.</p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              ✓ You're on the list!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 text-sm" />
              <button onClick={() => email && setSubmitted(true)} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-medium text-sm">Get Access</button>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 px-6 py-16 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChatPreview() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: 'Hey! How is the project going?', time: '10:30' },
    { id: 2, from: 'me', text: 'Pretty good! Just finished the new design.', time: '10:32' },
    { id: 3, from: 'them', text: 'That sounds amazing! Can you share?', time: '10:33' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setMessages([...messages, { id: Date.now(), from: 'me', text: input, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = ['Nice! 👍', 'Sounds good!', 'Awesome! 🎉', 'Love it!', 'Great work! 💪'];
      setMessages(prev => [...prev, { id: Date.now(), from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }]);
    }, 1500);
  };

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center font-bold">A</div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-950" />
        </div>
        <div>
          <div className="font-medium">Alice</div>
          <div className="text-xs text-emerald-400">Online</div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${m.from === 'me' ? 'bg-violet-600 rounded-br-sm' : 'bg-zinc-800 rounded-bl-sm'}`}>
              <p className="text-sm">{m.text}</p>
              <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-violet-200' : 'text-zinc-500'}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500 text-sm" />
        <button onClick={send} className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors text-sm font-medium">Send</button>
      </div>
    </div>
  );
}

function PortfolioPreview() {
  const projects = [
    { title: 'E-commerce Platform', tag: 'Full Stack', color: 'from-violet-500 to-fuchsia-500' },
    { title: 'AI Dashboard', tag: 'Frontend', color: 'from-cyan-500 to-blue-500' },
    { title: 'Mobile App', tag: 'UI/UX', color: 'from-emerald-500 to-teal-500' },
    { title: 'SaaS Analytics', tag: 'Full Stack', color: 'from-amber-500 to-orange-500' },
  ];

  const skills = [
    { name: 'React / Next.js', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'UI/UX Design', level: 80 },
  ];

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <nav className="px-6 py-5 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">JD<span className="text-violet-400">.</span></span>
          <div className="flex gap-5 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Work</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-violet-400 mb-3 font-medium">Hello, I'm</p>
          <h1 className="text-4xl font-bold mb-4">John Designer</h1>
          <p className="text-lg text-zinc-400 max-w-lg mb-6">A full-stack developer crafting digital experiences that merge aesthetics with functionality.</p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-zinc-200 transition-colors">View Projects</button>
            <button className="px-5 py-2.5 border border-zinc-700 rounded-full text-sm hover:border-zinc-500 transition-colors">Contact</button>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Selected Work</h2>
          <div className="grid grid-cols-2 gap-4">
            {projects.map((p, i) => (
              <div key={i} className={`aspect-video rounded-xl bg-gradient-to-br ${p.color} p-5 flex flex-col justify-end cursor-pointer hover:scale-[1.02] transition-transform`}>
                <span className="text-xs bg-black/20 px-2 py-1 rounded-full w-fit mb-1">{p.tag}</span>
                <h3 className="text-lg font-bold">{p.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Skills</h2>
          <div className="max-w-md space-y-4">
            {skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.name}</span>
                  <span className="text-zinc-500">{s.level}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all" style={{ width: `${s.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CustomPreview({ idea }) {
  return (
    <div className="min-h-full bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
          ✨
        </div>
        <h2 className="text-2xl font-bold mb-3">{idea || 'Din app'}</h2>
        <p className="text-zinc-400 mb-6">
          I produktion skulle Claude generera en riktig, fungerande app baserat på din beskrivning.
        </p>
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left">
          <p className="text-sm text-zinc-300 mb-2">Demo-läge visar:</p>
          <ul className="text-sm text-zinc-500 space-y-1">
            <li>• UX-flödet för att bygga appar</li>
            <li>• Iteration-konceptet</li>
            <li>• Kod-export funktionen</li>
          </ul>
        </div>
        <p className="mt-6 text-sm text-violet-400">
          ← Gå tillbaka och välj en av de 6 templates för att se fungerande exempel
        </p>
      </div>
    </div>
  );
}

const PREVIEW_COMPONENTS = {
  habit: HabitPreview,
  todo: TodoPreview,
  dashboard: DashboardPreview,
  landing: LandingPreview,
  chat: ChatPreview,
  portfolio: PortfolioPreview,
};

// ============================================
// CODE TEMPLATES
// ============================================

const CODE_TEMPLATES = {
  habit: `// HabitTracker.jsx - Built with KODA
import React, { useState } from 'react';

export default function HabitTracker() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Morning meditation', streak: 12, done: true },
    { id: 2, name: 'Read 30 minutes', streak: 8, done: false },
    { id: 3, name: 'Exercise', streak: 5, done: true },
  ]);

  const toggle = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 } : h
    ));
  };

  const progress = (habits.filter(h => h.done).length / habits.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Today's Habits</h1>
      <div className="h-2 bg-zinc-800 rounded-full mb-6">
        <div className="h-full bg-violet-500 rounded-full" style={{ width: progress + '%' }} />
      </div>
      {habits.map(h => (
        <div key={h.id} onClick={() => toggle(h.id)}
          className={\`p-4 mb-3 rounded-xl cursor-pointer \${h.done ? 'bg-violet-600/20' : 'bg-zinc-900'}\`}>
          {h.done ? '✓' : '○'} {h.name} — 🔥 {h.streak}
        </div>
      ))}
    </div>
  );
}`,

  todo: `// TodoApp.jsx - Built with KODA
import React, { useState } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Design landing page', done: false },
    { id: 2, text: 'Review PRs', done: true },
  ]);
  const [input, setInput] = useState('');

  const add = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">TaskFlow</h1>
      <div className="flex gap-2 mb-6">
        <input value={input} onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 rounded-lg" placeholder="New task..." />
        <button onClick={add} className="px-6 bg-cyan-500 rounded-lg">Add</button>
      </div>
      {todos.map(t => (
        <div key={t.id} onClick={() => setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x))}
          className="p-4 mb-2 bg-slate-800 rounded-lg cursor-pointer">
          {t.done ? '✓' : '○'} {t.text}
        </div>
      ))}
    </div>
  );
}`,

  dashboard: `// Dashboard.jsx - Built with KODA
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
            <div className="text-emerald-400">{s.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  landing: `// LandingPage.jsx - Built with KODA
import React, { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 flex justify-between">
        <span className="text-2xl font-bold">Nova.</span>
        <button className="px-4 py-2 bg-white text-black rounded-full">Get Started</button>
      </nav>
      <main className="text-center py-24 px-6">
        <h1 className="text-6xl font-bold mb-6">
          Build faster.<br/><span className="text-violet-400">Ship sooner.</span>
        </h1>
        {submitted ? (
          <p className="text-emerald-400">✓ You're on the list!</p>
        ) : (
          <div className="flex gap-2 justify-center">
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="px-4 py-3 bg-zinc-900 rounded-xl" placeholder="Email" />
            <button onClick={() => setSubmitted(true)} className="px-6 bg-violet-600 rounded-xl">
              Get Access
            </button>
          </div>
        )}
      </main>
    </div>
  );
}`,

  chat: `// ChatApp.jsx - Built with KODA
import React, { useState } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: 'Hey! How is it going?' },
    { id: 2, from: 'me', text: 'Great! Just shipped the update.' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), from: 'me', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      <div className="p-4 border-b border-zinc-800">Chat</div>
      <div className="flex-1 p-4 overflow-auto">
        {messages.map(m => (
          <div key={m.id} className={\`mb-3 \${m.from === 'me' ? 'text-right' : ''}\`}>
            <span className={\`inline-block px-4 py-2 rounded-2xl \${m.from === 'me' ? 'bg-violet-600' : 'bg-zinc-800'}\`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-3 bg-zinc-900 rounded-xl" placeholder="Message..." />
        <button onClick={send} className="px-6 bg-violet-600 rounded-xl">Send</button>
      </div>
    </div>
  );
}`,

  portfolio: `// Portfolio.jsx - Built with KODA
import React from 'react';

export default function Portfolio() {
  const projects = [
    { title: 'E-commerce', tag: 'Full Stack' },
    { title: 'AI Dashboard', tag: 'Frontend' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">John Designer</h1>
      <p className="text-zinc-400 mb-8">Full-stack developer</p>
      <div className="grid grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <div key={i} className="aspect-video bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl p-6 flex flex-col justify-end">
            <span className="text-sm opacity-80">{p.tag}</span>
            <h3 className="text-xl font-bold">{p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  custom: `// YourApp.jsx - Built with KODA
// 
// I produktion skulle Claude generera riktig kod
// baserat på din beskrivning här.
//
// Denna demo visar endast UX-flödet.
// Välj en av de 6 templates för att se fungerande exempel.

import React, { useState } from 'react';

export default function YourApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Din App</h1>
        <p className="text-zinc-400 mb-8">
          Claude API skulle generera din faktiska app här
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCount(c => c - 1)} 
            className="w-12 h-12 bg-zinc-800 rounded-xl text-xl">-</button>
          <span className="text-4xl font-bold">{count}</span>
          <button onClick={() => setCount(c => c + 1)}
            className="w-12 h-12 bg-violet-600 rounded-xl text-xl">+</button>
        </div>
      </div>
    </div>
  );
}`,
};
