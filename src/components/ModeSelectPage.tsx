interface ModeSelectPageProps {
    onSelectGame: () => void;
    onSelectEditor: () => void;
}

export const ModeSelectPage = ({ onSelectGame, onSelectEditor }: ModeSelectPageProps) => {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center gap-8 p-12 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />

            {/* Game Mode Card */}
            <div
                onClick={onSelectGame}
                className="relative w-1/3 h-[70%] group cursor-pointer perspective-1000"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-4 shadow-[0_0_50px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_80px_rgba(59,130,246,0.6)] border border-white/10 overflow-hidden">
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                        <div className="w-32 h-32 mb-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black tracking-widest mb-4">GAME MODE</h2>
                        <p className="text-white/60 text-center max-w-xs">
                            Play through a collection of rhythm tracks and challenge your high scores.
                        </p>
                    </div>
                </div>
            </div>

            {/* Editor Mode Card */}
            <div
                onClick={onSelectEditor}
                className="relative w-1/3 h-[70%] group cursor-pointer perspective-1000"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_80px_rgba(16,185,129,0.6)] border border-white/10 overflow-hidden">
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                        <div className="w-32 h-32 mb-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-colors">
                            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black tracking-widest mb-4">EDITOR MODE</h2>
                        <p className="text-white/60 text-center max-w-xs">
                            Create your own beatmaps and share them with the world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
