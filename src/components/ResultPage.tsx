import { useGameStore } from '../store/gameStore';
import type { Song } from '../types/game';

interface ResultPageProps {
    song: Song;
    onBack: () => void;
}

export const ResultPage = ({ song, onBack }: ResultPageProps) => {
    const { score, maxCombo, perfect, good, miss } = useGameStore();

    // Calculate Accuracy
    // Perfect = 100%, Good = 50%, Miss = 0%
    const totalNotes = perfect + good + miss;
    const maxPossibleScore = totalNotes * 1000; // Assuming Perfect is 1000 base score (simplified)
    // Actual score calculation might be different, but for accuracy % we can use weighted counts
    // Let's use a standard accuracy formula: (Perfect * 1 + Good * 0.5) / Total
    const accuracyRaw = totalNotes > 0 ? ((perfect * 1 + good * 0.5) / totalNotes) * 100 : 0;
    const accuracy = accuracyRaw.toFixed(2) + '%';

    // Determine Rank
    let rank = 'C';
    if (accuracyRaw >= 95) rank = 'S';
    else if (accuracyRaw >= 90) rank = 'A';
    else if (accuracyRaw >= 80) rank = 'B';

    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center">
            {/* Background Ambience */}
            <div className={`absolute inset-0 bg-gradient-to-br ${song.color} opacity-20`} />

            {/* Grid Background Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [perspective:1000px] [transform:rotateX(60deg)_scale(2)] origin-bottom opacity-30" />

            {/* Header */}
            <div className="z-10 mt-8 mb-4 text-center">
                <h1 className="text-6xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" style={{ fontFamily: 'Impact, sans-serif' }}>
                    TOTAL
                </h1>
                <div className="text-xl text-yellow-200 font-bold tracking-[1em] ml-4">结算</div>
            </div>

            {/* Main Content */}
            <div className="z-10 flex w-full max-w-6xl px-12 mt-8 gap-16 items-center justify-center">

                {/* Left: Song Card & Rank */}
                <div className="relative">
                    {/* Rank Badge */}
                    <div className="absolute -top-12 -left-8 z-20 text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '2px white' }}>
                        {rank}
                    </div>

                    {/* Card */}
                    <div className={`w-[320px] h-[460px] rounded-xl border-4 border-yellow-500/50 bg-gradient-to-b ${song.color} relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                        {/* Glitch/Noise overlay placeholder */}
                        <div className="absolute inset-0 bg-black/20" />

                        <div className="absolute bottom-0 w-full bg-black/80 p-4 border-t-2 border-white/20">
                            <div className="text-yellow-400 font-bold text-sm tracking-widest mb-1">{song.difficulty}</div>
                            <div className="text-white font-bold text-xl truncate">{song.title}</div>
                            <div className="text-white/60 text-sm">{song.artist}</div>
                        </div>
                    </div>

                    {/* Total Score (Below Card as per image, or maybe bottom left) */}
                    <div className="mt-4 text-left">
                        <div className="text-white/60 text-xl italic font-bold">» 总分:</div>
                        <div className="text-5xl font-mono font-bold text-white italic tracking-widest">{score.toString().padStart(7, '0')}</div>
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="flex-1 flex flex-col gap-8">

                    {/* Player Info & Status */}
                    <div className="flex justify-between items-end border-b-2 border-blue-500/30 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-700 rounded border-2 border-white/50 flex items-center justify-center">
                                <span className="text-xs text-white/50">AVATAR</span>
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">PLAYER</div>
                                <div className="text-blue-400 text-sm font-mono">Lv. 99</div>
                            </div>
                        </div>
                        <div className="text-4xl font-black text-yellow-400 italic tracking-widest drop-shadow-lg">
                            成功 <span className="text-2xl">SUCCESS</span>
                        </div>
                    </div>

                    {/* Judgment Counts */}
                    <div className="flex justify-between px-4">
                        <div className="text-center">
                            <div className="text-red-500 font-bold italic text-xl mb-1">» MISS</div>
                            <div className="text-red-400 font-mono text-3xl font-bold">{miss}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-green-400 font-bold italic text-xl mb-1">» GOOD</div>
                            <div className="text-green-300 font-mono text-3xl font-bold">{good}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-yellow-400 font-bold italic text-xl mb-1">» PERFECT</div>
                            <div className="text-yellow-200 font-mono text-3xl font-bold">{perfect}</div>
                        </div>
                    </div>

                    {/* Circles: Max Combo & Accuracy */}
                    <div className="flex justify-center gap-12 mt-4">
                        {/* Max Combo Circle */}
                        <div className="w-40 h-40 rounded-full border-4 border-yellow-500/30 flex flex-col items-center justify-center relative bg-black/40 backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-full border-t-4 border-yellow-500 rotate-45" />
                            <div className="text-4xl font-bold text-white font-mono">{maxCombo}</div>
                            <div className="text-xs text-yellow-500 font-bold mt-1">最大连击数</div>
                        </div>

                        {/* Accuracy Circle */}
                        <div className="w-40 h-40 rounded-full border-4 border-blue-500/30 flex flex-col items-center justify-center relative bg-black/40 backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-full border-r-4 border-blue-500 rotate-12" />
                            <div className="text-3xl font-bold text-white font-mono">{accuracy}</div>
                            <div className="text-xs text-blue-400 font-bold mt-1">完成度</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Button */}
            <button
                onClick={onBack}
                className="absolute bottom-12 px-16 py-3 bg-blue-600/20 border-2 border-blue-400 text-blue-100 font-bold text-xl rounded-full hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
                跳过
            </button>
        </div>
    );
};
