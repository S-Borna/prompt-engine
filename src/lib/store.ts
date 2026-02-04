import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================
// TYPES
// =====================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ChallengeCategory = 'basics' | 'clarity' | 'context' | 'constraints' | 'creativity' | 'advanced';

export interface Challenge {
    id: string;
    title: string;
    titleSv: string;
    description: string;
    descriptionSv: string;
    category: ChallengeCategory;
    difficulty: Difficulty;
    objective: string;
    objectiveSv: string;
    hints: string[];
    hintsSv: string[];
    exampleGoodPrompt?: string;
    exampleBadPrompt?: string;
    evaluationCriteria: string[];
    xpReward: number;
    timeEstimate: number; // minutes
}

export interface ChallengeAttempt {
    challengeId: string;
    prompt: string;
    response: string;
    score: number;
    feedback: string;
    timestamp: Date;
}

export interface UserProgress {
    level: number;
    xp: number;
    xpToNextLevel: number;
    completedChallenges: string[];
    currentStreak: number;
    longestStreak: number;
    totalAttempts: number;
    averageScore: number;
    badges: string[];
    lastActiveDate: string;
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    avatar?: string;
    level: number;
    xp: number;
    completedChallenges: number;
    streak: number;
}

// =====================
// STORE STATE
// =====================

interface AppState {
    // User
    username: string | null;
    setUsername: (name: string) => void;

    // Progress
    progress: UserProgress;
    addXP: (amount: number) => void;
    completeChallenge: (challengeId: string) => void;
    updateStreak: () => void;

    // Current session
    currentChallenge: Challenge | null;
    setCurrentChallenge: (challenge: Challenge | null) => void;

    // Attempts
    attempts: ChallengeAttempt[];
    addAttempt: (attempt: ChallengeAttempt) => void;

    // UI State
    language: 'en' | 'sv';
    setLanguage: (lang: 'en' | 'sv') => void;

    // Leaderboard
    leaderboard: LeaderboardEntry[];
    setLeaderboard: (entries: LeaderboardEntry[]) => void;
}

// =====================
// INITIAL VALUES
// =====================

const initialProgress: UserProgress = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    completedChallenges: [],
    currentStreak: 0,
    longestStreak: 0,
    totalAttempts: 0,
    averageScore: 0,
    badges: [],
    lastActiveDate: new Date().toISOString().split('T')[0],
};

// XP needed per level (exponential growth)
function xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// =====================
// STORE
// =====================

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // User
            username: null,
            setUsername: (name) => set({ username: name }),

            // Progress
            progress: initialProgress,

            addXP: (amount) => set((state) => {
                let newXP = state.progress.xp + amount;
                let newLevel = state.progress.level;
                let xpToNext = state.progress.xpToNextLevel;

                // Level up logic
                while (newXP >= xpToNext) {
                    newXP -= xpToNext;
                    newLevel++;
                    xpToNext = xpForLevel(newLevel);
                }

                return {
                    progress: {
                        ...state.progress,
                        xp: newXP,
                        level: newLevel,
                        xpToNextLevel: xpToNext,
                    },
                };
            }),

            completeChallenge: (challengeId) => set((state) => {
                if (state.progress.completedChallenges.includes(challengeId)) {
                    return state;
                }

                return {
                    progress: {
                        ...state.progress,
                        completedChallenges: [...state.progress.completedChallenges, challengeId],
                    },
                };
            }),

            updateStreak: () => set((state) => {
                const today = new Date().toISOString().split('T')[0];
                const lastActive = state.progress.lastActiveDate;

                if (lastActive === today) {
                    return state; // Already active today
                }

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let newStreak = state.progress.currentStreak;

                if (lastActive === yesterdayStr) {
                    // Continue streak
                    newStreak++;
                } else {
                    // Reset streak
                    newStreak = 1;
                }

                return {
                    progress: {
                        ...state.progress,
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, state.progress.longestStreak),
                        lastActiveDate: today,
                    },
                };
            }),

            // Current session
            currentChallenge: null,
            setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),

            // Attempts
            attempts: [],
            addAttempt: (attempt) => set((state) => {
                const newAttempts = [...state.attempts, attempt];
                const totalScore = newAttempts.reduce((sum, a) => sum + a.score, 0);

                return {
                    attempts: newAttempts,
                    progress: {
                        ...state.progress,
                        totalAttempts: newAttempts.length,
                        averageScore: totalScore / newAttempts.length,
                    },
                };
            }),

            // UI State
            language: 'sv',
            setLanguage: (lang) => set({ language: lang }),

            // Leaderboard
            leaderboard: [],
            setLeaderboard: (entries) => set({ leaderboard: entries }),
        }),
        {
            name: 'praxis-storage',
            partialize: (state) => ({
                username: state.username,
                progress: state.progress,
                attempts: state.attempts,
                language: state.language,
            }),
        }
    )
);

// =====================
// SELECTORS
// =====================

export const selectLevel = (state: AppState) => state.progress.level;
export const selectXP = (state: AppState) => state.progress.xp;
export const selectCompletedCount = (state: AppState) => state.progress.completedChallenges.length;
export const selectStreak = (state: AppState) => state.progress.currentStreak;
