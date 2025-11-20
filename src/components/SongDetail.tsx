import { useGameStore } from '../store/gameStore';
import type { Song } from '../types/game';

interface SongDetailProps {
    song: Song;
    onStart: () => void;
    onBack: () => void;
}

export const SongDetail = ({ song, onStart, onBack }: SongDetailProps) => {
    const { speed, setSpeed } = useGameStore();

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br ${song.color} opacity-30`} />

            {/* Content Container */}
            <div className="z-10 flex flex-col items-center w-full max-w-4xl px-8">

                {/* Song Info Card */}
                <div className={`w-[300px] h-[300px] rounded-2xl shadow-2xl bg-gradient-to-br ${song.color} mb-8 flex items-center justify-center border-4 border-white/20`}>
                    <div className="text-center text-white">
                        <h1 className="text-4xl font-black mb-2 drop-shadow-lg">{song.title}</h1>
                        <p className="text-xl opacity-80">{song.artist}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex gap-8 mb-12 text-white">
                    <div className="text-center">
                        <div className="text-sm opacity-60">BPM</div>
                        <div className="text-2xl font-bold">{song.bpm}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm opacity-60">DIFFICULTY</div>
                        <div className="text-2xl font-bold">{song.difficulty}</div>
                    </div>
                </div>

                {/* Speed Control */}
                <div className="w-full max-w-md mb-12">
                    <div className="flex justify-between w-full text-white mb-2 font-bold">
                        <span>SPEED</span>
                        <span className="text-blue-400">{speed}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6">
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full transition-colors"
                    >
                        BACK
                    </button>
                    <button
                        onClick={onStart}
                        className="px-12 py-3 bg-white hover:bg-gray-100 text-black font-black text-xl tracking-widest rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform hover:scale-105 active:scale-95"
                    >
                        START GAME
                    </button>
                </div>
            </div>
        </div>
    );
};
