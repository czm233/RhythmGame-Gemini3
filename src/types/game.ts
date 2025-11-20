export type NoteType = 'tap' | 'hold';
export type NoteColor = 'blue' | 'pink';

export interface Song {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    difficulty: string;
    color: string;
}

export interface Note {
    id: string;
    time: number; // The exact time the note should be hit (in ms)
    type: NoteType;
    duration?: number; // For hold notes
    lane: number; // 0-3 for 4 lanes
    color: NoteColor;
    hit: boolean; // Whether the note has been hit
    missed: boolean; // Whether the note has been missed
}

export interface GameState {
    isPlaying: boolean;
    currentTime: number;
    score: number;
    combo: number;
    maxCombo: number;
    perfect: number;
    good: number;
    miss: number;
    speed: number; // 1-10
    notes: Note[];
    lastJudgment: { type: 'PERFECT' | 'GOOD' | 'MISS'; timing: 'FAST' | 'LATE' | null; id: string } | null;

    // Actions
    startGame: () => void;
    pauseGame: () => void;
    endGame: () => void;
    resetGame: () => void;
    updateTime: (time: number) => void;
    setSpeed: (speed: number) => void;
    handleHit: (noteId: string, scoreDelta: number) => void;
    handleMiss: (noteId: string) => void;
}
