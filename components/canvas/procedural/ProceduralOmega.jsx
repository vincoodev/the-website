/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROCEDURAL OMEGA - 3D Omega Symbol
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Extruded geometry from SVG path
 * - Gold metallic material
 * - Animated pulsing glow
 * - Particle halo effect
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

/* ─── OMEGA GLOW SHADER ─── */
const omegaGlowVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uPulse;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        
        // Breathing effect
        float breath = sin(uTime * 1.5) * 0.02 * uPulse;
        vec3 pos = position * (1.0 + breath);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const omegaGlowFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uHighlightColor;
    uniform float uIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Fresnel glow
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        
        // Pulsing intensity
        float pulse = sin(uTime * 2.0) * 0.3 + 0.7;
        
        // Color gradient from center to edge
        vec3 color = mix(uColor, uHighlightColor, fresnel);
        
        // Add golden shimmer
        float shimmer = sin(uTime * 5.0 + vNormal.x * 10.0) * 0.1 + 0.9;
        color *= shimmer;
        
        // Final intensity
        float alpha = fresnel * uIntensity * pulse;
        color *= (1.0 + fresnel * 2.0);
        
        gl_FragColor = vec4(color, alpha + 0.8);
    }
`;

/* ─── PARTICLE HALO ─── */
function ParticleHalo({ radius = 2, count = 200 }) {
    const pointsRef = useRef();

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = radius * (0.8 + Math.random() * 0.4);
            pos[i * 3] = Math.cos(angle) * r;
            pos[i * 3 + 1] = Math.sin(angle) * r;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }
        return pos;
    }, [count, radius]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z = clock.getElapsedTime() * 0.1;
        }
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
                size={0.05}
                transparent={true}
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ─── MAIN OMEGA COMPONENT ─── */
export default function ProceduralOmega({
    scale = 1,
    position = [0, 0, 0],
    color = '#d4af37',
    highlightColor = '#ffd700',
    intensity = 1.0,
    showHalo = true,
    animated = true
}) {
    const groupRef = useRef();
    const materialRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uHighlightColor: { value: new THREE.Color(highlightColor) },
        uIntensity: { value: intensity },
        uPulse: { value: animated ? 1.0 : 0.0 },
    }), [color, highlightColor, intensity, animated]);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
        if (groupRef.current && animated) {
            // Gentle floating
            groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <Center>
                <Text3D
                    font="/fonts/helvetiker_bold.typeface.json"
                    size={2}
                    height={0.4}
                    curveSegments={32}
                    bevelEnabled={true}
                    bevelThickness={0.05}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={8}
                >
                    Ω
                    <shaderMaterial
                        ref={materialRef}
                        vertexShader={omegaGlowVertexShader}
                        fragmentShader={omegaGlowFragmentShader}
                        uniforms={uniforms}
                        transparent={true}
                        side={THREE.DoubleSide}
                    />
                </Text3D>
            </Center>

            {showHalo && <ParticleHalo radius={3} count={300} />}

            {/* Point light for additional glow */}
            <pointLight
                color={highlightColor}
                intensity={intensity * 2}
                distance={10}
            />
        </group>
    );
}

/* ─── FALLBACK OMEGA (no font dependency) ─── */
export function SimpleOmega({ scale = 1, position = [0, 0, 0], color = '#d4af37' }) {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
            groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.1;
        }
    });

    // Create Omega shape from torus geometry
    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Main omega arc */}
            <mesh rotation={[0, 0, Math.PI]}>
                <torusGeometry args={[1, 0.15, 32, 64, Math.PI * 1.4]} />
                <meshStandardMaterial
                    color={color}
                    metalness={1}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Left foot */}
            <mesh position={[-0.9, -0.8, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
                <meshStandardMaterial
                    color={color}
                    metalness={1}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Right foot */}
            <mesh position={[0.9, -0.8, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
                <meshStandardMaterial
                    color={color}
                    metalness={1}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Glow */}
            <pointLight color={color} intensity={2} distance={8} />
        </group>
    );
}
