'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

// =====================
// BUTTON
// =====================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-violet-600 hover:bg-violet-500 text-white hover:scale-105 active:scale-95',
            secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
            ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50',
            danger: 'bg-red-600 hover:bg-red-500 text-white',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm rounded-lg',
            md: 'px-5 py-2.5 text-sm rounded-xl',
            lg: 'px-6 py-3 text-base rounded-xl',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

// =====================
// INPUT
// =====================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

// =====================
// TEXTAREA
// =====================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none min-h-[120px]',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';

// =====================
// CARD
// =====================

interface CardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
    glow?: 'purple' | 'blue' | 'none';
    onClick?: () => void;
}

export function Card({ children, className, interactive, glow = 'none', onClick }: CardProps) {
    const glowStyles = {
        purple: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
        blue: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
        none: '',
    };

    return (
        <div
            className={cn(
                'bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-200',
                interactive && 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50 hover:scale-[1.02]',
                glowStyles[glow],
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// =====================
// BADGE
// =====================

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'muted';
    className?: string;
}

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
    const variants = {
        primary: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        error: 'bg-red-500/20 text-red-400 border-red-500/30',
        muted: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}

// =====================
// PROGRESS BAR
// =====================

interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'violet' | 'emerald' | 'amber' | 'blue';
}

export function ProgressBar({
    value,
    max = 100,
    className,
    showLabel = false,
    size = 'md',
    color = 'violet'
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const colors = {
        violet: 'bg-violet-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        blue: 'bg-blue-500',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className={cn('w-full bg-zinc-800 rounded-full overflow-hidden', sizes[size])}>
                <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="mt-1 text-sm text-zinc-400">{Math.round(percentage)}%</p>
            )}
        </div>
    );
}

// =====================
// AVATAR
// =====================

interface AvatarProps {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('rounded-full object-cover', sizes[size], className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-semibold text-white',
                sizes[size],
                className
            )}
        >
            {initials}
        </div>
    );
}

// =====================
// SKELETON
// =====================

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-zinc-800 rounded-lg',
                className
            )}
        />
    );
}

// =====================
// TOOLTIP (Simple)
// =====================

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
    return (
        <div className={cn('relative group', className)}>
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
}

// =====================
// STAT CARD
// =====================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    className?: string;
}

export function StatCard({ icon, label, value, subtext, className }: StatCardProps) {
    return (
        <Card className={cn('flex items-center gap-4', className)}>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                {icon}
            </div>
            <div>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subtext && <p className="text-xs text-zinc-500">{subtext}</p>}
            </div>
        </Card>
    );
}
