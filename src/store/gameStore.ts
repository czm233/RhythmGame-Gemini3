import { create } from 'zustand';
import type { GameState } from '../types/game';
import { generateBeatMap } from '../utils/beatGenerator';
import { gameTimer } from '../utils/timer';

export const useGameStore = create<GameState>((set) => ({
    isPlaying: false,
    currentTime: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    speed: 5, // Default speed
    notes: [],
    lastJudgment: null,

    startGame: () => {
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
            lastJudgment: null
        });
    },

    updateTime: (time: number) => {
        set({ currentTime: time });
    },

    setSpeed: (speed: number) => {
        set({ speed });
    },

    handleHit: (noteId: string, scoreDelta: number) => {
        set((state) => {
            const newCombo = state.combo + 1;
            return {
                score: state.score + scoreDelta,
                combo: newCombo,
                maxCombo: Math.max(state.maxCombo, newCombo),
                notes: state.notes.map(n => n.id === noteId ? { ...n, hit: true } : n),
                lastJudgment: { type: scoreDelta === 100 ? 'PERFECT' : 'GOOD', id: noteId }
            };
        });
    },

    handleMiss: (noteId: string) => {
        set((state) => ({
            combo: 0,
            notes: state.notes.map(n => n.id === noteId ? { ...n, missed: true } : n),
            lastJudgment: { type: 'MISS', id: noteId }
        }));
    }
}));
