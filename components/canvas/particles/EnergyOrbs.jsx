/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENERGY ORBS - Floating Power Spheres
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Mystical energy orbs:
 * - Orbiting motion
 * - Pulsing glow
 * - Trail particles
 * - Divine power visualization
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── SINGLE ORB COMPONENT ─── */
function EnergyOrb({
    position = [0, 0, 0],
    color = '#ffd700',
    size = 0.3,
    orbitRadius = 2,
    orbitSpeed = 1,
    phase = 0,
    pulseSpeed = 2
}) {
    const groupRef = useRef();
    const meshRef = useRef();
    const glowRef = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        if (groupRef.current) {
            // Orbital motion
            groupRef.current.position.x = Math.cos(t * orbitSpeed + phase) * orbitRadius;
            groupRef.current.position.z = Math.sin(t * orbitSpeed + phase) * orbitRadius;
            groupRef.current.position.y = Math.sin(t * orbitSpeed * 0.5 + phase) * 0.5;
        }

        if (meshRef.current) {
            // Pulse scale
            const pulse = 1 + Math.sin(t * pulseSpeed + phase) * 0.2;
            meshRef.current.scale.setScalar(pulse);
        }

        if (glowRef.current) {
            // Glow intensity
            glowRef.current.material.opacity = 0.3 + Math.sin(t * pulseSpeed + phase) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Core orb */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                />
            </mesh>

            {/* Outer glow */}
            <mesh ref={glowRef} scale={[1.5, 1.5, 1.5]}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent={true}
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Point light */}
            <pointLight color={color} intensity={1} distance={3} />
        </group>
    );
}

/* ─── ENERGY ORBS SYSTEM ─── */
export default function EnergyOrbs({
    count = 5,
    center = [0, 0, 0],
    radius = 3,
    color = '#ffd700',
    orbSize = 0.2,
    speed = 0.5
}) {
    const orbs = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            phase: (i / count) * Math.PI * 2,
            orbitSpeed: speed * (0.8 + Math.random() * 0.4),
        }));
    }, [count, speed]);

    return (
        <group position={center}>
            {orbs.map((orb) => (
                <EnergyOrb
                    key={orb.id}
                    color={color}
                    size={orbSize}
                    orbitRadius={radius}
                    orbitSpeed={orb.orbitSpeed}
                    phase={orb.phase}
                    pulseSpeed={2 + Math.random()}
                />
            ))}
        </group>
    );
}

/* ─── DIVINE ORBS ─── */
export function DivineOrbs({ position = [0, 2, 0] }) {
    return (
        <EnergyOrbs
            count={7}
            center={position}
            radius={4}
            color="#ffd700"
            orbSize={0.25}
            speed={0.3}
        />
    );
}

/* ─── CHAOS ORBS ─── */
export function ChaosOrbs({ position = [0, 0, 0] }) {
    return (
        <EnergyOrbs
            count={5}
            center={position}
            radius={3}
            color="#ff0044"
            orbSize={0.2}
            speed={1.0}
        />
    );
}

/* ─── OMEGA HALO ORBS ─── */
export function OmegaHaloOrbs({ position = [0, 0, 0] }) {
    return (
        <>
            <EnergyOrbs
                count={8}
                center={position}
                radius={2}
                color="#ffd700"
                orbSize={0.15}
                speed={0.4}
            />
            <EnergyOrbs
                count={6}
                center={position}
                radius={3}
                color="#ffaa00"
                orbSize={0.1}
                speed={-0.3}
            />
        </>
    );
}
