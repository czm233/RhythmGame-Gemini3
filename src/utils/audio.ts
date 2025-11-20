// Simple synthesized sound using Web Audio API

let audioContext: AudioContext | null = null;

export const initAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
};

export const playHitSound = (type: 'PERFECT' | 'GOOD' = 'PERFECT') => {
    if (!audioContext) initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sound for Perfect vs Good?
    // Perfect: Higher pitch, sharper
    // Good: Slightly lower

    const startFreq = type === 'PERFECT' ? 1200 : 800;
    const endFreq = 100;
    const duration = 0.1;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
};
