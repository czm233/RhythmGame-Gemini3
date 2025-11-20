import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { Note } from './Note';
import { gameTimer } from '../utils/timer';
import { JUDGMENT_WINDOWS } from '../utils/judgment';
import { useInput } from '../hooks/useInput';

const LaneVisuals = () => {
    return (
        <group>
            {/* Lane dividers */}
            {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
                <mesh key={i} position={[x * 1.5, -0.1, -25]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.1, 60]} />
                    <meshBasicMaterial color="#333" />
                </mesh>
            ))}
            {/* Judgment Line */}
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[6, 0.2]} />
                <meshBasicMaterial color="#FFF" />
            </mesh>
        </group>
    );
};



const GameLogic = ({ onEnd }: { onEnd: () => void }) => {
    const { updateTime, notes, handleMiss, isPlaying, endGame } = useGameStore();
    useInput();

    useFrame(() => {
        if (!isPlaying) return;

        const time = gameTimer.getTime();
        updateTime(time);

        // Check for misses
        notes.forEach(note => {
            if (!note.hit && !note.missed && (time - note.time > JUDGMENT_WINDOWS.MISS)) {
                handleMiss(note.id);
            }
        });

        // Check for song end (simple check: if time > last note time + 2s)
        const lastNote = notes[notes.length - 1];
        if (lastNote && time > lastNote.time + 2000) {
            endGame();
            onEnd();
        }
    });

    return (
        <>
            {notes.map(note => (
                <Note key={note.id} note={note} />
            ))}
        </>
    );
};

export const GameScene = ({ onEnd }: { onEnd: () => void }) => {
    return (
        <div className="w-full h-full relative bg-black">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                {/* <video src="..." autoPlay loop muted className="w-full h-full object-cover" /> */}
            </div>

            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 6]} rotation={[-0.1, 0, 0]} fov={60} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <LaneVisuals />
                <GameLogic onEnd={onEnd} />

                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    );
};
