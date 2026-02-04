import React, { useState, useEffect, useRef } from 'react';

// ============================================
// KODA — From Idea to App in Seconds
// ============================================

// Simulated AI generation (replace with real API in production)
const generateAppCode = async (userIdea, previousCode = null, iterationRequest = null) => {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
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
  } else if (idea.includes('portfolio') || idea.includes('cv')) {
    return PORTFOLIO_CODE;
  } else {
    return DEFAULT_APP_CODE;
  }
};

// ============================================
// APP TEMPLATES
// ============================================

const HABIT_TRACKER_CODE = `// Habit Tracker App
// Built with KODA

export default function HabitTracker() {
  const [habits, setHabits] = React.useState([
    { id: 1, name: 'Morning meditation', streak: 12, done: true },
    { id: 2, name: 'Read 30 minutes', streak: 8, done: false },
    { id: 3, name: 'Exercise', streak: 5, done: true },
    { id: 4, name: 'No social media', streak: 3, done: false },
  ]);
  const [newHabit, setNewHabit] = React.useState('');

  const toggle = (id) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 } : h
    ));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), name: newHabit, streak: 0, done: false }]);
    setNewHabit('');
  };

  const completed = habits.filter(h => h.done).length;
  const progress = habits.length > 0 ? (completed / habits.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Today's Habits</h1>
        <p className="text-zinc-500 text-sm mb-6">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">{completed} of {habits.length}</span>
            <span className="text-violet-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: progress + '%' }} />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={\`p-4 rounded-xl border cursor-pointer transition-all \${
                habit.done 
                  ? 'bg-violet-500/20 border-violet-500/30' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }\`}
            >
              <div className="flex items-center gap-4">
                <div className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center \${
                  habit.done ? 'border-violet-400 bg-violet-400/20' : 'border-zinc-600'
                }\`}>
                  {habit.done && <span className="text-violet-400">✓</span>}
                </div>
                <span className="flex-1">{habit.name}</span>
                <span className="text-sm">🔥 {habit.streak}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="New habit..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500"
          />
          <button onClick={addHabit} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}`;

const TODO_APP_CODE = `// Todo App
// Built with KODA

export default function TodoApp() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Design landing page', done: false },
    { id: 2, text: 'Review pull requests', done: true },
    { id: 3, text: 'Update documentation', done: false },
  ]);
  const [newTodo, setNewTodo] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
    setNewTodo('');
  };

  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(todos.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-center text-slate-400 mb-8">Focus on what matters</p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500"
          />
          <button onClick={addTodo} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold">
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-slate-800 rounded-lg">
          {['all', 'active', 'done'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`flex-1 py-2 rounded-md text-sm font-medium \${filter === f ? 'bg-slate-700' : 'text-slate-400'}\`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((todo) => (
            <div key={todo.id} className="group flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl">
              <button
                onClick={() => toggle(todo.id)}
                className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${
                  todo.done ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'
                }\`}
              >
                {todo.done && <span className="text-xs">✓</span>}
              </button>
              <span className={\`flex-1 \${todo.done ? 'line-through text-slate-500' : ''}\`}>{todo.text}</span>
              <button onClick={() => remove(todo.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400">
                ✕
              </button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          {todos.filter(t => !t.done).length} tasks remaining
        </p>
      </div>
    </div>
  );
}`;

const DASHBOARD_CODE = `// Analytics Dashboard
// Built with KODA

export default function Dashboard() {
  const stats = [
    { label: 'Revenue', value: '$48,352', change: '+12.5%', up: true, icon: '💰' },
    { label: 'Users', value: '2,847', change: '+8.2%', up: true, icon: '👥' },
    { label: 'Conversion', value: '3.24%', change: '-0.4%', up: false, icon: '📊' },
    { label: 'Avg. Session', value: '4m 32s', change: '+18.7%', up: true, icon: '⏱️' },
  ];

  const chartData = [35, 45, 38, 52, 48, 65, 72];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-500 mb-8">Welcome back, here's what's happening</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={\`text-xs font-medium px-2 py-1 rounded-full \${
                  stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }\`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <h2 className="font-semibold mb-6">Revenue Overview</h2>
          <div className="flex items-end justify-between h-48 gap-3">
            {chartData.map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg hover:from-violet-500 hover:to-violet-300 cursor-pointer transition-all"
                  style={{ height: (value / Math.max(...chartData)) * 100 + '%' }}
                />
                <span className="text-xs text-zinc-500">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;

const LANDING_PAGE_CODE = `// Landing Page
// Built with KODA

