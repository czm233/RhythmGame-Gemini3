

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

export const getJudgment = (timeDiff: number): 'PERFECT' | 'GOOD' | 'MISS' | null => {
    const absDiff = Math.abs(timeDiff);

    if (absDiff <= JUDGMENT_WINDOWS.PERFECT) return 'PERFECT';
    if (absDiff <= JUDGMENT_WINDOWS.GOOD) return 'GOOD';
    if (absDiff <= JUDGMENT_WINDOWS.MISS) return 'MISS'; // Or just return 'MISS' if it's within a catchable range but late?

    return null; // Too far to judge
};
