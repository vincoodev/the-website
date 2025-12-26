/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL DOOR - GIANT ANCIENT GATE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A massive double-door structure with procedural ancient details.
 * - Marble body with gold inlays
 * - Animated opening mechanism
 * - Giant scale for awe factor
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

import MarbleMaterial from '../materials/MarbleMaterial';
import GoldMaterial from '../materials/GoldMaterial';

export default function ProceduralDoor({ isOpen = false }) {
    // Animation for door opening - SMOOTH & UNREAL
    const { rotation } = useSpring({
        rotation: isOpen ? Math.PI / 1.5 : 0,
        config: { mass: 20, tension: 40, friction: 60, precision: 0.001 }
    });

    return (
        <group position={[0, 0, -8]} scale={[2.2, 2.2, 2.2]}>
            {/* ─── DOOR FRAME ─── */}
            <group position={[0, 4, 0]}>
                {/* Top Lintel (Giant Beam) */}
                <mesh position={[0, 6, 0]}>
                    <boxGeometry args={[14, 2, 2]} />
                    <MarbleMaterial baseColor="#2a2520" veinColor="#1a1815" veinIntensity={0.9} />
                </mesh>

                {/* Top Gold Ornament */}
                <mesh position={[0, 6, 1.1]}>
                    <boxGeometry args={[10, 1, 0.2]} />
                    <GoldMaterial />
                </mesh>

                {/* Left Pillar */}
                <mesh position={[-6, 0, 0]}>
                    <boxGeometry args={[2, 12, 2]} />
                    <MarbleMaterial baseColor="#2a2520" veinColor="#1a1815" veinIntensity={0.9} />
                </mesh>

                {/* Right Pillar */}
                <mesh position={[6, 0, 0]}>
                    <boxGeometry args={[2, 12, 2]} />
                    <MarbleMaterial baseColor="#2a2520" veinColor="#1a1815" veinIntensity={0.9} />
                </mesh>
            </group>

            {/* ─── MOVING DOORS ─── */}
            <group position={[0, 0, 0]}>
                {/* LEFT DOOR */}
                <animated.group
                    position={[-5, 4, 0]}
                    rotation-y={rotation.to(r => -r)}
                >
                    <group position={[2.5, 0, 0]}> {/* Pivot point offset */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[5, 10, 0.5]} />
                            <MarbleMaterial baseColor="#3a3530" veinColor="#1a1510" veinIntensity={0.5} />
                        </mesh>

                        {/* Gold Border Frame */}
                        <mesh position={[0, 0, 0.3]}>
                            <boxGeometry args={[4.5, 9.5, 0.1]} />
                            <meshStandardMaterial color="#1a1815" />
                        </mesh>

                        {/* Gold Relief Pattern */}
                        <mesh position={[0, 2, 0.35]}>
                            <ringGeometry args={[1, 1.2, 8]} />
                            <GoldMaterial />
                        </mesh>
                        <mesh position={[0, -2, 0.35]}>
                            <boxGeometry args={[2, 2, 0.1]} />
                            <GoldMaterial />
                        </mesh>

                        {/* Handle */}
                        <mesh position={[1.8, 0, 0.4]}>
                            <torusGeometry args={[0.3, 0.05, 16, 32]} />
                            <GoldMaterial />
                        </mesh>
                    </group>
                </animated.group>

                {/* RIGHT DOOR */}
                <animated.group
                    position={[5, 4, 0]}
                    rotation-y={rotation}
                >
                    <group position={[-2.5, 0, 0]}> {/* Pivot point offset */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[5, 10, 0.5]} />
                            <MarbleMaterial baseColor="#3a3530" veinColor="#1a1510" veinIntensity={0.5} />
                        </mesh>

                        {/* Gold Border Frame */}
                        <mesh position={[0, 0, 0.3]}>
                            <boxGeometry args={[4.5, 9.5, 0.1]} />
                            <meshStandardMaterial color="#1a1815" />
                        </mesh>

                        {/* Gold Relief Pattern */}
                        <mesh position={[0, 2, 0.35]}>
                            <ringGeometry args={[1, 1.2, 8]} />
                            <GoldMaterial />
                        </mesh>
                        <mesh position={[0, -2, 0.35]}>
                            <boxGeometry args={[2, 2, 0.1]} />
                            <GoldMaterial />
                        </mesh>

                        {/* Handle */}
                        <mesh position={[-1.8, 0, 0.4]}>
                            <torusGeometry args={[0.3, 0.05, 16, 32]} />
                            <GoldMaterial />
                        </mesh>
                    </group>
                </animated.group>
            </group>

            {/* ─── FLOOR PLATE at Threshold ─── */}
            <mesh position={[0, 0.1, 1]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[12, 4]} />
                <MarbleMaterial baseColor="#4a4036" />
            </mesh>
        </group>
    );
}
