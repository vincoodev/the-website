/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL ALTAR - Sacred Altar with Runes
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Divine altar element:
 * - Stone base
 * - Glowing runes
 * - Offering bowl
 * - Fire option
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import MarbleMaterial from '../materials/MarbleMaterial';

/* ─── GLOWING RUNE ─── */
function GlowingRune({ position, rotation, color = '#ffd700', size = 0.3 }) {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        if (meshRef.current) {
            // Pulse glow
            const pulse = Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.3 + 0.7;
            meshRef.current.material.emissiveIntensity = pulse;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={rotation}>
            <ringGeometry args={[size * 0.5, size, 6]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default function ProceduralAltar({
    position = [0, 0, 0],
    scale = 1,
    glowColor = '#ffd700',
    withFire = false,
    runeCount = 6
}) {
    const groupRef = useRef();

    const runes = useMemo(() => {
        return Array.from({ length: runeCount }, (_, i) => {
            const angle = (i / runeCount) * Math.PI * 2;
            const radius = 1.2;
            return {
                id: i,
                position: [Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius],
                rotation: [0, -angle + Math.PI / 2, 0],
            };
        });
    }, [runeCount]);

    return (
        <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
            {/* Base platform */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[1.5, 1.8, 0.3, 8]} />
                <MarbleMaterial
                    baseColor="#3a3530"
                    veinColor="#2a2520"
                    veinIntensity={0.8}
                />
            </mesh>

            {/* Main altar block */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <MarbleMaterial
                    baseColor="#4a4540"
                    veinColor="#3a3530"
                    veinIntensity={0.6}
                />
            </mesh>

            {/* Top surface */}
            <mesh position={[0, 1.05, 0]}>
                <boxGeometry args={[1.4, 0.1, 1.4]} />
                <meshStandardMaterial
                    color="#d4af37"
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>

            {/* Offering bowl */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial
                    color="#d4af37"
                    metalness={0.9}
                    roughness={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Glowing runes around base */}
            {runes.map((rune) => (
                <GlowingRune
                    key={rune.id}
                    position={rune.position}
                    rotation={rune.rotation}
                    color={glowColor}
                    size={0.25}
                />
            ))}

            {/* Center glow */}
            <pointLight
                position={[0, 1.5, 0]}
                color={glowColor}
                intensity={2}
                distance={5}
            />

            {/* Ambient candles at corners */}
            {[[-0.5, 0, -0.5], [0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5]].map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
                        <meshStandardMaterial color="#d4af37" />
                    </mesh>
                    <pointLight
                        position={[0, 1.35, 0]}
                        color="#ff6600"
                        intensity={0.3}
                        distance={2}
                    />
                </group>
            ))}
        </group>
    );
}

/* ─── DIVINE ALTAR ─── */
export function DivineAltar({ position = [0, 0, 0] }) {
    return (
        <ProceduralAltar
            position={position}
            scale={1.2}
            glowColor="#ffd700"
            runeCount={8}
        />
    );
}

/* ─── CHAOS ALTAR ─── */
export function ChaosAltar({ position = [0, 0, 0] }) {
    return (
        <ProceduralAltar
            position={position}
            scale={1.0}
            glowColor="#ff0044"
            runeCount={6}
        />
    );
}
