/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUZZLE 1 SCENE - THE OBSIDIAN HALL (V3 ELEGANTE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A clean, symmetrical, and ultra-premium server hall.
 * - Architecture: Two majestic rows of "Obsidian Servers" leading to infinity.
 * - Atmosphere: Calm, deep green/black void with subtle volumetric fog.
 * - Lighting: Cinematic rim lighting (No chaos).
 * - Floor: Perfect mirror reflection.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Premium Materials & Effects (Selected for Elegance)
import CustomBloom from '../effects/CustomBloom';
import Vignette3D from '../effects/Vignette3D';
import FilmGrainOverlay from '../effects/FilmGrain3D';

import { TerminalHologramMaterial } from '../materials/HolographicMaterial';

/* ─── MAJESTIC SERVER PILLARS (Symmetrical) ─── */
function MajesticServers() {
    const servers = useMemo(() => {
        const items = [];
        // Create 2 rows of 6 pillars (Left and Right)
        for (let i = 0; i < 6; i++) {
            const z = -5 - (i * 8); // Spread deep into screen

            // Left Pillar
            items.push({ pos: [-8, 2, z], rot: [0, 0.2, 0] });
            // Right Pillar
            items.push({ pos: [8, 2, z], rot: [0, -0.2, 0] });
        }
        return items;
    }, []);

    return (
        <group>
            {servers.map((data, i) => (
                <Float key={i} speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
                    <group position={data.pos} rotation={data.rot}>
                        {/* The Server Block */}
                        <mesh receiveShadow castShadow>
                            <boxGeometry args={[3, 8, 3]} />
                            <meshStandardMaterial
                                color="#051105"
                                roughness={0.1}
                                metalness={0.9}
                                envMapIntensity={1}
                            />
                        </mesh>

                        {/* Holographic Face */}
                        <mesh position={[0, 0, 1.51]}>
                            <planeGeometry args={[2.8, 7.8]} />
                            <TerminalHologramMaterial
                                color="#00ff41"
                                scanlineIntensity={0.3} // Subtle
                                gridScale={20}
                                flickerSpeed={0.5} // Slow, calm pulse
                            />
                        </mesh>

                        {/* Edge Light */}
                        <pointLight position={[0, 0, 3]} intensity={0.5} color="#00ff41" distance={5} />
                    </group>
                </Float>
            ))}
        </group>
    );
}

/* ─── OBSIDIAN FLOOR (High Gloss) ─── */
function ObsidianFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
                color="#000000"
                roughness={0.0}
                metalness={0.95}
                envMapIntensity={1.5}
            />
            {/* Subtle Grid Reflection */}
            <gridHelper args={[100, 20, '#113311', '#000000']} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
        </mesh>
    );
}

export default function Puzzle1Scene() {
    return (
        <>
            {/* 1. Deep Void Background (Clean gradient) */}
            <color attach="background" args={['#000301']} />
            <fog attach="fog" args={['#000301', 10, 40]} />

            {/* 2. Symmetrical Architecture */}
            <MajesticServers />

            {/* 3. The Mirror Floor */}
            <ObsidianFloor />

            {/* 4. Subtle Distant Stars (Static Elegance) */}
            <Stars radius={60} depth={20} count={1000} factor={3} saturation={0} fade speed={0.2} />

            {/* 5. Cinematic Lighting (Focused, Dramatic) */}
            <ambientLight intensity={0.2} color="#002200" />

            {/* Key Light (Center) */}
            <spotLight
                position={[0, 15, 5]}
                intensity={1.5}
                color="#ffffff"
                angle={0.6}
                penumbra={0.5}
                castShadow
            />

            {/* Rim Lights (Blue/Green Contrast) */}
            <pointLight position={[-15, 5, -10]} intensity={2} color="#00ff41" distance={30} />
            <pointLight position={[15, 5, -10]} intensity={1} color="#0044ff" distance={30} />

            {/* ═══ ELEGANT POST-PROCESSING ═══ */}
            <CustomBloom
                intensity={1.0} // Reduced bloom for sharpness
                luminanceThreshold={0.4}
                luminanceSmoothing={0.7}
            />
            <Vignette3D darkness={0.5} />
            <FilmGrainOverlay opacity={0.05} speed={1} /> {/* Very subtle grain */}
            {/* No Glitch, No Chromatic Aberration, No Scanlines -> Clean Look */}
        </>
    );
}
