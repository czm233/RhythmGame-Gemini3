import { useState, useRef, useEffect } from 'react';
import { SONGS } from '../data/songs';
import type { Song } from '../types/game';

interface SongSelectProps {
    onSelect: (song: Song) => void;
}

export const SongSelect = ({ onSelect }: SongSelectProps) => {
    const [selectedIndex, setSelectedIndex] = useState(2);
    const containerRef = useRef<HTMLDivElement>(null);

    const VISIBLE_ITEMS = 7;

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            setSelectedIndex(prev => prev + 1);
        } else if (direction === 'right') {
            setSelectedIndex(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowRight') handleSwipe('left');
            if (e.code === 'ArrowLeft') handleSwipe('right');
            if (e.code === 'Enter' || e.code === 'Space') {
                const dataIndex = ((selectedIndex % SONGS.length) + SONGS.length) % SONGS.length;
                onSelect(SONGS[dataIndex]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, onSelect]);

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br ${SONGS[((selectedIndex % SONGS.length) + SONGS.length) % SONGS.length].color} opacity-20 transition-colors duration-700`} />

            {/* Title */}
            <div className="absolute top-12 z-20 text-center">
                <h1 className="text-4xl font-bold text-white tracking-widest mb-2">SELECT TRACK</h1>
                <div className="w-24 h-1 bg-white mx-auto rounded-full opacity-50" />
            </div>

            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="relative w-full h-[500px] flex items-center justify-center perspective-1000"
                style={{ perspective: '1000px' }}
            >
                {Array.from({ length: VISIBLE_ITEMS }).map((_, i) => {
                    // Calculate offset relative to center (e.g., -3, -2, -1, 0, 1, 2, 3 for 7 items)
                    const offset = i - Math.floor(VISIBLE_ITEMS / 2);

                    // Calculate the actual index in the infinite sequence
                    const renderIndex = selectedIndex + offset;

                    // Calculate the data index (wrapped around)
                    const dataIndex = ((renderIndex % SONGS.length) + SONGS.length) % SONGS.length;
                    const song = SONGS[dataIndex];

                    const absOffset = Math.abs(offset);
                    const isActive = offset === 0;

                    // Visual Parameters
                    const xOffset = offset * 220; // Horizontal spacing
                    // New Layout: "2-1-2" (Center is high/1, all sides are low/2)
                    const yOffset = isActive ? 0 : 100;
                    const scale = isActive ? 1.1 : 0.8; // Emphasize center more
                    const zIndex = 100 - absOffset; // Stacking order
                    const opacity = Math.max(1 - absOffset * 0.2, 0.4); // Keep sides more visible
                    const rotateY = offset * -5; // Subtle rotation

                    return (
                        <div
                            key={`${song.id}-${renderIndex}`} // Unique key for React reconciliation
                            className={`absolute w-[280px] h-[400px] rounded-2xl shadow-2xl transition-all duration-500 ease-out cursor-pointer
                bg-gradient-to-br ${song.color} border-2 border-white/20
                flex flex-col items-center justify-between p-6
                ${isActive ? 'ring-4 ring-white/50' : 'brightness-50 grayscale-[0.5]'}`}
                            style={{
                                transform: `
                  translateX(${xOffset}px) 
                  translateY(${yOffset}px) 
                  scale(${scale})
                  rotateY(${rotateY}deg)
                `,
                                zIndex: zIndex,
                                opacity: opacity,
                            }}
                            onClick={() => {
                                if (isActive) {
                                    onSelect(song);
                                } else {
                                    setSelectedIndex(renderIndex);
                                }
                            }}
                        >
                            {/* Card Content */}
                            <div className="w-full flex justify-between items-start">
                                <span className="text-white/80 font-mono text-sm">NO.{song.id}</span>
                                <span className="px-2 py-1 bg-black/30 rounded text-xs font-bold text-white">{song.difficulty}</span>
                            </div>

                            <div className="text-center">
                                <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md">{song.title}</h2>
                                <p className="text-white/70 font-medium tracking-wider">{song.artist}</p>
                            </div>

                            <div className="w-full">
                                <div className="flex justify-between text-xs text-white/60 mb-1">
                                    <span>BPM</span>
                                    <span>{song.bpm}</span>
                                </div>
                                <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/80 w-[70%]" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
};
