import { useState } from 'react';

interface LandingPageProps {
    onSkip: () => void;
}

export const LandingPage = ({ onSkip }: LandingPageProps) => {
    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center gap-12 animate-fade-in">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                        RHYTHM PRO
                    </h1>
                    <p className="text-blue-200/60 tracking-[0.5em] text-sm uppercase">Ultimate Rhythm Experience</p>
                </div>

                {/* QR Code Placeholder */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <div className="relative w-64 h-64 bg-white rounded-lg p-4 flex items-center justify-center shadow-2xl">
                        {/* Mock QR Code Visual */}
                        <div className="w-full h-full border-4 border-black flex flex-wrap content-center justify-center gap-1 p-2">
                            {/* Random blocks to look like QR */}
                            {Array.from({ length: 64 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-5 h-5 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}
                                />
                            ))}
                            {/* Corner markers */}
                            <div className="absolute top-4 left-4 w-12 h-12 border-4 border-black bg-white flex items-center justify-center">
                                <div className="w-6 h-6 bg-black" />
                            </div>
                            <div className="absolute top-4 right-4 w-12 h-12 border-4 border-black bg-white flex items-center justify-center">
                                <div className="w-6 h-6 bg-black" />
                            </div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-4 border-black bg-white flex items-center justify-center">
                                <div className="w-6 h-6 bg-black" />
                            </div>
                        </div>

                        {/* Scan Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm rounded-lg">
                            <span className="text-black font-bold text-lg">Scan to Login</span>
                        </div>
                    </div>
                    <div className="text-center mt-4 text-white/50 text-sm font-mono">
                        WeChat Scan Login
                    </div>
                </div>

                {/* Skip Button */}
                <button
                    onClick={onSkip}
                    className="mt-8 px-12 py-3 bg-transparent border border-white/20 hover:border-white/50 text-white/60 hover:text-white rounded-full transition-all hover:bg-white/5 active:scale-95"
                >
                    SKIP LOGIN &gt;
                </button>
            </div>
        </div>
    );
};
