/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL WATER - Animated Water Surface
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Realistic water plane:
 * - Animated wave displacement
 * - Reflections
 * - Foam and caustics
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import WaterMaterial from '../materials/WaterMaterial';

export default function ProceduralWater({
    position = [0, 0, 0],
    size = [50, 50],
    segments = 128,
    shallowColor = '#40c4ff',
    deepColor = '#003366',
    waveHeight = 0.3,
    waveSpeed = 0.3
}) {
    const meshRef = useRef();

    return (
        <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[...size, segments, segments]} />
            <WaterMaterial
                shallowColor={shallowColor}
                deepColor={deepColor}
                waveHeight={waveHeight}
                waveSpeed={waveSpeed}
            />
        </mesh>
    );
}

/* ─── DIVINE POOL ─── */
export function DivinePool({ position = [0, -0.5, 0], size = 8 }) {
    return (
        <ProceduralWater
            position={position}
            size={[size, size]}
            segments={64}
            shallowColor="#ffd700"
            deepColor="#996600"
            waveHeight={0.1}
            waveSpeed={0.2}
        />
    );
}

/* ─── REFLECTION POOL ─── */
export function ReflectionPool({ position = [0, -0.2, 0], size = 15 }) {
    return (
        <ProceduralWater
            position={position}
            size={[size, size * 0.6]}
            segments={96}
            shallowColor="#4488aa"
            deepColor="#002244"
            waveHeight={0.05}
            waveSpeed={0.1}
        />
    );
}
