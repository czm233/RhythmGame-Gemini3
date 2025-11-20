import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Note as NoteType } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { Mesh } from 'three';

interface NoteProps {
    note: NoteType;
}

const LANE_WIDTH = 1.5;
const SPAWN_Z = -50;
const JUDGMENT_Z = 0;

export const Note: React.FC<NoteProps> = ({ note }) => {
    const meshRef = useRef<Mesh>(null);
    const { currentTime, speed } = useGameStore();

    // Calculate X position based on lane (centered around 0)
    // Lanes: 0, 1, 2, 3 -> -2.25, -0.75, 0.75, 2.25
    const xPos = (note.lane - 1.5) * LANE_WIDTH;

    useFrame(() => {
        if (!meshRef.current) return;

        // Calculate Z position
        // Distance to travel = JUDGMENT_Z - SPAWN_Z = 50
        // We want the note to be at JUDGMENT_Z when currentTime == note.time
        // So, Z = JUDGMENT_Z + (currentTime - note.time) * speedFactor
        // But wait, speed is 1-10.
        // Let's define a base speed.
        // If speed is higher, the note should appear later? No, speed means how fast it moves.
        // Distance = Speed * Time
        // Z = SPAWN_Z + (Distance traveled)
        // We want Z = JUDGMENT_Z at t = note.time
        // At t = note.time - lookahead, Z = SPAWN_Z

        // Let's simplify:
        // Z = JUDGMENT_Z - (note.time - currentTime) * (speed * 0.01)
        // If note.time > currentTime (future), Z is negative (far away).
        // If note.time == currentTime, Z is JUDGMENT_Z.

        const speedFactor = speed * 0.005; // Adjust this constant to feel right
        const zPos = JUDGMENT_Z - (note.time - currentTime) * speedFactor;

        meshRef.current.position.set(xPos, 0, zPos);

        // Visibility check
        meshRef.current.visible = zPos > SPAWN_Z && zPos < 10;
    });

    if (note.hit || note.missed) return null;

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial
                color={note.color === 'blue' ? '#60A5FA' : '#F472B6'}
                emissive={note.color === 'blue' ? '#2563EB' : '#DB2777'}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};
