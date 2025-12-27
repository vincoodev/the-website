/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL THRONE - God's Divine Seat
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Majestic throne design:
 * - Ornate backrest
 * - Golden accents
 * - Divine glow
 * - Floating option
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GoldMaterial from '../materials/GoldMaterial';
import MarbleMaterial from '../materials/MarbleMaterial';

export default function ProceduralThrone({
    position = [0, 0, 0],
    scale = 1,
    floating = false,
    floatHeight = 0.3,
    glowColor = '#ffd700',
    glowIntensity = 2
}) {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current && floating) {
            groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * floatHeight;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
            {/* Base platform */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[3, 0.3, 2]} />
                <MarbleMaterial
                    baseColor="#f5f5f5"
                    veinColor="#aaaaaa"
                    veinIntensity={0.6}
                />
            </mesh>

            {/* Seat */}
            <mesh position={[0, 0.8, 0.2]}>
                <boxGeometry args={[2, 0.3, 1.6]} />
                <meshStandardMaterial
                    color="#800020"
                    roughness={0.8}
                />
            </mesh>

            {/* Seat cushion gold trim */}
            <mesh position={[0, 0.85, 0.2]}>
                <boxGeometry args={[2.1, 0.1, 1.7]} />
                <GoldMaterial roughness={0.4} />
            </mesh>

            {/* Backrest */}
            <mesh position={[0, 2, -0.6]}>
                <boxGeometry args={[2, 2.5, 0.3]} />
                <MarbleMaterial
                    baseColor="#f0f0f0"
                    veinColor="#999999"
                    veinIntensity={0.5}
                />
            </mesh>

            {/* Backrest ornament (arch) */}
            <mesh position={[0, 3.5, -0.55]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.6, 0.1, 16, 32, Math.PI]} />
                <GoldMaterial />
            </mesh>

            {/* Left armrest */}
            <mesh position={[-1.2, 1.2, 0.2]}>
                <boxGeometry args={[0.3, 0.8, 1.4]} />
                <MarbleMaterial
                    baseColor="#e8e8e8"
                    veinColor="#aaaaaa"
                />
            </mesh>

            {/* Right armrest */}
            <mesh position={[1.2, 1.2, 0.2]}>
                <boxGeometry args={[0.3, 0.8, 1.4]} />
                <MarbleMaterial
                    baseColor="#e8e8e8"
                    veinColor="#aaaaaa"
                />
            </mesh>

            {/* Armrest lion heads (simplified spheres) */}
            <mesh position={[-1.2, 1.2, 0.9]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <GoldMaterial />
            </mesh>
            <mesh position={[1.2, 1.2, 0.9]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <GoldMaterial />
            </mesh>

            {/* Crown/top ornament */}
            <mesh position={[0, 4.0, -0.6]}>
                <octahedronGeometry args={[0.3, 0]} />
                <GoldMaterial />
            </mesh>

            {/* Left leg flourish */}
            <mesh position={[-1.3, 0.4, 0.8]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
                <GoldMaterial />
            </mesh>

            {/* Right leg flourish */}
            <mesh position={[1.3, 0.4, 0.8]} rotation={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
                <GoldMaterial />
            </mesh>

            {/* Divine glow behind throne */}
            <mesh position={[0, 2.5, -1]} rotation={[0, 0, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent={true}
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Lights */}
            <pointLight
                position={[0, 4, 0]}
                color={glowColor}
                intensity={glowIntensity}
                distance={8}
            />
            <spotLight
                position={[0, 6, 2]}
                target-position={[0, 1, 0]}
                color={glowColor}
                intensity={1}
                angle={0.4}
                penumbra={0.5}
            />
        </group>
    );
}

/* ─── ZEUS THRONE ─── */
export function ZeusThrone({ position = [0, 0, 0] }) {
    return (
        <ProceduralThrone
            position={position}
            scale={1.5}
            floating={true}
            floatHeight={0.2}
            glowColor="#ffd700"
            glowIntensity={3}
        />
    );
}

/* ─── HADES THRONE ─── */
export function HadesThrone({ position = [0, 0, 0] }) {
    return (
        <ProceduralThrone
            position={position}
            scale={1.3}
            floating={false}
            glowColor="#6633cc"
            glowIntensity={2}
        />
    );
}
