import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { Note } from './Note';
import { gameTimer } from '../utils/timer';

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

import { useInput } from '../hooks/useInput';

const GameLogic = () => {
    const { updateTime, notes } = useGameStore();
    useInput();

    useFrame(() => {
        updateTime(gameTimer.getTime());
    });

    return (
        <>
            {notes.map(note => (
                <Note key={note.id} note={note} />
            ))}
        </>
    );
};

export const GameScene = () => {
    return (
        <div className="w-full h-full relative bg-black">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                {/* <video src="..." autoPlay loop muted className="w-full h-full object-cover" /> */}
            </div>

            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 3, 5]} rotation={[-0.4, 0, 0]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <LaneVisuals />
                <GameLogic />

                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    );
};
