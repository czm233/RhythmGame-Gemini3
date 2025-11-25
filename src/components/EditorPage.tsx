import { useEffect, useRef, useState } from 'react';
import type { Note } from '../types/game';

import { useEditorStore } from '../store/editorStore';
import { playHitSound, initAudio } from '../utils/audio';

interface EditorPageProps {
    onBack: () => void;
}

export const EditorPage = ({ onBack }: EditorPageProps) => {
    const {
        currentTime, isPlaying, snapDivisor, zoomLevel, notes, selectedNoteIds, selectedToolColor, audioUrl, audioFileName,         hitSoundVolume, hitSoundType,
        loopStart, loopEnd,
        togglePlay, setTime, setSnap, setZoom, addNote, removeNote, selectNote, updateNote, updateNotes,
        setToolColor, setAudioUrl, setAudioFileName, setHitSoundVolume, setHitSoundType, setSelectedNotes,
        setLoopStart, setLoopEnd,
        copySelection, pasteNotes, mirrorSelection, randomizeSelection, deleteSelection,
        undo, redo
    } = useEditorStore();

    // Dragging state
    // Modified to support multi-note dragging
    const dragRef = useRef<{
        startX: number,
        startY: number,
        notes: { id: string, startTime: number, startLane: number }[]
    } | null>(null);

    // Audio refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Selection state
    // We use ref for logic to avoid stale closures in event listeners
    const selectionRef = useRef<{ startX: number, startY: number, currentX: number, currentY: number, isSelecting: boolean } | null>(null);
    // We use state for rendering the visual box
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

    // Handle mouse move (Global)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // 1. Handle Note Dragging
            if (dragRef.current) {
                const { startY, startX, notes: draggingNotes } = dragRef.current;
                const deltaY = startY - e.clientY; // Drag up = positive time
                const deltaX = e.clientX - startX;

                // Calculate time delta
                const timeDelta = (deltaY / zoomLevel) * 1000;

                // Calculate lane delta
                const laneWidth = 100; // Approx
                const laneDelta = Math.round(deltaX / laneWidth);

                const updates: { id: string, changes: Partial<Note> }[] = [];

                draggingNotes.forEach(note => {
                    let newTime = note.startTime + timeDelta;

                    // Snap time
                    if (snapDivisor > 0 && !e.shiftKey) {
                        const beatTime = 60000 / 120;
                        const snapInterval = beatTime * (4 / snapDivisor);
                        newTime = Math.round(newTime / snapInterval) * snapInterval;
                    }
                    newTime = Math.max(0, newTime);

                    let newLane = note.startLane + laneDelta;
                    // Individual clamping as requested:
                    // "touched note placed at first track, untouched ones normal"
                    // This implies we clamp each note individually to [0, 3]
                    newLane = Math.max(0, Math.min(3, newLane));

                    updates.push({
                        id: note.id,
                        changes: {
                            time: newTime,
                            lane: newLane
                        }
                    });
                });

                updateNotes(updates);
                return;
            }

            // 2. Handle Box Selection
            if (selectionRef.current && selectionRef.current.isSelecting) {
                // Update ref
                selectionRef.current.currentX = e.clientX;
                selectionRef.current.currentY = e.clientY;

                // Update state for rendering
                setSelectionBox({
                    startX: selectionRef.current.startX,
                    startY: selectionRef.current.startY,
                    currentX: e.clientX,
                    currentY: e.clientY
                });

                // Real-time selection update
                updateSelection(selectionRef.current);
            }
        };

        const updateSelection = (box: { startX: number, startY: number, currentX: number, currentY: number }) => {
            const trackContainer = document.querySelector('.track-area');
            if (!trackContainer) return;

            const trackRect = trackContainer.getBoundingClientRect();

            // Convert Box to Game Coordinates
            const boxTop = Math.min(box.startY, box.currentY);
            const boxBottom = Math.max(box.startY, box.currentY);
            const boxLeft = Math.min(box.startX, box.currentX);
            const boxRight = Math.max(box.startX, box.currentX);

            // Y to Time
            // Track Bottom (Time 0) is at trackRect.bottom (since height is 0, top=bottom)
            // But wait, trackRect.bottom is screen Y.
            // Time = (Distance from Bottom / Zoom) * 1000
            // Distance from Bottom = trackRect.bottom - y
            const maxTime = ((trackRect.bottom - boxTop) / zoomLevel) * 1000;
            const minTime = ((trackRect.bottom - boxBottom) / zoomLevel) * 1000;

            // X to Lane
            // Lane 0 starts at trackRect.left
            // Lane Width = trackRect.width / 4
            const laneWidth = trackRect.width / 4;
            const minLane = Math.floor((boxLeft - trackRect.left) / laneWidth);
            const maxLane = Math.floor((boxRight - trackRect.left) / laneWidth);

            const newSelectedIds: string[] = [];

            notes.forEach(note => {
                // Check intersection
                // For time: simple range check
                // For lane: simple range check
                // We add a small buffer for easier selection
                const isTimeIn = note.time >= minTime && note.time <= maxTime;
                const isLaneIn = note.lane >= minLane && note.lane <= maxLane;

                if (isTimeIn && isLaneIn) {
                    newSelectedIds.push(note.id);
                }
            });

            setSelectedNotes(newSelectedIds);
        };

        const handleMouseUp = (e: MouseEvent) => {
            dragRef.current = null;

            if (selectionRef.current && selectionRef.current.isSelecting) {
                const dist = Math.hypot(e.clientX - selectionRef.current.startX, e.clientY - selectionRef.current.startY);

                if (dist < 5) {
                    // Click: Add Note
                    // We need to calculate the position based on e.clientX/Y
                    const trackContainer = document.querySelector('.track-area');
                    if (trackContainer) {
                        const rect = trackContainer.getBoundingClientRect();
                        const yFromBottom = rect.bottom - e.clientY;
                        const laneWidth = rect.width / 4;
                        const x = e.clientX - rect.left;
                        const lane = Math.floor(x / laneWidth);
                        const rawTime = (yFromBottom / zoomLevel) * 1000;

                        const beatTime = 60000 / 120;
                        let snappedTime = rawTime;

                        if (snapDivisor > 0 && !e.shiftKey) {
                            const snapInterval = beatTime * (4 / snapDivisor);
                            snappedTime = Math.round(rawTime / snapInterval) * snapInterval;
                        }

                        if (snappedTime >= 0 && lane >= 0 && lane <= 3) {
                            addNote(lane, snappedTime);
                        }
                    }
                } else {
                    // Drag: Selection Finished
                    // Already handled in mousemove
                }

                selectionRef.current = null;
                setSelectionBox(null);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [zoomLevel, snapDivisor, updateNote, notes, setSelectedNotes, addNote, updateNotes]);

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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Space: Play/Pause
            if (e.code === 'Space') {
                e.preventDefault();
                if (audioUrl) {
                    togglePlay();
                }
                return;
            }

            // Undo: Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            // Redo: Ctrl+Shift+Z or Ctrl+Y
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') || 
                ((e.ctrlKey || e.metaKey) && e.code === 'KeyY')) {
                e.preventDefault();
                redo();
                return;
            }

            // Copy: Ctrl+C
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
                e.preventDefault();
                copySelection();
                return;
            }

            // Paste: Ctrl+V
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {
                e.preventDefault();
                pasteNotes(currentTime);
                return;
            }

            // Mirror: Ctrl+M
            if ((e.ctrlKey || e.metaKey) && e.code === 'KeyM') {
                e.preventDefault();
                mirrorSelection();
                return;
            }

            // Delete: Delete or Backspace
            if (e.code === 'Delete' || e.code === 'Backspace') {
                e.preventDefault();
                deleteSelection();
                return;
            }

            // Tools: 1 (Blue), 2 (Pink)
            if (e.key === '1') {
                setToolColor('blue');
            }
            if (e.key === '2') {
                setToolColor('pink');
            }

            // Loop Controls: I (In), O (Out), P (Clear)
            if (e.key.toLowerCase() === 'i') {
                e.preventDefault();
                // Snap currentTime
                let time = currentTime;
                if (snapDivisor > 0) {
                    const beatTime = 60000 / 120;
                    const snapInterval = beatTime * (4 / snapDivisor);
                    time = Math.round(time / snapInterval) * snapInterval;
                }
                setLoopStart(time);
            }
            if (e.key.toLowerCase() === 'o') {
                e.preventDefault();
                // Snap currentTime
                let time = currentTime;
                if (snapDivisor > 0) {
                    const beatTime = 60000 / 120;
                    const snapInterval = beatTime * (4 / snapDivisor);
                    time = Math.round(time / snapInterval) * snapInterval;
                }
                setLoopEnd(time);
            }
            if (e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setLoopStart(null);
                setLoopEnd(null);
            }

            // Quick Note Place: Q, W, E, R (Lanes 1-4)
            const keyToLane: Record<string, number> = { 'q': 0, 'w': 1, 'e': 2, 'r': 3 };
            if (keyToLane.hasOwnProperty(e.key.toLowerCase())) {
                e.preventDefault();
                const lane = keyToLane[e.key.toLowerCase()];
                let time = currentTime;

                // Apply snap
                if (snapDivisor > 0) {
                    const beatTime = 60000 / 120;
                    const snapInterval = beatTime * (4 / snapDivisor);
                    time = Math.round(time / snapInterval) * snapInterval;
                }

                addNote(lane, time);
            }

            // Scrolling: Arrow Up/Down
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                // Move forward in time (Up the chart)
                const delta = 100;
                const timeDelta = delta * (1000 / zoomLevel);
                const newTime = Math.max(0, currentTime + timeDelta);
                setTime(newTime);

                // If playing, also seek the audio immediately
                if (isPlaying && audioRef.current) {
                    audioRef.current.currentTime = newTime / 1000;
                }
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                // Move backward in time (Down the chart)
                const delta = -100;
                const timeDelta = delta * (1000 / zoomLevel);
                const newTime = Math.max(0, currentTime + timeDelta);
                setTime(newTime);

                // If playing, also seek the audio immediately
                if (isPlaying && audioRef.current) {
                    audioRef.current.currentTime = newTime / 1000;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [audioUrl, togglePlay, currentTime, copySelection, pasteNotes, mirrorSelection, deleteSelection, setToolColor, zoomLevel, setTime]);

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

                // Check for Loop wrapping
                if (loopStart !== null && loopEnd !== null && loopEnd > loopStart) {
                    if (newTime >= loopEnd) {
                        newTime = loopStart;
                        if (audioRef.current) {
                            audioRef.current.currentTime = loopStart / 1000;
                        }
                        // Force update local variable to avoid large delta check failure on loop
                        // But wait, if we loop, delta WILL be large (end -> start).
                        // We should handle loop sound checking separately or reset context.
                    }
                }

                // 1. Calculate accurate delta
                // Note: currentTime is from the closure (React state at effect start), 
                // newTime is from Audio/Performance.
                const timeDelta = Math.abs(newTime - currentTime);

                // 2. Only Play Hits if time diff is consistent with a single frame (e.g. < 50ms)
                // This effectively filters out:
                // - Seeking / Scrolling (large jumps)
                // - Initial play start (potential jump)
                // - Loop jumps (handled separately if needed, but usually we don't want a hit ON the loop jump instantly)
                
                if (timeDelta > 0 && timeDelta < 50) {
                    notes.forEach((note: Note) => {
                        // Strict range check
                        if (note.time > currentTime && note.time <= newTime) {
                            playHitSound('PERFECT', hitSoundVolume, hitSoundType);
                        }
                    });
                }

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
    }, [isPlaying, currentTime, setTime, notes, togglePlay, playHitSound, hitSoundVolume, hitSoundType]);

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden select-none">
            {/* Top Bar */}
            <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between z-50 relative">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white">
                        ← 返回
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlay}
                            disabled={!audioUrl}
                            className={`px-4 py-1 rounded ${!audioUrl ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : isPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}
                        >
                            {isPlaying ? '暂停 (Space)' : '播放 (Space)'}
                        </button>
                        <div className="text-xl font-mono w-24 text-center">
                            {(currentTime / 1000).toFixed(3)}s
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-mono text-gray-300">
                    {audioFileName || "No Audio Loaded"}
                </div>

                <div className="flex items-center gap-4">
                    <audio ref={audioRef} src={audioUrl} />
                    <input
                        type="file"
                        accept="audio/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setAudioUrl(url);
                                setAudioFileName(file.name);
                                initAudio(); // Init context on user interaction
                            }
                        }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    >
                        打开音频
                    </button>
                    <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                        导出谱面
                    </button>
                </div>
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

                    {/* Hit Sound Settings */}
                    <div className="space-y-4 border-t border-gray-700 pt-4">
                        <h3 className="text-gray-400 font-bold">音效设置</h3>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 block">音量 (Volume): {(hitSoundVolume * 100).toFixed(0)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={hitSoundVolume}
                                onChange={(e) => {
                                    const vol = Number(e.target.value);
                                    setHitSoundVolume(vol);
                                    // Preview sound
                                    playHitSound('PERFECT', vol, hitSoundType);
                                }}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 block">音效类型 (Type)</label>
                            <select
                                value={hitSoundType}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    setHitSoundType(type);
                                    playHitSound('PERFECT', hitSoundVolume, type);
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                            >
                                <option value="default">默认 (Default)</option>
                                <option value="kick">底鼓 (Kick)</option>
                                <option value="snare">军鼓 (Snare)</option>
                                <option value="tick">节拍 (Tick)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Center: Timeline & Tracks */}
                <div className="flex-1 bg-gray-950 relative overflow-hidden cursor-crosshair flex flex-col">
                    {/* Toolbar - Placed above the track area as requested */}
                    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 z-50">
                        {/* Color Tools */}
                        <div className="flex bg-gray-900 rounded p-1 gap-1">
                            <button
                                onClick={() => setToolColor('blue')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedToolColor === 'blue' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Blue Note [1]"
                            >
                                Blue
                            </button>
                            <button
                                onClick={() => setToolColor('pink')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedToolColor === 'pink' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Pink Note [2]"
                            >
                                Pink
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-700 mx-2" />

                        {/* Loop Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    let time = currentTime;
                                    if (snapDivisor > 0) {
                                        const beatTime = 60000 / 120;
                                        const snapInterval = beatTime * (4 / snapDivisor);
                                        time = Math.round(time / snapInterval) * snapInterval;
                                    }
                                    setLoopStart(time);
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-2 ${loopStart !== null ? 'bg-green-600/50 text-white border border-green-500' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                title="Set Loop Start [I]"
                            >
                                <span>In</span>
                            </button>
                            <button
                                onClick={() => {
                                    let time = currentTime;
                                    if (snapDivisor > 0) {
                                        const beatTime = 60000 / 120;
                                        const snapInterval = beatTime * (4 / snapDivisor);
                                        time = Math.round(time / snapInterval) * snapInterval;
                                    }
                                    setLoopEnd(time);
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-2 ${loopEnd !== null ? 'bg-green-600/50 text-white border border-green-500' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                title="Set Loop End [O]"
                            >
                                <span>Out</span>
                            </button>
                            {(loopStart !== null || loopEnd !== null) && (
                                <button
                                    onClick={() => {
                                        setLoopStart(null);
                                        setLoopEnd(null);
                                    }}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-400 hover:text-white"
                                    title="Clear Loop [P]"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-700 mx-2" />

                        {/* History Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={undo}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Undo [Ctrl+Z]"
                            >
                                <span>撤销</span>
                            </button>
                            <button
                                onClick={redo}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Redo [Ctrl+Y]"
                            >
                                <span>重做</span>
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-700 mx-2" />

                        {/* Edit Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={copySelection}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Copy [Ctrl+C]"
                            >
                                <span>复制</span>
                            </button>
                            <button
                                onClick={() => pasteNotes(currentTime)}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Paste [Ctrl+V]"
                            >
                                <span>粘贴</span>
                            </button>
                            <button
                                onClick={mirrorSelection}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Mirror [Ctrl+M]"
                            >
                                <span>镜像</span>
                            </button>
                            <button
                                onClick={randomizeSelection}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-200 flex items-center gap-2"
                                title="Randomize Lanes"
                            >
                                <span>随机</span>
                            </button>
                            <button
                                onClick={deleteSelection}
                                className="px-3 py-1 bg-red-900/50 hover:bg-red-900/80 text-red-200 rounded text-xs flex items-center gap-2"
                                title="Delete [Del]"
                            >
                                <span>删除</span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="flex-1 relative overflow-hidden"
                        onWheel={(e) => {
                            // Scroll to change time
                            const delta = e.deltaY;
                            // Zoom factor affects scroll speed?
                            const timeDelta = delta * (1000 / zoomLevel);
                            const newTime = Math.max(0, currentTime + timeDelta);
                            setTime(newTime);

                            // If playing, also seek the audio immediately
                            if (isPlaying && audioRef.current) {
                                audioRef.current.currentTime = newTime / 1000;
                            }
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
                                className="track-area w-[400px] absolute bottom-[20%] border-x border-gray-800 bg-black/20"
                                style={{
                                    height: '0px', // Allow overflow
                                    transform: `translateY(${currentTime / 1000 * zoomLevel}px)`,
                                    transition: isPlaying ? 'none' : 'transform 0.1s ease-out'
                                }}
                                onMouseDown={(e) => {
                                    // Start selection if not clicking on a note (notes stop propagation)
                                    if (e.button === 0) { // Left click
                                        const startPoint = {
                                            startX: e.clientX,
                                            startY: e.clientY,
                                            currentX: e.clientX,
                                            currentY: e.clientY,
                                            isSelecting: true
                                        };
                                        selectionRef.current = startPoint;
                                        setSelectionBox(startPoint);
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
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

                                {/* Loop Region Visualization */}
                                {loopStart !== null && loopEnd !== null && (
                                    <div
                                        className="absolute left-0 right-0 bg-green-500/20 border-y border-green-500/50 z-10 pointer-events-none"
                                        style={{
                                            bottom: `${loopStart / 1000 * zoomLevel}px`,
                                            height: `${(loopEnd - loopStart) / 1000 * zoomLevel}px`
                                        }}
                                    >
                                        <div className="absolute bottom-0 left-0 bg-green-600 text-white text-[10px] px-1">A</div>
                                        <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1">B</div>
                                    </div>
                                )}

                                {/* Notes */}
                                {notes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`absolute w-[23%] h-4 rounded-sm border transition-colors cursor-pointer z-30
                                            ${note.lane === 0 ? 'left-[1%]' : note.lane === 1 ? 'left-[26%]' : note.lane === 2 ? 'left-[51%]' : 'left-[76%]'}
                                            ${selectedNoteIds.includes(note.id) ? 'border-white border-2 shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-opacity-100' : 'border-transparent bg-opacity-80'}
                                            ${note.color === 'pink' ? 'bg-pink-500' : 'bg-blue-500'}
                                        `}
                                        style={{
                                            bottom: `${note.time / 1000 * zoomLevel}px`, // Position from bottom
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent native drag/selection
                                            e.stopPropagation();

                                            // Right click to delete
                                            if (e.button === 2) {
                                                removeNote(note.id);
                                                return;
                                            }

                                            console.log('Start drag', note.id);

                                            // Logic for multi-select drag:
                                            // If clicking on an already selected note, drag all selected notes.
                                            // If clicking on an unselected note, select ONLY that note (unless Shift), then drag.

                                            let newSelectedIds = selectedNoteIds;
                                            if (!selectedNoteIds.includes(note.id)) {
                                                if (e.shiftKey) {
                                                    selectNote(note.id, true); // Add to selection
                                                    newSelectedIds = [...selectedNoteIds, note.id];
                                                } else {
                                                    setSelectedNotes([note.id]); // Replace selection
                                                    newSelectedIds = [note.id];
                                                }
                                            }

                                            // Prepare drag state for ALL selected notes
                                            const draggingNotes = notes.filter(n => newSelectedIds.includes(n.id)).map(n => ({
                                                id: n.id,
                                                startTime: n.time,
                                                startLane: n.lane
                                            }));

                                            dragRef.current = {
                                                startX: e.clientX,
                                                startY: e.clientY,
                                                notes: draggingNotes
                                            };
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    />
                                ))}

                                {/* Click Area for Adding Notes */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 z-10"
                                    style={{ height: '100000px', top: 'auto' }} // Extend upwards
                                />
                            </div>

                            {/* Selection Box Rendering */}
                            {selectionBox && (
                                <div
                                    className="fixed border border-blue-500 bg-blue-500/20 pointer-events-none z-50"
                                    style={{
                                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                        height: Math.abs(selectionBox.currentY - selectionBox.startY)
                                    }}
                                />
                            )}
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
