/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PORTAL PARTICLES - Scene Transition Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Dimensional portal visualization:
 * - Ring formation
 * - Swirling motion
 * - Energy emission
 * - Warp effect
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PortalParticles({
    count = 300,
    position = [0, 0, 0],
    color = '#00aaff',
    innerColor = '#ffffff',
    radius = 2,
    thickness = 0.5,
    speed = 1.0,
    active = true
}) {
    const pointsRef = useRef();
    const ringRef = useRef();

    const { positions, phases, radiusOffsets } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const radiusOffsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * thickness;

            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = (Math.random() - 0.5) * thickness;
            positions[i * 3 + 2] = Math.sin(angle) * r;

            phases[i] = Math.random() * Math.PI * 2;
            radiusOffsets[i] = (Math.random() - 0.5) * thickness;
        }

        return { positions, phases, radiusOffsets };
    }, [count, radius, thickness]);

    useFrame(({ clock }) => {
        if (!pointsRef.current || !active) return;

        const t = clock.getElapsedTime();
        const posArray = pointsRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + t * speed;
            const r = radius + radiusOffsets[i] + Math.sin(t * 3 + phases[i]) * 0.1;

            posArray[i * 3] = Math.cos(angle) * r;
            posArray[i * 3 + 1] = Math.sin(t * 5 + phases[i]) * 0.2;
            posArray[i * 3 + 2] = Math.sin(angle) * r;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Rotate ring
        if (ringRef.current) {
            ringRef.current.rotation.z = t * speed * 0.5;
        }
    });

    if (!active) return null;

    return (
        <group position={position}>
            {/* Portal ring */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.05, 16, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent={true}
                    opacity={0.8}
                />
            </mesh>

            {/* Portal particles */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={color}
                    size={0.08}
                    transparent={true}
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>

            {/* Center glow */}
            <mesh>
                <circleGeometry args={[radius * 0.8, 32]} />
                <meshBasicMaterial
                    color={innerColor}
                    transparent={true}
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Light */}
            <pointLight color={color} intensity={2} distance={5} />
        </group>
    );
}

/* ─── DIVINE PORTAL ─── */
export function DivinePortal({ position = [0, 0, 0], active = true }) {
    return (
        <PortalParticles
            count={400}
            position={position}
            color="#ffd700"
            innerColor="#ffffff"
            radius={2.5}
            thickness={0.4}
            speed={0.8}
            active={active}
        />
    );
}

/* ─── CHAOS PORTAL ─── */
export function ChaosPortal({ position = [0, 0, 0], active = true }) {
    return (
        <PortalParticles
            count={500}
            position={position}
            color="#ff0044"
            innerColor="#330011"
            radius={2}
            thickness={0.6}
            speed={2.0}
            active={active}
        />
    );
}
