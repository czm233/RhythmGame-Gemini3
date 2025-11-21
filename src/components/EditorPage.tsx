import { useEffect, useRef } from 'react';

import { useEditorStore } from '../store/editorStore';
import { playHitSound, initAudio } from '../utils/audio';

interface EditorPageProps {
    onBack: () => void;
}

export const EditorPage = ({ onBack }: EditorPageProps) => {
    const {
        currentTime, isPlaying, snapDivisor, zoomLevel, notes, selectedNoteIds, selectedToolColor, audioUrl, audioFileName,
        togglePlay, setTime, setSnap, setZoom, addNote, removeNote, selectNote, updateNote, setToolColor, setAudioUrl, setAudioFileName
    } = useEditorStore();

    // Dragging state
    const dragRef = useRef<{ id: string, startY: number, startX: number, startTime: number, startLane: number } | null>(null);

    // Audio refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Handle mouse move for dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current) return;

            const { id, startY, startX, startTime, startLane } = dragRef.current;
            const deltaY = startY - e.clientY; // Drag up = positive time
            const deltaX = e.clientX - startX;

            console.log('Dragging:', { id, deltaX, deltaY });

            // Calculate new time
            const timeDelta = (deltaY / zoomLevel) * 1000;
            let newTime = startTime + timeDelta;

            // Snap time
            if (snapDivisor > 0 && !e.shiftKey) {
                const beatTime = 60000 / 120;
                const snapInterval = beatTime * (4 / snapDivisor);
                newTime = Math.round(newTime / snapInterval) * snapInterval;
            }
            newTime = Math.max(0, newTime);

            // Calculate new lane
            // Lane width is approx 25% of container width. 
            // We need to know container width, but we can estimate or use pixels.
            // Let's assume container is 400px wide (fixed in CSS).
            const laneWidth = 100;
            const laneDelta = Math.round(deltaX / laneWidth);
            let newLane = startLane + laneDelta;
            newLane = Math.max(0, Math.min(3, newLane));

            console.log('Update Note:', { id, newTime, newLane });

            updateNote(id, {
                time: newTime,
                lane: newLane,
                color: (newLane === 1 || newLane === 2) ? 'pink' : 'blue'
            });
        };

        const handleMouseUp = () => {
            dragRef.current = null;
        };

        // Always attach listeners, check dragRef inside handler
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [zoomLevel, snapDivisor, updateNote]);

    // Playback control
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Sync audio time when NOT playing (scrubbing)
    useEffect(() => {
        if (audioRef.current && !isPlaying) {
            const targetTime = currentTime / 1000;
            if (Math.abs(audioRef.current.currentTime - targetTime) > 0.05) {
                audioRef.current.currentTime = targetTime;
            }
        }
    }, [currentTime, isPlaying]);

    // Game Loop
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();

        const loop = () => {
            if (isPlaying) {
                let newTime = currentTime;

                if (audioRef.current && !audioRef.current.paused) {
                    // Use audio as master clock
                    newTime = audioRef.current.currentTime * 1000;
                } else {
                    // Fallback to timer
                    const now = performance.now();
                    const delta = now - lastTime;
                    newTime = currentTime + delta;
                    lastTime = now;
                }

                // Check for notes passed in this frame (simple check for hit sound)
                // Note: This might trigger multiple times if we seek back, but for playback it's fine.
                // A better way is to track "lastProcessedTime"
                notes.forEach(note => {
                    if (note.time > currentTime && note.time <= newTime) {
                        playHitSound('PERFECT');
                    }
                });

                setTime(newTime);

                // Stop if audio ended
                if (audioRef.current && audioRef.current.ended) {
                    togglePlay();
                }

                animationFrame = requestAnimationFrame(loop);
            }
        };

        if (isPlaying) {
            lastTime = performance.now();
            animationFrame = requestAnimationFrame(loop);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, currentTime, setTime, notes, togglePlay]);

    // Format time as mm:ss.ms
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = Math.floor(ms % 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    };

    return (
        <div className="w-full h-full bg-gray-900 flex flex-col text-white overflow-hidden">
            {/* Top Toolbar */}
            {/* Top Toolbar */}
            <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 shrink-0 z-20">
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold">
                    ← 返回
                </button>

                <div className="h-8 w-px bg-gray-600 mx-2" />

                <button
                    onClick={() => {
                        initAudio();
                        togglePlay();
                    }}
                    className={`px-6 py-2 rounded font-bold min-w-[100px] ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}
                >
                    {isPlaying ? '暂停 (Space)' : '播放 (Space)'}
                </button>

                <div className="font-mono text-xl bg-black/50 px-4 py-2 rounded border border-gray-600 min-w-[140px] text-center">
                    {formatTime(currentTime)}
                </div>

                <div className="flex-1 flex items-center gap-2 ml-4">
                    <input
                        type="text"
                        value={audioFileName || ''}
                        readOnly
                        placeholder="未加载音频"
                        className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="audio/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setAudioUrl(url);
                                setAudioFileName(file.name);
                                // Reset time to 0 when loading new song
                                setTime(0);
                                if (audioRef.current) {
                                    audioRef.current.load();
                                }
                            }
                        }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold whitespace-nowrap"
                    >
                        打开文件...
                    </button>
                    <audio ref={audioRef} src={audioUrl} />
                </div>

                <div className="h-8 w-px bg-gray-600 mx-2" />

                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold">
                    导出 JSON
                </button>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Toolbox */}
                <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 hidden md:flex flex-col gap-6 z-30">
                    <h3 className="text-gray-400 font-bold border-b border-gray-700 pb-2">工具库</h3>

                    {/* Snap Settings */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">吸附 (Snap)</label>
                        <select
                            value={snapDivisor}
                            onChange={(e) => setSnap(Number(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2"
                        >
                            <option value={0}>无 (Free)</option>
                            <option value={1}>1 (全音符)</option>
                            <option value={2}>2 (二分)</option>
                            <option value={4}>4 (四分)</option>
                            <option value={8}>8 (八分)</option>
                            <option value={16}>16 (十六分)</option>
                            <option value={32}>32 (三十二分)</option>
                        </select>
                        <div className="text-xs text-gray-500">按住 Shift 临时禁用吸附</div>
                    </div>

                    {/* Zoom Settings */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">缩放 (Zoom)</label>
                        <input
                            type="range"
                            min="50"
                            max="500"
                            value={zoomLevel}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Note Color Tool */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 block">默认 Note 颜色</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setToolColor('blue')}
                                className={`flex-1 py-2 rounded border-2 ${selectedToolColor === 'blue' ? 'border-white bg-blue-600' : 'border-transparent bg-blue-900 opacity-50'}`}
                            >
                                蓝
                            </button>
                            <button
                                onClick={() => setToolColor('pink')}
                                className={`flex-1 py-2 rounded border-2 ${selectedToolColor === 'pink' ? 'border-white bg-pink-600' : 'border-transparent bg-pink-900 opacity-50'}`}
                            >
                                粉
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center: Timeline & Tracks */}
                <div
                    className="flex-1 bg-gray-950 relative overflow-hidden cursor-crosshair"
                    onWheel={(e) => {
                        // Scroll to change time
                        const delta = e.deltaY;
                        // Zoom factor affects scroll speed?
                        const timeDelta = delta * (1000 / zoomLevel);
                        setTime(currentTime + timeDelta);
                    }}
                >
                    <div className="absolute inset-0 flex justify-center">
                        {/* Fixed Judgment Line */}
                        <div className="absolute left-0 right-0 bottom-[20%] h-1 bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.8)] pointer-events-none">
                            <div className="absolute right-0 bottom-0 text-red-500 text-xs font-mono bg-black/50 px-1">
                                JUDGMENT
                            </div>
                        </div>

                        {/* Moving Track Container */}
                        <div
                            className="w-[400px] absolute bottom-[20%] border-x border-gray-800 bg-black/20"
                            style={{
                                height: '0px', // Allow overflow
                                transform: `translateY(${currentTime / 1000 * zoomLevel}px)`,
                                transition: isPlaying ? 'none' : 'transform 0.1s ease-out'
                            }}
                        >
                            {/* Grid Lines */}
                            <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-20"
                                style={{
                                    height: '100000px', // Tall enough
                                    backgroundImage: `linear-gradient(to top, #fff 1px, transparent 1px)`, // Draw lines upwards
                                    // If snap is 0 (Free), show 1/4 lines as reference
                                    // 120 BPM -> 500ms/beat. 
                                    // Snap 4 -> 500ms. Snap 8 -> 250ms.
                                    // zoomLevel is px per 1000ms.
                                    // Spacing = (500 * 4 / snap) / 1000 * zoom
                                    //         = 2 / snap * zoom
                                    backgroundSize: `100% ${zoomLevel * 2 / (snapDivisor || 4)}px`,
                                    backgroundPosition: 'bottom'
                                }}
                            />

                            {/* Lane Dividers */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="absolute bottom-0 top-[-100000px] w-px bg-gray-800" style={{ left: `${i * 25}%` }} />
                            ))}

                            {/* Notes */}
                            {notes.map(note => (
                                <div
                                    key={note.id}
                                    className={`absolute w-[23%] h-4 rounded-sm border transition-colors cursor-pointer z-30
                                        ${note.lane === 0 ? 'left-[1%]' : note.lane === 1 ? 'left-[26%]' : note.lane === 2 ? 'left-[51%]' : 'left-[76%]'}
                                        ${selectedNoteIds.includes(note.id) ? 'border-white bg-opacity-100' : 'border-transparent bg-opacity-80'}
                                        ${note.color === 'pink' ? 'bg-pink-500' : 'bg-blue-500'}
                                    `}
                                    style={{
                                        bottom: `${note.time / 1000 * zoomLevel}px`, // Position from bottom
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent native drag/selection
                                        e.stopPropagation();
                                        console.log('Start drag', note.id);
                                        selectNote(note.id, e.shiftKey);
                                        dragRef.current = {
                                            id: note.id,
                                            startY: e.clientY,
                                            startX: e.clientX,
                                            startTime: note.time,
                                            startLane: note.lane
                                        };
                                    }}
                                />
                            ))}

                            {/* Click Area for Adding Notes */}
                            <div
                                className="absolute bottom-0 left-0 right-0 z-10"
                                style={{ height: '100000px', top: 'auto' }} // Extend upwards
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    // e.clientY is viewport Y.
                                    // rect.bottom is viewport Y of the bottom of this container.
                                    // Since this container's bottom is at Judgment Line + translateY.
                                    // Distance from bottom of container = rect.bottom - e.clientY.

                                    const yFromBottom = rect.bottom - e.clientY;

                                    const laneWidth = rect.width / 4;
                                    const x = e.clientX - rect.left;
                                    const lane = Math.floor(x / laneWidth);

                                    // time = y / zoom * 1000
                                    const rawTime = (yFromBottom / zoomLevel) * 1000;

                                    // Snap
                                    const beatTime = 60000 / 120;
                                    let snappedTime = rawTime;

                                    // Apply snap if not Free (0) and Shift is not held
                                    if (snapDivisor > 0 && !e.shiftKey) {
                                        const snapInterval = beatTime * (4 / snapDivisor);
                                        snappedTime = Math.round(rawTime / snapInterval) * snapInterval;
                                    }

                                    if (snappedTime >= 0) {
                                        addNote(lane, snappedTime);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Properties */}
                <div className="w-72 bg-gray-800 border-l border-gray-700 p-4 hidden lg:block">
                    <h3 className="text-gray-400 font-bold mb-4">属性面板</h3>
                    {selectedNoteIds.length === 0 ? (
                        <div className="text-gray-500 text-sm">未选择 Note</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-white font-bold">
                                已选择 {selectedNoteIds.length} 个 Note
                            </div>
                            {selectedNoteIds.length === 1 && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">时间 (ms)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-gray-500"
                                            value={notes.find(n => n.id === selectedNoteIds[0])?.time.toFixed(0)}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">轨道 (1-4)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm"
                                            value={(notes.find(n => n.id === selectedNoteIds[0])?.lane ?? 0) + 1}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const internalLane = val - 1;
                                                if (!isNaN(internalLane) && internalLane >= 0 && internalLane <= 3) {
                                                    updateNote(selectedNoteIds[0], {
                                                        lane: internalLane
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">颜色</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateNote(selectedNoteIds[0], { color: 'blue' })}
                                                className={`flex-1 py-1 rounded border ${notes.find(n => n.id === selectedNoteIds[0])?.color === 'blue' ? 'border-white bg-blue-600' : 'border-transparent bg-blue-900'}`}
                                            >
                                                蓝
                                            </button>
                                            <button
                                                onClick={() => updateNote(selectedNoteIds[0], { color: 'pink' })}
                                                className={`flex-1 py-1 rounded border ${notes.find(n => n.id === selectedNoteIds[0])?.color === 'pink' ? 'border-white bg-pink-600' : 'border-transparent bg-pink-900'}`}
                                            >
                                                粉
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeNote(selectedNoteIds[0])}
                                        className="w-full py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold mt-4"
                                    >
                                        删除 Note
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
