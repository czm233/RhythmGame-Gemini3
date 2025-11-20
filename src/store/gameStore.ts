import { create } from 'zustand';
import type { GameState } from '../types/game';
import { generateBeatMap } from '../utils/beatGenerator';
import { gameTimer } from '../utils/timer';
import { initAudio } from '../utils/audio';

const SCORES = { PERFECT: 100, GOOD: 50 };

export const useGameStore = create<GameState>((set) => ({
    isPlaying: false,
    currentTime: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    speed: 5, // Default speed
    notes: [],
    lastJudgment: null,

    endGame: () => {
        gameTimer.pause();
        set({ isPlaying: false });
    },

    startGame: () => {
        initAudio();
        const notes = generateBeatMap();
        gameTimer.reset();
        gameTimer.start();
        set({
            isPlaying: true,
            notes,
            score: 0,
            combo: 0,
            currentTime: 0,
            maxCombo: 0,
            perfect: 0,
            good: 0,
            miss: 0,
            lastJudgment: null
        });
    },

    pauseGame: () => {
        gameTimer.pause();
        set({ isPlaying: false });
    },

    resetGame: () => {
        gameTimer.reset();
        set({
            isPlaying: false,
            currentTime: 0,
            score: 0,
            combo: 0,
            maxCombo: 0,
            perfect: 0,
            good: 0,
            miss: 0,
            notes: [],
            lastJudgment: null,
        });
    },

    updateTime: (time: number) => {
        set({ currentTime: time });
    },

    setSpeed: (speed: number) => {
        set({ speed });
    },

    handleHit: (id: string, judgment: 'PERFECT' | 'GOOD', timing?: 'FAST' | 'LATE') => {
        const points = SCORES[judgment];

        set((state) => {
            const newCombo = state.combo + 1;
            return {
                notes: state.notes.map(n => n.id === id ? { ...n, hit: true } : n),
                score: state.score + points,
                combo: newCombo,
                maxCombo: Math.max(state.maxCombo, newCombo),
                perfect: judgment === 'PERFECT' ? state.perfect + 1 : state.perfect,
                good: judgment === 'GOOD' ? state.good + 1 : state.good,
                lastJudgment: { type: judgment, timing, id }
            };
        });
    },

    handleMiss: (id: string) => {
        set((state) => ({
            notes: state.notes.map(n => n.id === id ? { ...n, missed: true } : n),
            combo: 0,
            miss: state.miss + 1,
            lastJudgment: { type: 'MISS', timing: null, id }
        }));
    }
}));
