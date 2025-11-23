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
    hitSoundVolume: number;
    hitSoundType: string;

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
    setHitSoundVolume: (volume: number) => void;
    setHitSoundType: (type: string) => void;
    setSelectedNotes: (ids: string[]) => void;
    updateNotes: (updates: { id: string, changes: Partial<Note> }[]) => void;

    // Clipboard & Tools
    clipboard: Note[];
    copySelection: () => void;
    pasteNotes: (targetTime: number) => void;
    mirrorSelection: () => void;
    deleteSelection: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    snapDivisor: 4,
    zoomLevel: 200, // px per 1000ms
    notes: [],
    selectedNoteIds: [],
    selectedToolColor: 'blue',
    audioUrl: '',
    audioFileName: '',
    hitSoundVolume: 0.8,
    hitSoundType: 'default',

    clipboard: [],

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setTime: (time) => set({ currentTime: Math.max(0, time) }),
    setSnap: (snap) => set({ snapDivisor: snap }),
    setZoom: (zoom) => set({ zoomLevel: Math.max(10, Math.min(1000, zoom)) }),

    addNote: (lane, time) => set((state) => {
        // Prevent duplicates
        if (state.notes.some(n => Math.abs(n.time - time) < 1 && n.lane === lane)) {
            return {};
        }
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

    setSelectedNotes: (ids: string[]) => set({ selectedNoteIds: ids }),

    updateNotes: (updates: { id: string, changes: Partial<Note> }[]) => set((state) => ({
        notes: state.notes.map((note) => {
            const update = updates.find(u => u.id === note.id);
            return update ? { ...note, ...update.changes } : note;
        })
    })),

    // Clipboard & Tools
    copySelection: () => set((state) => {
        const selected = state.notes.filter(n => state.selectedNoteIds.includes(n.id));
        if (selected.length === 0) return {};
        return { clipboard: JSON.parse(JSON.stringify(selected)) };
    }),

    pasteNotes: (targetTime: number) => set((state) => {
        if (state.clipboard.length === 0) return {};

        const minTime = Math.min(...state.clipboard.map(n => n.time));
        const timeOffset = targetTime - minTime;

        const newNotes = state.clipboard.map(note => ({
            ...note,
            id: uuidv4(),
            time: Math.max(0, note.time + timeOffset),
        })).filter(newNote => {
            // Prevent duplicates
            return !state.notes.some(n => Math.abs(n.time - newNote.time) < 1 && n.lane === newNote.lane);
        });

        if (newNotes.length === 0) return {};

        return {
            notes: [...state.notes, ...newNotes],
            selectedNoteIds: newNotes.map(n => n.id)
        };
    }),

    mirrorSelection: () => set((state) => {
        const updates = state.notes.map(note => {
            if (state.selectedNoteIds.includes(note.id)) {
                return { ...note, lane: 3 - note.lane };
            }
            return note;
        });
        return { notes: updates };
    }),

    deleteSelection: () => set((state) => ({
        notes: state.notes.filter(n => !state.selectedNoteIds.includes(n.id)),
        selectedNoteIds: []
    })),

    clearSelection: () => set({ selectedNoteIds: [] }),

    updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
    })),

    setToolColor: (color) => set({ selectedToolColor: color }),
    setAudioUrl: (url) => set({ audioUrl: url }),
    setAudioFileName: (name) => set({ audioFileName: name }),
    setHitSoundVolume: (volume) => set({ hitSoundVolume: volume }),
    setHitSoundType: (type) => set({ hitSoundType: type }),
}));
