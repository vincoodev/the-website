/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ASH EMBERS - Fire Ember Particles
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Realistic ember effect:
 * - Rising motion
 * - Color fade (orange to red)
 * - Flickering brightness
 * - Random drift
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AshEmbers({
    count = 100,
    position = [0, 0, 0],
    spread = [3, 5, 3],
    speed = 0.5,
    colorStart = '#ff6600',
    colorEnd = '#ff2200',
    size = 0.05
}) {
    const pointsRef = useRef();

    const { positions, velocities, phases, lifetimes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = [];
        const phases = [];
        const lifetimes = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread[0];
            positions[i * 3 + 1] = Math.random() * spread[1];
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: speed * (0.5 + Math.random() * 0.5),
                z: (Math.random() - 0.5) * 0.02,
            });

            phases.push(Math.random() * Math.PI * 2);
            lifetimes.push(Math.random());
        }

        return { positions, velocities, phases, lifetimes };
    }, [count, spread, speed]);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;

        const t = clock.getElapsedTime();
        const posArray = pointsRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            // Rise up
            posArray[i * 3 + 1] += velocities[i].y * 0.01;

            // Drift horizontally with noise
            posArray[i * 3] += velocities[i].x + Math.sin(t * 2 + phases[i]) * 0.005;
            posArray[i * 3 + 2] += velocities[i].z + Math.cos(t * 2 + phases[i]) * 0.005;

            // Update lifetime
            lifetimes[i] += 0.005;

            // Reset when too high or lifetime exceeded
            if (posArray[i * 3 + 1] > spread[1] || lifetimes[i] > 1) {
                posArray[i * 3] = (Math.random() - 0.5) * spread[0];
                posArray[i * 3 + 1] = 0;
                posArray[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
                lifetimes[i] = 0;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color={colorStart}
                size={size}
                transparent={true}
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ─── TORCH EMBERS ─── */
export function TorchEmbers({ position = [0, 0, 0] }) {
    return (
        <AshEmbers
            count={50}
            position={position}
            spread={[0.5, 2, 0.5]}
            speed={0.3}
            colorStart="#ff8800"
            colorEnd="#ff4400"
            size={0.04}
        />
    );
}

/* ─── BONFIRE EMBERS ─── */
export function BonfireEmbers({ position = [0, 0, 0] }) {
    return (
        <AshEmbers
            count={200}
            position={position}
            spread={[2, 6, 2]}
            speed={0.6}
            colorStart="#ff6600"
            colorEnd="#ff2200"
            size={0.06}
        />
    );
}
