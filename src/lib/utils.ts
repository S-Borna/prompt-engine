import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
}

export function calculateMatchScore(expected: string[], actual: string[]): number {
    if (expected.length === 0) return 0;

    const expectedLower = expected.map(s => s.toLowerCase());
    const actualLower = actual.map(s => s.toLowerCase());

    let matches = 0;
    for (const exp of expectedLower) {
        if (actualLower.some(act => act.includes(exp) || exp.includes(act))) {
            matches++;
        }
    }

    return matches / expected.length;
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just nu';
    if (diffMinutes < 60) return `${diffMinutes}m sedan`;
    if (diffHours < 24) return `${diffHours}h sedan`;
    if (diffDays < 7) return `${diffDays}d sedan`;

    return formatDate(d);
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
export function getFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}

export function setToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        console.error('Failed to save to localStorage');
    }
}
