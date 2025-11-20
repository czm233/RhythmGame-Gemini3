import { v4 as uuidv4 } from 'uuid';
import type { Note, NoteColor } from '../types/game';

const TOTAL_TIME = 120000; // 2 minutes in ms
const MIN_INTERVAL = 200; // Minimum time between notes in ms

export const generateBeatMap = (): Note[] => {
    const notes: Note[] = [];
    let currentTime = 1000; // Start after 1 second

    while (currentTime < TOTAL_TIME) {
        // Randomize interval based on "rhythm" (simplified)
        const interval = Math.random() > 0.7 ? MIN_INTERVAL * 2 : MIN_INTERVAL * 4;
        currentTime += interval;

        if (currentTime >= TOTAL_TIME) break;

        // Random lane (0-3)
        const lane = Math.floor(Math.random() * 4);

        // Random color
        const color: NoteColor = Math.random() > 0.5 ? 'blue' : 'pink';

        // Random type (mostly tap, sometimes hold)
        const isHold = Math.random() > 0.85;
        const type = isHold ? 'hold' : 'tap';
        const duration = isHold ? Math.random() * 500 + 200 : 0;

        notes.push({
            id: uuidv4(),
            time: currentTime,
            type,
            duration: isHold ? duration : undefined,
            lane,
            color,
            hit: false,
            missed: false,
        });
    }

    return notes;
};
