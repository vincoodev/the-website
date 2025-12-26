/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL STATUE - Greek God Bust
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Parametric Greek sculpture:
 * - Abstract bust form
 * - Marble material
 * - Dramatic lighting
 * - Floating pedestal
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MarbleMaterial from '../materials/MarbleMaterial';

/* ─── ABSTRACT BUST COMPONENT ─── */
export default function ProceduralStatue({
    position = [0, 0, 0],
    scale = 1,
    floating = false,
    floatSpeed = 1,
    floatAmount = 0.3,
    rotation = [0, 0, 0]
}) {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current && floating) {
            groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * floatSpeed) * floatAmount;
            groupRef.current.rotation.y = rotation[1] + Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
            {/* Pedestal */}
            <mesh position={[0, -1.5, 0]}>
                <cylinderGeometry args={[0.8, 1, 0.5, 8]} />
                <MarbleMaterial
                    baseColor="#e8e8e8"
                    veinColor="#888888"
                    veinIntensity={0.5}
                />
            </mesh>

            {/* Torso */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.7, 0.9, 2, 16]} />
                <MarbleMaterial
                    baseColor="#f8f8f8"
                    veinColor="#aaaaaa"
                    veinIntensity={0.6}
                />
            </mesh>

            {/* Shoulders */}
            <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.35, 1.5, 8, 16]} />
                <MarbleMaterial
                    baseColor="#f5f5f5"
                    veinColor="#999999"
                    veinIntensity={0.5}
                />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.25, 0.35, 0.6, 16]} />
                <MarbleMaterial
                    baseColor="#f8f8f8"
                    veinColor="#aaaaaa"
                    veinIntensity={0.4}
                />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.2, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <MarbleMaterial
                    baseColor="#ffffff"
                    veinColor="#bbbbbb"
                    veinIntensity={0.3}
                />
            </mesh>

            {/* Hair/Crown hint */}
            <mesh position={[0, 2.5, 0]} rotation={[0.2, 0, 0]}>
                <torusGeometry args={[0.35, 0.1, 8, 16]} />
                <MarbleMaterial
                    baseColor="#f0f0f0"
                    veinColor="#aaaaaa"
                    veinIntensity={0.7}
                />
            </mesh>
        </group>
    );
}

/* ─── ZEUS STATUE ─── */
export function ZeusStatue({ position = [0, 0, 0], scale = 1.2 }) {
    return (
        <ProceduralStatue
            position={position}
            scale={scale}
            floating={true}
            floatSpeed={0.5}
            floatAmount={0.2}
        />
    );
}

/* ─── ATHENA STATUE ─── */
export function AthenaStatue({ position = [0, 0, 0], scale = 1.0 }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            <ProceduralStatue floating={false} />

            {/* Helmet crest */}
            <mesh position={[0, 3.0, -0.2]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.1, 0.5, 0.8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    );
}

/* ─── BROKEN STATUE ─── */
export function BrokenStatue({ position = [0, 0, 0], scale = 1.0 }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Broken torso */}
            <mesh position={[0, 0, 0]} rotation={[0.1, 0.2, 0.1]}>
                <cylinderGeometry args={[0.7, 0.9, 1.5, 16, 1, true]} />
                <MarbleMaterial
                    baseColor="#e0e0e0"
                    veinColor="#888888"
                    veinIntensity={0.8}
                />
            </mesh>

            {/* Debris */}
            {[...Array(5)].map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 2,
                        -1 + Math.random() * 0.5,
                        (Math.random() - 0.5) * 2
                    ]}
                    rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
                >
                    <boxGeometry args={[0.2 + Math.random() * 0.3, 0.2 + Math.random() * 0.3, 0.2 + Math.random() * 0.3]} />
                    <MarbleMaterial
                        baseColor="#d0d0d0"
                        veinColor="#999999"
                        veinIntensity={0.6}
                    />
                </mesh>
            ))}
        </group>
    );
}
