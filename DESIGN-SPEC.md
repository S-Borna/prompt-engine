# PRAXIS — Design Specification

> **Version:** 1.0
> **Senast uppdaterad:** 2026-02-06
> **Syfte:** Extremt detaljerad designspecifikation för hela PRAXIS-plattformen.
> Används som referensdokument för framtida projekt, onboarding och design-konsistens.

---

## Innehåll

1. [Teknisk Stack](#1-teknisk-stack)
2. [Design Tokens & CSS-variabler](#2-design-tokens--css-variabler)
3. [Typografi](#3-typografi)
4. [Färgpalett](#4-färgpalett)
5. [Layoutsystem](#5-layoutsystem)
6. [Animationer & Transitions](#6-animationer--transitions)
7. [Landing Page (pre-login)](#7-landing-page-pre-login)
8. [Dashboard Layout (post-login)](#8-dashboard-layout-post-login)
9. [Dashboard-sidor](#9-dashboard-sidor)
10. [Komponentbibliotek](#10-komponentbibliotek)
11. [Model Insight Popover](#11-model-insight-popover)
12. [Structured Prompt Output](#12-structured-prompt-output)
13. [Toasts & Feedback](#13-toasts--feedback)
14. [Responsiv Design](#14-responsiv-design)
15. [Tillgänglighet](#15-tillgänglighet)
16. [Scrollbar & Selection](#16-scrollbar--selection)
17. [Säkerhet (SecurityShield)](#17-säkerhet-securityshield)

---

## 1. Teknisk Stack

| Komponent | Teknologi | Version | Notering |
|-----------|-----------|---------|----------|
| Framework | Next.js | 16.1.6 | App Router, `'use client'` för interaktiva sidor |
| Språk | TypeScript | 5.x | Strikt läge |
| Styling | Tailwind CSS | 4.1.18 | `@import 'tailwindcss'` syntax (ej `@tailwind`) |
| Font loading | `next/font/google` | — | `Inter` med `display: 'swap'`, variabel `--font-inter` |
| State management | Zustand | 5.x | `usePromptStore` för prompts, history, folders |
| Auth | NextAuth.js | 5.x (beta) | JWT strategy, Credentials + Google/GitHub OAuth |
| Databas | Railway Postgres | — | Prisma 7 + `@prisma/adapter-pg` |
| Hosting | Cloudflare Workers | — | Via `@opennextjs/cloudflare` 1.16.2 |
| Build | webpack | — | `npx next build --webpack` (INTE Turbopack) |
| Icons | Lucide React | — | Alla ikoner importeras per komponent |
| Toast | react-hot-toast | — | Bottom-right, glasmorfism-stil |
| Animationer | Vanilla CSS + IntersectionObserver | — | Inga externa animationsbibliotek i produktion |

### Build Pipeline

```bash
rm -rf .next .open-next           # ALLTID rensa först
npx next build --webpack          # INTE turbopack (pg-modul kraschar)
npx opennextjs-cloudflare build   # Genererar .open-next/worker.js
npx wrangler deploy --compatibility-date=2025-01-10
```

---

## 2. Design Tokens & CSS-variabler

Definierade i `src/app/globals.css` under `:root`. Alla komponenter refererar till dessa.

### Bakgrundsfärger

| Token | Värde | Användning |
|-------|-------|------------|
| `--color-bg` | `#09090b` | Huvudbakgrund (body, sidebar, main) |
| `--color-bg-subtle` | `#0c0c0f` | Upphöjda ytor (demo-fönster, modaler) |
| `--color-bg-muted` | `#131316` | Inaktiva element |

### Textfärger

| Token | Värde | Användning |
|-------|-------|------------|
| `--color-text` | `#ffffff` | Primär text |
| `--color-text-muted` | `rgba(255,255,255,0.6)` | Sekundär text, descriptions |
| `--color-text-subtle` | `rgba(255,255,255,0.4)` | Tertiär text, labels |
| `--color-text-faint` | `rgba(255,255,255,0.25)` | Placeholders, meta |

### Borders

| Token | Värde | Användning |
|-------|-------|------------|
| `--color-border` | `rgba(255,255,255,0.06)` | Standard border (cards, dividers) |
| `--color-border-hover` | `rgba(255,255,255,0.12)` | Hover-state borders |

### Brand

| Token | Värde | Hex | Användning |
|-------|-------|-----|------------|
| `--color-primary` | `#8B5CF6` | Violet 500 | Primär accent (knappar, badges, glöd) |
| `--color-primary-hover` | `#7C3AED` | Violet 600 | Hover-state |
| `--color-secondary` | `#6366F1` | Indigo 500 | Sekundär accent (gradient-slut) |

### Gradienter

| Token | Värde | Användning |
|-------|-------|------------|
| `--gradient-primary` | `linear-gradient(135deg, #8B5CF6, #6366F1)` | CTA-knappar, sidebar-logo, tier badges |
| `--gradient-text` | `linear-gradient(90deg, #A78BFA, #818CF8, #6366F1)` | Gradient-text (headline emphasis) |

### Spacing Scale (4px base)

| Token | Värde | px |
|-------|-------|----|
| `--space-1` | `0.25rem` | 4 |
| `--space-2` | `0.5rem` | 8 |
| `--space-3` | `0.75rem` | 12 |
| `--space-4` | `1rem` | 16 |
| `--space-5` | `1.25rem` | 20 |
| `--space-6` | `1.5rem` | 24 |
| `--space-8` | `2rem` | 32 |
| `--space-10` | `2.5rem` | 40 |
| `--space-12` | `3rem` | 48 |
| `--space-16` | `4rem` | 64 |
| `--space-20` | `5rem` | 80 |
| `--space-24` | `6rem` | 96 |

### Radius Scale

| Token | Värde | Användning |
|-------|-------|------------|
| `--radius-sm` | `0.375rem` (6px) | Små element (badges dot) |
| `--radius-md` | `0.5rem` (8px) | Inputs, small cards |
| `--radius-lg` | `0.75rem` (12px) | Knappar, nav items |
| `--radius-xl` | `1rem` (16px) | Cards |
| `--radius-2xl` | `1.25rem` (20px) | Stora cards, modaler |
| `--radius-3xl` | `1.5rem` (24px) | Demo-fönster |
| `--radius-full` | `9999px` | Pills, badges, avatar |

### Shadows

| Token | Värde | Användning |
|-------|-------|------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.5)` | Subtila element |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.3)` | Dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.25)` | Modaler |
| `--shadow-glow` | `0 0 40px rgba(139,92,246,0.15)` | CTA-knappar, hero-element |

### Transitions

| Token | Värde | Användning |
|-------|-------|------------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard easing — snabb start, mjuk landing |
| `--duration-fast` | `150ms` | Hover-states, focus |
| `--duration-normal` | `250ms` | Knappar, cards |
| `--duration-slow` | `400ms` | Sektions-transitions |

---

## 3. Typografi

### Fonter

| Font | CSS-variabel | Fallback | Användning |
|------|-------------|----------|------------|
| Inter | `--font-sans` | -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif | All body text |
| JetBrains Mono | `--font-mono` | 'SF Mono', Consolas, monospace | Code blocks, prompt mono-text |

### Font Loading

```tsx
// src/app/layout.tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap",         // Visar fallback direkt, byter vid laddning
  variable: "--font-inter",
});
// Applied: <html className={`${inter.variable} dark`}>
// Body:    <body className="font-sans antialiased ...">
```

### Headings

- **Weight:** 600 (semibold) som standard, 700-800 för hero
- **Line-height:** 1.2 för headings, 1.08 för hero
- **Letter-spacing:** `-0.02em` för headings, `-0.03em` för hero
- **Margin:** Alltid `0` (reset), spacing via Tailwind `mb-*`

### Text Rendering

```css
html {
  -webkit-font-smoothing: antialiased;    /* Tunnare rendering på macOS */
  -moz-osx-font-smoothing: grayscale;
}
```

### Text Selection

```css
::selection {
  background-color: rgba(139, 92, 246, 0.3);  /* Violet highlight */
  color: white;
}
```

---

## 4. Färgpalett

### Primärt (Brand)

| Namn | Hex | Opacity-varianter | Kontext |
|------|-----|-------------------|---------|
| Violet 400 | `#A78BFA` | — | Gradient text start |
| Violet 500 | `#8B5CF6` | 0.08, 0.10, 0.15, 0.20, 0.25 | Primär accent |
| Violet 600 | `#7C3AED` | — | Hover state |
| Indigo 400 | `#818CF8` | — | Gradient text mitt |
| Indigo 500 | `#6366F1` | — | Sekundär accent, gradient-slut |
| Indigo 600 | `#4F46E5` | — | Djupare hover |

### AI Platform-färger

| Plattform | Hex | Tailwind | Kontext |
|-----------|-----|----------|---------|
| OpenAI (ChatGPT) | `#10b981` | emerald-500 | Modellkort, platform strip |
| Anthropic (Claude) | `#f97316` | orange-500 | Modellkort, platform strip |
| Google (Gemini) | `#3b82f6` | blue-500 | Modellkort, platform strip |
| xAI (Grok) | `#94a3b8` | slate-400 | Modellkort, platform strip |
| OpenAI (Sora) | `#ec4899` | pink-500 | ModelInsightPopover |
| Nano (Banana) | `#eab308` | yellow-500 | ModelInsightPopover |

### Tier System

| Tier | Gradient | Ikon | Glow |
|------|----------|------|------|
| CREATOR | `from-amber-400 via-yellow-500 to-orange-500` | Crown | `shadow-amber-500/20` |
| PRO | `from-violet-500 to-purple-600` | Zap | `shadow-violet-500/15` |
| TEAM | `from-blue-500 to-blue-600` | Zap | `shadow-blue-500/15` |
| ENTERPRISE | `from-emerald-500 to-emerald-600` | Crown | `shadow-emerald-500/15` |
| FREE | `from-zinc-500 to-zinc-600` | Zap | — |

### Semantiska färger

| Syfte | Färg | Kontext |
|-------|------|---------|
| Success | emerald-400/500 | Quality scores, check marks, "Prompt Improved" |
| Warning | amber-400/500 | Trial countdown ≤10 prompts, prompt counter |
| Critical | red-400/500 | Trial expired, ≤3 prompts, errors |
| Info | blue-400 | Gemini-optimized, informational badges |

### Opacity Scale (för white-on-dark)

| Opacity | Hex-form | Användning |
|---------|----------|------------|
| 0.02 | `bg-white/[0.02]` | Card bakgrund (subtilt upphöjd) |
| 0.03 | `bg-white/[0.03]` | Input bakgrund, hover state level 1 |
| 0.04 | `bg-white/[0.04]` | Input hover, icon bakgrund |
| 0.05 | `bg-white/[0.05]` | Aktiv nav-item |
| 0.06 | — | Standard border |
| 0.08 | `bg-white/[0.08]` | Aktiv sidebar-item, selected state |
| 0.10 | `bg-white/[0.1]` | Tydlig border hover |
| 0.12 | — | Input focus border |
| 0.15 | — | Stark border hover |
| 0.20 | — | Mycket synlig text/border |

---

## 5. Layoutsystem

### Landing Page

- **Max-width:** `max-w-5xl` (64rem = 1024px) för hero, `max-w-6xl` (72rem = 1152px) för nav
- **Max-width (demo):** `max-w-4xl` (56rem = 896px)
- **Container:** `max-w-6xl mx-auto px-6`
- **Section padding:** `py-24` (6rem), hero `pt-36 pb-16`
- **Section dividers:** Horisontell gradient-linje `w-[600px] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent`

### Dashboard

- **Sidebar collapsed:** `w-[68px]`
- **Sidebar expanded:** `w-[240px]`
- **Transition:** `transition-all duration-300`
- **Main content:** `marginLeft` dynamiskt (68px eller 240px)
- **Top bar:** `h-20`, sticky, `bg-[#09090b]/90 backdrop-blur-xl`
- **Content area:** `px-4 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto`
- **Min-height:** `min-h-[calc(100vh-80px)]` för main content

### Grids

| Kontext | Konfiguration |
|---------|--------------|
| Feature cards | `grid md:grid-cols-2 lg:grid-cols-3 gap-5` |
| How it works | `grid md:grid-cols-3 gap-6` |
| Pricing cards | `grid md:grid-cols-3 gap-5 max-w-4xl mx-auto` |
| Stats | `grid grid-cols-2 md:grid-cols-4 gap-8` |
| Settings | `grid grid-cols-2 gap-5` (profile form) |
| Billing plans | `grid grid-cols-1 md:grid-cols-3 gap-6` |
| Library (grid mode) | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` |

### Flex Patterns

| Pattern | Användning |
|---------|------------|
| `flex flex-col items-center text-center` | Alla section headers (centreringsbuggen) |
| `flex items-center gap-*` | Nav items, button groups, badges |
| `flex items-center justify-between` | Headers, action bars |
| `flex flex-col sm:flex-row items-center gap-4` | Responsiva CTA-grupper |

---

## 6. Animationer & Transitions

### Keyframe-animationer (globals.css)

#### `fadeIn`

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Användning:** Hero-element med staggered delay, global `.animate-fade-in`

#### `pulse`

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
```

**Användning:** Typewriter cursor, critical trial warning, processing indicators

#### `spin`

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

**Användning:** Loader2-ikon (processing state), transforming-animation

### Hero Staggered Entrance

Varje hero-element har en individuell delay:

```
Eyebrow badge:   animate-[fadeIn_0.6s_ease-out_0.1s_forwards]   opacity-0
Headline:         animate-[fadeIn_0.6s_ease-out_0.2s_forwards]   opacity-0
Subtitle:         animate-[fadeIn_0.6s_ease-out_0.35s_forwards]  opacity-0
CTA buttons:      animate-[fadeIn_0.6s_ease-out_0.45s_forwards]  opacity-0
Trust line:       animate-[fadeIn_0.6s_ease-out_0.55s_forwards]  opacity-0
Platform strip:   animate-[fadeIn_0.6s_ease-out_0.65s_forwards]  opacity-0
```

Alla har `opacity-0` som initial state → `forwards` behåller `opacity: 1` efter animation.

### RevealSection (Scroll Reveal)

```tsx
function RevealSection({ children, delay = 0 }) {
  // IntersectionObserver med threshold: 0.1
  // setTimeout(delay) innan visible = true
  // Transition:
  //   opacity-0 translate-y-6 → opacity-100 translate-y-0
  //   duration-700 ease-out
}
```

**Staggered delays per sektion:**

- Feature cards: `delay={i * 80}` (0, 80, 160, 240, 320, 400ms)
- How It Works: `delay={i * 120}` (0, 120, 240ms)
- Pricing: `delay={0}`, `delay={100}`, `delay={200}`
- Demo section header: `delay={0}`, demo body: `delay={150}`

### AnimatedNumber (Counter)

```tsx
function AnimatedNumber({ target, duration = 2000, suffix }) {
  // IntersectionObserver med threshold: 0.3
  // Cubic ease-out: 1 - Math.pow(1 - progress, 3)
  // requestAnimationFrame loop
  // Runs once (started.current guard)
}
```

**Stats som animeras:** `4+`, `9`, `2`, `30s`

### LiveDemo Transform Animation

3 faser:

1. **Before** → Visar enkel prompt, quality bar 12% (röd)
2. **Transforming** (1200ms) → Concentric circles:
   - Yttre: `animate-ping` (pulserar ut)
   - Mellan: `animate-spin` (roterar)
   - Inner: Statisk gradient med Sparkles-ikon
3. **After** → `visibleSections` animerat med `transition-all duration-700`

### Frosted Glass Nav

```tsx
// Trigger: scrollY > 50
<header className={`... ${scrollY > 50
  ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]'
  : ''
}`}>
```

### Knapp Hover States

| Knapp-typ | Normal | Hover |
|-----------|--------|-------|
| CTA Primary | `shadow-lg shadow-violet-500/25` | `shadow-xl shadow-violet-500/35` + `scale-[1.02]` |
| CTA Secondary | `border-white/[0.08]` | `border-white/[0.15]` |
| `.btn-primary` (CSS) | `box-shadow: 0 4px 14px rgba(139,92,246,0.25)` | `box-shadow: 0 6px 20px rgba(139,92,246,0.35)` + `translateY(-1px)` |
| `.btn-secondary` (CSS) | `bg-white/0.05, border: 1px solid var(--color-border)` | `bg-white/0.08, border-color: var(--color-border-hover)` |
| Sidebar nav item | `bg-transparent` | `bg-white/[0.03]` |
| Footer links | `text-white/30` | `text-white/50` |

### Card Hover States

| Card-typ | Normal | Hover |
|----------|--------|-------|
| Feature cards | `border-white/[0.06] bg-white/[0.015]` | `border-white/[0.1] bg-white/[0.03]` |
| Feature icon | `border-violet-500/10` | `border-violet-500/20` |
| How It Works cards | `border-white/[0.06] bg-white/[0.015]` | `border-white/[0.1] bg-white/[0.03]` |
| `.card` (CSS) | `bg-white/0.02, border: var(--color-border)` | `bg-white/0.04, border-color: var(--color-border-hover)` |
| Library prompt cards | `border-white/[0.06]` | `border-white/[0.12]` + `bg-white/[0.04]` |

### Arrow Nudge

```
ArrowRight: group-hover:translate-x-0.5 transition-transform
ArrowRight: group-hover:translate-x-1 transition-transform  (demo CTA)
```

### Sidebar Collapse Animation

```css
transition-all duration-300
/* Sidebar: w-[240px] → w-[68px] */
/* ChevronLeft: rotate-180 on collapse */
/* Main content: marginLeft animeras dynamiskt */
```

---

## 7. Landing Page (pre-login)

**Fil:** `src/app/page.tsx` (703 rader, `'use client'`)

### Struktur (top-to-bottom)

| Ordning | Sektion | ID | Padding |
|---------|---------|-----|---------|
| 1 | Navigation | — | `h-16`, fixed top, z-50 |
| 2 | Hero | — | `pt-36 pb-16` |
| 3 | Live Demo | `#demo` | `py-24` |
| 4 | Features | `#features` | `py-24` |
| 5 | How It Works | `#how-it-works` | `py-24` |
| 6 | Stats | — | `py-16` |
| 7 | Pricing | `#pricing` | `py-24` |
| 8 | Final CTA | — | `py-32` |
| 9 | Footer | — | `py-12` |

### Navigation

- **Position:** `fixed top-0 left-0 right-0 z-50`
- **Height:** `h-16`
- **Glassmorfism:** Aktiveras vid `scrollY > 50`:
  - `bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]`
- **Scroll tracking:** `useEffect` med `{ passive: true }` event listener
- **Logo:** 8×8 rounded-lg gradient box med Sparkles-ikon + "PRAXIS" bold text
- **Links:** Demo, Features, How It Works, Pricing — `text-white/50 hover:text-white`
- **Auth:** "Log in" (ghost) + "Get Started" (gradient pill med shadow)

### Hero

- **Ambient radial glow:**
  - Toppen: `w-[900px] h-[600px]`, ellipse 80%×50%, `rgba(139,92,246,0.12)`
  - Höger: `w-[400px] h-[400px]`, `rgba(99,102,241,0.06)`
- **Eyebrow badge:** Pill med Zap-ikon, violet glow: `bg-violet-500/[0.08] border-violet-500/[0.15]`
- **Headline:** Responsivt `text-4xl sm:text-5xl md:text-6xl lg:text-[68px]`
  - Rad 1: "Better prompts," (white/95)
  - Rad 2: "better results." (gradient text — violet→purple→indigo)
- **Subtitle:** `text-lg md:text-xl text-white/50 max-w-2xl`
- **CTAs:**
  - Primary: "Start Free Trial" — gradient pill, ArrowRight med hover-nudge
  - Secondary: "See How It Works" — outline, ArrowDown-ikon
- **Trust line:** "Free 7-day trial · No credit card required" `text-white/25`
- **Platform strip:** "Works with" + 4 plattformar med färgade dots

### Live Demo

- **Fönster-chrome:** 3 prickar (röd/gul/grön /60 opacity), URL-bar `praxis.saidborna.com`
- **Min-height:** `420px`
- **BEFORE_PROMPT:** `"Help me plan a healthy weekly meal plan"` (7 ord)
- **AFTER_PROMPT:** 180-ord strukturerad nutritionist-prompt
- **Quality bars:** 12% (röd) → 94% (grön)
- **Tre faser:** Se avsnitt 6 (Animationer)
- **CTA-knapp:** "Transform with PRAXIS" — gradient, shadow, `hover:scale-[1.02]`
- **Reset:** "↺ Try again" länk

### Features

- **6 feature cards** i 3-kolumns grid
- **Ikoner:** Layers, Target, Eye, BarChart3, Zap, Shield (alla Lucide)
- **Icon-box:** `w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/10 border border-violet-500/10`
- **Card-struktur:** Icon → Title (base, semibold, white/90) → Description (sm, white/40)
- **Features:**
  1. Structured Output
  2. Platform-Aware
  3. Full Transparency
  4. Quality Scoring
  5. Two Enhancement Modes
  6. Domain Detection

### How It Works

- **3 step-cards** med stor step-nummer
- **Step-nummer:** `text-5xl font-black text-violet-500/[0.08]`
- **Steps:**
  1. "Write your prompt"
  2. "PRAXIS refines it"
  3. "Use it anywhere"

### Stats

- **Boxed card:** `rounded-2xl border bg-white/[0.015] p-10`
- **4 counters** med `AnimatedNumber`:
  - 4+ AI platforms supported
  - 9 Domains detected
  - 2 Enhancement modes
  - 30s Average turnaround

### Pricing

- **3 tiers:**

| Tier | Pris | Featured | CTA |
|------|------|----------|-----|
| Trial | $0 / 7 days | Nej | "Start Free Trial" (outline) |
| Standard | $9.99 / month | Ja — `scale-[1.02]`, `border-2 border-violet-500/30` | "Get Started" (gradient) |
| Premium | $14.99 / month | Nej | "Upgrade to Premium" (outline) |

- **"Most Popular" badge:** Absolut positionerad `-top-3`, gradient pill, `shadow-lg shadow-violet-500/20`
- **Check marks:** Violet för Standard (`text-violet-400/60`), white/20 för övriga
- **Star-ikon** på Premium-titeln (`text-amber-400`)
- **Pris-formatting:** Heltal i 4xl bold, decimaler i lg/50 opacity

### Final CTA

- **Bakgrund:** Bottom radial glow `rgba(139,92,246,0.08)`
- **Headline:** "Ready to get more from every AI conversation?"
- **CTA:** "Start Free Trial" — `text-lg`, extra stor padding `px-10 py-4`
- **Trust:** "Free for 7 days · Cancel anytime"

### Footer

- **Border-top:** `border-white/[0.06]`
- **Tre kolumner** (flex row):
  1. PRAXIS logo (7×7)
  2. Legal links: Terms, Privacy, Cookies → `text-white/30 hover:text-white/50`
  3. Kontakt-email
- **Bottom bar:** © + "Created and designed by Said Borna"

---

## 8. Dashboard Layout (post-login)

**Fil:** `src/app/dashboard/layout.tsx` (550 rader, `'use client'`)

### Session & Auth

```tsx
const { data: session, status } = useSession();
// Redirectar till /login om ej inloggad
// Hämtar: session.user.email, session.user.name, session.user.tier, session.user.trialEndsAt
```

### Sidebar

#### Struktur (top-to-bottom)

1. **Logo** — Samma gradient-box som landing page, "PRAXIS" text
2. **Main Navigation** (`mainNav`)
   - Improve Prompt → `/dashboard/spark` — gradient `from-violet-500 to-purple-600`
   - Refine Prompt → `/dashboard/precision` — gradient `from-red-500 to-red-600`
3. **Divider** — `h-px bg-white/[0.04]`
4. **Secondary Navigation** (`secondaryNav`)
   - Label: "LIBRARY" (10px uppercase, tracking-widest, white/25)
   - Library → `/dashboard/library` — FolderOpen-ikon
   - History → `/dashboard/history` — Clock-ikon
5. **Settings Navigation** (`settingsNav`)
   - Label: "ACCOUNT" (10px uppercase, tracking-widest, white/25)
   - Settings → `/dashboard/settings` — Settings-ikon
   - Billing → `/dashboard/billing` — CreditCard-ikon
6. **Trial Info Card** (free users only)
7. **Profile Card**
8. **Collapse Toggle** — ChevronLeft

#### Nav Item States

| State | Bakgrund | Text | Icon Container |
|-------|----------|------|---------------|
| Default | `transparent` | `text-white/60` | `bg-white/[0.04]` |
| Hover | `bg-white/[0.03]` | `text-white/80` | `bg-white/[0.06]` |
| Active (main) | `bg-white/[0.05]` | `text-white font-medium` | `bg-gradient-to-br {item.gradient}` |
| Active (secondary) | `bg-white/[0.04]` | `text-white` | — |

#### Trial Info Card

**Trigger:** `!isPaid` (free/trial users)

**States baserat på `counterWarning`:**

| State | Prompts ≤ | Bakgrund | Border | Text |
|-------|----------|----------|--------|------|
| normal | > 20 | `bg-white/[0.02]` | `border-white/[0.04]` | white/40 |
| notice | ≤ 20 | `bg-amber-500/[0.06]` | `border-amber-500/10` | white/40 |
| warning | ≤ 10 | `bg-amber-500/10` | `border-amber-500/15` | amber-400 |
| critical | ≤ 3 | `bg-red-500/10` + `animate-pulse` | `border-red-500/20` | red-400 |
| expired | 0 / trial expired | `bg-red-500/10` | `border-red-500/20` | red-400 |

**Prompt counter:** `text-lg font-bold tabular-nums` — färg följer warning state

**Progress bar:**

- **Container:** `h-1.5 bg-white/[0.06] rounded-full`
- **Fill:** Gradient baserat på state, `transition-all duration-700 ease-out`
  - normal: `from-violet-500 to-indigo-500`
  - notice: `from-amber-500/70 to-yellow-400`
  - warning: `from-amber-500 to-amber-400`
  - critical: `from-red-500 to-red-400`
- **Min-width:** `Math.max(2, (promptsRemaining / TRIAL_LIMIT) * 100)%`

**Trial days countdown:**

- "Free Trial" label + `Xd left` eller "Expired"
- Separator: `border-b border-white/[0.04]`

**Warning messages (critical/warning):**

- AlertTriangle-ikon + text
- "Upgrade to Pro" CTA-länk: Gradient pill till `/dashboard/billing`

#### Profile Card

- **Avatar:** `w-9 h-9 rounded-xl` med gradient (Creator: amber→yellow→orange, andra: tier gradient)
- **Tier badge dot:** `w-3.5 h-3.5 rounded-full` absolut positionerad top-right, med `ring-2 ring-[#09090b]`
- **Creator special:**
  - Avatar: `shadow-lg shadow-amber-500/20`
  - Card: `bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.04] border border-amber-500/10`
  - "Unlimited access" text
- **Tier badge pill:** `text-[9px] font-bold uppercase tracking-wider` med gradient bakgrund + glow shadow
- **Quick Actions:** Settings + Sign Out — `text-[11px]`, hover:red-400 för Sign Out

#### Collapsed Sidebar

- Logo utan text
- Nav icons centrerade utan labels
- Prompt counter: `w-8 h-8` numerisk display
- Profil: Avatar + collapse-knapp
- Tooltip via `title` attribut

### Top Bar

- **Height:** `h-20` (80px)
- **Position:** `sticky top-0 z-30`
- **Background:** `bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.06]`
- **Left:** Mobile hamburger + Current tool icon/name
- **Center:** "Transform your prompts" headline + subtitle
- **Right:** "New" button med Plus-ikon (gradient)

### Search Modal (Cmd+K)

- **Trigger:** `⌘K` keyboard shortcut
- **Overlay:** `fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]`
- **Modal position:** `pt-[20vh]` (command palette style)
- **Container:** `max-w-xl`, `bg-[#0c0c0f] rounded-2xl border border-white/[0.08] shadow-2xl`
- **Input:** Search-ikon + input + ESC kbd hint
- **Placeholder:** "Search prompts, templates..."
- **Status:** "Search functionality coming soon"

### Mobile

- **Sidebar:** `-translate-x-full lg:translate-x-0` — slides in
- **Overlay:** `bg-black/60 z-30 backdrop-blur-sm`
- **Hamburger:** Togglar `mobileMenuOpen` state
- **Desktop detection:** `window.innerWidth >= 1024` (resize listener)

---

## 9. Dashboard-sidor

### 9.1 Spark (Improve Prompt)

**Fil:** `src/app/dashboard/spark/page.tsx` (326 rader)

**Syfte:** One-click prompt enhancement — användaren klistrar in en prompt och får förbättrad version direkt.

**Layout:** `flex flex-col gap-6 max-w-4xl mx-auto`

**Komponenter:**

1. **Header** — `text-2xl font-bold` + subtitle
2. **Target Platform** — 8 AI-modeller som `ModelCardWithInsight` (se sektion 11)
3. **Language Selector** — EN 🇬🇧 / SV 🇸🇪 / Sve→Eng 🇸🇪→🇬🇧
   - Container: `bg-gradient-to-r from-violet-500/[0.06] to-indigo-500/[0.06] border border-violet-500/10 rounded-xl`
   - Pro tip-text med Languages-ikon
4. **Input Area** — `rounded-2xl bg-white/[0.02] border border-white/[0.06]`
   - Textarea: `min-h-[160px]`, auto-grow via `scrollHeight`
   - Character count: `{input.length}/10 000`
   - Example prompts: 3 clickable pills (visas när input tom)
   - Submit: "Improve Prompt" gradient CTA med `kbd ⌘↵`
5. **Processing State** — Centered `Loader2 animate-spin text-violet-400` + text
6. **Result** — `StructuredPromptOutput` (se sektion 12)
7. **Error** — Red alert box med AlertCircle-ikon

**Keyboard shortcut:** `⌘↵` → trigger `handleSpark()`

**API:** `POST /api/ai/enhance` med `mode: 'enhance'`, timeout 30s

**AI Models:**

| ID | Namn | Familj | Färg |
|----|------|--------|------|
| gpt-5.2 | GPT 5.2 | OpenAI | #10b981 |
| gpt-5.1 | GPT 5.1 | OpenAI | #10b981 |
| claude-opus-4.5 | Opus 4.5 | Anthropic | #f97316 |
| claude-sonnet-4.5 | Sonnet 4.5 | Anthropic | #f97316 |
| gemini-3 | Gemini 3 | Google | #3b82f6 |
| gemini-2.5 | Gemini 2.5 | Google | #3b82f6 |
| grok-3 | Grok 3 | xAI | #94a3b8 |
| grok-2 | Grok 2 | xAI | #94a3b8 |

**Replay:** Läser `sessionStorage.getItem('replay-input')` vid mount.

**Real-time usage:** Dispatchar `CustomEvent('praxis:usage-update')` med `promptsUsed` + `promptsRemaining`.

### 9.2 Precision (Refine Prompt)

**Fil:** `src/app/dashboard/precision/page.tsx` (408 rader)

**Syfte:** 3-stegs wizard — AI genererar klargörande frågor, användaren svarar, sedan genereras en skräddarsydd prompt.

**Steps:**

| Step | Namn | Innehåll |
|------|------|----------|
| 1 | Enter Prompt | Platform selector + textarea |
| 2 | Answer Questions | AI-genererade flervalsfrågor |
| 3 | Get Result | StructuredPromptOutput |

**Step Indicator:**

- Cirkel: `w-7 h-7 rounded-full`
- Completed: `bg-emerald-500` med CheckCircle2-ikon
- Active: `bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/50`
- Pending: `bg-white/[0.06] text-white/30`
- Connector: `w-16 h-px` (emerald-500 om completed, white/[0.08] annars)

**Fråge-kort (Step 2):**

- Container: `rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6`
- Fråge-nummer: `w-6 h-6 rounded-full bg-violet-500/15`
- Options: Selectable cards med transition:
  - Default: `border-white/[0.06] bg-white/[0.02]`
  - Selected: `border-violet-500/40 bg-violet-500/10`
- "Other" option: Triggar inline text-input
- Navigation: Back-knapp (ghost) + "Generate Prompt" (gradient, disabled om < 3 svar)

**API:**

- Step 1→2: `POST /api/ai/refine?stage=questions`
- Step 2→3: `POST /api/ai/refine?stage=generate`

### 9.3 Library

**Fil:** `src/app/dashboard/library/page.tsx` (496 rader)

**Syfte:** Prompt collection & organization — grid/list-vy med mappar, sök, favoriter.

**Layout:** Sidebar (folders, 208px) + Main content

**Features:**

- **View modes:** Grid / List toggle (`bg-white/[0.08]` for active)
- **Search:** Fulltext sök i titel, content, tags
- **Folders:** All, Personal, Work, Templates, Starred — med räknare
- **Prompt cards:** Titel, truncated content, tags, timestamp, tool-badge
- **Actions:** Copy, Edit, Delete, Star (toggle)
- **Modals:** New Folder, Edit Prompt
- **DB sync:** Hämtar från `/api/prompts?limit=200` vid mount

### 9.4 History

**Fil:** `src/app/dashboard/history/page.tsx` (381 rader)

**Syfte:** Activity timeline — Postgres-backed med localStorage fallback.

**Features:**

- **Date grouping:** Today, Yesterday, [date]
- **Tool filters:** spark, precision, mindmap, fusion, personas, code — med gradient-ikoner
- **Expandable items:** Visar full input/output
- **Actions:** Copy output, Save to Library, Replay
- **Replay:** Navigerar till rätt tool med `sessionStorage.setItem('replay-input')`
- **DB merge:** `dbPrompts` + `localOnly` history items

### 9.5 Settings

**Fil:** `src/app/dashboard/settings/page.tsx` (270 rader)

**Tabs:** Profile, Notifications, Appearance, Security, Language

**Profile:**

- Avatar med gradient (initial-baserad)
- Form: First Name, Last Name, Email, Bio
- "Change Avatar" button (coming soon)
- Save gradient CTA

**Notifications:**

- Toggle switches: `w-14 h-8 rounded-full`
  - ON: `bg-violet-500`
  - OFF: `bg-white/20`
  - Knob: `w-6 h-6 rounded-full shadow-md`, `translate-x-7` / `translate-x-1`
- Items: Email, Push, Product Updates, Tips & Tutorials

**Appearance:**

- Theme cards: Light (Sun), Dark (Moon), System (Monitor)
- Selected: `border-2 border-violet-500 bg-violet-500/10`

### 9.6 Billing

**Fil:** `src/app/dashboard/billing/page.tsx` (236 rader)

**Features:**

- **Billing cycle toggle:** Monthly / Yearly (−20% i emerald)
- **Current Plan Banner:** Icon + plan name + usage info
- **3 plan cards:** Free, Pro ($19), Team ($49)
- **Popular badge:** "Most Popular" gradient pill
- **Payment:** "No payment methods" honest empty state
- **CTA:** "Coming Soon" disabled button

### 9.7 Dashboard Index

**Fil:** `src/app/dashboard/page.tsx` (7 rader)

```tsx
import { redirect } from 'next/navigation';
export default function DashboardPage() {
    redirect('/dashboard/spark');
}
```

---

## 10. Komponentbibliotek

### SectionBadge (Landing Page)

```tsx
<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
  bg-violet-500/[0.08] border border-violet-500/[0.15]
  text-violet-300/80 text-xs font-medium uppercase tracking-[0.08em]">
  {children}
</span>
```

**Instanser:** "Live Demo", "Features", "How It Works", "Pricing"

### Buttons

#### Primary CTA (Landing)

```
inline-flex items-center gap-2.5
px-8 py-3.5
bg-gradient-to-r from-violet-500 to-indigo-500
text-white font-semibold rounded-xl
shadow-lg shadow-violet-500/25
hover:shadow-xl hover:shadow-violet-500/35
hover:scale-[1.02]
transition-all text-base
```

#### Secondary CTA (Landing)

```
inline-flex items-center gap-2
px-8 py-3.5
text-white/60 hover:text-white font-medium
border border-white/[0.08] hover:border-white/[0.15]
rounded-xl transition-all text-base
```

#### Dashboard Action Button

```
flex items-center gap-2
px-4 py-2.5
bg-gradient-to-r from-violet-500 to-indigo-500
text-white text-sm font-semibold rounded-xl
shadow-lg shadow-violet-500/15
hover:shadow-xl hover:shadow-violet-500/20
transition-all
```

#### Ghost Button

```
px-4 py-2 text-sm
text-white/50 hover:text-white/70
border border-white/[0.08] hover:border-white/[0.15]
rounded-xl transition-colors
```

### Form Elements

#### Text Input (Dashboard)

```
w-full px-4 py-2.5
bg-white/[0.02] border border-white/[0.06]
rounded-lg text-white text-sm
placeholder-white/20
focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.03]
transition-all
```

#### Textarea (Prompt Input)

```
w-full min-h-[160px] p-6
bg-transparent text-white/90 placeholder-white/20
resize-none focus:outline-none
text-sm leading-relaxed
```

### CSS Component Classes (globals.css)

| Klass | Syfte |
|-------|-------|
| `.btn` | Base button — inline-flex, center, gap-2, py-3 px-5, rounded-lg |
| `.btn-primary` | Gradient bakgrund, violet shadow |
| `.btn-secondary` | Ghost med border |
| `.card` | bg-white/0.02, border, rounded-2xl |
| `.badge` | Pill — rounded-full, white/0.05 bg |
| `.badge-primary` | Violet-tinted pill |
| `.section-badge` | Uppercase, tracking-0.1em, rounded-full |
| `.section-title` | `clamp(2rem, 5vw, 3rem)`, bold, tracking-tight |
| `.section-subtitle` | 1.125rem, subtle color, max-w-40rem |
| `.gradient-text` | bg-clip-text, transparent fill |
| `.bg-gradient-radial` | Radial gradient utility |
| `.nav-item` | Sidebar nav — flex, gap-3, rounded-lg |
| `.nav-item.active` | white text, bg-white/0.08 |

---

## 11. Model Insight Popover

**Fil:** `src/components/ui/ModelInsightPopover.tsx` (586 rader)

### Syfte

Premium hover-upplevelse som visar detaljerad information om varje AI-modell. Glasmorfism-panel med modell-tintade accenter.

### Trigger

- **Hover intent:** 200ms delay via `setTimeout`
- **Leave guard:** 50ms delay för att förhindra flicker
- **Events:** `onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`
- **Position update:** Lyssnar på `scroll` (capture) + `resize`

### ModelCardWithInsight (Trigger-komponent)

```
button group flex items-center gap-1.5
px-2.5 py-1.5 rounded-lg
transition-all duration-200

Selected:  bg-white/[0.08] ring-1 ring-white/20
           boxShadow: 0 0 16px -4px {model.color}40
Default:   bg-white/[0.02]
Hover:     bg-white/[0.05]

Logo:
  Selected: opacity-100
  Default:  opacity-50
  Hover:    opacity-80
```

### Popover Panel

- **Rendering:** `createPortal` till `document.body`
- **Position:** Beräknas dynamiskt — centrerad under trigger, clampas till viewport
- **Fallback:** Om ej plats nedanför → visas ovanför
- **Width:** 360px
- **Estimated height:** 420px
- **Gap:** 12px från trigger

### Entrance Animation

```css
/* Show */
opacity-100 scale-100 translate-y-0
transitionTimingFunction: cubic-bezier(0.34, 1.56, 0.64, 1)  /* Spring-like */
transitionDuration: 180ms

/* Hide */
opacity-0 scale-[0.96] translate-y-1
transitionTimingFunction: cubic-bezier(0.4, 0, 0.2, 1)       /* Smooth */
transitionDuration: 100ms
```

### Glass Panel Styling

```css
background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)
backdrop-filter: blur(24px) saturate(180%)
box-shadow:
  0 0 0 1px rgba(255,255,255,0.06),      /* Border */
  0 4px 6px -1px rgba(0,0,0,0.3),        /* Close shadow */
  0 12px 24px -4px rgba(0,0,0,0.4),      /* Medium shadow */
  0 24px 48px -8px rgba(0,0,0,0.3),      /* Far shadow */
  inset 0 1px 0 rgba(255,255,255,0.05)   /* Top highlight */
```

### Model-tinted accents

- **Gradient edge:** `linear-gradient(135deg, {color}15 0%, transparent 50%)` — 20% opacity
- **Inner glow:** `w-3/4 h-24 blur-2xl` — modellens färg, 30% opacity

### Popover Content

| Section | Styling |
|---------|---------|
| **Header** | 10×10 rounded-xl logo box (färg/15 bg) + Namn (16px semibold) + Family label (11px white/30 uppercase) |
| **Tagline** | 13px white/50 |
| **"How this model thinks"** | 10px uppercase heading + bullet points (modell-färgad dot, 13px white/60) |
| **"How PRAXIS adapts prompts"** | 10px uppercase heading + bullet points (violet dot, 13px white/60) |
| **"Best used for"** | 10px uppercase heading + flex-wrap tag pills (11px, bg-white/[0.04], border-white/[0.06]) |

### Modeller med data

10 modeller dokumenterade: GPT 5.2, GPT 5.1, Claude Sonnet 4.5, Claude Opus 4.5, Gemini 3, Gemini 2.5, Grok 3, Grok 2, Sora, Nano Banana Pro

---

## 12. Structured Prompt Output

**Fil:** `src/components/ui/StructuredPromptOutput.tsx` (263 rader)

### Syfte

Unified rendering av förbättrade prompts. Sektioner visas med **color-accented left borders** men UTAN synliga labels — skyddar prompt-engineering-metodik från reverse engineering.

### StructuredResult Interface

```typescript
interface StructuredResult {
  sections: {
    expertRole: string;
    mainObjective: string;
    contextBackground: string;
    outputFormat: string;
    constraints: string;
    approachGuidelines: string;
  };
  domain: string;           // "CODING", "MARKETING", etc.
  improvements: string[];   // ["Enhanced clarity", ...]
  targetPlatform?: string;  // "chatgpt", "claude", etc.
  meta?: {
    tokensIn?: number;
    tokensOut?: number;
    timeMs?: number;
    model?: string;
    score?: number;
  };
}
```

### Section Color Borders

| Section | Border Color |
|---------|-------------|
| expertRole | `border-violet-500/30` |
| mainObjective | `border-indigo-500/30` |
| contextBackground | `border-blue-500/30` |
| outputFormat | `border-cyan-500/30` |
| constraints | `border-amber-500/30` |
| approachGuidelines | `border-emerald-500/30` |

### Layout

```
rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden

├── Platform Badge (conditional)
│   └── Cpu icon + "Optimized for {platform}" — color-coded
├── Header
│   ├── Left: ✓ "Prompt Improved/Refined" + Domain badge + Quality badge
│   └── Right: Copy + Save buttons
├── Content
│   └── Sections (pl-4 border-l-2 {color}) — NO labels
├── "What was improved" (collapsible)
│   └── CheckCircle2 items
└── Footer
    ├── Meta: tokens in/out, time, model
    └── Actions: "{Action} Another Prompt" + "Copy {Action} Prompt"
```

### Platform Colors

| Platform | Label | Color Class |
|----------|-------|-------------|
| chatgpt | "Optimized for ChatGPT" | `text-emerald-400` |
| claude | "Optimized for Claude" | `text-orange-400` |
| gemini | "Optimized for Gemini" | `text-blue-400` |
| grok | "Optimized for Grok" | `text-slate-300` |
| general | "Universal Prompt" | `text-violet-400` |

### Quality Indicator

| Score | Label | Color | Background |
|-------|-------|-------|------------|
| ≥ 80 | "Excellent" | `text-emerald-400` | `bg-emerald-500/10` |
| ≥ 60 | "Strong" | `text-blue-400` | `bg-blue-500/10` |
| < 60 | "Enhanced" | `text-violet-400` | `bg-violet-500/10` |

### Empty State

```
min-h-[320px] rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed
Centered: gradient icon box + "Your enhanced prompt will appear here" (white/20)
```

---

## 13. Toasts & Feedback

**Konfigurerat i:** `src/app/layout.tsx`

### Position

`bottom-right`

### Styling

```javascript
{
  duration: 4000,
  style: {
    background: 'rgba(20, 20, 28, 0.95)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '14px',
  },
  success: {
    iconTheme: { primary: '#10b981', secondary: '#ffffff' }
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#ffffff' }
  }
}
```

### Vanliga toasts

| Kontext | Typ | Meddelande |
|---------|-----|------------|
| Copy to clipboard | success | "Copied to clipboard" / "Copied to clipboard!" |
| Save to library | success | "Saved to Library!" |
| Enhancement failed | error | "Enhancement failed" |
| Timeout | error | "Timed out" |
| Prompt deleted | success | "Prompt deleted" |
| Folder created | success | `Folder "{name}" created` |
| Profile saved | success | "Profile saved (demo mode)" |
| Replay loaded | success | "Loaded from history" |
| Paid plans | custom | "Paid plans coming soon!" (🚀 emoji) |

---

## 14. Responsiv Design

### Breakpoints

| Breakpoint | Tailwind | Viewport |
|------------|----------|----------|
| Mobile | Default | < 640px |
| Small | `sm:` | ≥ 640px |
| Medium | `md:` | ≥ 768px |
| Large | `lg:` | ≥ 1024px |

### Responsive Overrides (globals.css)

```css
@media (max-width: 768px) {
  :root {
    --space-6: 1rem;     /* 24→16px */
    --space-8: 1.5rem;   /* 32→24px */
    --space-12: 2rem;    /* 48→32px */
    --space-16: 3rem;    /* 64→48px */
    --space-20: 4rem;    /* 80→64px */
    --space-24: 5rem;    /* 96→80px */
  }
  .section-title {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
  }
}
```

### Landing Page Responsivity

| Element | Mobile | Desktop |
|---------|--------|---------|
| Hero headline | `text-4xl` | `lg:text-[68px]` |
| Nav links | Dolda | `hidden md:flex` |
| CTA grupp | `flex-col` | `sm:flex-row` |
| Feature grid | 1 kolumn | `md:grid-cols-2 lg:grid-cols-3` |
| Pricing grid | 1 kolumn | `md:grid-cols-3` |
| Footer | `flex-col gap-8` | `md:flex-row justify-between` |
| Subtitle | `text-lg` | `md:text-xl` |
| Demo padding | `p-6` | `md:p-8` |
| Stats grid | `grid-cols-2` | `md:grid-cols-4` |
| kbd hints | Dolda | `hidden sm:inline` |

### Dashboard Responsivity

| Element | Mobile | Desktop |
|---------|--------|---------|
| Sidebar | `-translate-x-full` (dolda) | `lg:translate-x-0` |
| Hamburger | Synlig | `lg:hidden` |
| Mobile overlay | `bg-black/60 backdrop-blur-sm` | — |
| Content margin-left | `0` | Dynamiskt (68/240px) |
| Content padding | `px-4 py-6` | `lg:px-8 lg:py-8` |
| Collapse toggle | Dold | `hidden lg:flex` |
| Top bar title | Dold | `hidden sm:flex` |
| Library folders sidebar | Dold | `hidden md:block` |
| Settings tabs sidebar | Dold | `hidden md:block` |

---

## 15. Tillgänglighet

### Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-primary);  /* #8B5CF6 */
  outline-offset: 2px;
}
```

### Screen Reader

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Keyboard Navigation

| Shortcut | Action | Kontext |
|----------|--------|---------|
| `⌘K` | Öppna sökning | Dashboard (globalt) |
| `⌘↵` | Kör prompt enhancement | Spark-sidan |
| `ESC` | Stäng sök-modal | Dashboard |

### ARIA

- Popover: `role="tooltip"`, `aria-hidden={!isVisible}`
- Modaler: Click-outside stänger via overlay `onClick`
- Buttons: `title` attribut för collapsed sidebar items
- Disabled states: `disabled` attribut + `cursor-not-allowed`

---

## 16. Scrollbar & Selection

### Custom Scrollbar (WebKit)

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

### Text Selection

```css
::selection {
  background-color: rgba(139, 92, 246, 0.3);
  color: white;
}
```

---

## 17. Säkerhet (SecurityShield)

**Fil:** `src/components/security/SecurityShield.tsx`

**Konfigurerat i layout.tsx:**

```tsx
<SecurityShield
  enableDevToolsDetection={true}
  enableContextMenuProtection={true}
  enableConsoleProtection={true}
/>
```

**Funktioner:**

- **DevTools Detection:** Upptäcker öppna devtools
- **Context Menu Protection:** Blockerar högerklick
- **Console Protection:** Skyddar mot konsol-injection

---

## Appendix: Filstruktur (Komplett)

```
src/
├── middleware.ts                          # Auth middleware
├── app/
│   ├── layout.tsx                        # Root layout (Inter font, SecurityShield, Providers, Toaster)
│   ├── page.tsx                          # Landing page (703 rader, 'use client')
│   ├── globals.css                       # Design tokens + component classes (447 rader)
│   ├── error.tsx                         # Error boundary
│   ├── global-error.tsx                  # Global error boundary
│   ├── not-found.tsx                     # 404 page
│   ├── api/
│   │   ├── ai/enhance/route.ts           # AI enhancement endpoint
│   │   ├── ai/ab-test/route.ts           # A/B testing endpoint
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth routes
│   │   └── auth/register/route.ts        # Registration + SendGrid
│   ├── dashboard/
│   │   ├── layout.tsx                    # Dashboard shell (550 rader, sidebar + topbar)
│   │   ├── page.tsx                      # Redirect → /dashboard/spark
│   │   ├── spark/page.tsx                # Improve Prompt (326 rader)
│   │   ├── precision/page.tsx            # Refine Prompt wizard (408 rader)
│   │   ├── library/page.tsx              # Prompt library (496 rader)
│   │   ├── history/page.tsx              # Activity timeline (381 rader)
│   │   ├── settings/page.tsx             # Account settings (270 rader)
│   │   ├── billing/page.tsx              # Billing & plans (236 rader)
│   │   ├── analytics/page.tsx            # Analytics dashboard
│   │   ├── mindmap/page.tsx              # MindMap tool
│   │   ├── personas/page.tsx             # AI personas
│   │   ├── code/page.tsx                 # Code tool
│   │   ├── fusion/page.tsx               # Fusion tool
│   │   └── integrations/page.tsx         # Integrations
│   ├── login/page.tsx                    # Login page
│   ├── signup/page.tsx                   # Signup page
│   └── legal/                            # Privacy, Terms, Cookies
├── components/
│   ├── providers.tsx                     # React providers (SessionProvider)
│   ├── security/SecurityShield.tsx       # DevTools + context menu protection
│   └── ui/
│       ├── index.tsx                     # UI exports
│       ├── ModelInsightPopover.tsx        # Premium hover experience (586 rader)
│       ├── StructuredPromptOutput.tsx     # Unified prompt renderer (263 rader)
│       ├── EnhancedPromptOutput.tsx       # Legacy prompt output (282 rader)
│       ├── PromptWizard.tsx              # Wizard component
│       └── TypeWriter.tsx                # Character animation
└── lib/
    ├── auth.ts                           # NextAuth config
    ├── auth-context.tsx                  # Auth React context
    ├── prisma.ts                         # Prisma client
    ├── prompt-store.ts                   # Zustand store
    ├── prompt-engine.ts                  # Prompt engine
    ├── prompt-analyzer.ts                # Prompt scoring
    ├── prompt-rewriter.ts                # Prompt rewriting
    ├── challenges.ts                     # Challenge system
    ├── design-system.ts                  # Design system constants
    ├── execution-adapter.ts              # Execution adapter
    ├── rate-limit.ts                     # Rate limiting
    ├── store.ts                          # Store utilities
    └── utils.ts                          # General utilities
```

---

*Genererad: 2026-02-06 | PRAXIS Design System v1.0*
