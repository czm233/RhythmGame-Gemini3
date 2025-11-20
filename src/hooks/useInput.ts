import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getJudgment, SCORES, JUDGMENT_WINDOWS } from '../utils/judgment';
import { playHitSound } from '../utils/audio';

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
                const result = getJudgment(timeDiff);

                if (result?.type === 'PERFECT') {
                    handleHit(targetNote.id, 'PERFECT', result.timing);
                    playHitSound('PERFECT');
                    console.log('PERFECT', result.timing);
                } else if (result?.type === 'GOOD') {
                    handleHit(targetNote.id, 'GOOD', result.timing);
                    playHitSound('GOOD');
                    console.log('GOOD', result.timing);
                } else if (result?.type === 'MISS') {
                    handleMiss(targetNote.id);
                    console.log('MISS');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, notes, currentTime, handleHit, handleMiss]);
};
