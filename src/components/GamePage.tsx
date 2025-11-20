import { useEffect } from 'react';
import { GameScene } from './GameScene';
import { useGameStore } from '../store/gameStore';

interface GamePageProps {
    onBack: () => void;
    onEnd: () => void;
}

export const GamePage = ({ onBack, onEnd }: GamePageProps) => {
    const { startGame, isPlaying, score, combo, lastJudgment, resetGame } = useGameStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isPlaying) {
                startGame();
            }
            if (e.code === 'Escape') {
                resetGame();
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, startGame, resetGame, onBack]);

    return (
        <div className="w-full h-full relative">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <GameScene onEnd={onEnd} />
            </div>
            {/* HUD */}
            <div className="absolute top-4 left-4 text-white font-bold text-2xl font-mono z-10">
                SCORE: {score.toString().padStart(6, '0')}
            </div>

            {/* Combo Display */}
            {combo > 0 && (
                <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                    <div className="text-blue-200 font-bold text-2xl tracking-widest opacity-80">COMBO</div>
                    <div className="text-white font-black text-6xl leading-none drop-shadow-lg animate-pulse">
                        {combo}
                    </div>
                </div>
            )}

            {/* Judgment Display */}
            {lastJudgment && (
                <div
                    key={lastJudgment.id}
                    className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                >
                    <div className={`text-4xl font-black tracking-widest animate-bounce
            ${lastJudgment.type === 'PERFECT' ? 'text-yellow-400' :
                            lastJudgment.type === 'GOOD' ? 'text-green-400' : 'text-red-500'}`}
                    >
                        {lastJudgment.type}
                    </div>

                    {lastJudgment.timing && (
                        <div className={`text-xl font-bold mt-1
              ${lastJudgment.timing === 'FAST' ? 'text-blue-400' : 'text-red-400'}`}
                        >
                            {lastJudgment.timing}
                        </div>
                    )}
                </div>
            )}

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                    <div className="text-white text-center">
                        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
                            RHYTHM GAME
                        </h1>
                        <p className="text-xl animate-pulse mb-8">Press SPACE to Start</p>
                        <button
                            onClick={onBack}
                            className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button (Always visible for safety) */}
            <button
                onClick={() => { resetGame(); onBack(); }}
                className="absolute top-4 right-4 text-white/50 hover:text-white z-50"
            >
                EXIT
            </button>
        </div>
    );
};
