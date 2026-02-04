// ═══════════════════════════════════════════════════════════════════════════
// PRAXIS Design System - Single Source of Truth
// Extracted from landing page - enforced across all surfaces
// ═══════════════════════════════════════════════════════════════════════════

/**
 * COLOR PALETTE
 * The landing page defines a calm, premium dark aesthetic
 */
export const colors = {
    // Backgrounds (layered depth)
    bg: {
        base: '#0a0a0f',           // Main background - rich dark
        surface: 'rgba(255,255,255,0.03)',    // Cards, panels - very subtle
        surfaceHover: 'rgba(255,255,255,0.05)', // Hover state
        elevated: 'rgba(255,255,255,0.06)',    // Elevated elements
        input: 'rgba(255,255,255,0.05)',       // Form inputs
    },

    // Borders (minimal, intentional)
    border: {
        subtle: 'rgba(255,255,255,0.06)',      // Default borders
        default: 'rgba(255,255,255,0.08)',     // Slightly visible
        hover: 'rgba(255,255,255,0.1)',        // Hover states
        focus: 'rgba(255,255,255,0.15)',       // Focus states
    },

    // Text (clear hierarchy)
    text: {
        primary: 'white',                      // Headlines, important
        secondary: 'rgba(255,255,255,0.8)',    // Body text
        muted: 'rgba(255,255,255,0.5)',        // Descriptions
        subtle: 'rgba(255,255,255,0.4)',       // Labels, hints
        disabled: 'rgba(255,255,255,0.3)',     // Disabled states
    },

    // Brand (purple-violet gradient)
    brand: {
        primary: '#8b5cf6',                    // Primary violet
        secondary: '#6366f1',                  // Secondary indigo
        gradient: 'linear-gradient(to right, #8b5cf6, #6366f1)',
        glow: 'rgba(139,92,246,0.2)',
    },

    // Accents (semantic colors - used sparingly)
    accent: {
        violet: { base: '#8b5cf6', soft: 'rgba(139,92,246,0.15)' },
        purple: { base: '#a78bfa', soft: 'rgba(167,139,250,0.15)' },
        blue: { base: '#3b82f6', soft: 'rgba(59,130,246,0.1)' },
        emerald: { base: '#10b981', soft: 'rgba(16,185,129,0.1)' },
        amber: { base: '#f59e0b', soft: 'rgba(245,158,11,0.1)' },
        red: { base: '#ef4444', soft: 'rgba(239,68,68,0.1)' },
    },
} as const;

/**
 * TYPOGRAPHY
 * Clean, readable, premium feel
 */
export const typography = {
    // Font families
    fontFamily: {
        sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        mono: "'JetBrains Mono', ui-monospace, monospace",
    },

    // Font sizes (px converted to rem for accessibility)
    fontSize: {
        xs: '0.75rem',    // 12px - tiny labels
        sm: '0.875rem',   // 14px - small text, buttons
        base: '1rem',     // 16px - body
        lg: '1.125rem',   // 18px - large body
        xl: '1.25rem',    // 20px - small headings
        '2xl': '1.5rem',  // 24px - section headings
        '3xl': '1.875rem', // 30px - page titles
        '4xl': '2.25rem', // 36px - hero smaller
        '5xl': '3rem',    // 48px - hero larger
    },

    // Font weights
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Line heights
    lineHeight: {
        tight: 1.15,      // Headlines
        snug: 1.35,       // Subheadings
        normal: 1.5,      // Body text
        relaxed: 1.6,     // Paragraphs
    },
} as const;

/**
 * SPACING
 * Consistent, intentional whitespace
 */
export const spacing = {
    // Component internal spacing
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '2.5rem', // 40px
    '4xl': '3rem',   // 48px
    '5xl': '4rem',   // 64px
    '6xl': '5rem',   // 80px

    // Section spacing
    section: {
        sm: '3rem',    // 48px
        md: '4rem',    // 64px
        lg: '5rem',    // 80px
    },

    // Container
    container: {
        maxWidth: '1200px',
        padding: '1.5rem', // 24px
    },
} as const;

/**
 * RADIUS
 * Smooth, friendly corners
 */
export const radius = {
    sm: '0.375rem',  // 6px - small elements
    md: '0.5rem',    // 8px - buttons, inputs
    lg: '0.625rem',  // 10px - cards
    xl: '0.75rem',   // 12px - modals
    '2xl': '1rem',   // 16px - large cards
    '3xl': '1.25rem', // 20px - hero cards
    full: '9999px',  // Pills, avatars
} as const;

/**
 * SHADOWS
 * Subtle depth, not distracting
 */
export const shadows = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.3)',
    lg: '0 8px 24px rgba(0,0,0,0.4)',
    xl: '0 12px 40px rgba(0,0,0,0.5)',

    // Glow effects (for primary actions)
    glow: {
        violet: '0 4px 20px rgba(139,92,246,0.4)',
        emerald: '0 4px 20px rgba(16,185,129,0.3)',
        blue: '0 4px 20px rgba(59,130,246,0.3)',
        amber: '0 4px 20px rgba(245,158,11,0.3)',
    },
} as const;

