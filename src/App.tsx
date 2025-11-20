import { useEffect } from 'react';
import { GameScene } from './components/GameScene';
import { useGameStore } from './store/gameStore';

function App() {
  const { startGame, isPlaying, score, combo, speed, setSpeed, lastJudgment } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPlaying) {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, startGame]);

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      <div className="w-full h-full absolute inset-0">
        <GameScene />


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

              <div className="flex flex-col items-center gap-2">
                <label className="text-lg font-semibold">Speed: {speed}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <p className="text-sm text-gray-400">Adjust speed (1-10)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
