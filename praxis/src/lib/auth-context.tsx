'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
    user: {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        tier: string;
        xp: number;
        level: number;
        streak: number;
        promptsUsedToday: number;
    } | null;
    loading: boolean;
    isAuthenticated: boolean;
    signIn: typeof signIn;
    signOut: typeof signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    return (
        <AuthContext.Provider
            value={{
                user: session?.user ?? null,
                loading,
                isAuthenticated,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook for checking tier limits
export function useTierLimits() {
    const { user } = useAuth();

    const tier = user?.tier || 'FREE';
    const promptsUsedToday = user?.promptsUsedToday || 0;

    const limits = {
        FREE: { dailyPrompts: 5, savedPrompts: 10, analyses: 3 },
        PRO: { dailyPrompts: Infinity, savedPrompts: 500, analyses: Infinity },
        TEAM: { dailyPrompts: Infinity, savedPrompts: Infinity, analyses: Infinity },
        ENTERPRISE: { dailyPrompts: Infinity, savedPrompts: Infinity, analyses: Infinity },
    };

    const currentLimits = limits[tier as keyof typeof limits] || limits.FREE;

    return {
        tier,
        canUsePrompt: () => promptsUsedToday < currentLimits.dailyPrompts,
        canSavePrompt: () => true,
        canAnalyze: () => promptsUsedToday < currentLimits.analyses,
        remainingPrompts: () => {
            if (currentLimits.dailyPrompts === Infinity) return 'obegränsat';
            return Math.max(0, currentLimits.dailyPrompts - promptsUsedToday);
        },
        isPro: tier === 'PRO' || tier === 'TEAM' || tier === 'ENTERPRISE',
        isTeam: tier === 'TEAM' || tier === 'ENTERPRISE',
    };
}