/**
 * TRANSITIONS
 * Smooth, intentional motion
 */
export const transitions = {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT STYLES (Tailwind class patterns)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * BUTTON STYLES
 * Unified button language across the app
 */
export const buttonStyles = {
    // Primary action - gradient with glow
    primary: `
    inline-flex items-center justify-center gap-2
    px-5 py-2.5
    bg-gradient-to-r from-violet-500 to-indigo-500
    text-white text-sm font-semibold
    rounded-[10px]
    hover:shadow-lg hover:shadow-violet-500/30
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

    // Secondary action - subtle background
    secondary: `
    inline-flex items-center justify-center gap-2
    px-5 py-2.5
    bg-white/[0.06] border border-white/10
    text-white/80 text-sm font-medium
    rounded-[10px]
    hover:bg-white/[0.08] hover:border-white/15
    transition-all duration-200
  `,

    // Ghost/text button - minimal
    ghost: `
    inline-flex items-center justify-center gap-2
    px-4 py-2
    text-white/60 text-sm font-medium
    rounded-lg
    hover:text-white hover:bg-white/5
    transition-all duration-200
  `,

    // Danger action
    danger: `
    inline-flex items-center justify-center gap-2
    px-4 py-2
    text-red-400 text-sm font-medium
    border border-red-500/30
    rounded-[10px]
    hover:bg-red-500/10
    transition-all duration-200
  `,
} as const;

/**
 * CARD STYLES
 * Consistent surface treatment
 */
export const cardStyles = {
    // Standard card
    base: `
    bg-white/[0.03]
    rounded-2xl
    border border-white/[0.06]
  `,

    // Elevated card (modals, dropdowns)
    elevated: `
    bg-[#1a1a24]
    rounded-2xl
    border border-white/10
    shadow-xl
  `,

    // Interactive card
    interactive: `
    bg-white/[0.03]
    rounded-2xl
    border border-white/[0.06]
    hover:bg-white/[0.05]
    hover:border-white/10
    transition-all duration-200
    cursor-pointer
  `,

    // Featured/highlight card
    featured: `
    bg-gradient-to-br from-violet-500/10 to-purple-500/10
    rounded-2xl
    border border-violet-500/20
  `,
} as const;

/**
 * INPUT STYLES
 * Form elements with focus states
 */
export const inputStyles = {
    // Standard input
    base: `
    w-full
    px-4 py-3
    bg-white/5
    border border-white/10
    rounded-xl
    text-white
    placeholder-white/30
    focus:outline-none
    focus:ring-2 focus:ring-violet-500/30
    focus:border-violet-500/50
    transition-all duration-200
  `,

    // Search input
    search: `
    w-full
    pl-12 pr-4 py-3
    bg-white/5
    border border-white/10
    rounded-xl
    text-white
    placeholder-white/30
    focus:outline-none
    focus:ring-2 focus:ring-violet-500/30
    focus:border-violet-500/50
    transition-all duration-200
  `,

    // Textarea
    textarea: `
    w-full
    p-4
    bg-white/5
    border border-white/10
    rounded-xl
    text-white
    placeholder-white/30
    resize-none
    focus:outline-none
    focus:ring-2 focus:ring-violet-500/30
    focus:border-violet-500/50
    transition-all duration-200
  `,
} as const;

/**
 * TEXT STYLES
 * Typography patterns
 */
export const textStyles = {
    // Page title
    pageTitle: 'text-2xl font-bold text-white',

    // Page description
    pageDesc: 'text-white/50',

    // Section heading
    sectionTitle: 'text-lg font-semibold text-white',

    // Card title
    cardTitle: 'font-semibold text-white',

    // Body text
    body: 'text-white/70 leading-relaxed',

    // Small/label text
    label: 'text-sm font-medium text-white/70',

    // Muted/helper text
    muted: 'text-sm text-white/50',

    // Tiny text
    tiny: 'text-xs text-white/40',
} as const;

/**
 * ICON CONTAINER
 * Consistent icon treatment in headers
 */
export const iconContainer = {
    // Large (page headers)
    lg: 'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',

    // Medium (cards, list items)
    md: 'w-10 h-10 rounded-xl flex items-center justify-center',

    // Small (inline)
    sm: 'w-8 h-8 rounded-lg flex items-center justify-center',
} as const;

/**
 * GRADIENTS
 * Tool-specific gradients (consistent across app)
 */
export const toolGradients = {
    spark: 'from-violet-500 to-purple-600',
    mindmap: 'from-pink-500 to-rose-600',
    fusion: 'from-blue-500 to-cyan-600',
    personas: 'from-orange-500 to-amber-600',
    code: 'from-emerald-500 to-green-600',
    precision: 'from-red-500 to-rose-600',
    library: 'from-amber-500 to-orange-600',
    history: 'from-indigo-500 to-purple-600',
    analytics: 'from-teal-500 to-emerald-600',
    settings: 'from-gray-600 to-gray-700',
    billing: 'from-violet-500 to-purple-600',
    integrations: 'from-indigo-500 to-purple-600',
} as const;
