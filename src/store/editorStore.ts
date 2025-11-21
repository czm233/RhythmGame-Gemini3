import { create } from 'zustand';
import type { Note } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
    // Playback
    isPlaying: boolean;
    currentTime: number;
    playbackRate: number;

    // Grid & Snap
    snapDivisor: number; // 1/4, 1/8, 1/16 etc.
    zoomLevel: number; // Pixels per second

    // Data
    notes: Note[];
    selectedNoteIds: string[];
    selectedToolColor: 'blue' | 'pink';
    audioUrl: string;
    audioFileName: string;

    // Actions
    togglePlay: () => void;
    setTime: (time: number) => void;
    setSnap: (snap: number) => void;
    setZoom: (zoom: number) => void;
    addNote: (lane: number, time: number) => void;
    removeNote: (id: string) => void;
    selectNote: (id: string, multi?: boolean) => void;
    clearSelection: () => void;

    updateNote: (id: string, updates: Partial<Note>) => void;
    setToolColor: (color: 'blue' | 'pink') => void;
    setAudioUrl: (url: string) => void;
    setAudioFileName: (name: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    snapDivisor: 4,
    zoomLevel: 200,
    notes: [],
    selectedNoteIds: [],
    selectedToolColor: 'blue',
    audioUrl: '',
    audioFileName: '',

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setTime: (time) => set({ currentTime: Math.max(0, time) }),
    setSnap: (snap) => set({ snapDivisor: snap }),
    setZoom: (zoom) => set({ zoomLevel: Math.max(10, Math.min(1000, zoom)) }),

    addNote: (lane, time) => set((state) => {
        const newNote: Note = {
            id: uuidv4(),
            time,
            lane,
            type: 'tap',
            color: state.selectedToolColor, // Use selected tool color
            hit: false,
            missed: false
        };
        return { notes: [...state.notes, newNote].sort((a, b) => a.time - b.time) };
    }),

    removeNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id),
        selectedNoteIds: state.selectedNoteIds.filter(sid => sid !== id)
    })),

    selectNote: (id, multi = false) => set((state) => ({
        selectedNoteIds: multi
            ? (state.selectedNoteIds.includes(id)
                ? state.selectedNoteIds.filter(sid => sid !== id)
                : [...state.selectedNoteIds, id])
            : [id]
    })),

    clearSelection: () => set({ selectedNoteIds: [] }),

    updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
    })),

    setToolColor: (color) => set({ selectedToolColor: color }),
    setAudioUrl: (url) => set({ audioUrl: url }),
    setAudioFileName: (name) => set({ audioFileName: name }),
}));
