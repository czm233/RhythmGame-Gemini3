import { create } from 'zustand';

export interface SettingsState {
    // Key bindings for 4 lanes
    // keyCodes corresponding to lane 0, 1, 2, 3
    laneKeys: string[];
    
    // Actions
    setLaneKeys: (keys: string[]) => void;
    setLaneKey: (lane: number, key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    // Default: D, F, J, K
    laneKeys: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'],

    setLaneKeys: (keys) => set({ laneKeys: keys }),
    
    setLaneKey: (lane, key) => set((state) => {
        const newKeys = [...state.laneKeys];
        if (lane >= 0 && lane < newKeys.length) {
            newKeys[lane] = key;
        }
        return { laneKeys: newKeys };
    })
}));

