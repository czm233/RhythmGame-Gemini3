

export const JUDGMENT_WINDOWS = {
    PERFECT: 50, // ms
    GOOD: 100,   // ms
    MISS: 150,   // ms
};

export const SCORES = {
    PERFECT: 100,
    GOOD: 50,
    MISS: 0,
};

export interface JudgmentResult {
    type: 'PERFECT' | 'GOOD' | 'MISS';
    timing?: 'FAST' | 'LATE';
}

export const getJudgment = (timeDiff: number): JudgmentResult | null => {
    const absDiff = Math.abs(timeDiff);
    // const timing = timeDiff > 0 ? 'LATE' : 'FAST';
    // In Note.tsx: zPos = JUDGMENT_Z - (note.time - currentTime) * speedFactor
    // If note.time > currentTime, it hasn't reached yet.
    // If we hit it when note.time > currentTime, we are EARLY (FAST).
    // So if (note.time - currentTime) > 0, it's FAST.
    // Let's check useInput.ts: const timeDiff = targetNote.time - currentTime;
    // So timeDiff > 0 means FAST.

    const timingLabel = timeDiff > 0 ? 'FAST' : 'LATE';

    if (absDiff <= JUDGMENT_WINDOWS.PERFECT) return { type: 'PERFECT', timing: timingLabel };
    if (absDiff <= JUDGMENT_WINDOWS.GOOD) return { type: 'GOOD', timing: timingLabel };
    if (absDiff <= JUDGMENT_WINDOWS.MISS) return { type: 'MISS' };

    return null;
};
