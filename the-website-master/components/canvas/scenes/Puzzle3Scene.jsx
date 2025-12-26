/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUZZLE 3 SCENE - PURE GATE FOCUS ($10k DESIGN)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CONCEPT:
 * - A clean, architectural view of the Olympus Gate.
 * - No distracting fog, columns, or debris.
 * - Perfect 3-point lighting studio setup.
 * - collision-free opening animation.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Store
import { useGameStore } from '../../../store/gameStore';

// Premium effects
import CustomBloom from '../effects/CustomBloom';
import Vignette3D from '../effects/Vignette3D';
import GodRays from '../effects/GodRays';

// Premium materials
import MarbleMaterial from '../materials/MarbleMaterial';
import GoldMaterial from '../materials/GoldMaterial';

// Premium geometry
import ProceduralDoor from '../geometry/ProceduralDoor';

// Environment
import { ColumnShadows } from '../environment/AmbientOcclusion';

/* ─── WALLS FRAMING THE GATE - TIGHT FIT ─── */
function TempleWalls() {
    return (
        <group position={[0, 0, 0]}>
            {/* Floor - Clean polished marble */}
            <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <MarbleMaterial baseColor="#15100a" veinColor="#2a2015" veinIntensity={0.3} />
            </mesh>

            {/* Back Wall (Set behind the door at z=-2) */}

            {/* Left Wall Panel - Moved closer to center (x=-8) */}
            <mesh position={[-14, 6, -2]}>
                <boxGeometry args={[12, 20, 2]} />
                <MarbleMaterial baseColor="#1a1815" veinColor="#3a3025" veinIntensity={0.6} />
            </mesh>

            {/* Right Wall Panel - Moved closer to center (x=8) */}
            <mesh position={[14, 6, -2]}>
                <boxGeometry args={[12, 20, 2]} />
                <MarbleMaterial baseColor="#1a1815" veinColor="#3a3025" veinIntensity={0.6} />
            </mesh>

            {/* Header / Architrave */}
            <mesh position={[0, 14, -2]}>
                <boxGeometry args={[40, 8, 2]} />
                <MarbleMaterial baseColor="#201a15" veinColor="#403525" veinIntensity={0.6} />
            </mesh>

            {/* Subtle Gold Trim on walls - Tight framing */}
            <mesh position={[-8, 6, -1.9]}>
                <boxGeometry args={[0.5, 20, 0.2]} />
                <GoldMaterial />
            </mesh>
            <mesh position={[8, 6, -1.9]}>
                <boxGeometry args={[0.5, 20, 0.2]} />
                <GoldMaterial />
            </mesh>
        </group>
    );
}

export default function Puzzle3Scene() {
    const isCompleted = useGameStore((state) => state.puzzles[3].completed);

    return (
        <>
            {/* Deep Twilight Background for Contrast */}
            <color attach="background" args={['#06070a']} />

            {/* Camera - Professional Architectural View (Telephoto) */}
            <PerspectiveCamera makeDefault position={[0, 2, 25]} fov={35} />

            {/* STUDIO LIGHTING SETUP */}
            {/* Key Light (Warm Gold) */}
            <spotLight
                position={[15, 15, 15]}
                intensity={2.5}
                angle={0.4}
                penumbra={1}
                color="#ffeebb"
                castShadow
            />
            {/* Fill Light (Cool Blue) */}
            <pointLight position={[-15, 5, 10]} intensity={1.2} color="#aaddff" distance={40} />
            {/* Back Light (Rim light for edges) */}
            <spotLight position={[0, 15, -10]} intensity={3} color="#ffd700" distance={30} />
            {/* Ambient Base */}
            <ambientLight intensity={1.2} color="#202025" />

            {/* CENTERPIECE: THE OLYMPUS GATE */}
            <group position={[0, -4, 0]}>
                <ProceduralDoor isOpen={isCompleted} />
            </group>

            {/* ARCHITECTURE */}
            <TempleWalls />

            {/* POST PROCESSING - Crisp and Elegant */}
            <CustomBloom
                intensity={0.5}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.8}
            />
            <Vignette3D darkness={0.4} />

            {/* Removed GodRays to prevent center obstruction */}
        </>
    );
}
