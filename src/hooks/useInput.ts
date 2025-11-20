import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getJudgment, SCORES, JUDGMENT_WINDOWS } from '../utils/judgment';

const KEY_MAPPING: { [key: string]: number } = {
    'KeyD': 0,
    'KeyF': 1,
    'KeyJ': 2,
    'KeyK': 3,
};

export const useInput = () => {
    const { notes, currentTime, handleHit, handleMiss, isPlaying } = useGameStore();

    useEffect(() => {
        if (!isPlaying) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const lane = KEY_MAPPING[e.code];
            if (lane === undefined) return;

            // Find the closest unhit note in this lane
            // We need to sort by time to get the earliest one? 
            // Notes are generated in order, so finding the first unhit one should work.
            // But we only care about notes that are close to currentTime.

            const targetNote = notes.find(n =>
                n.lane === lane &&
                !n.hit &&
                !n.missed &&
                Math.abs(n.time - currentTime) < JUDGMENT_WINDOWS.MISS // Only check notes within miss window
            );

            if (targetNote) {
                const timeDiff = targetNote.time - currentTime;
                const judgment = getJudgment(timeDiff);

                if (judgment === 'PERFECT') {
                    handleHit(targetNote.id, SCORES.PERFECT);
                    console.log('PERFECT');
                } else if (judgment === 'GOOD') {
                    handleHit(targetNote.id, SCORES.GOOD);
                    console.log('GOOD');
                } else if (judgment === 'MISS') {
                    handleMiss(targetNote.id);
                    console.log('MISS');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, notes, currentTime, handleHit, handleMiss]);
};