export default function LandingPage() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Built for speed.' },
    { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security.' },
    { icon: '🎨', title: 'Beautiful', desc: 'Stunning interfaces.' },
    { icon: '📱', title: 'Responsive', desc: 'Perfect on every device.' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-fuchsia-500 rounded-full opacity-20 blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold">Nova<span className="text-violet-400">.</span></div>
        <button className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200">
          Get Started
        </button>
      </nav>

      <section className="relative z-10 px-8 pt-20 pb-32 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm text-zinc-400 mb-8 border border-zinc-800">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Build faster.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Ship sooner.
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10">
            The modern platform for building exceptional products.
          </p>
          
          {submitted ? (
            <div className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              ✓ You're on the list!
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500"
              />
              <button 
                onClick={() => email && setSubmitted(true)}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold"
              >
                Get Early Access
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 px-8 py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}`;

const CHAT_APP_CODE = `// Chat App
// Built with KODA

export default function ChatApp() {
  const [messages, setMessages] = React.useState([
    { id: 1, from: 'them', text: 'Hey! How is the project going?', time: '10:30' },
    { id: 2, from: 'me', text: 'Pretty good! Just finished the design.', time: '10:32' },
    { id: 3, from: 'them', text: 'Amazing! Can you share screenshots?', time: '10:33' },
  ]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);

  const send = () => {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setMessages([...messages, { id: Date.now(), from: 'me', text: input, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = ['Nice! 👍', 'Sounds good!', 'Awesome! 🎉', 'Got it!'];
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        from: 'them', 
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
    }, 1500);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center font-bold">
          A
        </div>
        <div>
          <div className="font-medium">Alice</div>
          <div className="text-xs text-emerald-400">Online</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={\`flex \${msg.from === 'me' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-xs px-4 py-2 rounded-2xl \${
              msg.from === 'me' 
                ? 'bg-violet-600 rounded-br-sm' 
                : 'bg-zinc-800 rounded-bl-sm'
            }\`}>
              <p>{msg.text}</p>
              <p className={\`text-xs mt-1 \${msg.from === 'me' ? 'text-violet-200' : 'text-zinc-500'}\`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500"
        />
        <button onClick={send} className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl">
          Send
        </button>
      </div>
    </div>
  );
}`;

const PORTFOLIO_CODE = `// Portfolio
// Built with KODA

export default function Portfolio() {
  const projects = [
    { title: 'E-commerce Platform', tag: 'Full Stack', color: 'from-violet-500 to-fuchsia-500' },
    { title: 'AI Dashboard', tag: 'Frontend', color: 'from-cyan-500 to-blue-500' },
    { title: 'Mobile App', tag: 'UI/UX', color: 'from-emerald-500 to-teal-500' },
    { title: 'SaaS Analytics', tag: 'Full Stack', color: 'from-amber-500 to-orange-500' },
  ];

  const skills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'Design', level: 80 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="px-8 py-6 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">JD<span className="text-violet-400">.</span></div>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white">Work</a>
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </nav>

      <section className="px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-violet-400 mb-4">Hello, I'm</p>
          <h1 className="text-5xl font-bold mb-6">John Designer</h1>
          <p className="text-xl text-zinc-400 max-w-xl mb-8">
            A full-stack developer crafting digital experiences.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-black rounded-full font-medium">View Projects</button>
            <button className="px-6 py-3 border border-zinc-700 rounded-full">Contact</button>
          </div>
        </div>
      </section>

      <section className="px-8 py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <div key={i} className={\`aspect-video rounded-2xl bg-gradient-to-br \${p.color} p-8 flex flex-col justify-end cursor-pointer hover:scale-[1.02] transition-transform\`}>
                <span className="text-sm bg-black/20 px-3 py-1 rounded-full w-fit mb-2">{p.tag}</span>
                <h3 className="text-2xl font-bold">{p.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Skills</h2>
          <div className="max-w-md space-y-6">
            {skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{s.name}</span>
                  <span className="text-zinc-500">{s.level}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: s.level + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`;

const DEFAULT_APP_CODE = `// Starter App
// Built with KODA

export default function App() {
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState([
    { id: 1, name: 'First item', status: 'active' },
    { id: 2, name: 'Second item', status: 'pending' },
    { id: 3, name: 'Third item', status: 'done' },
  ]);
  const [newItem, setNewItem] = React.useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now(), name: newItem, status: 'active' }]);
    setNewItem('');
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    done: 'bg-zinc-500/20 text-zinc-400',
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Your App
        </h1>
        <p className="text-zinc-400 mb-8">Built with KODA</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-zinc-800 rounded-2xl text-center">
            <div className="text-3xl font-bold text-violet-400">{items.length}</div>
            <div className="text-sm text-zinc-500">Items</div>
          </div>
          <div className="p-6 bg-zinc-800 rounded-2xl text-center">
            <div className="text-3xl font-bold text-emerald-400">{items.filter(i => i.status === 'active').length}</div>
            <div className="text-sm text-zinc-500">Active</div>
          </div>
          <div className="p-6 bg-zinc-800 rounded-2xl text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{count}</div>
            <div className="text-sm text-zinc-500">Counter</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => setCount(c => c - 1)} className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xl font-bold">-</button>
          <span className="text-4xl font-bold w-16 text-center">{count}</span>
          <button onClick={() => setCount(c => c + 1)} className="w-12 h-12 bg-violet-600 hover:bg-violet-500 rounded-xl text-xl font-bold">+</button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add item..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-violet-500"
          />
          <button onClick={addItem} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium">Add</button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
              <span>{item.name}</span>
              <span className={\`px-3 py-1 text-xs font-medium rounded-full \${statusColors[item.status]}\`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;

// ============================================
// MAIN COMPONENT
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

  const MAX_FREE = 20;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generate = async () => {
    if (!idea.trim() || isGenerating || usageCount >= MAX_FREE) return;

    setHasStarted(true);
    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', text: idea }]);
    setMessages(prev => [...prev, { type: 'system', text: '⚡ Generating your app...' }]);

    try {
      const code = await generateAppCode(idea);
      setGeneratedCode(code);
      setUsageCount(prev => prev + 1);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'bot', text: '✓ Done! Your app is ready.' };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'error', text: 'Something went wrong.' };
        return updated;
      });
    }

    setIsGenerating(false);
    setIdea('');
  };

  const iterate = async () => {
    if (!iterationInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setMessages(prev => [...prev, { type: 'user', text: iterationInput }]);
    setMessages(prev => [...prev, { type: 'system', text: '⚡ Updating...' }]);

    try {
      const code = await generateAppCode(iterationInput, generatedCode, iterationInput);
      setGeneratedCode(code);
      setUsageCount(prev => prev + 1);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'bot', text: '✓ Updated!' };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'error', text: 'Error updating.' };
        return updated;
      });
    }

    setIsGenerating(false);
    setIterationInput('');
  };

  const download = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.jsx';
    a.click();
  };

  const copy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // LANDING
  // ============================================
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600 rounded-full opacity-10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full opacity-10 blur-[120px]" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold">K</div>
            <span className="text-xl font-semibold">KODA</span>
          </div>
          <span className="text-sm text-emerald-400">✓ {MAX_FREE} free generations</span>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="text-center max-w-2xl mb-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Idea → App
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            <p className="text-lg text-zinc-400">
              Describe what you want. Watch it come to life.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generate();
                  }
                }}
                placeholder="Describe your app... (e.g. 'A habit tracker with streaks')"
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:border-violet-500 resize-none h-28 text-base"
              />
              <button
                onClick={generate}
                disabled={!idea.trim() || isGenerating}
                className={`absolute bottom-3 right-3 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  idea.trim() ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate →'}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {['Habit tracker', 'Todo app', 'Dashboard', 'Landing page', 'Chat app'].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-white hover:border-zinc-700"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-sm text-zinc-600">
          Ett alternativ till dyra AI-builders
        </footer>
      </div>
    );
  }

  // ============================================
  // MAIN APP
  // ============================================
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
          <span className="font-semibold">KODA</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{MAX_FREE - usageCount} left</span>
          {generatedCode && (
            <>
              <button onClick={copy} className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button onClick={download} className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium">
                Download
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.type === 'user' ? 'bg-violet-600 rounded-br-sm' :
                  msg.type === 'error' ? 'bg-rose-500/20 text-rose-300' :
                  msg.type === 'system' ? 'bg-zinc-800 text-zinc-400' :
                  'bg-zinc-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedCode ? iterationInput : idea}
                onChange={(e) => generatedCode ? setIterationInput(e.target.value) : setIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (generatedCode ? iterate() : generate())}
                placeholder={generatedCode ? "Describe changes..." : "Describe your app..."}
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={generatedCode ? iterate : generate}
                disabled={isGenerating}
                className="px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium"
              >
                {isGenerating ? '...' : generatedCode ? 'Update' : 'Build'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview/Code */}
        <div className="hidden md:flex w-1/2 flex-col bg-zinc-900">
          <div className="flex gap-1 p-2 border-b border-zinc-800">
            <button
              onClick={() => setShowCode(false)}
              className={`px-4 py-2 text-sm rounded-lg ${!showCode ? 'bg-zinc-800' : 'text-zinc-400'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`px-4 py-2 text-sm rounded-lg ${showCode ? 'bg-zinc-800' : 'text-zinc-400'}`}
            >
              Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {generatedCode ? (
              showCode ? (
                <pre className="h-full overflow-auto p-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                  {generatedCode}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🚀</div>
                    <p className="font-medium mb-2">App Generated!</p>
                    <p className="text-sm text-zinc-600 max-w-xs">
                      Click "Download" to get the code. Paste it into v0, Lovable, or run locally.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <div className="text-5xl mb-4">✨</div>
                  <p>Your app will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
