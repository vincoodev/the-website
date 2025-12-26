/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FINISH SCENE - Simplified Divine Victory Scene
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Basic components
import ProceduralClouds from '../procedural/ProceduralClouds';
import ProceduralStars from '../procedural/ProceduralStars';
import { SimpleOmega } from '../procedural/ProceduralOmega';

/* ─── DIVINE SKY ─── */
function DivineSky() {
    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[300, 64, 64]} />
            <meshBasicMaterial
                color="#ffefd5"
                side={THREE.BackSide}
            />
        </mesh>
    );
}

/* ─── GOLDEN RAIN PARTICLES ─── */
function GoldenRain() {
    const pointsRef = useRef();
    const count = 500;

    const { positions, velocities } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

            velocities.push({
                y: 0.02 + Math.random() * 0.03,
                wobble: Math.random() * Math.PI * 2,
            });
        }

        return { positions, velocities };
    }, []);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;

        const posArray = pointsRef.current.geometry.attributes.position.array;
        const t = clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            // Fall down
            posArray[i * 3 + 1] -= velocities[i].y;

            // Wobble
            posArray[i * 3] += Math.sin(t * 2 + velocities[i].wobble) * 0.01;

            // Reset when below ground
            if (posArray[i * 3 + 1] < -5) {
                posArray[i * 3 + 1] = 25;
                posArray[i * 3] = (Math.random() - 0.5) * 40;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
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
                color="#ffd700"
                size={0.2}
                transparent={true}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ─── VICTORY RINGS ─── */
function VictoryRings() {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.children.forEach((ring, i) => {
                const scale = 1 + Math.sin(clock.getElapsedTime() * 1.5 + i * 0.8) * 0.2;
                ring.scale.setScalar(scale);
                ring.rotation.z = clock.getElapsedTime() * 0.3 * (i % 2 ? 1 : -1);
            });
        }
    });

    const rings = [
        { radius: 2, thickness: 0.08, color: '#ffd700', y: 0 },
        { radius: 3, thickness: 0.06, color: '#ffaa00', y: 0.5 },
        { radius: 4, thickness: 0.04, color: '#ff8800', y: 1 },
    ];

    return (
        <group ref={groupRef} position={[0, 2, 0]}>
            {rings.map((ring, i) => (
                <mesh key={i} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[ring.radius, ring.thickness, 16, 64]} />
                    <meshBasicMaterial
                        color={ring.color}
                        transparent={true}
                        opacity={0.6}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ─── DIVINE AURORA ─── */
function DivineAurora() {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 15, -25]} rotation={[0.3, 0, 0]}>
            <planeGeometry args={[60, 15]} />
            <meshBasicMaterial
                color="#ffd700"
                transparent={true}
                opacity={0.3}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

/* ─── PREMIUM OMEGA SYMBOL ─── */
function PremiumOmega() {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
            <group ref={groupRef} position={[0, 2.5, 0]}>
                <SimpleOmega scale={0.8} />

                {/* Halo glow */}
                <pointLight
                    position={[0, 1, 0]}
                    color="#ffd700"
                    intensity={2}
                    distance={10}
                />
            </group>
        </Float>
    );
}

/* ─── MAIN SCENE ─── */
export default function FinishScene() {
    return (
        <>
            {/* Divine Sky */}
            <DivineSky />

            {/* Stars (distant) */}
            <ProceduralStars
                count={2000}
                radius={100}
                color="#ffffff"
                minSize={0.5}
                maxSize={2}
            />

            {/* Clouds */}
            <ProceduralClouds
                count={15}
                spread={[40, 10, 30]}
                basePosition={[0, 5, -20]}
                color="#ffffff"
                glowColor="#ffd700"
                opacity={0.4}
                minScale={3}
                maxScale={8}
            />

            {/* Divine Aurora backdrop */}
            <DivineAurora />

            {/* Golden Rain */}
            <GoldenRain />

            {/* Victory Rings */}
            <VictoryRings />

            {/* Premium Omega */}
            <PremiumOmega />

            {/* Lighting */}
            <ambientLight intensity={0.6} color="#fff8e0" />
            <directionalLight position={[5, 10, 5]} intensity={1} color="#ffd700" />
            <pointLight position={[0, 10, 0]} intensity={2} color="#ffd700" distance={30} />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffaa00" distance={15} />
            <pointLight position={[10, 5, -10]} intensity={0.5} color="#ffcc00" distance={15} />

            {/* Fog for depth */}
            <fog attach="fog" args={['#ffefd5', 30, 150]} />
        </>
    );
}
