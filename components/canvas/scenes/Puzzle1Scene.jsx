/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUZZLE 1 SCENE - THE DIGITAL CORE (ULTRA PREMIUM)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A dense, high-fidelity Cyberpunk Data Center.
 * - Cylindrical "Data Tunnel" enveloping the user.
 * - Floating "Server Racks" with holographic data.
 * - Volumetric "Code Fog".
 * - Infinite reflective floor.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Version: 2.1 (Debug - Cache Bust)
 */

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Stars, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

// Premium Materials & Effects
import CustomBloom from '../effects/CustomBloom';
import Vignette3D from '../effects/Vignette3D';
import FilmGrainOverlay, { Scanlines } from '../effects/FilmGrain3D';
import GlitchEffect from '../effects/GlitchEffect';
import ChromaticAberration from '../effects/ChromaticAberration';

import { TerminalHologramMaterial, DataHologramMaterial } from '../materials/HolographicMaterial';
import { MatrixRain } from '../particles/DataStream';

/* ─── DATA TUNNEL (Cylindrical Matrix Rain) ─── */
function DataTunnel({ radius = 15, count = 12 }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const rotation = [0, -angle, 0];

                return (
                    <group key={i} position={[x, 0, z]} rotation={rotation}>
                        <MatrixRain position={[0, 5, 0]} />
                    </group>
                );
            })}
        </group>
    );
}

/* ─── FLOATING SERVER RACKS (Instanced) ─── */
function ServerRacks({ count = 20 }) {
    const racks = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2; // Circle
            const radius = 8 + Math.random() * 5;
            return {
                position: [
                    Math.cos(angle) * radius,
                    Math.random() * 4 - 2,
                    Math.sin(angle) * radius
                ],
                rotation: [0, -angle - Math.PI / 2, 0],
                scale: [1 + Math.random(), 3 + Math.random(), 1],
                speed: Math.random() * 0.5 + 0.1
            };
        });
    }, [count]);

    return (
        <group>
            {racks.map((rack, i) => (
                <Float key={i} speed={rack.speed} rotationIntensity={0.2} floatIntensity={1}>
                    <mesh position={rack.position} rotation={rack.rotation}>
                        <boxGeometry args={[1, 4, 1]} />
                        <TerminalHologramMaterial
                            color={i % 2 === 0 ? "#00ff41" : "#003300"}
                            gridScale={10}
                            scanlineIntensity={0.8}
                        />
                    </mesh>
                    {/* Inner Core Light */}
                    <pointLight position={rack.position} intensity={0.5} distance={5} color="#00ff41" />
                </Float>
            ))}
        </group>
    );
}

/* ─── DATA CABLES (Curves) ─── */
function DataCables() {
    const cables = useMemo(() => {
        return Array.from({ length: 15 }, () => {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3((Math.random() - 0.5) * 10, -5, (Math.random() - 0.5) * 10),
                new THREE.Vector3((Math.random() - 0.5) * 15, 0, (Math.random() - 0.5) * 15),
                new THREE.Vector3((Math.random() - 0.5) * 20, 10, (Math.random() - 0.5) * 20),
            ]);
            return curve;
        });
    }, []);

    return (
        <group>
            {cables.map((curve, i) => (
                <mesh key={i}>
                    <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
                    <meshBasicMaterial color="#00ff41" transparent opacity={0.3} />
                </mesh>
            ))}
        </group>
    );
}

/* ─── DIGITAL FLOOR ─── */
function DigitalFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
            <planeGeometry args={[100, 100, 64, 64]} />
            <meshStandardMaterial
                color="#000500"
                roughness={0.1}
                metalness={0.9}
                emissive="#001100"
                wireframe={true} // Create grid effect via wireframe geometry if needed, or texture
            />
            {/* Grid Overlay */}
            <gridHelper args={[100, 100, '#00ff41', '#001100']} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} />
        </mesh>
    );
}

export default function Puzzle1Scene() {
    return (
        <>
            {/* DEBUG CUBE - IF YOU SEE THIS, 3D IS WORKING */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>

            <color attach="background" args={['#000500']} />
            <fog attach="fog" args={['#000500', 5, 30]} /> {/* Deep Dark Fog */}

            {/* 1. Main Data Tunnel (Background) */}
            <DataTunnel radius={12} count={16} />

            {/* 2. Floating Infrastructure */}
            <ServerRacks count={12} />

            {/* 3. Rising Data Cables */}
            <DataCables />

            {/* 4. Reflective Floor */}
            <DigitalFloor />

            {/* 5. Ambient Particles */}
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

            {/* Lighting */}
            <ambientLight intensity={0.2} color="#003300" />
            <spotLight position={[0, 10, 0]} intensity={2.0} color="#00ff41" angle={0.5} penumbra={1} />
            <pointLight position={[-10, 0, -10]} intensity={1} color="#00ff41" distance={20} />
            <pointLight position={[10, 0, -10]} intensity={1} color="#004400" distance={20} />

            {/* ═══ POST-PROCESSING (Ultra Premium) ═══ */}
            <CustomBloom
                intensity={1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
            />
            <ChromaticAberration offset={0.002} radialFalloff={true} />
            <Vignette3D darkness={0.6} />
            <FilmGrainOverlay opacity={0.12} speed={3} />
            <Scanlines intensity={0.15} speed={0.2} />
            <GlitchEffect active={true} intensity={0.15} mode="constant" />
        </>
    );
}
