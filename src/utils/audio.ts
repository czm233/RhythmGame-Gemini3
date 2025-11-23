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

export const playHitSound = (type: 'PERFECT' | 'GOOD' = 'PERFECT', volume: number = 0.8, soundType: string = 'default') => {
    if (!audioContext) initAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let startFreq = 1200;
    let endFreq = 100;
    let duration = 0.1;
    let waveType: OscillatorType = 'sine';

    // Configure sound based on type
    switch (soundType) {
        case 'kick':
            startFreq = 150;
            endFreq = 0.01;
            duration = 0.15;
            waveType = 'sine';
            break;
        case 'snare':
            // Noise burst simulation (simplified with high freq triangle)
            startFreq = 800;
            endFreq = 100;
            duration = 0.05;
            waveType = 'triangle';
            break;
        case 'tick':
            startFreq = 2000;
            endFreq = 2000;
            duration = 0.02;
            waveType = 'square';
            break;
        default: // 'default'
            startFreq = type === 'PERFECT' ? 1200 : 800;
            endFreq = 100;
            duration = 0.1;
            waveType = 'sine';
            break;
    }

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(0.01, endFreq), audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
};
